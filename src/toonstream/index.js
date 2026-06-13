const cheerio = require('cheerio-without-node-native');

const TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
const DOMAINS_JSON_URL = "https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json";
const FALLBACK_DOMAIN = "https://toonstream.day";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

let cachedDomain = "";
let domainCachedAt = 0;
const DOMAIN_TTL_MS = 3600000;

function safeAtob(str) {
  if (typeof atob === "function") return atob(str);
  return Buffer.from(str, "base64").toString("binary");
}

async function getDomain() {
  const now = Date.now();
  if (cachedDomain && now - domainCachedAt < DOMAIN_TTL_MS) return cachedDomain;
  try {
    const r = await fetch(DOMAINS_JSON_URL, { headers: { "User-Agent": USER_AGENT } });
    const data = await r.json();
    cachedDomain = data.toonstream || FALLBACK_DOMAIN;
    domainCachedAt = now;
    return cachedDomain;
  } catch (_) {
    return FALLBACK_DOMAIN;
  }
}

async function getTmdbTitle(tmdbId, mediaType) {
  const tmdbType = mediaType === "tv" ? "tv" : "movie";
  const r = await fetch(
    "https://api.themoviedb.org/3/" + tmdbType + "/" + tmdbId + "?api_key=" + TMDB_API_KEY,
    { headers: { "User-Agent": USER_AGENT, "Accept": "application/json" } }
  );
  const data = await r.json();
  const title = mediaType === "tv" ? data.name : data.title;
  const dateStr = data.release_date || data.first_air_date || "";
  const year = dateStr ? parseInt(dateStr.slice(0, 4), 10) : null;
  return { title: title || "", year };
}

function normalize(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function rankResults(results, wantedTitle) {
  const want = normalize(wantedTitle);
  const exact = [];
  const prefix = [];
  for (let i = 0; i < results.length; i++) {
    const n = normalize(results[i].title);
    if (n === want) exact.push(results[i]);
    else if (n.startsWith(want)) prefix.push(results[i]);
  }
  return exact.concat(prefix);
}

async function searchSite(domain, query) {
  const results = [];
  const seen = {};
  for (let page = 1; page <= 3; page++) {
    let html;
    try {
      const r = await fetch(domain + "/page/" + page + "/?s=" + encodeURIComponent(query), {
        headers: { "User-Agent": USER_AGENT }
      });
      html = await r.text();
    } catch (_) { break; }
    const $ = cheerio.load(html);
    const items = $("#movies-a > ul > li");
    if (!items.length) break;
    let added = 0;
    items.each(function(i, el) {
      const href = $(el).find("article > a").attr("href") || "";
      const title = $(el).find("article > header > h2").text().trim().replace("Watch Online", "").trim();
      if (href && title && !seen[href]) {
        seen[href] = true;
        results.push({ url: href, title: title });
        added++;
      }
    });
    if (added === 0) break;
  }
  return results;
}

async function loadPost(url) {
  const r = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  const html = await r.text();
  const $ = cheerio.load(html);
  const title = $("header.entry-header > h1").text().trim().replace("Watch Online", "").trim();
  const bodyText = $("body").text();
  const yearMatch = bodyText.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : null;
  const isSeries = url.indexOf("/series/") !== -1;
  const seasons = [];
  if (isSeries) {
    $("div.aa-drp.choose-season > ul > li > a").each(function(i, el) {
      seasons.push({
        dataPost: $(el).attr("data-post") || "",
        dataSeason: $(el).attr("data-season") || "",
      });
    });
  }
  return { title: title, year: year, isSeries: isSeries, seasons: seasons };
}

async function getSeasonEpisodes(domain, dataPost, dataSeason) {
  const body = "action=action_select_season&season=" + encodeURIComponent(dataSeason) + "&post=" + encodeURIComponent(dataPost);
  const r = await fetch(domain + "/wp-admin/admin-ajax.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": USER_AGENT,
    },
    body: body,
  });
  const html = await r.text();
  const $ = cheerio.load(html);
  const episodes = [];
  $("article").each(function(i, el) {
    const href = $(el).find("a").first().attr("href") || "";
    const numEpi = $(el).find("span.num-epi").text().trim();
    const parts = numEpi.split("x");
    const s = parseInt(parts[0] || "1", 10) || 1;
    const ep = parseInt(parts[1] || "1", 10) || 1;
    if (href) episodes.push({ url: href, season: s, episode: ep });
  });
  return episodes;
}

async function findEpisodeUrl(domain, post, targetSeason, targetEpisode) {
  for (let si = 0; si < post.seasons.length; si++) {
    const s = post.seasons[si];
    let eps;
    try {
      eps = await getSeasonEpisodes(domain, s.dataPost, s.dataSeason);
    } catch (_) { continue; }
    for (let ei = 0; ei < eps.length; ei++) {
      if (eps[ei].season === targetSeason && eps[ei].episode === targetEpisode) {
        return eps[ei].url;
      }
    }
  }
  return null;
}

