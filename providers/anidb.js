/**
 * anidb - Built from src/anidb/
 * Generated: 2026-06-14T08:46:33.554Z
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

// src/anidb/index.js
var cheerio = require("cheerio-without-node-native");
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var BASE_URL = "https://anidb.app";
var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
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
function absolutize(href) {
  if (!href)
    return "";
  if (href.indexOf("http") === 0)
    return href;
  if (href.indexOf("//") === 0)
    return "https:" + href;
  if (href.charAt(0) === "/")
    return BASE_URL + href;
  return BASE_URL + "/" + href;
}
function searchSite(query) {
  return __async(this, null, function* () {
    const results = [];
    const seen = {};
    let html;
    try {
      const r = yield fetch(BASE_URL + "/browse?q=" + encodeURIComponent(query), {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9"
        }
      });
      html = yield r.text();
    } catch (_) {
      return results;
    }
    const $ = cheerio.load(html);
    $("a.anime-card").each(function(i, el) {
      const href = absolutize($(el).attr("href") || "");
      const title = ($(el).attr("title") || $(el).find("img").attr("alt") || "").trim();
      if (href && title && !seen[href]) {
        seen[href] = true;
        results.push({ url: href, title });
      }
    });
    return results;
  });
}
function getEpisodes(siteId) {
  return __async(this, null, function* () {
    const r = yield fetch(BASE_URL + "/api/frontend/anime/" + siteId + "/episodes", {
      headers: { "User-Agent": USER_AGENT, "X-Requested-With": "XMLHttpRequest" }
    });
    const data = yield r.json();
    return data && data.episodes ? data.episodes : [];
  });
}
function getLanguages(episodeId, slug) {
  return __async(this, null, function* () {
    const r = yield fetch(BASE_URL + "/api/frontend/episode/" + episodeId + "/languages", {
      headers: {
        "User-Agent": USER_AGENT,
        "X-Requested-With": "XMLHttpRequest",
        "Referer": BASE_URL + "/anime/" + slug
      }
    });
    const data = yield r.json();
    return data && data.languages ? data.languages : [];
  });
}
var HLS_REGEXES = [
  /file\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,
  /sources\s*:\s*\[\s*\{[^}]*file\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,
  /["'](https?:\/\/[^"']+\/master\.m3u8[^"']*)["']/i,
  /["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i
];
function extractEmbed(embedUrl) {
  return __async(this, null, function* () {
    try {
      const r = yield fetch(embedUrl, {
        headers: { "User-Agent": USER_AGENT, "Referer": BASE_URL + "/" }
      });
      const text = yield r.text();
      for (let i = 0; i < HLS_REGEXES.length; i++) {
        const m = text.match(HLS_REGEXES[i]);
        if (m && m[1])
          return m[1];
      }
    } catch (_) {
    }
    return null;
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const info = yield getTmdbInfo(tmdbId, mediaType);
      if (!info.title)
        return [];
      console.log("[AniDB] " + mediaType + ' "' + info.title + '" S' + season + "E" + episode);
      const ranked = rankResults(yield searchSite(info.title), info.title);
      const targetEpisode = mediaType === "tv" ? episode || 1 : 1;
      for (let ci = 0; ci < Math.min(3, ranked.length); ci++) {
        const candidate = ranked[ci];
        const slug = candidate.url.split("/").filter(Boolean).pop() || "";
        const idStr = slug.split("-").pop();
        const siteId = parseInt(idStr, 10);
        if (!siteId)
          continue;
        let episodes = [];
        try {
          episodes = yield getEpisodes(siteId);
        } catch (_) {
          continue;
        }
        if (!episodes.length)
          continue;
        let target = null;
        for (let i = 0; i < episodes.length; i++) {
          if (episodes[i].number === targetEpisode) {
            target = episodes[i];
            break;
          }
        }
        if (!target)
          target = episodes[targetEpisode - 1] || episodes[0];
        if (!target || target.id == null)
          continue;
        let languages = [];
        try {
          languages = yield getLanguages(target.id, slug);
        } catch (_) {
          continue;
        }
        const embedUrls = [];
        for (let i = 0; i < languages.length; i++) {
          const eu = languages[i].embed_url;
          if (eu)
            embedUrls.push({ url: eu, name: languages[i].name || languages[i].code || "" });
        }
        if (!embedUrls.length)
          continue;
        const resolved = yield Promise.all(embedUrls.map(function(e) {
          return extractEmbed(e.url);
        }));
        const streams = [];
        const seen = {};
        for (let i = 0; i < resolved.length; i++) {
          const m3u8 = resolved[i];
          if (!m3u8 || seen[m3u8])
            continue;
          seen[m3u8] = true;
          const langLabel = embedUrls[i].name ? " [" + embedUrls[i].name + "]" : "";
          const label = mediaType === "tv" ? info.title + " E" + String(targetEpisode).padStart(2, "0") + langLabel + " \u2022 HLS" : info.title + langLabel + " \u2022 HLS";
          streams.push({
            name: "AniDB",
            title: label,
            url: m3u8,
            quality: "Auto",
            headers: { "Referer": BASE_URL + "/" }
          });
        }
        if (streams.length) {
          console.log("[AniDB] found " + streams.length + " streams");
          return streams;
        }
      }
      console.log("[AniDB] no streams found");
      return [];
    } catch (e) {
      console.error("[AniDB] Fatal: " + (e && e.message));
      return [];
    }
  });
}
module.exports = { getStreams };
