const cheerio = require('cheerio-without-node-native');

const TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
const DOMAINS_JSON_URL = "https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json";
const FALLBACK_DOMAIN = "https://4khdhub.one";
const FALLBACK_HUBCLOUD = "https://hubcloud.foo";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

let cachedMain = "";
let cachedHubcloud = "";
let domainCachedAt = 0;
const DOMAIN_TTL_MS = 3600000;

function safeAtob(str) {
  try {
    if (typeof atob === "function") return atob(str);
  } catch (_) {}
  try { return Buffer.from(str, "base64").toString("binary"); } catch (_) { return ""; }
}

// ROT13 — mirrors Utils.kt pen()
function rot13(value) {
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c >= 65 && c <= 90) out += String.fromCharCode(((c - 65 + 13) % 26) + 65);
    else if (c >= 97 && c <= 122) out += String.fromCharCode(((c - 97 + 13) % 26) + 97);
    else out += value[i];
  }
  return out;
}

async function getDomains() {
  const now = Date.now();
  if (cachedMain && now - domainCachedAt < DOMAIN_TTL_MS) {
    return { main: cachedMain, hubcloud: cachedHubcloud };
  }
  try {
    const r = await fetch(DOMAINS_JSON_URL, { headers: { "User-Agent": USER_AGENT } });
    const data = await r.json();
    cachedMain = data["4khdhub"] || FALLBACK_DOMAIN;
    cachedHubcloud = data["hubcloud"] || FALLBACK_HUBCLOUD;
    domainCachedAt = now;
  } catch (_) {
    cachedMain = cachedMain || FALLBACK_DOMAIN;
    cachedHubcloud = cachedHubcloud || FALLBACK_HUBCLOUD;
  }
  return { main: cachedMain, hubcloud: cachedHubcloud };
}

async function getTmdbInfo(tmdbId, mediaType) {
  const tmdbType = mediaType === "tv" ? "tv" : "movie";
  const r = await fetch(
    "https://api.themoviedb.org/3/" + tmdbType + "/" + tmdbId + "?api_key=" + TMDB_API_KEY,
    { headers: { "User-Agent": USER_AGENT, "Accept": "application/json" } }
  );
  const data = await r.json();
  const title = mediaType === "tv" ? data.name : data.title;
  const dateStr = data.release_date || data.first_air_date || "";
  const year = dateStr ? parseInt(dateStr.slice(0, 4), 10) : null;
  return { title: title || "", year: year };
}

