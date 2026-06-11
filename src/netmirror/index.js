const TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";

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

function safeAtob(encoded) {
  if (typeof atob === "function") return atob(encoded);
  return Buffer.from(encoded, "base64").toString("binary");
}

function buildHeaders(ott, extra) {
  const h = {};
  const keys = Object.keys(NEWTV_HEADERS);
  for (let i = 0; i < keys.length; i++) h[keys[i]] = NEWTV_HEADERS[keys[i]];
  h["Ott"] = ott;
  if (extra) {
    const ek = Object.keys(extra);
    for (let i = 0; i < ek.length; i++) h[ek[i]] = extra[ek[i]];
  }
  return h;
}

async function resolveApiUrl() {
  if (resolvedApiUrl) return resolvedApiUrl;
  for (let di = 0; di < NEWTV_DOMAINS.length; di++) {
    const base = safeAtob(NEWTV_DOMAINS[di]).replace(/\/$/, "");
    try {
      const r = await fetch(base + "/checknewtv.php", { headers: NEWTV_HEADERS });
      const d = await r.json();
      if (d.token_hash) {
        resolvedApiUrl = safeAtob(d.token_hash).replace(/\/$/, "");
        return resolvedApiUrl;
      }
    } catch (_) {}
  }
  throw new Error("NetMirror: failed to resolve API URL");
}

async function fetchEpisodesPage(seasonId, startPage, seasonNumber, ott, apiBase) {
  const episodes = [];
  let pg = startPage;
  while (true) {
    const r = await fetch(apiBase + "/newtv/episodes.php?id=" + seasonId + "&page=" + pg, {
      headers: buildHeaders(ott),
    });
    const data = await r.json();
    const epList = data.episodes || [];
    for (let ei = 0; ei < epList.length; ei++) {
      const ep = epList[ei];
      if (!ep) continue;
      const epNum = ep.ep ? parseInt(ep.ep, 10) : null;
      episodes.push({ id: ep.id, s: seasonNumber, ep: epNum });
    }
    if (data.nextPageShow !== 1) break;
    pg++;
  }
  return episodes;
}

async function getAllEpisodes(postData, ott, apiBase) {
  const episodes = [];
  const seasonList = postData.season || [];

  // Find the selected season index (used to derive its season number)
  let selectedIdx = -1;
  for (let i = 0; i < seasonList.length; i++) {
    if (seasonList[i].selected === true) { selectedIdx = i; break; }
  }
  const selectedSeasonId = selectedIdx >= 0 ? seasonList[selectedIdx].id : postData.nextPageSeason;
  const selectedSeasonNumber = selectedIdx >= 0 ? selectedIdx + 1 : null;

  // Collect page-1 episodes embedded in post response
  const embedded = postData.episodes || [];
  for (let i = 0; i < embedded.length; i++) {
    const ep = embedded[i];
    if (!ep) continue;
    const epNum = ep.ep ? parseInt(ep.ep, 10) : null;
    episodes.push({ id: ep.id, s: selectedSeasonNumber, ep: epNum });
  }

  // Fetch remaining pages of the selected season if needed
  if (postData.nextPageShow === 1 && selectedSeasonId) {
    const more = await fetchEpisodesPage(selectedSeasonId, 2, selectedSeasonNumber, ott, apiBase);
    for (let i = 0; i < more.length; i++) episodes.push(more[i]);
  }

  // Fetch all non-selected seasons
  for (let idx = 0; idx < seasonList.length; idx++) {
    const s = seasonList[idx];
    if (s.id !== selectedSeasonId && s.id) {
      const more = await fetchEpisodesPage(s.id, 1, idx + 1, ott, apiBase);
      for (let i = 0; i < more.length; i++) episodes.push(more[i]);
    }
  }

  return episodes;
}

async function fetchFromPlatform(ott, platformName, title, mediaType, season, episode) {
  const apiBase = await resolveApiUrl();

  const searchR = await fetch(apiBase + "/newtv/search.php?s=" + encodeURIComponent(title), {
    headers: buildHeaders(ott),
  });
  const searchData = await searchR.json();
  if (!searchData.searchResult || searchData.searchResult.length === 0) return null;

  const contentId = searchData.searchResult[0].id;

  const postR = await fetch(apiBase + "/newtv/post.php?id=" + contentId, {
    headers: buildHeaders(ott, { Lastep: "", Usertoken: "" }),
  });
  const postData = await postR.json();

  let targetId;

  if (mediaType === "tv") {
    const allEps = await getAllEpisodes(postData, ott, apiBase);
    let found = null;
    for (let i = 0; i < allEps.length; i++) {
      if (allEps[i] && allEps[i].s === season && allEps[i].ep === episode) {
        found = allEps[i];
        break;
      }
    }
    if (!found) return null;
    targetId = found.id;
  } else {
    const isSeries = postData.type === "t" ||
      (postData.episodes && postData.episodes.filter(function(e) { return e !== null; }).length > 0);
    if (isSeries) return null;
    targetId = postData.main_id || contentId;
  }

  const playerR = await fetch(apiBase + "/newtv/player.php?id=" + targetId, {
    headers: buildHeaders(ott, { Usertoken: "" }),
  });
  const player = await playerR.json();

  if (player.status === "ok" && player.video_link) {
    return {
      name: "NetMirror / " + platformName,
      title: mediaType === "tv"
        ? "S" + String(season).padStart(2, "0") + "E" + String(episode).padStart(2, "0") + " • HLS"
        : title + " • HLS",
      url: player.video_link,
      quality: "Auto",
      headers: { Referer: player.referer || apiBase },
    };
  }
  return null;
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    const tmdbType = mediaType === "tv" ? "tv" : "movie";
    const tmdbR = await fetch(
      "https://api.themoviedb.org/3/" + tmdbType + "/" + tmdbId + "?api_key=" + TMDB_API_KEY,
      { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" } }
    );
    const tmdbData = await tmdbR.json();
    const title = mediaType === "tv" ? tmdbData.name : tmdbData.title;
    if (!title) return [];

    console.log("[NetMirror] " + mediaType + " \"" + title + "\" S" + season + "E" + episode);

    const streams = [];
    for (let pi = 0; pi < PLATFORMS.length; pi++) {
      const p = PLATFORMS[pi];
      try {
        const result = await fetchFromPlatform(p.key, p.name, title, mediaType, season, episode);
        if (result) {
          streams.push(result);
          console.log("[NetMirror] " + p.key + " ok: " + result.url);
        }
      } catch (e) {
        console.log("[NetMirror] " + p.key + " failed: " + e.message);
      }
    }

    console.log("[NetMirror] " + streams.length + " stream(s) found");
    return streams;
  } catch (e) {
    console.error("[NetMirror] Fatal: " + e.message);
    return [];
  }
}

module.exports = { getStreams };
