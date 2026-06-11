/**
 * netmirror - Built from src/netmirror/
 * Generated: 2026-06-11T06:12:20.833Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

// src/netmirror/index.js
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var PLATFORMS = [
  { key: "nf", name: "Netflix" },
  { key: "pv", name: "Prime Video" },
  { key: "hs", name: "Hotstar / Disney+" }
];
var NEWTV_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
  "X-Requested-With": "NetmirrorNewTV v1.0",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0 /OS.GatuNewTV v1.0",
  "Accept": "application/json, text/plain, */*"
};
var NEWTV_DOMAINS = [
  "aHR0cHM6Ly9tb2JpbGVkZXRlY3RzLmNvbQ==",
  "aHR0cHM6Ly9tb2JpbGVkZXRlY3QuYXBw",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmFydA==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmNj",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmNsaWNr",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0Lmluaw==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmxpdmU=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnBybw==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNob3A=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNpdGU=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNwYWNl",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnN0b3Jl",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnZpcA==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0Lndpa2k=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0Lnh5eg==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5hcnQ=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5jYw==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5pbmZv",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5pbms=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5saXZl",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5wcm8=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5zdG9yZQ==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy50b3A=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy54eXo="
];
var resolvedApiUrl = "";
function resolveApiUrl() {
  return __async(this, null, function* () {
    if (resolvedApiUrl)
      return resolvedApiUrl;
    for (const enc of NEWTV_DOMAINS) {
      const base = atob(enc).replace(/\/$/, "");
      try {
        const r = yield fetch(`${base}/checknewtv.php`, {
          headers: NEWTV_HEADERS
        });
        const d = yield r.json();
        if (d.token_hash) {
          resolvedApiUrl = atob(d.token_hash).replace(/\/$/, "");
          return resolvedApiUrl;
        }
      } catch (_) {
      }
    }
    throw new Error("NetMirror: failed to resolve API URL");
  });
}
function normalize(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function parseSeasonNumber(s) {
  const m = String(s || "").match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}
function resolveForPlatform(apiBase, ott, title, mediaType, season, episode) {
  return __async(this, null, function* () {
    var _a;
    const r = yield fetch(`${apiBase}/newtv/search.php?s=${encodeURIComponent(title)}`, {
      headers: __spreadProps(__spreadValues({}, NEWTV_HEADERS), { Ott: ott })
    });
    const data = yield r.json();
    if (!((_a = data.searchResult) == null ? void 0 : _a.length))
      return null;
    const wanted = normalize(title);
    const results = [...data.searchResult];
    results.sort((a, b) => {
      const an = normalize(a.t), bn = normalize(b.t);
      if (an === wanted && bn !== wanted)
        return -1;
      if (bn === wanted && an !== wanted)
        return 1;
      return 0;
    });
    for (const result of results.slice(0, 3)) {
      const postR = yield fetch(`${apiBase}/newtv/post.php?id=${result.id}`, {
        headers: __spreadProps(__spreadValues({}, NEWTV_HEADERS), { Ott: ott, Lastep: "", Usertoken: "" })
      });
      const post = yield postR.json();
      let targetId;
      if (mediaType === "movie") {
        if (post.type === "t")
          continue;
        targetId = post.main_id || result.id;
      } else {
        const targetSeason = (post.season || []).find((s) => parseSeasonNumber(s.s) == season);
        if (!targetSeason)
          continue;
        const episodes = [];
        let page = 1;
        for (let i = 0; i < 20; i++) {
          const epR = yield fetch(`${apiBase}/newtv/episodes.php?id=${targetSeason.id}&page=${page}`, {
            headers: __spreadProps(__spreadValues({}, NEWTV_HEADERS), { Ott: ott })
          });
          const epData = yield epR.json();
          for (const ep2 of (epData.episodes || []).filter(Boolean)) {
            episodes.push({ id: ep2.id, ep: parseInt(ep2.ep, 10) });
          }
          if (epData.nextPageShow !== 1)
            break;
          page++;
        }
        const ep = episodes.find((e) => e.ep == episode);
        if (!ep)
          continue;
        targetId = ep.id;
      }
      const playerR = yield fetch(`${apiBase}/newtv/player.php?id=${targetId}`, {
        headers: __spreadProps(__spreadValues({}, NEWTV_HEADERS), { Ott: ott, Usertoken: "" })
      });
      const player = yield playerR.json();
      if (player.status === "ok" && player.video_link) {
        return { url: player.video_link, referer: player.referer || apiBase };
      }
    }
    return null;
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const tmdbType = mediaType === "tv" ? "tv" : "movie";
      const tmdbR = yield fetch(
        `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?api_key=${TMDB_API_KEY}`
      );
      const tmdbData = yield tmdbR.json();
      const title = mediaType === "tv" ? tmdbData.name : tmdbData.title;
      if (!title)
        return [];
      console.log(`[NetMirror] ${mediaType} "${title}" S${season}E${episode}`);
      const apiBase = yield resolveApiUrl();
      const streams = [];
      const seen = /* @__PURE__ */ new Set();
      for (const { key, name } of PLATFORMS) {
        try {
          const result = yield resolveForPlatform(apiBase, key, title, mediaType, season, episode);
          if (result && !seen.has(result.url)) {
            seen.add(result.url);
            streams.push({
              name: `NetMirror / ${name}`,
              title: mediaType === "tv" ? `S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")} \u2022 HLS` : `${title} \u2022 HLS`,
              url: result.url,
              quality: "Auto",
              headers: { Referer: result.referer }
            });
          }
        } catch (e) {
          console.log(`[NetMirror] ${key} failed: ${e.message}`);
        }
      }
      console.log(`[NetMirror] ${streams.length} stream(s) found`);
      return streams;
    } catch (e) {
      console.error(`[NetMirror] Fatal: ${e.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
