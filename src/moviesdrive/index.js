import { load } from 'cheerio-without-node-native';
import MoviesDriveScraper from './scrapers/moviesdrive.js';

// We need a helper to get IMDB ID from TMDB ID
const TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";

async function getImdbId(tmdbId, mediaType) {
  const tmdbType = mediaType === "tv" ? "tv" : "movie";
  const r = await fetch(
    `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`
  );
  const data = await r.json();
  return data.imdb_id;
}

const scraper = new MoviesDriveScraper();
// Override cheerio load inside scraper since Nuvio uses cheerio-without-node-native
// Wait, the MoviesDriveScraper probably imports `cheerio`. We can alias it or just rely on Nuvio's config.

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    const imdbId = await getImdbId(tmdbId, mediaType);
    if (!imdbId) {
      console.log(`[MoviesDrive] No IMDb ID found for TMDB ${tmdbId}`);
      return [];
    }

    const item = {
      id: imdbId,
      type: mediaType === "tv" ? "series" : "movie",
    };

    console.log(`[MoviesDrive] Request: ${item.type} ${item.id} S${season || 1}E${episode || 1}`);
    const streams = await scraper.getStreams(item, season, episode);

    // Map to Nuvio format
    return streams.map(s => ({
      name: "MoviesDrive",
      title: `${s.quality || 'Auto'} • ${s.source || 'HLS'}`,
      url: s.url,
      quality: s.quality === 2160 ? "4k" : (s.quality ? `${s.quality}p` : "Auto"),
      headers: s.headers || {},
    }));
  } catch (error) {
    console.error(`[MoviesDrive] Error: ${error.message}`);
    return [];
  }
}

module.exports = { getStreams };
