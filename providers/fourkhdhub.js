/**
 * fourkhdhub - Built from src/fourkhdhub/
 * Generated: 2026-08-05T03:41:45.949Z
 */
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/fourkhdhub/index.js
var cheerio = require("cheerio-without-node-native");
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var DOMAINS_JSON_URL = "https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json";
var FALLBACK_DOMAIN = "https://4khdhub.one";
var FALLBACK_HUBCLOUD = "https://hubcloud.foo";
var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var cachedMain = "";
var cachedHubcloud = "";
var domainCachedAt = 0;
var DOMAIN_TTL_MS = 36e5;
function safeAtob(str) {
  try {
    if (typeof atob === "function")
      return atob(str);
  } catch (_) {
  }
  try {
    return Buffer.from(str, "base64").toString("binary");
  } catch (_) {
    return "";
  }
}
function rot13(value) {
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c >= 65 && c <= 90)
      out += String.fromCharCode((c - 65 + 13) % 26 + 65);
    else if (c >= 97 && c <= 122)
      out += String.fromCharCode((c - 97 + 13) % 26 + 97);
    else
      out += value[i];
  }
  return out;
}
function getDomains() {
  return __async(this, null, function* () {
    const now = Date.now();
    if (cachedMain && now - domainCachedAt < DOMAIN_TTL_MS) {
      return { main: cachedMain, hubcloud: cachedHubcloud };
    }
    try {
      const r = yield fetch(DOMAINS_JSON_URL, { headers: { "User-Agent": USER_AGENT } });
      const data = yield r.json();
      cachedMain = data["4khdhub"] || FALLBACK_DOMAIN;
      cachedHubcloud = data["hubcloud"] || FALLBACK_HUBCLOUD;
      domainCachedAt = now;
    } catch (_) {
      cachedMain = cachedMain || FALLBACK_DOMAIN;
      cachedHubcloud = cachedHubcloud || FALLBACK_HUBCLOUD;
    }
    return { main: cachedMain, hubcloud: cachedHubcloud };
  });
}
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const tmdbType = mediaType === "tv" ? "tv" : "movie";
    const r = yield fetch(
      "https://api.themoviedb.org/3/" + tmdbType + "/" + tmdbId + "?api_key=" + TMDB_API_KEY,
      { headers: { "User-Agent": USER_AGENT, "Accept": "application/json" } }
    );
    const data = yield r.json();
    const title = mediaType === "tv" ? data.name : data.title;
    const dateStr = data.release_date || data.first_air_date || "";
    const year = dateStr ? parseInt(dateStr.slice(0, 4), 10) : null;
    return { title: title || "", year };
  });
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
    if (n === want)
      exact.push(results[i]);
    else if (n.indexOf(want) !== -1 || want.indexOf(n) !== -1)
      partial.push(results[i]);
  }
  return exact.concat(partial);
}
function absolutize(domain, href) {
  if (!href)
    return "";
  if (href.indexOf("http") === 0)
    return href;
  if (href.indexOf("//") === 0)
    return "https:" + href;
  if (href.charAt(0) === "/")
    return domain.replace(/\/$/, "") + href;
  return domain.replace(/\/$/, "") + "/" + href;
}
function getBaseUrl(url) {
  const m = url.match(/^(https?:\/\/[^/]+)/);
  return m ? m[1] : "";
}
function getIndexQuality(str) {
  const m = String(str || "").match(/(\d{3,4})[pP]/);
  if (m && m[1])
    return m[1] + "p";
  return "2160p";
}
function searchSite(domain, query) {
  return __async(this, null, function* () {
    const results = [];
    const seen = {};
    let html;
    try {
      const r = yield fetch(domain + "/?s=" + encodeURIComponent(query), {
        headers: { "User-Agent": USER_AGENT }
      });
      html = yield r.text();
    } catch (_) {
      return results;
    }
    const $ = cheerio.load(html);
    $("div.card-grid a").each(function(i, el) {
      const href = absolutize(domain, $(el).attr("href") || "");
      const title = $(el).find("h3").first().text().trim();
      if (href && title && !seen[href]) {
        seen[href] = true;
        results.push({ url: href, title });
      }
    });
    return results;
  });
}
function getMovieLinks(pageUrl) {
  return __async(this, null, function* () {
    const r = yield fetch(pageUrl, { headers: { "User-Agent": USER_AGENT } });
    const html = yield r.text();
    const $ = cheerio.load(html);
    const links = [];
    $("div.download-item a").each(function(i, el) {
      const href = $(el).attr("href") || "";
      if (href)
        links.push(href.trim());
    });
    return links;
  });
}
function getEpisodeLinks(pageUrl, season, episode) {
  return __async(this, null, function* () {
    const r = yield fetch(pageUrl, { headers: { "User-Agent": USER_AGENT } });
    const html = yield r.text();
    const $ = cheerio.load(html);
    const links = [];
    const seen = {};
    $("div.episodes-list div.season-item").each(function(i, seasonEl) {
      const seasonText = $(seasonEl).find("div.episode-number").text();
      const sMatch = seasonText.match(/S?([1-9][0-9]*)/);
      const s = sMatch ? parseInt(sMatch[1], 10) : null;
      if (s !== season)
        return;
      $(seasonEl).find("div.episode-download-item").each(function(j, epEl) {
        const epText = $(epEl).find("span.badge-psa").text();
        const eMatch = epText.match(/Episode-0*([1-9][0-9]*)/);
        const ep = eMatch ? parseInt(eMatch[1], 10) : null;
        if (ep !== episode)
          return;
        $(epEl).find("a").each(function(k, a) {
          const href = ($(a).attr("href") || "").trim();
          if (href && !seen[href]) {
            seen[href] = true;
            links.push(href);
          }
        });
      });
    });
    return links;
  });
}
var REDIRECT_REGEX = /s\('o','([A-Za-z0-9+/=]+)'|ck\('_wp_http_\d+','([^']+)'/g;
function getRedirectLinks(url) {
  return __async(this, null, function* () {
    let html;
    try {
      const r = yield fetch(url, { headers: { "User-Agent": USER_AGENT } });
      html = yield r.text();
    } catch (_) {
      return "";
    }
    let combined = "";
    let m;
    REDIRECT_REGEX.lastIndex = 0;
    while ((m = REDIRECT_REGEX.exec(html)) !== null) {
      if (m[1])
        combined += m[1];
      else if (m[2])
        combined += m[2];
    }
    if (!combined)
      return "";
    try {
      const decoded = safeAtob(rot13(safeAtob(safeAtob(combined))));
      const json = JSON.parse(decoded);
      const encodedUrl = safeAtob(json.o || "").trim();
      if (encodedUrl)
        return encodedUrl;
      const data = safeAtob(json.data || "");
      const wp = json.blog_url || "";
      if (!wp || !data)
        return "";
      const r2 = yield fetch(wp + "?re=" + data, { headers: { "User-Agent": USER_AGENT } });
      const t = yield r2.text();
      return cheerio.load(t).text().trim();
    } catch (_) {
      return url;
    }
  });
}
function extractHubCloud(url, hubcloudDomain, refName) {
  return __async(this, null, function* () {
    const out = [];
    const baseUrl = getBaseUrl(url) || hubcloudDomain;
    let href;
    if (url.indexOf("hubcloud.php") !== -1) {
      href = url;
    } else {
      let raw = "";
      try {
        const r = yield fetch(url, { headers: { "User-Agent": USER_AGENT } });
        const $ = cheerio.load(yield r.text());
        raw = ($("#download").attr("href") || "").trim();
      } catch (_) {
        return out;
      }
      if (!raw)
        return out;
      href = raw.indexOf("http") === 0 ? raw : baseUrl.replace(/\/$/, "") + "/" + raw.replace(/^\//, "");
    }
    if (!href)
      return out;
    let $2;
    try {
      const r2 = yield fetch(href, { headers: { "User-Agent": USER_AGENT } });
      $2 = cheerio.load(yield r2.text());
    } catch (_) {
      return out;
    }
    const size = $2("#size").first().text().trim();
    const header = $2("div.card-header").first().text().trim();
    const quality = getIndexQuality(header);
    let extras = "";
    if (size)
      extras += "[" + size + "]";
    const buttons = $2("a.btn");
    for (let i = 0; i < buttons.length; i++) {
      const el = buttons[i];
      const link = ($2(el).attr("href") || "").trim();
      const label = $2(el).text().toLowerCase();
      if (!link)
        continue;
      if (label.indexOf("download file") !== -1) {
        out.push({ url: link, quality, server: "Download " + extras });
      } else if (label.indexOf("fsl server") !== -1) {
        out.push({ url: link, quality, server: "FSL " + extras });
      } else if (label.indexOf("s3 server") !== -1) {
        out.push({ url: link, quality, server: "S3 " + extras });
      } else if (label.indexOf("pixeldra") !== -1 || label.indexOf("pixel server") !== -1 || label.indexOf("pixeldrain") !== -1) {
        const base = getBaseUrl(link);
        const finalUrl = link.indexOf("download") !== -1 ? link : base + "/api/file/" + link.split("/").pop() + "?download";
        out.push({ url: finalUrl, quality, server: "Pixeldrain " + extras });
      } else if (label.indexOf("buzzserver") !== -1) {
        try {
          const resp = yield fetch(link + "/download", {
            headers: { "User-Agent": USER_AGENT, "Referer": link },
            redirect: "manual"
          });
          const dlink = resp.headers.get("hx-redirect") || resp.headers.get("HX-Redirect") || "";
          if (dlink)
            out.push({ url: dlink, quality, server: "BuzzServer " + extras });
        } catch (_) {
        }
      } else if (label.indexOf("10gbps") !== -1 || label.indexOf("mega") !== -1 || label.indexOf("pdl") !== -1 || label.indexOf("fslv2") !== -1) {
        out.push({ url: link, quality, server: "Server " + extras });
      }
    }
    return out;
  });
}
function extractHubDrive(url, hubcloudDomain, refName) {
  return __async(this, null, function* () {
    try {
      const r = yield fetch(url, { headers: { "User-Agent": USER_AGENT } });
      const $ = cheerio.load(yield r.text());
      let href = $(".btn.btn-primary.btn-user.btn-success1.m-1").attr("href") || "";
      if (!href) {
        $("a").each(function(i, el) {
          const h = $(el).attr("href") || "";
          if (!href && h.toLowerCase().indexOf("hubcloud") !== -1)
            href = h;
        });
      }
      if (!href)
        return [];
      if (href.toLowerCase().indexOf("hubcloud") !== -1) {
        return yield extractHubCloud(href, hubcloudDomain, refName);
      }
    } catch (_) {
    }
    return [];
  });
}
function extractHubCdn(url) {
  return __async(this, null, function* () {
    try {
      const r = yield fetch(url, { headers: { "User-Agent": USER_AGENT } });
      const html = yield r.text();
      const m = html.match(/reurl\s*=\s*"([^"]+)"/);
      if (!m)
        return [];
      const after = m[1].split("?r=")[1] || m[1].split("link=")[1] || "";
      if (!after)
        return [];
      const decoded = safeAtob(after);
      const link = decoded.indexOf("link=") !== -1 ? decoded.split("link=").pop() : decoded;
      if (link)
        return [{ url: link, quality: "Auto", server: "HubCdn" }];
    } catch (_) {
    }
    return [];
  });
}
function extractHblinks(url, hubcloudDomain, refName) {
  return __async(this, null, function* () {
    const out = [];
    let $;
    try {
      const r = yield fetch(url, { headers: { "User-Agent": USER_AGENT } });
      $ = cheerio.load(yield r.text());
    } catch (_) {
      return out;
    }
    const hrefs = [];
    $("h3 a, h5 a, div.entry-content p a").each(function(i, el) {
      const h = ($(el).attr("href") || "").trim();
      if (h)
        hrefs.push(h);
    });
    for (let i = 0; i < hrefs.length; i++) {
      const sub = yield dispatchHost(hrefs[i], hubcloudDomain, refName);
      for (let j = 0; j < sub.length; j++)
        out.push(sub[j]);
    }
    return out;
  });
}
function dispatchHost(url, hubcloudDomain, refName) {
  return __async(this, null, function* () {
    const lower = url.toLowerCase();
    try {
      if (lower.indexOf("hubcloud") !== -1)
        return yield extractHubCloud(url, hubcloudDomain, refName);
      if (lower.indexOf("hubdrive") !== -1)
        return yield extractHubDrive(url, hubcloudDomain, refName);
      if (lower.indexOf("hblinks") !== -1)
        return yield extractHblinks(url, hubcloudDomain, refName);
      if (lower.indexOf("hubcdn") !== -1)
        return yield extractHubCdn(url);
    } catch (_) {
    }
    return [];
  });
}
function resolveLink(raw, hubcloudDomain, refName) {
  return __async(this, null, function* () {
    let resolved = raw;
    try {
      if (raw.indexOf("id=") !== -1)
        resolved = yield getRedirectLinks(raw);
    } catch (_) {
      resolved = "";
    }
    if (!resolved)
      return [];
    return yield dispatchHost(resolved, hubcloudDomain, refName);
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const info = yield getTmdbInfo(tmdbId, mediaType);
      if (!info.title)
        return [];
      console.log("[4KHDHub] " + mediaType + ' "' + info.title + '" S' + season + "E" + episode);
      const domains = yield getDomains();
      const rawResults = yield searchSite(domains.main, info.title);
      const ranked = rankResults(rawResults, info.title);
      const streams = [];
      const seenUrls = {};
      for (let ci = 0; ci < Math.min(3, ranked.length); ci++) {
        const candidate = ranked[ci];
        let pageLinks = [];
        try {
          pageLinks = mediaType === "tv" ? yield getEpisodeLinks(candidate.url, season, episode) : yield getMovieLinks(candidate.url);
        } catch (_) {
          continue;
        }
        if (!pageLinks.length)
          continue;
        const resolvedGroups = yield Promise.all(
          pageLinks.map(function(l) {
            return resolveLink(l, domains.hubcloud, "4KHDHub");
          })
        );
        for (let gi = 0; gi < resolvedGroups.length; gi++) {
          const group = resolvedGroups[gi];
          for (let k = 0; k < group.length; k++) {
            const s = group[k];
            if (!s || !s.url || seenUrls[s.url])
              continue;
            seenUrls[s.url] = true;
            const label = mediaType === "tv" ? info.title + " S" + String(season).padStart(2, "0") + "E" + String(episode).padStart(2, "0") + " \u2022 " + s.server : info.title + " \u2022 " + s.server;
            streams.push({
              name: "4KHDHub",
              title: label.trim(),
              url: s.url,
              quality: s.quality || "Auto",
              headers: {}
            });
          }
        }
        if (streams.length)
          break;
      }
      console.log("[4KHDHub] found " + streams.length + " streams");
      return streams;
    } catch (e) {
      console.error("[4KHDHub] Fatal: " + (e && e.message));
      return [];
    }
  });
}
module.exports = { getStreams };
