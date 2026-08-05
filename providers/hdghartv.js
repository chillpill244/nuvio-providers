/**
 * hdghartv - Built from src/hdghartv/
 * Generated: 2026-08-05T02:49:46.089Z
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

// src/hdghartv/index.js
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const isTv = mediaType === "tv" || mediaType === "series";
      const tmdbType = isTv ? "tv" : "movie";
      const tmdbUrl = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?api_key=${TMDB_API_KEY}`;
      const tmdbRes = yield fetch(tmdbUrl).catch(() => null);
      if (!tmdbRes || !tmdbRes.ok)
        return [];
      const tmdbData = yield tmdbRes.json();
      const titleName = tmdbData.name || tmdbData.title || "";
      if (!titleName)
        return [];
      const hdGharApi = "https://hdghartv.cc/api";
      const searchUrl = `${hdGharApi}/search?q=${encodeURIComponent(titleName)}&type=all&page=1`;
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://hdghartv.cc/"
      };
      const searchRes = yield fetch(searchUrl, { headers }).catch(() => null);
      if (!searchRes || !searchRes.ok)
        return [];
      const searchData = yield searchRes.json();
      let targetId = null;
      if (searchData.movies) {
        const m = searchData.movies.find((x) => x.tmdbId === parseInt(tmdbId));
        if (m)
          targetId = m._id;
      }
      if (!targetId && searchData.series) {
        const s = searchData.series.find((x) => x.tmdbId === parseInt(tmdbId));
        if (s)
          targetId = s._id;
      }
      if (!targetId)
        return [];
      const apiType = isTv ? "series" : "movie";
      const detailsUrl = `${hdGharApi}/${apiType}/public/${targetId}`;
      const detailsRes = yield fetch(detailsUrl, { headers }).catch(() => null);
      if (!detailsRes || !detailsRes.ok)
        return [];
      const detailsData = yield detailsRes.json();
      let streamingLinks = [];
      if (!isTv) {
        streamingLinks = detailsData.streamingLinks || [];
      } else {
        const s = (detailsData.seasons || []).find((x) => x.seasonNumber === (season || 1));
        if (s) {
          const ep = (s.episodes || []).find((x) => x.episodeNumber === (episode || 1));
          if (ep) {
            streamingLinks = ep.streamingLinks || [];
          }
        }
      }
      if (!streamingLinks || streamingLinks.length === 0)
        return [];
      const results = [];
      streamingLinks.forEach((linkObj) => {
        const url = linkObj.url;
        const quality = linkObj.quality || "Auto";
        if (url) {
          const icon = quality.includes("2160") || quality.toLowerCase().includes("4k") ? "\u{1F48E}" : quality.includes("1080") ? "\u{1F525}" : "\u{1F3AC}";
          const audio = "Dual-Audio \u{1F310}";
          const format = url.includes(".m3u8") ? "HLS" : "MP4";
          const desc = `\u26A1 ${format}
${icon} ${quality} | \u{1F50A} ${audio}
\u{1F6F0}\uFE0F Source: HDGharTV`;
          results.push({
            name: `HDGharTV | ${quality}`,
            title: desc,
            description: desc,
            size: desc,
            url,
            behaviorHints: { notSupported: false, proxyHeaders: { request: headers } }
          });
        }
      });
      return results;
    } catch (err) {
      console.error("HDGharTV Error:", err.message);
      return [];
    }
  });
}
module.exports = { getStreams };