function normalize(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function rankResults(results, wantedTitle) {
  const want = normalize(wantedTitle);
  const exact = [];
  const partial = [];
  for (let i = 0; i < results.length; i++) {
    const n = normalize(results[i].title);
    if (n === want) exact.push(results[i]);
    else if (n.indexOf(want) !== -1 || want.indexOf(n) !== -1) partial.push(results[i]);
  }
  return exact.concat(partial);
}

function absolutize(domain, href) {
  if (!href) return "";
  if (href.indexOf("http") === 0) return href;
  if (href.indexOf("//") === 0) return "https:" + href;
  if (href.charAt(0) === "/") return domain.replace(/\/$/, "") + href;
  return domain.replace(/\/$/, "") + "/" + href;
}

function getBaseUrl(url) {
  const m = url.match(/^(https?:\/\/[^/]+)/);
  return m ? m[1] : "";
}

function getIndexQuality(str) {
  const m = String(str || "").match(/(\d{3,4})[pP]/);
  if (m && m[1]) return m[1] + "p";
  return "2160p";
}

async function searchSite(domain, query) {
  const results = [];
  const seen = {};
  let html;
  try {
    const r = await fetch(domain + "/?s=" + encodeURIComponent(query), {
      headers: { "User-Agent": USER_AGENT }
    });
    html = await r.text();
  } catch (_) { return results; }
  const $ = cheerio.load(html);
  $("div.card-grid a").each(function (i, el) {
    const href = absolutize(domain, $(el).attr("href") || "");
    const title = $(el).find("h3").first().text().trim();
    if (href && title && !seen[href]) {
      seen[href] = true;
      results.push({ url: href, title: title });
    }
  });
  return results;
}

// --- Movie: collect download-item hrefs ---
async function getMovieLinks(pageUrl) {
  const r = await fetch(pageUrl, { headers: { "User-Agent": USER_AGENT } });
  const html = await r.text();
  const $ = cheerio.load(html);
  const links = [];
  $("div.download-item a").each(function (i, el) {
    const href = $(el).attr("href") || "";
    if (href) links.push(href.trim());
  });
  return links;
}

// --- TV: collect hrefs for a specific season/episode ---
async function getEpisodeLinks(pageUrl, season, episode) {
  const r = await fetch(pageUrl, { headers: { "User-Agent": USER_AGENT } });
  const html = await r.text();
  const $ = cheerio.load(html);
  const links = [];
  const seen = {};

  $("div.episodes-list div.season-item").each(function (i, seasonEl) {
    const seasonText = $(seasonEl).find("div.episode-number").text();
    const sMatch = seasonText.match(/S?([1-9][0-9]*)/);
    const s = sMatch ? parseInt(sMatch[1], 10) : null;
    if (s !== season) return;
    $(seasonEl).find("div.episode-download-item").each(function (j, epEl) {
      const epText = $(epEl).find("span.badge-psa").text();
      const eMatch = epText.match(/Episode-0*([1-9][0-9]*)/);
      const ep = eMatch ? parseInt(eMatch[1], 10) : null;
      if (ep !== episode) return;
      $(epEl).find("a").each(function (k, a) {
        const href = ($(a).attr("href") || "").trim();
        if (href && !seen[href]) { seen[href] = true; links.push(href); }
      });
    });
  });

  return links;
}

// --- Redirect link resolver (mirrors Utils.kt getRedirectLinks) ---
const REDIRECT_REGEX = /s\('o','([A-Za-z0-9+/=]+)'|ck\('_wp_http_\d+','([^']+)'/g;

async function getRedirectLinks(url) {
  let html;
  try {
    const r = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    html = await r.text();
  } catch (_) { return ""; }

  let combined = "";
  let m;
  REDIRECT_REGEX.lastIndex = 0;
  while ((m = REDIRECT_REGEX.exec(html)) !== null) {
    if (m[1]) combined += m[1];
    else if (m[2]) combined += m[2];
  }
  if (!combined) return "";

  try {
    const decoded = safeAtob(rot13(safeAtob(safeAtob(combined))));
    const json = JSON.parse(decoded);

    const encodedUrl = safeAtob(json.o || "").trim();
    if (encodedUrl) return encodedUrl;

    const data = safeAtob(json.data || "");
    const wp = json.blog_url || "";
    if (!wp || !data) return "";
    const r2 = await fetch(wp + "?re=" + data, { headers: { "User-Agent": USER_AGENT } });
    const t = await r2.text();
    return cheerio.load(t).text().trim();
  } catch (_) {
    return url;
  }
}

// --- HubCloud extractor (mirrors Extractor.kt HubCloud) ---
async function extractHubCloud(url, hubcloudDomain, refName) {
  const out = [];
  const baseUrl = getBaseUrl(url) || hubcloudDomain;
  let href;
  if (url.indexOf("hubcloud.php") !== -1) {
    href = url;
  } else {
    let raw = "";
    try {
      const r = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      const $ = cheerio.load(await r.text());
      raw = ($("#download").attr("href") || "").trim();
    } catch (_) { return out; }
    if (!raw) return out;
    href = raw.indexOf("http") === 0 ? raw : baseUrl.replace(/\/$/, "") + "/" + raw.replace(/^\//, "");
  }
  if (!href) return out;

  let $2;
  try {
    const r2 = await fetch(href, { headers: { "User-Agent": USER_AGENT } });
    $2 = cheerio.load(await r2.text());
  } catch (_) { return out; }

  const size = $2("#size").first().text().trim();
  const header = $2("div.card-header").first().text().trim();
  const quality = getIndexQuality(header);
  let extras = "";
  if (size) extras += "[" + size + "]";

  const buttons = $2("a.btn");
  for (let i = 0; i < buttons.length; i++) {
    const el = buttons[i];
    const link = ($2(el).attr("href") || "").trim();
    const label = $2(el).text().toLowerCase();
    if (!link) continue;

    if (label.indexOf("download file") !== -1) {
      out.push({ url: link, quality: quality, server: "Download " + extras });
    } else if (label.indexOf("fsl server") !== -1) {
      out.push({ url: link, quality: quality, server: "FSL " + extras });
    } else if (label.indexOf("s3 server") !== -1) {
      out.push({ url: link, quality: quality, server: "S3 " + extras });
    } else if (label.indexOf("pixeldra") !== -1 || label.indexOf("pixel server") !== -1 || label.indexOf("pixeldrain") !== -1) {
      const base = getBaseUrl(link);
      const finalUrl = link.indexOf("download") !== -1
        ? link
        : base + "/api/file/" + link.split("/").pop() + "?download";
      out.push({ url: finalUrl, quality: quality, server: "Pixeldrain " + extras });
    } else if (label.indexOf("buzzserver") !== -1) {
      try {
        const resp = await fetch(link + "/download", {
          headers: { "User-Agent": USER_AGENT, "Referer": link },
          redirect: "manual",
        });
        const dlink = resp.headers.get("hx-redirect") || resp.headers.get("HX-Redirect") || "";
        if (dlink) out.push({ url: dlink, quality: quality, server: "BuzzServer " + extras });
      } catch (_) {}
    } else if (label.indexOf("10gbps") !== -1 || label.indexOf("mega") !== -1 || label.indexOf("pdl") !== -1 || label.indexOf("fslv2") !== -1) {
      out.push({ url: link, quality: quality, server: "Server " + extras });
    }
  }
  return out;
}

// --- HubDrive extractor → resolves to a HubCloud link ---
async function extractHubDrive(url, hubcloudDomain, refName) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    const $ = cheerio.load(await r.text());
    let href = $(".btn.btn-primary.btn-user.btn-success1.m-1").attr("href") || "";
    if (!href) {
      $("a").each(function (i, el) {
        const h = $(el).attr("href") || "";
        if (!href && h.toLowerCase().indexOf("hubcloud") !== -1) href = h;
      });
    }
    if (!href) return [];
    if (href.toLowerCase().indexOf("hubcloud") !== -1) {
      return await extractHubCloud(href, hubcloudDomain, refName);
    }
  } catch (_) {}
  return [];
}

