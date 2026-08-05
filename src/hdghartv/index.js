/**
 * HDGharTV Provider for Nuvio
 */

const TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
const MANIFEST_STREAM_BASE = "https://pengu.uk/%7B%22source_hdghartv%22%3A%22on%22%2C%22res_1080%22%3A%22on%22%2C%22res_720%22%3A%22on%22%2C%22disable_direct%22%3A%22on%22%2C%22auth_token%22%3A%22XwZg2rLkLlbjXBeDVCyxgfHXjxN1ijLMkUuToW8KaKc%22%7D";

async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        const isTv = mediaType === 'tv' || mediaType === 'series';
        const tmdbType = isTv ? 'tv' : 'movie';
        
        // 1. Fetch TMDB to get the name
        const tmdbUrl = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?api_key=${TMDB_API_KEY}`;
        const tmdbRes = await fetch(tmdbUrl).catch(() => null);
        if (!tmdbRes || !tmdbRes.ok) return [];
        const tmdbData = await tmdbRes.json();
        
        const titleName = tmdbData.name || tmdbData.title || '';
        if (!titleName) return [];
        
        // 2. Search hdghartv.cc directly
        const hdGharApi = "https://hdghartv.cc/api";
        const searchUrl = `${hdGharApi}/search?q=${encodeURIComponent(titleName)}&type=all&page=1`;
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://hdghartv.cc/"
        };
        
        const searchRes = await fetch(searchUrl, { headers }).catch(() => null);
        if (!searchRes || !searchRes.ok) return [];
        const searchData = await searchRes.json();
        
        let targetId = null;
        
        if (searchData.movies) {
            const m = searchData.movies.find(x => x.tmdbId === parseInt(tmdbId));
            if (m) targetId = m._id;
        }
        if (!targetId && searchData.series) {
            const s = searchData.series.find(x => x.tmdbId === parseInt(tmdbId));
            if (s) targetId = s._id;
        }
        
        if (!targetId) return [];
        
        // 3. Fetch public details
        const apiType = isTv ? "series" : "movie";
        const detailsUrl = `${hdGharApi}/${apiType}/public/${targetId}`;
        const detailsRes = await fetch(detailsUrl, { headers }).catch(() => null);
        if (!detailsRes || !detailsRes.ok) return [];
        const detailsData = await detailsRes.json();
        
        let streamingLinks = [];
        if (!isTv) {
            streamingLinks = detailsData.streamingLinks || [];
        } else {
            const s = (detailsData.seasons || []).find(x => x.seasonNumber === (season || 1));
            if (s) {
                const ep = (s.episodes || []).find(x => x.episodeNumber === (episode || 1));
                if (ep) {
                    streamingLinks = ep.streamingLinks || [];
                }
            }
        }
        
        if (!streamingLinks || streamingLinks.length === 0) return [];
        
        const results = [];
        streamingLinks.forEach(linkObj => {
            const url = linkObj.url;
            const quality = linkObj.quality || 'Auto';
            
            if (url) {
                const icon = (quality.includes("2160") || quality.toLowerCase().includes("4k")) ? "💎" : (quality.includes("1080") ? "🔥" : "🎬");
                const audio = "Dual-Audio 🌐";
                const format = url.includes(".m3u8") ? "HLS" : "MP4";
                
                const desc = `⚡ ${format}\n${icon} ${quality} | 🔊 ${audio}\n🛰️ Source: HDGharTV`;
                
                results.push({
                    name: `HDGharTV | ${quality}`,
                    title: desc,
                    description: desc,
                    size: desc,
                    url: url,
                    behaviorHints: { notSupported: false, proxyHeaders: { request: headers } }
                });
            }
        });
        
        return results;
    } catch (err) {
        console.error("HDGharTV Error:", err.message);
        return [];
    }
}

module.exports = { getStreams };
