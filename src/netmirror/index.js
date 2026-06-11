const TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";

// Disney+ shares the Hotstar backend (ott="hs") on the NewTV API
const PLATFORMS = [
  { key: "nf", name: "Netflix" },
  { key: "pv", name: "Prime Video" },
  { key: "hs", name: "Hotstar / Disney+" },
];

const NEWTV_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
  "X-Requested-With": "NetmirrorNewTV v1.0",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0 /OS.GatuNewTV v1.0",
  "Accept": "application/json, text/plain, */*",
};

const NEWTV_DOMAINS = [
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
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy54eXo=",
];

let resolvedApiUrl = "";

async function resolveApiUrl() {
  if (resolvedApiUrl) return resolvedApiUrl;
  for (let di = 0; di < NEWTV_DOMAINS.length; di++) {
    const base = atob(NEWTV_DOMAINS[di]).replace(/\/$/, "");
    try {
      const r = await fetch(base + "/checknewtv.php", {
        headers: NEWTV_HEADERS,
      });
      const d = await r.json();
      if (d.token_hash) {
        resolvedApiUrl = atob(d.token_hash).replace(/\/$/, "");
        return resolvedApiUrl;
      }
    } catch (_) {}
  }
  throw new Error("NetMirror: failed to resolve API URL");
}

function normalize(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// Parses season number from formats like "Season 1 (8 EP)", "S1", "1"
function parseSeasonNumber(s) {
  const m = String(s || "").match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

async function resolveForPlatform(apiBase, ott, title, mediaType, season, episode) {
  const r = await fetch(`${apiBase}/newtv/search.php?s=${encodeURIComponent(title)}`, {
    headers: { ...NEWTV_HEADERS, Ott: ott },
  });
  const data = await r.json();
  if (!data.searchResult || !data.searchResult.length) return null;

  const wanted = normalize(title);
  const results = data.searchResult.slice(0, 3).sort((a, b) => {
    const an = normalize(a.t), bn = normalize(b.t);
    if (an === wanted && bn !== wanted) return -1;
    if (bn === wanted && an !== wanted) return 1;
    return 0;
  });

  // Use indexed for loops (not for...of) to avoid Hermes generator + for-of edge cases
  for (let ri = 0; ri < results.length; ri++) {
    const result = results[ri];
    const postR = await fetch(`${apiBase}/newtv/post.php?id=${result.id}`, {
      headers: { ...NEWTV_HEADERS, Ott: ott, Lastep: "", Usertoken: "" },
    });
    const post = await postR.json();

    let targetId = null;

    if (mediaType === "movie") {
      if (post.type !== "t") {
        targetId = post.main_id || result.id;
      }
    } else {
      const seasons = post.season || [];
      let targetSeasonId = null;
      for (let si = 0; si < seasons.length; si++) {
        if (parseSeasonNumber(seasons[si].s) == season) {
          targetSeasonId = seasons[si].id;
          break;
        }
      }
      if (targetSeasonId) {
        const episodes = [];
        let page = 1;
        for (let pi = 0; pi < 20; pi++) {
          const epR = await fetch(`${apiBase}/newtv/episodes.php?id=${targetSeasonId}&page=${page}`, {
            headers: { ...NEWTV_HEADERS, Ott: ott },
          });
          const epData = await epR.json();
          const epList = epData.episodes || [];
          for (let ei = 0; ei < epList.length; ei++) {
            const ep = epList[ei];
            if (ep) episodes.push({ id: ep.id, ep: parseInt(ep.ep, 10) });
          }
          if (epData.nextPageShow !== 1) break;
          page++;
        }
        for (let ei = 0; ei < episodes.length; ei++) {
          if (episodes[ei].ep == episode) {
            targetId = episodes[ei].id;
            break;
          }
        }
      }
    }

    if (targetId) {
      const playerR = await fetch(`${apiBase}/newtv/player.php?id=${targetId}`, {
        headers: { ...NEWTV_HEADERS, Ott: ott, Usertoken: "" },
      });
      const player = await playerR.json();
      if (player.status === "ok" && player.video_link) {
        return { url: player.video_link, referer: player.referer || apiBase };
      }
    }
  }

  return null;
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    const tmdbType = mediaType === "tv" ? "tv" : "movie";
    const tmdbR = await fetch(
      `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?api_key=${TMDB_API_KEY}`
    );
    const tmdbData = await tmdbR.json();
    const title = mediaType === "tv" ? tmdbData.name : tmdbData.title;
    if (!title) return [];

    console.log(`[NetMirror] ${mediaType} "${title}" S${season}E${episode}`);

    const apiBase = await resolveApiUrl();
    const streams = [];
    const seen = new Set();

    for (let pi = 0; pi < PLATFORMS.length; pi++) {
      const platform = PLATFORMS[pi];
      try {
        const result = await resolveForPlatform(apiBase, platform.key, title, mediaType, season, episode);
        if (result && !seen.has(result.url)) {
          seen.add(result.url);
          streams.push({
            name: "NetMirror / " + platform.name,
            title:
              mediaType === "tv"
                ? "S" + String(season).padStart(2, "0") + "E" + String(episode).padStart(2, "0") + " • HLS"
                : title + " • HLS",
            url: result.url,
            quality: "Auto",
            headers: { Referer: result.referer },
          });
        }
      } catch (e) {
        console.log("[NetMirror] " + platform.key + " failed: " + e.message);
      }
    }

    console.log(`[NetMirror] ${streams.length} stream(s) found`);
    return streams;
  } catch (e) {
    console.error(`[NetMirror] Fatal: ${e.message}`);
    return [];
  }
}

module.exports = { getStreams };