// --- HubCdn extractor → base64 m3u8 ---
async function extractHubCdn(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    const html = await r.text();
    const m = html.match(/reurl\s*=\s*"([^"]+)"/);
    if (!m) return [];
    const after = m[1].split("?r=")[1] || m[1].split("link=")[1] || "";
    if (!after) return [];
    const decoded = safeAtob(after);
    const link = decoded.indexOf("link=") !== -1 ? decoded.split("link=").pop() : decoded;
    if (link) return [{ url: link, quality: "Auto", server: "HubCdn" }];
  } catch (_) {}
  return [];
}

// --- Hblinks extractor → fans out to hub* hosts ---
async function extractHblinks(url, hubcloudDomain, refName) {
  const out = [];
  let $;
  try {
    const r = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    $ = cheerio.load(await r.text());
  } catch (_) { return out; }
  const hrefs = [];
  $("h3 a, h5 a, div.entry-content p a").each(function (i, el) {
    const h = ($(el).attr("href") || "").trim();
    if (h) hrefs.push(h);
  });
  for (let i = 0; i < hrefs.length; i++) {
    const sub = await dispatchHost(hrefs[i], hubcloudDomain, refName);
    for (let j = 0; j < sub.length; j++) out.push(sub[j]);
  }
  return out;
}

async function dispatchHost(url, hubcloudDomain, refName) {
  const lower = url.toLowerCase();
  try {
    if (lower.indexOf("hubcloud") !== -1) return await extractHubCloud(url, hubcloudDomain, refName);
    if (lower.indexOf("hubdrive") !== -1) return await extractHubDrive(url, hubcloudDomain, refName);
    if (lower.indexOf("hblinks") !== -1) return await extractHblinks(url, hubcloudDomain, refName);
    if (lower.indexOf("hubcdn") !== -1) return await extractHubCdn(url);
  } catch (_) {}
  return [];
}

async function resolveLink(raw, hubcloudDomain, refName) {
  let resolved = raw;
  try {
    if (raw.indexOf("id=") !== -1) resolved = await getRedirectLinks(raw);
  } catch (_) { resolved = ""; }
  if (!resolved) return [];
  return await dispatchHost(resolved, hubcloudDomain, refName);
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    const info = await getTmdbInfo(tmdbId, mediaType);
    if (!info.title) return [];

    console.log("[4KHDHub] " + mediaType + " \"" + info.title + "\" S" + season + "E" + episode);

    const domains = await getDomains();
    const rawResults = await searchSite(domains.main, info.title);
    const ranked = rankResults(rawResults, info.title);

    const streams = [];
    const seenUrls = {};

    for (let ci = 0; ci < Math.min(3, ranked.length); ci++) {
      const candidate = ranked[ci];

      let pageLinks = [];
      try {
        pageLinks = mediaType === "tv"
          ? await getEpisodeLinks(candidate.url, season, episode)
          : await getMovieLinks(candidate.url);
      } catch (_) { continue; }

      if (!pageLinks.length) continue;

      // Resolve all page links concurrently — each is an independent host chain.
      const resolvedGroups = await Promise.all(
        pageLinks.map(function (l) { return resolveLink(l, domains.hubcloud, "4KHDHub"); })
      );

      for (let gi = 0; gi < resolvedGroups.length; gi++) {
        const group = resolvedGroups[gi];
        for (let k = 0; k < group.length; k++) {
          const s = group[k];
          if (!s || !s.url || seenUrls[s.url]) continue;
          seenUrls[s.url] = true;
          const label = mediaType === "tv"
            ? info.title + " S" + String(season).padStart(2, "0") + "E" + String(episode).padStart(2, "0") + " • " + s.server
            : info.title + " • " + s.server;
          streams.push({
            name: "4KHDHub",
            title: label.trim(),
            url: s.url,
            quality: s.quality || "Auto",
            headers: {},
          });
        }
      }

      if (streams.length) break;
    }

    console.log("[4KHDHub] found " + streams.length + " streams");
    return streams;
  } catch (e) {
    console.error("[4KHDHub] Fatal: " + (e && e.message));
    return [];
  }
}

module.exports = { getStreams };