async function getVideoLinks(pageUrl) {
  const r = await fetch(pageUrl, { headers: { "User-Agent": USER_AGENT } });
  const html = await r.text();
  const $ = cheerio.load(html);
  const links = [];
  const iframes = $("#aa-options > div > iframe[data-src]");
  for (let i = 0; i < iframes.length; i++) {
    const dataSrc = $(iframes[i]).attr("data-src") || "";
    if (!dataSrc) continue;
    try {
      const r2 = await fetch(dataSrc, { headers: { "User-Agent": USER_AGENT } });
      const html2 = await r2.text();
      const $2 = cheerio.load(html2);
      const src = $2("iframe").first().attr("src") || "";
      if (src) links.push(src);
    } catch (_) {}
  }
  return links;
}

async function extractAWSStream(url) {
  const hash = url.split("/").pop();
  const base = url.slice(0, url.lastIndexOf("/"));
  const r = await fetch(
    base + "/player/index.php?data=" + hash + "&do=getVideo",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-requested-with": "XMLHttpRequest",
        "User-Agent": USER_AGENT,
      },
      body: "hash=" + encodeURIComponent(hash) + "&r=" + encodeURIComponent(base),
    }
  );
  const data = await r.json();
  if (data && data.videoSource) {
    return { url: data.videoSource, headers: {} };
  }
  return null;
}

async function extractStreamruby(url) {
  const clean = url.replace(/\/e\/(?=\w)/, "/");
  const r = await fetch(clean, { headers: { "User-Agent": USER_AGENT } });
  const text = await r.text();
  const m = text.match(/file:\s*"(.*?\.m3u8.*?)"/);
  if (m && m[1]) return { url: m[1], headers: { Referer: "streamruby.com" } };
  return null;
}

async function extractGDMirrorbot(url) {
  const embedIdx = url.indexOf("/embed/");
  const sid = embedIdx !== -1 ? url.slice(embedIdx + 7).split("?")[0] : "";
  const host = embedIdx !== -1 ? url.slice(0, embedIdx) : "";
  if (!sid || !host) return null;

  const r = await fetch(host + "/embedhelper.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "sid=" + encodeURIComponent(sid),
  });
  const data = await r.json();
  const siteUrls = data.siteUrls || {};
  let mresult = data.mresult || {};
  if (typeof mresult === "string") {
    try { mresult = JSON.parse(safeAtob(mresult)); } catch (_) { return null; }
  }

  const keys = Object.keys(siteUrls);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!mresult[key]) continue;
    const base = (siteUrls[key] || "").replace(/\/$/, "");
    const path = (mresult[key] || "").replace(/^\//, "");
    const subUrl = base + "/" + path;
    let result = null;
    try {
      if (subUrl.indexOf("awstream") !== -1 || subUrl.indexOf("zephyrflick") !== -1) {
        result = await extractAWSStream(subUrl);
      } else if (subUrl.indexOf("streamruby") !== -1) {
        result = await extractStreamruby(subUrl);
      }
    } catch (_) {}
    if (result && result.url) return result;
  }
  return null;
}

async function resolveVideoLink(url) {
  try {
    if (url.indexOf("awstream") !== -1 || url.indexOf("zephyrflick") !== -1) return await extractAWSStream(url);
    if (url.indexOf("streamruby") !== -1) return await extractStreamruby(url);
    if (url.indexOf("gdmirrorbot") !== -1 || url.indexOf("techinmind") !== -1) return await extractGDMirrorbot(url);
  } catch (_) {}
  return null;
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    const { title, year } = await getTmdbTitle(tmdbId, mediaType);
    if (!title) return [];

    console.log("[Toonstream] " + mediaType + " \"" + title + "\" S" + season + "E" + episode);

    const domain = await getDomain();
    const rawResults = await searchSite(domain, title);
    const ranked = rankResults(rawResults, title);

    for (let ci = 0; ci < Math.min(3, ranked.length); ci++) {
      const candidate = ranked[ci];
      let post;
      try { post = await loadPost(candidate.url); } catch (_) { continue; }

      if (year && post.year && Math.abs(post.year - year) > 2) continue;

      let pageUrl = candidate.url;

      if (mediaType === "tv") {
        let episodeUrl = null;
        try { episodeUrl = await findEpisodeUrl(domain, post, season, episode); } catch (_) {}
        if (!episodeUrl) continue;
        pageUrl = episodeUrl;
      }

      let videoLinks = [];
      try { videoLinks = await getVideoLinks(pageUrl); } catch (_) { continue; }

      for (let vi = 0; vi < videoLinks.length; vi++) {
        let resolved = null;
        try { resolved = await resolveVideoLink(videoLinks[vi]); } catch (_) {}
        if (resolved && resolved.url) {
          const label = mediaType === "tv"
            ? title + " S" + String(season).padStart(2, "0") + "E" + String(episode).padStart(2, "0") + " • HLS"
            : title + " • HLS";
          console.log("[Toonstream] stream found: " + resolved.url);
          return [{
            name: "Toonstream",
            title: label,
            url: resolved.url,
            quality: "Auto",
            headers: resolved.headers || {},
          }];
        }
      }
    }

    console.log("[Toonstream] no streams found");
    return [];
  } catch (e) {
    console.error("[Toonstream] Fatal: " + e.message);
    return [];
  }
}

module.exports = { getStreams };
