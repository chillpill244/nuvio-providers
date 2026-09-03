/**
 * moviesdrive - Built from src/moviesdrive/
 * Generated: 2026-09-03T00:55:19.350Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
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

// src/moviesdrive/index.js
var import_cheerio_without_node_native = require("cheerio-without-node-native");

// src/moviesdrive/http-client.js
var import_axios = __toESM(require("axios"));

// src/moviesdrive/security.js
var PRIVATE_IP_PATTERNS = [
  /^127\./,
  // Loopback
  /^10\./,
  // Private Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  // Private Class B
  /^192\.168\./,
  // Private Class C
  /^169\.254\./,
  // Link-local
  /^0\./,
  // Current network
  /^::1$/,
  // IPv6 loopback
  /^fc00:/i,
  // IPv6 private
  /^fe80:/i
  // IPv6 link-local
];
var SUSPICIOUS_PATTERNS = [
  /localhost/i,
  /127\.0\.0\.1/i,
  /0\.0\.0\.0/i,
  /\[::\]/i,
  /file:\/\//i,
  /ftp:\/\//i,
  /dict:\/\//i,
  /gopher:\/\//i,
  /ldap:\/\//i,
  /smtp:\/\//i,
  /imap:\/\//i,
  /pop3:\/\//i,
  /ssh:\/\//i,
  /telnet:\/\//i,
  /data:\/\//i,
  /javascript:/i,
  /vbscript:/i
];
function isPrivateIP(ip) {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
}
function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== "string") {
    return false;
  }
  try {
    const url = new URL(urlString);
    if (!["http:", "https:"].includes(url.protocol)) {
      console.warn(`[Security] Blocked non-HTTP protocol: ${url.protocol}`);
      return false;
    }
    const hostname = url.hostname.toLowerCase();
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(hostname)) {
        console.warn(`[Security] Blocked suspicious hostname: ${hostname}`);
        return false;
      }
    }
    const ipMatch = hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/);
    if (ipMatch) {
      if (isPrivateIP(hostname)) {
        console.warn(`[Security] Blocked private IP: ${hostname}`);
        return false;
      }
    }
    if (urlString.match(/@\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
      console.warn(`[Security] Blocked potential DNS rebinding attack`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(`[Security] Invalid URL: ${urlString}`);
    return false;
  }
}
function sanitizeForLogging(url) {
  if (!url || typeof url !== "string") {
    return "[invalid]";
  }
  const maxLength = 100;
  let sanitized = url.substring(0, maxLength);
  if (url.length > maxLength) {
    sanitized += "...";
  }
  sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  return sanitized;
}
function isWrapperUrl(url) {
  if (!url)
    return false;
  const wrapperDomains = [
    "hubcloud",
    "gamerxyt",
    "carnewz",
    "cryptoinsights",
    "hubcloud.php",
    "hubcloud.icu",
    "hubcloud.lol",
    "hubcloud.art",
    "hubcloud.dad",
    "hubcloud.foo",
    "hubcloud.bar",
    "bonuscaf",
    "iriverwave",
    "tinyurl",
    "carnewz.site",
    "bonuscaf.com",
    "iriverwave.com",
    "kxnr"
  ];
  const urlLower = url.toLowerCase();
  return wrapperDomains.some((domain) => urlLower.includes(domain));
}
var RateLimitStore = class {
  constructor() {
    this.requests = /* @__PURE__ */ new Map();
    this.windowMs = 6e4;
    this.maxRequests = 30;
  }
  /**
   * Check if request is allowed
   * @param {string} key - Client identifier (IP)
   * @returns {Object} Rate limit info
   */
  isAllowed(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    let history = this.requests.get(key) || [];
    history = history.filter((time) => time > windowStart);
    const allowed = history.length < this.maxRequests;
    if (allowed) {
      history.push(now);
    }
    this.requests.set(key, history);
    if (Math.random() < 0.01) {
      this.cleanup();
    }
    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - history.length),
      resetTime: windowStart + this.windowMs
    };
  }
  /**
   * Cleanup old entries
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [key, history] of this.requests.entries()) {
      const filtered = history.filter((time) => time > windowStart);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }
};
var rateLimitStore = new RateLimitStore();

// src/moviesdrive/http-client.js
var setTimeout = (ms) => new Promise((r) => global.setTimeout(r, ms));
var HttpClient = class {
  constructor(options = {}) {
    this.timeout = options.timeout || (process.env.REQUEST_TIMEOUT || 1e4);
    this.userAgent = options.userAgent || process.env.USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    this.client = import_axios.default.create({
      timeout: this.timeout,
      headers: {
        "User-Agent": this.userAgent,
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-US,en;q=0.9"
      },
      maxRedirects: 10,
      // Allow following redirects
      validateStatus: () => true
      // Don't throw on any status
    });
    this.client.interceptors.request.use(
      (config) => {
        if (!isValidUrl(config.url)) {
          throw new Error(`SSRF: Blocked request to ${sanitizeForLogging(config.url)}`);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    this.client.interceptors.response.use(
      (response) => {
        var _a, _b, _c, _d;
        const finalUrl = ((_b = (_a = response.request) == null ? void 0 : _a.res) == null ? void 0 : _b.responseUrl) || ((_c = response.config) == null ? void 0 : _c.url) || ((_d = response.request) == null ? void 0 : _d.path);
        if (finalUrl && !isValidUrl(finalUrl)) {
          throw new Error(`SSRF: Blocked redirect to ${sanitizeForLogging(finalUrl)}`);
        }
        return response;
      },
      (error) => {
        var _a;
        if (((_a = error.response) == null ? void 0 : _a.status) === 403) {
          console.error("[HttpClient] Cloudflare protection detected");
        }
        return Promise.reject(error);
      }
    );
  }
  get(_0) {
    return __async(this, arguments, function* (url, options = {}) {
      var _a, _b, _c, _d, _e;
      if (!isValidUrl(url)) {
        throw new Error(`SSRF: Blocked request to ${sanitizeForLogging(url)}`);
      }
      try {
        const response = yield this.client.get(url, __spreadProps(__spreadValues({}, options), {
          timeout: options.timeout || this.timeout
        }));
        let finalUrl = url;
        if ((_b = (_a = response.request) == null ? void 0 : _a.res) == null ? void 0 : _b.responseUrl) {
          finalUrl = response.request.res.responseUrl;
        } else if ((_c = response.config) == null ? void 0 : _c.url) {
          finalUrl = response.config.url;
        } else if ((_d = response.request) == null ? void 0 : _d.path) {
          finalUrl = response.request.path;
        } else if ((_e = response.headers) == null ? void 0 : _e.location) {
          finalUrl = response.headers.location;
        }
        if (!isValidUrl(finalUrl)) {
          throw new Error(`SSRF: Blocked redirect to ${sanitizeForLogging(finalUrl)}`);
        }
        const text = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
        return {
          text,
          status: response.status,
          headers: response.headers,
          url: finalUrl,
          finalUrl
        };
      } catch (error) {
        console.error(`[HttpClient] Error fetching ${sanitizeForLogging(url)}:`, error.message);
        throw error;
      }
    });
  }
  post(_0, _1) {
    return __async(this, arguments, function* (url, data, options = {}) {
      if (!isValidUrl(url)) {
        throw new Error(`SSRF: Blocked request to ${sanitizeForLogging(url)}`);
      }
      try {
        const response = yield this.client.post(url, data, __spreadProps(__spreadValues({}, options), {
          timeout: options.timeout || this.timeout
        }));
        const text = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
        return {
          text,
          status: response.status,
          headers: response.headers
        };
      } catch (error) {
        console.error(`[HttpClient] Error posting to ${sanitizeForLogging(url)}:`, error.message);
        throw error;
      }
    });
  }
  retry(fn, maxRetries = 3, delayMs = 1e3) {
    return __async(this, null, function* () {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return yield fn();
        } catch (error) {
          if (i === maxRetries - 1)
            throw error;
          yield setTimeout(delayMs * (i + 1));
        }
      }
    });
  }
};
var http_client_default = HttpClient;

// src/moviesdrive/link-resolver.js
var import_cheerio = require("cheerio");
var LinkResolver = class {
  constructor() {
    this.http = new http_client_default();
  }
  /**
   * Check whether URL points to a final playable stream target we want to return.
   * @param {string} url
   * @returns {boolean}
   */
  isFinalStreamUrl(url) {
    const lower = String(url || "").toLowerCase();
    const isFinalHubHost = /^https?:\/\/hub\.[^/]+\//i.test(lower) && !lower.includes("hubcloud") && lower.includes("token=");
    return lower.includes("fsl") || lower.includes("hub.fsl") || lower.includes("fsl-lover") || lower.includes("pixeldrain.dev/api/file/") || lower.includes("pixeldrain.com/api/file/") || isFinalHubHost;
  }
  normalizeResolvedSource(stream) {
    const sourceLower = String((stream == null ? void 0 : stream.source) || "").toLowerCase();
    const urlLower = String((stream == null ? void 0 : stream.url) || "").toLowerCase();
    if (sourceLower.includes("pixel") || urlLower.includes("pixeldrain")) {
      return "Pixel";
    }
    if (sourceLower.includes("fsl") || urlLower.includes("fsl")) {
      return "FSL";
    }
    return null;
  }
  isFinalResolvedStream(stream) {
    const url = String((stream == null ? void 0 : stream.url) || "").trim();
    const urlLower = url.toLowerCase();
    if (!url.startsWith("http") || !isValidUrl(url)) {
      return false;
    }
    if (urlLower.includes("/games/")) {
      return false;
    }
    const normalizedSource = this.normalizeResolvedSource(stream);
    if (normalizedSource) {
      return true;
    }
    return this.isFinalStreamUrl(urlLower);
  }
  /**
   * Check whether URL belongs to the expected wrapper chain or final hosts.
   * @param {string} url
   * @returns {boolean}
   */
  isChainRelevantUrl(url) {
    const lower = String(url || "").toLowerCase();
    if (this.isFinalStreamUrl(lower)) {
      return true;
    }
    return lower.includes("hubcloud") || lower.includes("hubcloud.php") || lower.includes("gamerxyt") || lower.includes("carnewz") || lower.includes("cryptoinsights") || lower.includes("/games/");
  }
  /**
   * Known ad/hijack domains to avoid following in chain traversal.
   * @param {string} url
   * @returns {boolean}
   */
  isRejectedRedirectUrl(url) {
    const lower = String(url || "").toLowerCase();
    const rejectedDomains = [
      "bonuscaf",
      "macan-native",
      "blehcourt",
      "gryphline",
      "endfield"
    ];
    return rejectedDomains.some((domain) => lower.includes(domain));
  }
  /**
   * Build absolute URL from candidate and filter invalid/ad URLs.
   * @param {string} candidateUrl
   * @param {string} pageUrl
   * @returns {string|null}
   */
  normalizeCandidateUrl(candidateUrl, pageUrl) {
    if (!candidateUrl) {
      return null;
    }
    let normalized = String(candidateUrl).trim();
    try {
      if (!normalized.startsWith("http")) {
        normalized = new URL(normalized, pageUrl).href;
      }
    } catch (e) {
      return null;
    }
    if (!isValidUrl(normalized) || this.isRejectedRedirectUrl(normalized)) {
      return null;
    }
    return normalized;
  }
  /**
   * Extract redirect candidates from DOM, headers and script patterns.
   * @param {string} pageHtml
   * @param {string} pageUrl
   * @param {Object} response
   * @returns {Array<{url:string,type:string,priority:number}>}
   */
  extractRedirectCandidates(pageHtml, pageUrl, response) {
    var _a;
    const candidates = [];
    const $ = (0, import_cheerio.load)(pageHtml);
    const addCandidate = (rawUrl, type, priority) => {
      const normalized = this.normalizeCandidateUrl(rawUrl, pageUrl);
      if (!normalized) {
        return;
      }
      candidates.push({
        url: normalized,
        type,
        priority
      });
    };
    $("a#download[href]").each((_, elem) => {
      addCandidate($(elem).attr("href"), "a#download[href]", 10);
    });
    $(".downloads-btns-div a[href]").each((_, elem) => {
      addCandidate($(elem).attr("href"), ".downloads-btns-div a[href]", 20);
    });
    $('a[href*="hubcloud.php"]').each((_, elem) => {
      addCandidate($(elem).attr("href"), 'a[href*="hubcloud.php"]', 30);
    });
    $('a[href*="/games/"]').each((_, elem) => {
      addCandidate($(elem).attr("href"), 'a[href*="/games/"]', 40);
    });
    if ((response == null ? void 0 : response.status) >= 300 && (response == null ? void 0 : response.status) < 400 && ((_a = response == null ? void 0 : response.headers) == null ? void 0 : _a.location)) {
      addCandidate(response.headers.location, "http-location-header", 15);
    }
    const metaRefreshMatch = pageHtml.match(/<meta[^>]*?http-equiv=["']refresh["'][^>]*?content=["']([^"']*)['"]/i);
    if (metaRefreshMatch) {
      const redirectContent = metaRefreshMatch[1];
      const urlMatch = redirectContent.match(/url=([^\s;]+)/i);
      if (urlMatch) {
        addCandidate(urlMatch[1].replace(/['"]/g, ""), "meta-refresh", 50);
      }
    }
    const jsRedirectPatterns = [
      { regex: /var\s+url\s*=\s*['"]([^'"]+)['"]/i, type: "js-var-url", priority: 35 },
      { regex: /window\.location\.replace\s*\(\s*['"]([^'"]+)['"]/i, type: "js-window.location.replace", priority: 60 },
      { regex: /window\.location\.href\s*=\s*['"]([^'"]+)['"]/i, type: "js-window.location.href", priority: 65 },
      { regex: /window\.location\s*=\s*['"]([^'"]+)['"]/i, type: "js-window.location", priority: 70 },
      { regex: /location\.href\s*=\s*['"]([^'"]+)['"]/i, type: "js-location.href", priority: 75 },
      { regex: /document\.location\s*=\s*['"]([^'"]+)['"]/i, type: "js-document.location", priority: 80 },
      { regex: /window\.open\s*\(\s*['"]([^'"]+)['"]/i, type: "js-window.open", priority: 85 },
      { regex: /onclick\s*=\s*["'][^"']*window\.location\s*=\s*['"]([^'"]+)['"]/i, type: "js-onclick", priority: 90 }
    ];
    for (const pattern of jsRedirectPatterns) {
      const match = pageHtml.match(pattern.regex);
      if (match == null ? void 0 : match[1]) {
        addCandidate(match[1], pattern.type, pattern.priority);
      }
    }
    const deduped = /* @__PURE__ */ new Map();
    for (const candidate of candidates) {
      const existing = deduped.get(candidate.url);
      if (!existing || candidate.priority < existing.priority) {
        deduped.set(candidate.url, candidate);
      }
    }
    return Array.from(deduped.values()).sort((a, b) => a.priority - b.priority);
  }
  /**
   * Convert a final URL candidate directly into a stream entry.
   * @param {string} url
   * @returns {Object|null}
   */
  createStreamFromFinalUrl(url) {
    const lower = String(url || "").toLowerCase();
    const isFinalHubHost = /^https?:\/\/hub\.[^/]+\//i.test(lower) && !lower.includes("hubcloud") && lower.includes("token=");
    if (lower.includes("pixeldrain")) {
      const fileId = this.extractPixelDrainId(url);
      if (fileId) {
        return {
          url: `https://pixeldrain.dev/api/file/${fileId}?download`,
          quality: 1080,
          source: "PixelDrain"
        };
      }
      return null;
    }
    if (lower.includes("fsl") || isFinalHubHost) {
      return {
        url,
        quality: 1080,
        source: "FSL Server"
      };
    }
    return null;
  }
  /**
   * Resolve a wrapper URL through redirect chain to get final streaming URL
   * Handles: hubcloud.php -> intermediate page -> FSL/PixelDrain URLs
   * Also handles meta refresh and JavaScript redirects
   * Extracts links from intermediate pages as well as final page
   * 
   * Example flow:
   * gamerxyt.com/hubcloud.php?... -> carnewz.site/hubcloud.php?... -> cryptoinsights.site/games/ -> extract FSL/PixelDrain
   */
  resolveWrapperUrl(wrapperUrl) {
    return __async(this, null, function* () {
      try {
        console.log(`[LinkResolver] Resolving wrapper: ${sanitizeForLogging(wrapperUrl)}`);
        const allStreams = [];
        const visitedUrls = /* @__PURE__ */ new Set();
        let currentUrl = wrapperUrl;
        let redirectCount = 0;
        const maxRedirects = 15;
        while (currentUrl && redirectCount < maxRedirects) {
          if (visitedUrls.has(currentUrl)) {
            console.log(`[LinkResolver] Already visited ${sanitizeForLogging(currentUrl)}, stopping`);
            break;
          }
          visitedUrls.add(currentUrl);
          console.log(`[LinkResolver] [Step ${redirectCount + 1}] Fetching: ${sanitizeForLogging(currentUrl)}`);
          try {
            const response = yield this.http.get(currentUrl, {
              timeout: 2e4,
              maxRedirects: 0
              // Handle redirects manually to track the chain
            });
            const pageHtml = response.text;
            const responseUrl = response.url || response.finalUrl || currentUrl;
            console.log(`[LinkResolver] Response URL: ${sanitizeForLogging(responseUrl)}`);
            const pageStreams = yield this.extractStreamsFromPage(pageHtml, responseUrl);
            if (pageStreams.length > 0) {
              console.log(`[LinkResolver] \u2713 Found ${pageStreams.length} stream(s) on this page`);
              allStreams.push(...pageStreams);
            }
            const redirectCandidates = this.extractRedirectCandidates(pageHtml, responseUrl, response);
            if (!redirectCandidates.length) {
              console.log(`[LinkResolver] No redirect candidates found, reached final page`);
              break;
            }
            const nextCandidate = redirectCandidates.find((candidate) => {
              return !visitedUrls.has(candidate.url) && this.isChainRelevantUrl(candidate.url);
            });
            if (!nextCandidate) {
              console.log(`[LinkResolver] No chain-relevant redirect candidates found, stopping traversal`);
              break;
            }
            if (this.isFinalStreamUrl(nextCandidate.url)) {
              const directStream = this.createStreamFromFinalUrl(nextCandidate.url);
              if (directStream && !allStreams.find((stream) => stream.url === directStream.url)) {
                allStreams.push(directStream);
                console.log(`[LinkResolver] \u2713 Final stream discovered directly from redirect candidate: ${sanitizeForLogging(directStream.url)}`);
              }
              break;
            }
            const nextUrl = nextCandidate.url;
            console.log(`[LinkResolver] Following ${nextCandidate.type} to: ${sanitizeForLogging(nextUrl)}`);
            currentUrl = nextUrl;
            redirectCount++;
          } catch (error) {
            console.error(`[LinkResolver] Error fetching ${sanitizeForLogging(currentUrl)}: ${error.message}`);
            break;
          }
        }
        console.log(`[LinkResolver] Redirect chain complete. Total steps: ${redirectCount}`);
        const uniqueStreams = [];
        const seenUrls = /* @__PURE__ */ new Set();
        for (const stream of allStreams) {
          if (!seenUrls.has(stream.url)) {
            seenUrls.add(stream.url);
            uniqueStreams.push(stream);
          }
        }
        const finalStreams = uniqueStreams.filter((stream) => this.isFinalResolvedStream(stream));
        if (finalStreams.length > 0) {
          console.log(`[LinkResolver] \u2713 Total unique final streams: ${finalStreams.length}`);
          finalStreams.forEach((s, i) => {
            console.log(`  [${i + 1}] ${s.source} (${s.quality}p): ${sanitizeForLogging(s.url)}`);
          });
        } else {
          console.log(`[LinkResolver] \u2717 No final streaming links found in redirect chain`);
        }
        return finalStreams;
      } catch (error) {
        console.error(`[LinkResolver] Error resolving ${sanitizeForLogging(wrapperUrl)}:`, error.message);
        return [];
      }
    });
  }
  /**
   * Decode obfuscated JavaScript content (data-digest pattern)
   * Some pages use base64-encoded JavaScript to hide actual links
   */
  decodeObfuscatedContent(html) {
    try {
      const digestMatch = html.match(/data-digest=["']([A-Za-z0-9+/=]+)["']/);
      if (digestMatch) {
        const base64Content = digestMatch[1];
        try {
          const decoded = Buffer.from(base64Content, "base64").toString("utf-8");
          console.log(`[LinkResolver] Decoded obfuscated content (${decoded.length} bytes)`);
          console.log(`[LinkResolver] Decoded preview: ${decoded.substring(0, 500)}...`);
          const urlMatches = decoded.match(/https?:\/\/[^"'\s<>()]+/g) || [];
          console.log(`[LinkResolver] Found ${urlMatches.length} raw URLs in decoded content`);
          const filteredUrls = urlMatches.filter((url) => {
            const urlLower = url.toLowerCase();
            return urlLower.includes("fsl") || urlLower.includes("pixeldrain") || urlLower.includes("hubcloud") || urlLower.includes("gdflix") || urlLower.includes("hub.fsl") || urlLower.includes("fsl-lover");
          });
          if (filteredUrls.length > 0) {
            console.log(`[LinkResolver] Filtered to ${filteredUrls.length} streaming URLs`);
            return filteredUrls;
          }
          const hexStrings = decoded.match(/0x[0-9a-f]{2}/gi) || [];
          if (hexStrings.length > 0) {
            console.log(`[LinkResolver] Found ${hexStrings.length} hex-encoded values, attempting to decode...`);
            const charCodeMatches = decoded.match(/String\.fromCharCode\(([^)]+)\)/g) || [];
            for (const match of charCodeMatches) {
              const numbers = match.match(/\d+/g);
              if (numbers) {
                try {
                  const str = String.fromCharCode(...numbers.map((n) => parseInt(n)));
                  if (str.includes("http") && (str.includes("fsl") || str.includes("pixeldrain"))) {
                    console.log(`[LinkResolver] Found URL in fromCharCode: ${str.substring(0, 100)}`);
                    return [str];
                  }
                } catch (e) {
                }
              }
            }
          }
        } catch (e) {
          console.debug(`[LinkResolver] Failed to decode base64: ${e.message}`);
        }
      }
      const hexArrayMatch = html.match(/var _0x[a-f0-9]+\s*=\s*\[([^\]]+)\]/);
      if (hexArrayMatch) {
        const arrayContent = hexArrayMatch[1];
        const urlMatches = arrayContent.match(/https?:\/\/[^"'\s,]+/g) || [];
        return urlMatches;
      }
      const allUrls = html.match(/https?:\/\/[^"'\s<>]+/g) || [];
      const streamingUrls = allUrls.filter((url) => {
        const urlLower = url.toLowerCase();
        return urlLower.includes("fsl") || urlLower.includes("pixeldrain") || urlLower.includes("hub.fsl");
      });
      if (streamingUrls.length > 0) {
        console.log(`[LinkResolver] Found ${streamingUrls.length} streaming URLs in raw HTML`);
        return streamingUrls;
      }
      return [];
    } catch (error) {
      console.debug(`[LinkResolver] Error decoding obfuscated content: ${error.message}`);
      return [];
    }
  }
  /**
   * Extract streaming links from page HTML
   * Looks for FSL Server, PixelDrain, and other hosting links
   * Based on the Kotlin extractor patterns from VCloud and HubCloud
   */
  extractStreamsFromPage(html, pageUrl) {
    return __async(this, null, function* () {
      const streams = [];
      const $ = (0, import_cheerio.load)(html);
      const obfuscatedUrls = this.decodeObfuscatedContent(html);
      if (obfuscatedUrls.length > 0) {
        console.log(`[LinkResolver] Found ${obfuscatedUrls.length} URL(s) in obfuscated content`);
        obfuscatedUrls.forEach((url) => {
          if (url.includes("fsl") && !streams.find((s) => s.url === url)) {
            streams.push({
              url,
              quality: 1080,
              source: "FSL Server"
            });
            console.log(`[LinkResolver] \u2713 FSL (decoded): ${sanitizeForLogging(url)}`);
          } else if (url.includes("pixeldrain") && !streams.find((s) => s.url === url)) {
            const fileId = this.extractPixelDrainId(url);
            if (fileId) {
              const apiUrl = `https://pixeldrain.dev/api/file/${fileId}?download`;
              streams.push({
                url: apiUrl,
                quality: 1080,
                source: "PixelDrain"
              });
              console.log(`[LinkResolver] \u2713 PixelDrain (decoded): ${sanitizeForLogging(apiUrl)}`);
            }
          }
        });
      }
      const headerText = $("div.card-header").text() || "";
      const pageQuality = this.extractQualityFromText(headerText);
      if (headerText) {
        console.log(`[LinkResolver] Page header: ${headerText.substring(0, 100)}`);
      }
      const pageTitle = $("title").text() || "";
      const anyHeading = $("h1, h2, h3, h4, h5").first().text() || "";
      const extractedQuality = pageQuality || this.extractQualityFromText(pageTitle) || this.extractQualityFromText(anyHeading);
      if (extractedQuality && extractedQuality !== 720) {
        console.log(`[LinkResolver] Extracted quality from page: ${extractedQuality}p`);
      }
      const fslSelectors = [
        'a[id="fsl"]',
        'a[href*="hub.fsl-lover"]',
        'a[href*="fsl-lover"]',
        'a[href*="fsl"]',
        'a:contains("FSL")',
        'a:contains("Download [FSL")',
        'a:contains("FSL Server")',
        'a.btn-success[href*="fsl"]',
        'a.btn[href*="fsl"]',
        'a[rel="noreferrer nofollow noopener"][href*="fsl"]',
        'a[target="_blank"][href*="fsl"]',
        'a[download][href*="fsl"]',
        "div.card-body h2 a.btn",
        // Common container pattern
        "div.center_it a"
        // Howblogs pattern
      ];
      for (const selector of fslSelectors) {
        $(selector).each((_, elem) => {
          const $elem = $(elem);
          let href = $elem.attr("href");
          const text = $elem.text() || "";
          if (selector.includes("div.card-body") || selector.includes("div.center_it")) {
            if (!text.toLowerCase().includes("fsl")) {
              return;
            }
          }
          if (href) {
            if (!href.startsWith("http")) {
              href = new URL(href, pageUrl).href;
            }
            if (!isValidUrl(href)) {
              console.warn(`[LinkResolver] Skipping invalid FSL URL: ${sanitizeForLogging(href)}`);
              return;
            }
            const ariaLabel = $elem.attr("aria-label") || "";
            const titleAttr = $elem.attr("title") || "";
            const downloadAttr = $elem.attr("download") || "";
            const combinedText = `${text} ${ariaLabel} ${titleAttr} ${downloadAttr} ${headerText}`;
            const quality = this.extractQualityFromText(combinedText) || pageQuality || 1080;
            const fileSize = this.extractFileSizeFromText(combinedText);
            const streamTitle = downloadAttr || titleAttr || text;
            if (!streams.find((s) => s.url === href)) {
              streams.push({
                url: href,
                quality,
                source: "FSL Server",
                title: streamTitle || "",
                fileSize: fileSize || void 0
              });
              console.log(`[LinkResolver] \u2713 FSL: ${sanitizeForLogging(href)} (${quality}p)`);
            }
          }
        });
      }
      const pixelDrainSelectors = [
        'a[href*="pixeldrain.dev/u/"]',
        'a[href*="pixeldrain.com/u/"]',
        'a[href*="pixeldrain"]',
        'a:contains("PixelDrain")',
        'a:contains("PixelServer")',
        'a:contains("Pixel Server")',
        'a:contains("Server : 2")',
        // Common PixelServer label
        'a[download*="pixeldrain"]',
        'a[href*="pixeldrain"][download]',
        'a[target="_blank"][href*="pixeldrain"]',
        'a[rel*="noreferrer"][href*="pixeldrain"]',
        "div.card-body h2 a.btn"
        // Check in same container as FSL
      ];
      for (const selector of pixelDrainSelectors) {
        $(selector).each((_, elem) => {
          const $elem = $(elem);
          let href = $elem.attr("href");
          const text = $elem.text() || "";
          if (selector.includes("div.card-body")) {
            const textLower = text.toLowerCase();
            if (!textLower.includes("pixel") && !textLower.includes("server : 2") && !textLower.includes("server: 2")) {
              return;
            }
          }
          if (href) {
            const fileId = this.extractPixelDrainId(href);
            if (fileId) {
              if (!href.includes("/api/file/")) {
                href = `https://pixeldrain.dev/api/file/${fileId}?download`;
              }
            }
            if (!href.startsWith("http")) {
              href = new URL(href, pageUrl).href;
            }
            if (!isValidUrl(href)) {
              console.warn(`[LinkResolver] Skipping invalid PixelDrain URL: ${sanitizeForLogging(href)}`);
              return;
            }
            const ariaLabel = $elem.attr("aria-label") || "";
            const titleAttr = $elem.attr("title") || "";
            const downloadAttr = $elem.attr("download") || "";
            const combinedText = `${text} ${ariaLabel} ${titleAttr} ${downloadAttr} ${headerText}`;
            const quality = this.extractQualityFromText(combinedText) || pageQuality || 1080;
            const fileSize = this.extractFileSizeFromText(combinedText);
            const streamTitle = downloadAttr || titleAttr || text;
            if (!streams.find((s) => s.url === href)) {
              streams.push({
                url: href,
                quality,
                source: "PixelDrain",
                title: streamTitle || "",
                fileSize: fileSize || void 0
              });
              console.log(`[LinkResolver] \u2713 PixelDrain: ${sanitizeForLogging(href)} (${quality}p)`);
            }
          }
        });
      }
      const gdFlixSelectors = [
        'a[href*="gdflix.dev/file/"]',
        'a[href*="gdflix.lol/file/"]',
        'a:contains("GDFlix")',
        'a.btn-primary[href*="gdflix"]'
      ];
      for (const selector of gdFlixSelectors) {
        $(selector).each((_, elem) => {
          const $elem = $(elem);
          let href = $elem.attr("href");
          if (href) {
            if (!href.startsWith("http")) {
              href = new URL(href, pageUrl).href;
            }
            if (!isValidUrl(href)) {
              console.warn(`[LinkResolver] Skipping invalid GDFlix URL: ${sanitizeForLogging(href)}`);
              return;
            }
            const quality = this.extractQualityFromText($elem.text());
            if (!streams.find((s) => s.url === href)) {
              streams.push({
                url: href,
                quality,
                source: "GDFlix"
              });
              console.log(`[LinkResolver] \u2713 GDFlix: ${sanitizeForLogging(href)} (${quality}p)`);
            }
          }
        });
      }
      const goFileSelectors = [
        'a[href*="gofile.io/d/"]',
        'a:contains("GoFile")',
        'a[href*="gofile"]'
      ];
      for (const selector of goFileSelectors) {
        $(selector).each((_, elem) => {
          const $elem = $(elem);
          let href = $elem.attr("href");
          if (href) {
            if (!href.startsWith("http")) {
              href = new URL(href, pageUrl).href;
            }
            if (!isValidUrl(href)) {
              console.warn(`[LinkResolver] Skipping invalid GoFile URL: ${sanitizeForLogging(href)}`);
              return;
            }
            const quality = this.extractQualityFromText($elem.text());
            if (!streams.find((s) => s.url === href)) {
              streams.push({
                url: href,
                quality,
                source: "GoFile"
              });
              console.log(`[LinkResolver] \u2713 GoFile: ${sanitizeForLogging(href)} (${quality}p)`);
            }
          }
        });
      }
      const streamTapeSelectors = [
        'a[href*="streamtape.com"]',
        'a[href*="streamta.pe"]',
        'a:contains("StreamTape")'
      ];
      for (const selector of streamTapeSelectors) {
        $(selector).each((_, elem) => {
          const $elem = $(elem);
          let href = $elem.attr("href");
          if (href) {
            if (!href.startsWith("http")) {
              href = new URL(href, pageUrl).href;
            }
            if (!isValidUrl(href)) {
              console.warn(`[LinkResolver] Skipping invalid StreamTape URL: ${sanitizeForLogging(href)}`);
              return;
            }
            const quality = this.extractQualityFromText($elem.text());
            if (!streams.find((s) => s.url === href)) {
              streams.push({
                url: href,
                quality,
                source: "StreamTape"
              });
              console.log(`[LinkResolver] \u2713 StreamTape: ${sanitizeForLogging(href)} (${quality}p)`);
            }
          }
        });
      }
      const mixDropSelectors = [
        'a[href*="mixdrop.co"]',
        'a[href*="mixdrop.to"]',
        'a:contains("MixDrop")'
      ];
      for (const selector of mixDropSelectors) {
        $(selector).each((_, elem) => {
          const $elem = $(elem);
          let href = $elem.attr("href");
          if (href) {
            if (!href.startsWith("http")) {
              href = new URL(href, pageUrl).href;
            }
            if (!isValidUrl(href)) {
              console.warn(`[LinkResolver] Skipping invalid MixDrop URL: ${sanitizeForLogging(href)}`);
              return;
            }
            const quality = this.extractQualityFromText($elem.text());
            if (!streams.find((s) => s.url === href)) {
              streams.push({
                url: href,
                quality,
                source: "MixDrop"
              });
              console.log(`[LinkResolver] \u2713 MixDrop: ${sanitizeForLogging(href)} (${quality}p)`);
            }
          }
        });
      }
      $('a[href*="hub.fsl-lover"]').each((_, elem) => {
        const $elem = $(elem);
        let href = $elem.attr("href");
        if (href && !streams.find((s) => s.url === href)) {
          if (!href.startsWith("http")) {
            href = new URL(href, pageUrl).href;
          }
          if (isValidUrl(href)) {
            const text = $elem.text();
            const downloadAttr = $elem.attr("download") || "";
            const titleAttr = $elem.attr("title") || "";
            const combinedText = `${text} ${downloadAttr} ${titleAttr}`;
            const quality = this.extractQualityFromText(combinedText);
            const fileSize = this.extractFileSizeFromText(combinedText);
            streams.push({
              url: href,
              quality,
              source: "FSL Server",
              title: downloadAttr || titleAttr || text || "",
              fileSize: fileSize || void 0
            });
            console.log(`[LinkResolver] \u2713 FSL (direct): ${sanitizeForLogging(href)} (${quality}p)`);
          }
        }
      });
      if (streams.length === 0) {
        console.log(`[LinkResolver] No specific links found, trying fallback extraction...`);
        $('a[href^="http"], a[href^="https"]').each((_, elem) => {
          const $elem = $(elem);
          let href = $elem.attr("href");
          const text = $elem.text().toLowerCase();
          if (text.includes("download") || text.includes("stream") || text.includes("watch") || $elem.hasClass("btn-success") || $elem.hasClass("btn-primary") || $elem.hasClass("btn-download")) {
            if (href) {
              if (!href.startsWith("http")) {
                href = new URL(href, pageUrl).href;
              }
              if (!isValidUrl(href)) {
                return;
              }
              if (streams.find((s) => s.url === href)) {
                return;
              }
              if (isWrapperUrl(href)) {
                return;
              }
              if (href.toLowerCase().includes("/games/")) {
                return;
              }
              const quality = this.extractQualityFromText(text);
              streams.push({
                url: href,
                quality,
                source: "Direct"
              });
              console.log(`[LinkResolver] \u2713 Fallback: ${sanitizeForLogging(href)} (${quality}p)`);
            }
          }
        });
      }
      return streams;
    });
  }
  /**
   * Extract PixelDrain file ID from URL
   * Converts pixeldrain.dev/u/FILEID -> FILEID
   * Also handles pixeldrain.dev/api/file/FILEID format
   */
  extractPixelDrainId(url) {
    const uMatch = url.match(/pixeldrain\.(?:dev|com)\/u\/([a-zA-Z0-9]+)/);
    if (uMatch)
      return uMatch[1];
    const apiMatch = url.match(/pixeldrain\.(?:dev|com)\/api\/file\/([a-zA-Z0-9]+)/);
    if (apiMatch)
      return apiMatch[1];
    return null;
  }
  /**
   * Extract quality from text
   */
  extractQualityFromText(text) {
    const qualityMap = {
      "4k": 2160,
      "2160p": 2160,
      "1080p": 1080,
      "1080": 1080,
      "fullhd": 1080,
      "fhd": 1080,
      "720p": 720,
      "720": 720,
      "hd": 720,
      "480p": 480,
      "sd": 480,
      "360p": 360
    };
    const textLower = String(text).toLowerCase();
    for (const [key, value] of Object.entries(qualityMap)) {
      if (textLower.includes(key)) {
        return value;
      }
    }
    const match = textLower.match(/(\d{3,4})p?/);
    if (match) {
      return parseInt(match[1]);
    }
    return 720;
  }
  /**
   * Extract first file size token from text.
   * @param {string} text
   * @returns {string|null}
   */
  extractFileSizeFromText(text) {
    const match = String(text || "").match(/(\d+(?:\.\d+)?)\s*(TB|GB|MB)/i);
    if (!match) {
      return null;
    }
    return `${match[1]} ${match[2].toUpperCase()}`;
  }
  /**
   * Validate if a URL is actually reachable
   */
  validateUrl(url, timeout = 5e3) {
    return __async(this, null, function* () {
      try {
        const response = yield this.http.get(url, { timeout });
        return response.status >= 200 && response.status < 400;
      } catch (error) {
        console.debug(`[LinkResolver] URL validation failed for ${sanitizeForLogging(url)}: ${error.message}`);
        return false;
      }
    });
  }
  /**
   * Resolve and validate multiple URLs
   */
  resolveAndValidate(urls, validateOnce = false) {
    return __async(this, null, function* () {
      const validatedStreams = [];
      for (const streamObj of urls) {
        try {
          let finalUrl = streamObj.url;
          if (isWrapperUrl(finalUrl)) {
            const resolved = yield this.resolveWrapperUrl(finalUrl);
            validatedStreams.push(...resolved);
          } else {
            if (!validateOnce || (yield this.validateUrl(finalUrl))) {
              validatedStreams.push(streamObj);
            }
          }
        } catch (error) {
          console.warn(`[LinkResolver] Failed to process ${sanitizeForLogging(streamObj.url)}: ${error.message}`);
        }
      }
      return validatedStreams;
    });
  }
};
var link_resolver_default = LinkResolver;

// src/moviesdrive/utils.js
var import_cheerio2 = require("cheerio");
var SourceExtractors = class {
  constructor() {
    this.http = new http_client_default();
    this.linkResolver = new link_resolver_default();
  }
  /**
   * Extract from various hosting providers
   * @param {string} url - Hosting provider URL
   * @param {string} title - Optional title for the stream
   * @param {string} fileSize - Optional file size
   * @returns {Promise<Array<Object>>} Array of extracted stream objects
   */
  extractFromUrl(url, title = "", fileSize = "") {
    return __async(this, null, function* () {
      if (!url)
        return [];
      const urlLower = url.toLowerCase();
      console.log(`[Extractor] Extracting from: ${urlLower.substring(0, 50)}...`);
      if (title) {
        console.log(`[Extractor] Title: ${title}`);
      }
      try {
        if (isWrapperUrl(url)) {
          console.log(`[Extractor] Detected wrapper URL, resolving through redirect chain`);
          const streams = yield this.linkResolver.resolveWrapperUrl(url);
          return streams.map((s) => __spreadProps(__spreadValues({}, s), {
            title: s.title || title,
            fileSize: s.fileSize || fileSize
          }));
        }
        if (urlLower.includes("hubcloud") || urlLower.includes("gdrive")) {
          return yield this.extractGDrive(url, title, fileSize);
        } else if (urlLower.includes("streamtape") || urlLower.includes("streamta.pe")) {
          return yield this.extractStreamTape(url, title, fileSize);
        } else if (urlLower.includes("mixdrop")) {
          return yield this.extractMixDrop(url, title, fileSize);
        } else if (urlLower.includes("pixeldrain")) {
          return yield this.extractPixelDrain(url, title, fileSize);
        } else if (urlLower.includes("gofile")) {
          return yield this.extractGoFile(url, title, fileSize);
        } else if (urlLower.includes("gdflix")) {
          return yield this.extractGDFlix(url, title, fileSize);
        } else if (urlLower.includes("gdlink")) {
          return yield this.extractGDLink(url, title, fileSize);
        } else if (urlLower.includes("fsl")) {
          return yield this.extractFSL(url, title, fileSize);
        } else {
          return yield this.extractGeneric(url, title, fileSize);
        }
      } catch (error) {
        console.error(`[Extractor] Error extracting from ${url}:`, error.message);
        return [];
      }
    });
  }
  /**
   * Extract from GDrive/HubCloud
   */
  extractGDrive(url, title = "", fileSize = "") {
    return __async(this, null, function* () {
      try {
        const response = yield this.http.get(url, { timeout: 2e4 });
        const text = typeof response.text === "string" ? response.text : JSON.stringify(response.text);
        const $ = (0, import_cheerio2.load)(text);
        const streams = [];
        $('a[href*="drive.google.com"], a[href*="/uc?"], a[href*="export=download"]').each((_, elem) => {
          const $elem = $(elem);
          let href = $elem.attr("href");
          if (href) {
            if (!href.startsWith("http")) {
              href = new URL(href, url).href;
            }
            const buttonText = $elem.text() || "";
            const quality = this.extractQualityFromText(buttonText);
            streams.push({
              url: href,
              quality,
              source: "GDrive",
              title,
              fileSize
            });
          }
        });
        const scriptText = $("script").text();
        const driveMatch = scriptText.match(/window\.location\s*=\s*['"](https:\/\/drive\.google\.com\/[^'"]+)['"]/i);
        if (driveMatch) {
          streams.push({
            url: driveMatch[1],
            quality: 1080,
            source: "GDrive",
            title,
            fileSize
          });
        }
        console.debug(`[GDrive] Found ${streams.length} stream(s)`);
        return streams.map((s) => __spreadProps(__spreadValues({}, s), {
          title: s.title || title,
          fileSize: s.fileSize || fileSize
        }));
      } catch (error) {
        console.error(`[GDrive] Error:`, error.message);
        return [];
      }
    });
  }
  /**
   * Extract from StreamTape
   */
  extractStreamTape(url, title = "", fileSize = "") {
    return __async(this, null, function* () {
      try {
        const response = yield this.http.get(url, { timeout: 2e4 });
        const text = typeof response.text === "string" ? response.text : JSON.stringify(response.text);
        const $ = (0, import_cheerio2.load)(text);
        const streams = [];
        const scriptText = $("script").text();
        const videoMatch = scriptText.match(/sources:\s*\[\s*\{[^}]*src:\s*['"]([^'"]+)['"]/);
        if (videoMatch) {
          streams.push({
            url: videoMatch[1],
            quality: 720,
            source: "StreamTape",
            title,
            fileSize
          });
        }
        $('a[href*="download"], button[data-url]').each((_, elem) => {
          const $elem = $(elem);
          const href = $elem.attr("href") || $elem.attr("data-url");
          if (href && href.includes("stream")) {
            streams.push({
              url: href,
              quality: 720,
              source: "StreamTape",
              title,
              fileSize
            });
          }
        });
        console.debug(`[StreamTape] Found ${streams.length} stream(s)`);
        return streams.map((s) => __spreadProps(__spreadValues({}, s), {
          title: s.title || title,
          fileSize: s.fileSize || fileSize
        }));
      } catch (error) {
        console.error(`[StreamTape] Error:`, error.message);
        return [];
      }
    });
  }
  /**
   * Extract from MixDrop
   */
  extractMixDrop(url, title = "", fileSize = "") {
    return __async(this, null, function* () {
      try {
        const response = yield this.http.get(url, { timeout: 2e4 });
        const text = typeof response.text === "string" ? response.text : JSON.stringify(response.text);
        const $ = (0, import_cheerio2.load)(text);
        const streams = [];
        $("video source, video").each((_, elem) => {
          const $elem = $(elem);
          const src = $elem.attr("src") || $elem.find("source").attr("src");
          if (src) {
            streams.push({
              url: src,
              quality: 720,
              source: "MixDrop",
              title,
              fileSize
            });
          }
        });
        const scriptText = $("script").text();
        const wurlMatch = scriptText.match(/wurl\s*=\s*["']([^"']+)["']/);
        if (wurlMatch) {
          const videoUrl = "https://" + wurlMatch[1];
          streams.push({
            url: videoUrl,
            quality: 720,
            source: "MixDrop",
            title,
            fileSize
          });
        }
        console.debug(`[MixDrop] Found ${streams.length} stream(s)`);
        return streams.map((s) => __spreadProps(__spreadValues({}, s), {
          title: s.title || title,
          fileSize: s.fileSize || fileSize
        }));
      } catch (error) {
        console.error(`[MixDrop] Error:`, error.message);
        return [];
      }
    });
  }
  /**
   * Extract from PixelDrain
   */
  extractPixelDrain(url, title = "", fileSize = "") {
    return __async(this, null, function* () {
      try {
        if (url.includes("zip") || url.includes("archive")) {
          console.log(`[PixelDrain] Processing zip file: ${url}`);
          return yield this.extractZipFile(url, title, fileSize);
        }
        const fileId = this.extractPixelDrainId(url);
        if (fileId) {
          const apiUrl = `https://pixeldrain.dev/api/file/${fileId}?download`;
          console.log(`[PixelDrain] Converted ${url} to API URL: ${apiUrl}`);
          return [{
            url: apiUrl,
            quality: 1080,
            source: "PixelDrain",
            title,
            fileSize
          }];
        }
        return [];
      } catch (error) {
        console.error(`[PixelDrain] Error:`, error.message);
        return [];
      }
    });
  }
  /**
   * Extract PixelDrain file ID from URL
   * Supports both /u/FILEID and /api/file/FILEID patterns
   */
  extractPixelDrainId(url) {
    const uMatch = url.match(/pixeldrain\.dev\/u\/([a-zA-Z0-9]+)/);
    if (uMatch)
      return uMatch[1];
    const apiMatch = url.match(/pixeldrain\.dev\/api\/file\/([a-zA-Z0-9]+)/);
    if (apiMatch)
      return apiMatch[1];
    return null;
  }
  /**
   * Extract from GoFile
   */
  extractGoFile(url, title = "", fileSize = "") {
    return __async(this, null, function* () {
      try {
        const response = yield this.http.get(url, { timeout: 2e4 });
        const text = typeof response.text === "string" ? response.text : JSON.stringify(response.text);
        const $ = (0, import_cheerio2.load)(text);
        const streams = [];
        $('a[href*="download"], button[data-url], a.btn-primary').each((_, elem) => {
          const $elem = $(elem);
          const href = $elem.attr("href") || $elem.attr("data-url");
          if (href) {
            streams.push({
              url: href,
              quality: 720,
              source: "GoFile",
              title,
              fileSize
            });
          }
        });
        console.debug(`[GoFile] Found ${streams.length} stream(s)`);
        return streams.map((s) => __spreadProps(__spreadValues({}, s), {
          title: s.title || title,
          fileSize: s.fileSize || fileSize
        }));
      } catch (error) {
        console.error(`[GoFile] Error:`, error.message);
        return [];
      }
    });
  }
  /**
   * Extract from GDFlix
   */
  extractGDFlix(url, title = "", fileSize = "") {
    return __async(this, null, function* () {
      try {
        const response = yield this.http.get(url, { timeout: 2e4 });
        const text = typeof response.text === "string" ? response.text : JSON.stringify(response.text);
        const $ = (0, import_cheerio2.load)(text);
        const streams = [];
        $('a[href*="drive"], a.btn-primary, button[data-url], a[href*="download"]').each((_, elem) => {
          const $elem = $(elem);
          let href = $elem.attr("href") || $elem.attr("data-url");
          if (href) {
            if (!href.startsWith("http")) {
              href = new URL(href, url).href;
            }
            const buttonText = $elem.text() || "";
            const quality = this.extractQualityFromText(buttonText);
            if (href.includes("drive") || href.includes("download")) {
              streams.push({
                url: href,
                quality,
                source: "GDFlix",
                title,
                fileSize
              });
            }
          }
        });
        console.debug(`[GDFlix] Found ${streams.length} stream(s)`);
        return streams.map((s) => __spreadProps(__spreadValues({}, s), {
          title: s.title || title,
          fileSize: s.fileSize || fileSize
        }));
      } catch (error) {
        console.error(`[GDFlix] Error:`, error.message);
        return [];
      }
    });
  }
  /**
   * Extract from GDLink
   */
  extractGDLink(url, title = "", fileSize = "") {
    return __async(this, null, function* () {
      try {
        const response = yield this.http.get(url, { timeout: 2e4 });
        const text = typeof response.text === "string" ? response.text : JSON.stringify(response.text);
        const $ = (0, import_cheerio2.load)(text);
        const streams = [];
        $('a[href*="drive"], a.btn-primary, button[data-url]').each((_, elem) => {
          const $elem = $(elem);
          let href = $elem.attr("href") || $elem.attr("data-url");
          if (href && href.includes("drive")) {
            streams.push({
              url: href,
              quality: 720,
              source: "GDLink",
              title,
              fileSize
            });
          }
        });
        console.debug(`[GDLink] Found ${streams.length} stream(s)`);
        return streams.map((s) => __spreadProps(__spreadValues({}, s), {
          title: s.title || title,
          fileSize: s.fileSize || fileSize
        }));
      } catch (error) {
        console.error(`[GDLink] Error:`, error.message);
        return [];
      }
    });
  }
  /**
   * Extract from FSL Server
   */
  extractFSL(url, title = "", fileSize = "") {
    return __async(this, null, function* () {
      try {
        if (url.includes("fsl")) {
          return [{
            url,
            quality: 1080,
            source: "FSL Server",
            title,
            fileSize
          }];
        }
        return [];
      } catch (error) {
        console.error(`[FSL] Error:`, error.message);
        return [];
      }
    });
  }
  /**
   * Generic extractor for unknown hosts
   */
  extractGeneric(url, title = "", fileSize = "") {
    return __async(this, null, function* () {
      try {
        const response = yield this.http.get(url, { timeout: 2e4 });
        const text = typeof response.text === "string" ? response.text : JSON.stringify(response.text);
        const $ = (0, import_cheerio2.load)(text);
        const streams = [];
        const selectors = [
          'a[href*="download"]',
          "a.download",
          "a.btn-primary",
          "button[data-url]",
          "source"
        ];
        for (const selector of selectors) {
          $(selector).each((_, elem) => {
            const $elem = $(elem);
            const href = $elem.attr("href") || $elem.attr("src") || $elem.attr("data-url");
            if (href && (href.startsWith("http") || href.startsWith("blob"))) {
              if (!streams.find((s) => s.url === href)) {
                streams.push({
                  url: href,
                  quality: 720,
                  source: "Direct",
                  title,
                  fileSize
                });
              }
            }
          });
          if (streams.length > 0)
            break;
        }
        console.debug(`[Generic] Found ${streams.length} stream(s)`);
        return streams.map((s) => __spreadProps(__spreadValues({}, s), {
          title: s.title || title,
          fileSize: s.fileSize || fileSize
        }));
      } catch (error) {
        console.error(`[Generic] Error:`, error.message);
        return [];
      }
    });
  }
  /**
   * Extract from zip files
   */
  extractZipFile(url, title = "", fileSize = "") {
    return __async(this, null, function* () {
      try {
        console.log(`[ZipExtractor] Extracting from zip file: ${url}`);
        const response = yield this.http.get(url, { timeout: 3e4 });
        const text = typeof response.text === "string" ? response.text : JSON.stringify(response.text);
        const $ = (0, import_cheerio2.load)(text);
        const streams = [];
        $("a[href]").each((_, elem) => {
          const $elem = $(elem);
          const href = $elem.attr("href");
          const linkText = $elem.text();
          if (href && (href.includes(".mkv") || href.includes(".mp4") || href.includes(".avi"))) {
            const filename = href.split("/").pop() || linkText;
            const metadata = this.extractMetadataFromFilename(filename);
            streams.push({
              url: href.startsWith("http") ? href : new URL(href, url).href,
              quality: metadata.quality,
              source: "Zip Archive",
              title: metadata.title,
              fileSize: metadata.fileSize
            });
          }
        });
        console.debug(`[ZipExtractor] Found ${streams.length} stream(s) in zip file`);
        return streams.map((s) => __spreadProps(__spreadValues({}, s), {
          title: s.title || title,
          fileSize: s.fileSize || fileSize
        }));
      } catch (error) {
        console.error(`[ZipExtractor] Error:`, error.message);
        return [];
      }
    });
  }
  /**
   * Extract metadata from filename
   * Format: Landman.S01E01.1080p.BluRay.Hindi.2.0-English.5.1.ESub.x264 [FSL / PIXEL SERVER] [resolution] [file size]
   */
  extractMetadataFromFilename(filename) {
    const filenameLower = filename.toLowerCase();
    const episodeMatch = filenameLower.match(/s(\d+)e(\d+)/);
    const season = episodeMatch ? parseInt(episodeMatch[1]) : 1;
    const episode = episodeMatch ? parseInt(episodeMatch[2]) : 1;
    const quality = this.extractQualityFromText(filename);
    const sizeMatch = filenameLower.match(/(\d+\.?\d*)\s*(gb|mb)/i);
    const fileSize = sizeMatch ? `${sizeMatch[1]} ${sizeMatch[2].toUpperCase()}` : "";
    const sourceMatch = filenameLower.match(/\[(.*?)\]/);
    const source = sourceMatch ? sourceMatch[1] : "Unknown";
    const title = `${filename.split(".")[0]} [${source}] [${quality}p] [${fileSize}]`;
    return {
      quality,
      fileSize,
      title,
      source
    };
  }
  /**
   * Extract quality from text
   */
  extractQualityFromText(text) {
    const qualityMap = {
      "4k": 2160,
      "2160p": 2160,
      "1080p": 1080,
      "1080": 1080,
      "fullhd": 1080,
      "fhd": 1080,
      "720p": 720,
      "720": 720,
      "hd": 720,
      "480p": 480,
      "sd": 480,
      "360p": 360
    };
    const textLower = String(text).toLowerCase();
    for (const [key, value] of Object.entries(qualityMap)) {
      if (textLower.includes(key)) {
        return value;
      }
    }
    const match = textLower.match(/(\d{3,4})p?/);
    if (match) {
      return parseInt(match[1]);
    }
    return 720;
  }
};
var utils_default = SourceExtractors;

// src/moviesdrive/subtitles.js
var import_cheerio3 = require("cheerio");
var SubtitlesExtractor = class {
  constructor() {
    this.languageMap = {
      "english": "eng",
      "hindi": "hin",
      "spanish": "spa",
      "french": "fre",
      "german": "ger",
      "italian": "ita",
      "portuguese": "por",
      "russian": "rus",
      "chinese": "chi",
      "japanese": "jpn",
      "korean": "kor",
      "arabic": "ara",
      "turkish": "tur",
      "polish": "pol",
      "dutch": "dut",
      "swedish": "swe",
      "norwegian": "nor",
      "danish": "dan",
      "finnish": "fin",
      "czech": "cze",
      "hungarian": "hun",
      "greek": "gre",
      "hebrew": "heb",
      "thai": "tha",
      "vietnamese": "vie",
      "indonesian": "ind",
      "malay": "may",
      "romanian": "rum",
      "ukrainian": "ukr",
      "bulgarian": "bul",
      "croatian": "hrv",
      "serbian": "srp",
      "slovenian": "slv",
      "estonian": "est",
      "latvian": "lav",
      "lithuanian": "lit"
    };
  }
  /**
   * Extract subtitles from HTML content
   * @param {string} imdbId - IMDB ID
   * @param {string} htmlContent - HTML content to parse
   * @returns {Promise<Array<Object>>} Array of subtitle objects
   */
  getSubtitles(imdbId, htmlContent) {
    return __async(this, null, function* () {
      try {
        const $ = (0, import_cheerio3.load)(htmlContent);
        const subtitles = [];
        $('a[href*=".srt"], a[href*=".vtt"], a[href*=".ass"], a[href*="subtitle"]').each((_, elem) => {
          const $elem = $(elem);
          const href = $elem.attr("href");
          const text = $elem.text() || "";
          if (href) {
            const language = this.detectLanguage(text);
            subtitles.push({
              id: `${imdbId}-sub-${subtitles.length}`,
              url: href.startsWith("http") ? href : `https://new1.moviesdrive.surf${href}`,
              lang: language,
              language: this.getLanguageName(language)
            });
          }
        });
        return subtitles;
      } catch (error) {
        console.error(`[Subtitles] Error extracting subtitles:`, error.message);
        return [];
      }
    });
  }
  /**
   * Detect language from text
   * @param {string} text - Text to analyze
   * @returns {string} Language code
   */
  detectLanguage(text) {
    const textLower = text.toLowerCase();
    for (const [name, code] of Object.entries(this.languageMap)) {
      if (textLower.includes(name)) {
        return code;
      }
    }
    return "eng";
  }
  /**
   * Get full language name from code
   * @param {string} code - Language code
   * @returns {string} Language name
   */
  getLanguageName(code) {
    const reverseMap = Object.fromEntries(
      Object.entries(this.languageMap).map(([k, v]) => [v, k])
    );
    return reverseMap[code] || "English";
  }
};
var subtitles_default = SubtitlesExtractor;

// src/moviesdrive/cache.js
var CacheManager = class {
  constructor(options = {}) {
    this.ttl = options.ttl || 36e5;
    this.maxSize = options.maxSize || 500;
    this.cache = /* @__PURE__ */ new Map();
  }
  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if expired/not found
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  /**
   * Set item in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} customTtl - Optional custom TTL in ms
   */
  set(key, value, customTtl) {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    const ttl = customTtl || this.ttl;
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }
  /**
   * Delete item from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }
  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.clear();
  }
  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  stats() {
    let expired = 0;
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expired++;
      }
    }
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expired,
      ttl: this.ttl
    };
  }
  /**
   * Clean up expired entries
   * @returns {number} Number of entries removed
   */
  cleanup() {
    const now = Date.now();
    let removed = 0;
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        removed++;
      }
    }
    return removed;
  }
};
var cache_default = CacheManager;

// src/moviesdrive/scrapers/moviesdrive.js
var import_cheerio4 = require("cheerio");
var MoviesDriveScraper = class {
  constructor() {
    this.http = new http_client_default();
    this.extractors = new utils_default();
    this.subtitles = new subtitles_default();
    this.apiUrl = process.env.MOVIESDRIVE_API || "https://new3.moviesdrive.christmas";
    this.cache = new cache_default({
      ttl: (process.env.CACHE_TTL || 3600) * 1e3,
      // Convert to ms
      maxSize: 500
    });
  }
  /**
   * Extract hosting provider links from a page
   * Matches the Kotlin: extractMdrive function from CineStreamUtils.kt
   * Looks for links containing: hubcloud, gdflix, gdlink
   * @param {string} url - The URL to extract from
   * @returns {Promise<Array<string>>} Extracted hosting links
   */
  extractMdrive(url) {
    return __async(this, null, function* () {
      try {
        const response = yield this.http.get(url);
        const textResponse = typeof response.text === "string" ? response.text : JSON.stringify(response.text);
        const $ = (0, import_cheerio4.load)(textResponse);
        const links = [];
        const hostingProviders = [
          "hubcloud",
          "gdflix",
          "gdlink",
          "gdfilm",
          "filezone",
          "droplinks",
          "verystream",
          "uptobox",
          "mixdrop",
          "streamtape",
          "pixeldrain",
          "gofile"
        ];
        const providerRegex = new RegExp(hostingProviders.join("|"), "i");
        $("a").each((_, elem) => {
          const href = $(elem).attr("href");
          if (href && providerRegex.test(href)) {
            links.push(href);
          }
        });
        console.debug(`[MoviesDrive] Extracted ${links.length} hosting provider links from ${url}`);
        return [...new Set(links)];
      } catch (error) {
        console.error(`[MoviesDrive] Error extracting links from ${url}:`, error.message);
        return [];
      }
    });
  }
  /**
   * Extract quality from plain text (e.g. 480p/720p/1080p/4K)
   * @param {string} text
   * @returns {number}
   */
  extractQualityFromText(text) {
    const qualityMap = {
      "4k": 2160,
      "2160p": 2160,
      "1080p": 1080,
      "1080": 1080,
      "720p": 720,
      "720": 720,
      "480p": 480,
      "480": 480,
      "360p": 360,
      "360": 360
    };
    const textLower = String(text || "").toLowerCase();
    for (const [key, value] of Object.entries(qualityMap)) {
      if (textLower.includes(key)) {
        return value;
      }
    }
    const match = textLower.match(/(\d{3,4})p/);
    return match ? parseInt(match[1], 10) : 720;
  }
  /**
   * Parse movie resolution blocks from paired h5 tags:
   * <h5>Title...</h5>
   * <h5><a href="...">...</a></h5>
   * @param {Function} $ - Cheerio instance
   * @returns {Array<{titleFromH5: string, mdrivePageUrl: string, parsedQuality: number}>}
   */
  parseMovieDownloadBlocks($) {
    const blocks = [];
    const seen = /* @__PURE__ */ new Set();
    $("h5").each((_, elem) => {
      const $h5 = $(elem);
      const $link = $h5.find("a[href]").first();
      if (!$link.length) {
        return;
      }
      const previousH5 = $h5.prevAll("h5").first();
      if (!previousH5.length || previousH5.find("a[href]").length > 0) {
        return;
      }
      const titleFromH5 = previousH5.text().replace(/\s+/g, " ").trim();
      if (!titleFromH5) {
        return;
      }
      let href = $link.attr("href");
      if (!href) {
        return;
      }
      try {
        if (!href.startsWith("http")) {
          href = new URL(href, this.apiUrl).href;
        }
      } catch (e) {
        return;
      }
      const parsedQuality = this.extractQualityFromText(`${titleFromH5} ${$link.text()}`);
      const key = `${titleFromH5}|${href}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      blocks.push({
        titleFromH5,
        mdrivePageUrl: href,
        parsedQuality
      });
    });
    return blocks;
  }
  /**
   * Extract a strict HubCloud wrapper URL from an mdrive archive page.
   * Priority:
   * 1) h4 a[href*="hubcloud"]
   * 2) a[href*="hubcloud"][href*="/drive/"]
   * @param {string} mdrivePageUrl
   * @returns {Promise<string|null>}
   */
  extractHubCloudWrapperFromMdrive(mdrivePageUrl) {
    return __async(this, null, function* () {
      try {
        const response = yield this.http.get(mdrivePageUrl, { timeout: 2e4 });
        const textResponse = typeof response.text === "string" ? response.text : JSON.stringify(response.text);
        const $ = (0, import_cheerio4.load)(textResponse);
        const selectors = [
          'h4 a[href*="hubcloud"]',
          'a[href*="hubcloud"][href*="/drive/"]'
        ];
        for (const selector of selectors) {
          const candidates = $(selector).toArray();
          for (const candidate of candidates) {
            let href = $(candidate).attr("href");
            if (!href) {
              continue;
            }
            try {
              if (!href.startsWith("http")) {
                href = new URL(href, mdrivePageUrl).href;
              }
            } catch (e) {
              continue;
            }
            const hrefLower = href.toLowerCase();
            if (hrefLower.includes("hubcloud") && hrefLower.includes("/drive/")) {
              return href;
            }
          }
        }
        return null;
      } catch (error) {
        console.error(`[MoviesDrive] Error getting hubcloud wrapper from ${mdrivePageUrl}:`, error.message);
        return null;
      }
    });
  }
  /**
   * Normalize stream source names for movie output.
   * @param {Object} stream
   * @returns {'FSL'|'Pixel'|null}
   */
  normalizeMovieSource(stream) {
    const urlLower = String((stream == null ? void 0 : stream.url) || "").toLowerCase();
    const sourceLower = String((stream == null ? void 0 : stream.source) || "").toLowerCase();
    if (urlLower.includes("pixeldrain") || sourceLower.includes("pixel")) {
      return "Pixel";
    }
    if (urlLower.includes("fsl") || urlLower.includes("hub.fsl") || sourceLower.includes("fsl")) {
      return "FSL";
    }
    return null;
  }
  /**
   * Normalize stream source names for series output.
   * @param {Object} stream
   * @returns {'FSL'|'Pixel'|null}
   */
  normalizeSeriesSource(stream) {
    const urlLower = String((stream == null ? void 0 : stream.url) || "").toLowerCase();
    const sourceLower = String((stream == null ? void 0 : stream.source) || "").toLowerCase();
    if (urlLower.includes("pixeldrain") || sourceLower.includes("pixel")) {
      return "Pixel";
    }
    if (sourceLower.includes("fsl") || urlLower.includes("fsl")) {
      return "FSL";
    }
    return null;
  }
  normalizeWhitespace(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }
  extractFileSizeFromText(text) {
    const normalized = this.normalizeWhitespace(text);
    const match = normalized.match(/(\d+(?:\.\d+)?)\s*(TB|GB|MB)/i);
    if (!match) {
      return null;
    }
    return `${match[1]} ${match[2].toUpperCase()}`;
  }
  cleanSeriesHubCloudFilename(rawFilename) {
    const normalized = this.normalizeWhitespace(rawFilename);
    if (!normalized) {
      return null;
    }
    let cleaned = normalized.replace(/\.(mkv|mp4|avi|mov|m4v|webm)\b.*$/i, "").replace(/\s*[-–—]?\s*\[[^\]]*moviesdrives?[^\]]*\]\s*$/i, "").replace(/\s*[-–—]?\s*moviesdrives?\.[a-z]{2,}\s*$/i, "").replace(/\s*[-–—]?\s*\[[^\]]*\.cv[^\]]*\]\s*$/i, "").replace(/[-_.\s]+$/g, "").trim();
    if (!cleaned) {
      return null;
    }
    cleaned = cleaned.replace(/\s+/g, " ");
    return cleaned || null;
  }
  /**
   * Extract filename and size metadata from a HubCloud drive wrapper page.
   * @param {string} wrapperUrl
   * @returns {Promise<{rawFilename:string|null,cleanBaseTitle:string|null,fileSize:string|null}|null>}
   */
  extractHubCloudDriveMetadata(wrapperUrl) {
    return __async(this, null, function* () {
      const cacheKey = `hubmeta:${wrapperUrl}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached.__missing ? null : cached;
      }
      try {
        const response = yield this.http.get(wrapperUrl, { timeout: 2e4 });
        const textResponse = typeof response.text === "string" ? response.text : JSON.stringify(response.text);
        const $ = (0, import_cheerio4.load)(textResponse);
        const rawFilename = this.normalizeWhitespace($("div.card-header").first().text()) || this.normalizeWhitespace($("title").first().text()) || null;
        const cleanBaseTitle = this.cleanSeriesHubCloudFilename(rawFilename);
        let fileSize = null;
        const sizeCandidates = [];
        $("li").each((_, elem) => {
          const rowText = this.normalizeWhitespace($(elem).text());
          if (!/file\s*size/i.test(rowText)) {
            return;
          }
          sizeCandidates.push(this.normalizeWhitespace($(elem).find("i").first().text()));
          sizeCandidates.push(rowText);
        });
        sizeCandidates.push(this.normalizeWhitespace($('li:contains("File Size") i').first().text()));
        sizeCandidates.push(this.normalizeWhitespace($('li:contains("File Size")').first().text()));
        $("i#size").each((_, elem) => {
          sizeCandidates.push(this.normalizeWhitespace($(elem).text()));
        });
        for (const candidate of sizeCandidates) {
          const parsed = this.extractFileSizeFromText(candidate);
          if (parsed) {
            fileSize = parsed;
            break;
          }
        }
        if (!fileSize) {
          const pageText = this.normalizeWhitespace($.root().text());
          const fallbackSizeMatch = pageText.match(/file\s*size[^0-9]*(\d+(?:\.\d+)?)\s*(TB|GB|MB)/i);
          if (fallbackSizeMatch) {
            fileSize = `${fallbackSizeMatch[1]} ${fallbackSizeMatch[2].toUpperCase()}`;
          }
        }
        const metadata = {
          rawFilename,
          cleanBaseTitle,
          fileSize: fileSize || null
        };
        if (!metadata.rawFilename && !metadata.cleanBaseTitle && !metadata.fileSize) {
          this.cache.set(cacheKey, { __missing: true });
          return null;
        }
        this.cache.set(cacheKey, metadata);
        return metadata;
      } catch (error) {
        console.error(`[MoviesDrive] Error extracting HubCloud metadata from ${wrapperUrl}:`, error.message);
        this.cache.set(cacheKey, { __missing: true });
        return null;
      }
    });
  }
  /**
   * Parse season number from permalink slug.
   * Examples:
   * - /landman-season-1/ => 1
   * - /show-season_2/ => 2
   * - /show-s01/ => 1
   * @param {string} permalink
   * @returns {number|null}
   */
  getSeasonFromPermalink(permalink) {
    const normalized = String(permalink || "").toLowerCase();
    if (!normalized) {
      return null;
    }
    const patterns = [
      /(?:^|[\/_-])season(?:[\s/_-]|%20)*0*(\d+)(?=$|[\/_-])/i,
      /(?:^|[\/_-])s0*(\d{1,2})(?=$|[\/_-])/i
    ];
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (!(match == null ? void 0 : match[1])) {
        continue;
      }
      const value = parseInt(match[1], 10);
      if (!Number.isNaN(value) && value > 0) {
        return value;
      }
    }
    return null;
  }
  parseFileSizeToMB(fileSize) {
    const match = String(fileSize || "").match(/(\d+(?:\.\d+)?)\s*(TB|GB|MB)/i);
    if (!match) {
      return 0;
    }
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === "TB")
      return value * 1024 * 1024;
    if (unit === "GB")
      return value * 1024;
    return value;
  }
  formatEpisodeNumber(episode) {
    return String(Math.max(1, parseInt(episode, 10) || 1)).padStart(2, "0");
  }
  buildSeriesFallbackBaseTitle(documentTitle, season, episode) {
    const episodeTag = `S${String(season).padStart(2, "0")}E${this.formatEpisodeNumber(episode)}`;
    const normalizedTitle = this.normalizeWhitespace(documentTitle);
    if (!normalizedTitle) {
      return `Series.${episodeTag}`;
    }
    const strippedSeason = normalizedTitle.replace(/\bseason\s*\d+\b.*$/i, "").replace(/\(\d{4}\)/g, "").trim();
    const compact = strippedSeason.replace(/[^a-zA-Z0-9]+/g, ".").replace(/\.+/g, ".").replace(/^\.|\.$/g, "");
    return compact ? `${compact}.${episodeTag}` : `Series.${episodeTag}`;
  }
  extractPreferredSeriesBaseTitle(streamTitle) {
    const normalized = this.normalizeWhitespace(streamTitle);
    if (!normalized) {
      return null;
    }
    const hasEpisodeToken = /s\d+\s*e\d+|ep(?:isode)?\s*0*\d+/i.test(normalized);
    const hasVideoExt = /\.(mkv|mp4|avi|mov|m4v|webm)$/i.test(normalized);
    if (!hasEpisodeToken && !hasVideoExt) {
      return null;
    }
    const withoutExtension = normalized.replace(/\.(mkv|mp4|avi|mov|m4v|webm)$/i, "");
    return withoutExtension.trim();
  }
  /**
   * Parse series resolution blocks from sequential h5 nodes:
   * - h5 text: "Season X ... 480p ..."
   * - next h5 link: "... Single Episode"
   * @param {Function} $ - Cheerio instance
   * @param {number} season - Requested season number
   * @returns {Array<{seasonHeadingTitle:string,quality:number,mdriveArchiveUrl:string,perEpisodeSizeIfPresent:string|null}>}
   */
  parseSeriesSingleEpisodeBlocks($, season) {
    const blocks = [];
    const seen = /* @__PURE__ */ new Set();
    const h5Nodes = $("h5").toArray();
    const seasonRegex = new RegExp(`\\bseason\\s*0*${season}\\b|\\bs0*${season}\\b`, "i");
    for (let i = 0; i < h5Nodes.length; i++) {
      const current = $(h5Nodes[i]);
      if (current.find("a[href]").length > 0) {
        continue;
      }
      const headingText = this.normalizeWhitespace(current.text());
      if (!headingText || !seasonRegex.test(headingText)) {
        continue;
      }
      if (!/(?:\b\d{3,4}p\b|\b4k\b)/i.test(headingText)) {
        continue;
      }
      const quality = this.extractQualityFromText(headingText);
      if (!quality) {
        continue;
      }
      const nextNode = h5Nodes[i + 1] ? $(h5Nodes[i + 1]) : null;
      if (!nextNode || nextNode.find("a[href]").length === 0) {
        continue;
      }
      const anchor = nextNode.find("a[href]").first();
      const anchorText = this.normalizeWhitespace(anchor.text());
      const anchorTextLower = anchorText.toLowerCase();
      if (!anchorTextLower.includes("single episode") || anchorTextLower.includes("zip")) {
        continue;
      }
      let href = anchor.attr("href");
      if (!href) {
        continue;
      }
      try {
        if (!href.startsWith("http")) {
          href = new URL(href, this.apiUrl).href;
        }
      } catch (e) {
        continue;
      }
      const key = `${quality}|${href}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      blocks.push({
        seasonHeadingTitle: headingText,
        quality,
        mdriveArchiveUrl: href,
        perEpisodeSizeIfPresent: this.extractFileSizeFromText(headingText)
      });
    }
    return blocks;
  }
  /**
   * Extract exact episode HubCloud wrapper from mdrive archive page.
   * @param {string} archiveUrl - mdrive archive URL containing all episodes
   * @param {number} episode - requested episode number
   * @returns {Promise<{hubcloudWrapperUrl:string,episodeLabel:string,episodeFileSize:string|null}|null>}
   */
  extractEpisodeHubCloudFromArchive(archiveUrl, episode) {
    return __async(this, null, function* () {
      try {
        const response = yield this.http.get(archiveUrl, { timeout: 2e4 });
        const textResponse = typeof response.text === "string" ? response.text : JSON.stringify(response.text);
        const $ = (0, import_cheerio4.load)(textResponse);
        const h5Nodes = $("h5").toArray();
        const episodeInt = Math.max(1, parseInt(episode, 10) || 1);
        const targetEpisodeRegex = new RegExp(
          `\\b(?:ep(?:isode)?\\s*0*${episodeInt}|e\\s*0*${episodeInt}|s\\d+e\\s*0*${episodeInt})\\b`,
          "i"
        );
        const anyEpisodeRegex = /\b(?:ep(?:isode)?\s*\d+|e\s*\d+|s\d+e\d+)\b/i;
        for (let i = 0; i < h5Nodes.length; i++) {
          const headingNode = $(h5Nodes[i]);
          if (headingNode.find("a[href]").length > 0) {
            continue;
          }
          const headingText = this.normalizeWhitespace(headingNode.text());
          if (!targetEpisodeRegex.test(headingText)) {
            continue;
          }
          const episodeFileSize = this.extractFileSizeFromText(headingText);
          for (let j = i + 1; j < h5Nodes.length; j++) {
            const sectionNode = $(h5Nodes[j]);
            const sectionText = this.normalizeWhitespace(sectionNode.text());
            if (sectionNode.find("a[href]").length === 0) {
              if (anyEpisodeRegex.test(sectionText)) {
                break;
              }
              continue;
            }
            const anchors = sectionNode.find("a[href]").toArray();
            for (const anchorElem of anchors) {
              let href = $(anchorElem).attr("href");
              if (!href) {
                continue;
              }
              try {
                if (!href.startsWith("http")) {
                  href = new URL(href, archiveUrl).href;
                }
              } catch (e) {
                continue;
              }
              const hrefLower = href.toLowerCase();
              if (hrefLower.includes("hubcloud") && hrefLower.includes("/drive/")) {
                return {
                  hubcloudWrapperUrl: href,
                  episodeLabel: headingText,
                  episodeFileSize
                };
              }
            }
          }
          return null;
        }
        return null;
      } catch (error) {
        console.error(`[MoviesDrive] Error getting episode wrapper from ${archiveUrl}:`, error.message);
        return null;
      }
    });
  }
  /**
   * Search for content by IMDB ID and get document
   * @param {string} imdbId - IMDB ID (e.g., tt1234567)
   * @param {number} [season] - Season number (for series)
   * @returns {Promise<Object|null>} Search result with document
   */
  searchAndGetDocument(imdbId, season) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      try {
        const cacheKey = season ? `search:${imdbId}:S${season}` : `search:${imdbId}`;
        const cached = this.cache.get(cacheKey);
        if (cached) {
          console.log(`[MoviesDrive] Cache hit for ${imdbId}${season ? ` S${season}` : ""}`);
          return cached;
        }
        const searchUrl = `${this.apiUrl}/search.php?q=${imdbId}`;
        console.log(`[MoviesDrive] Searching at: ${searchUrl}`);
        const response = yield this.http.get(searchUrl);
        const textResponse = typeof response.text === "string" ? response.text : JSON.stringify(response.text);
        const searchData = JSON.parse(textResponse);
        if (!searchData.hits || searchData.hits.length === 0) {
          console.log(`[MoviesDrive] No results found for ${imdbId}`);
          return null;
        }
        let document = null;
        const hits = Array.isArray(searchData.hits) ? searchData.hits : [];
        const exactImdbHits = hits.filter((hit) => {
          var _a2;
          return ((_a2 = hit == null ? void 0 : hit.document) == null ? void 0 : _a2.imdb_id) === imdbId;
        });
        const candidateHits = exactImdbHits.length > 0 ? exactImdbHits : hits;
        if (season) {
          const requestedSeason = Math.max(1, parseInt(season, 10) || 1);
          console.log(`[MoviesDrive] Looking for season ${requestedSeason} in ${candidateHits.length} candidate result(s)`);
          candidateHits.forEach((hit, index) => {
            var _a2;
            const permalink = ((_a2 = hit == null ? void 0 : hit.document) == null ? void 0 : _a2.permalink) || "";
            const parsedSeason = this.getSeasonFromPermalink(permalink);
            console.log(
              `[MoviesDrive] Candidate ${index + 1}/${candidateHits.length}: permalink=${permalink || "[none]"} parsedSeason=${parsedSeason != null ? parsedSeason : "n/a"}`
            );
          });
          const titlePattern = new RegExp(`\\bSeason\\s*0*${requestedSeason}\\b|\\bS\\s*0*${requestedSeason}\\b`, "i");
          const seasonPermalinkHit = candidateHits.find((hit) => {
            var _a2;
            const permalink = ((_a2 = hit == null ? void 0 : hit.document) == null ? void 0 : _a2.permalink) || "";
            const parsedSeason = this.getSeasonFromPermalink(permalink);
            return parsedSeason === requestedSeason;
          });
          if (seasonPermalinkHit == null ? void 0 : seasonPermalinkHit.document) {
            document = seasonPermalinkHit.document;
            console.log(`[MoviesDrive] Selected tier=permalink-season-match: ${document.permalink}`);
          } else {
            const seasonTitleHit = candidateHits.find((hit) => {
              var _a2, _b2;
              const title = ((_a2 = hit == null ? void 0 : hit.document) == null ? void 0 : _a2.post_title) || ((_b2 = hit == null ? void 0 : hit.document) == null ? void 0 : _b2.title) || "";
              return titlePattern.test(title);
            });
            if (seasonTitleHit == null ? void 0 : seasonTitleHit.document) {
              document = seasonTitleHit.document;
              console.log(`[MoviesDrive] Selected tier=title-season-match: ${document.permalink}`);
            } else if ((_a = candidateHits[0]) == null ? void 0 : _a.document) {
              document = candidateHits[0].document;
              console.log(`[MoviesDrive] Selected tier=first-exact-imdb-hit: ${document.permalink}`);
            } else if ((_b = hits[0]) == null ? void 0 : _b.document) {
              document = hits[0].document;
              console.log(`[MoviesDrive] Selected tier=first-overall-hit: ${document.permalink}`);
            }
          }
        } else {
          if (((_c = candidateHits[0]) == null ? void 0 : _c.document) && exactImdbHits.length > 0) {
            document = candidateHits[0].document;
            console.log(`[MoviesDrive] Found exact movie match for ${imdbId}`);
          } else if ((_d = hits[0]) == null ? void 0 : _d.document) {
            document = hits[0].document;
            console.log(`[MoviesDrive] No exact movie match for ${imdbId}, using first result`);
          }
        }
        if (!(document == null ? void 0 : document.permalink)) {
          console.log(`[MoviesDrive] No document/permalink selected for ${imdbId}`);
          return null;
        }
        const contentUrl = `${this.apiUrl}${document.permalink}`;
        console.log(`[MoviesDrive] Fetching content page: ${contentUrl}`);
        const contentResponse = yield this.http.get(contentUrl);
        const contentText = typeof contentResponse.text === "string" ? contentResponse.text : JSON.stringify(contentResponse.text);
        const $ = (0, import_cheerio4.load)(contentText);
        const result = {
          document,
          html: contentText,
          $
        };
        this.cache.set(cacheKey, result);
        return result;
      } catch (error) {
        console.error(`[MoviesDrive] Error searching for ${imdbId}:`, error.message);
        return null;
      }
    });
  }
  /**
   * Extract movie streams
   * @param {string} imdbId - IMDB ID
   * @param {string} _title - Movie title (unused for movie-page h5 title mode)
   * @returns {Promise<Array<Object>>} Array of streams
   */
  extractMovieStreams(imdbId, _title) {
    return __async(this, null, function* () {
      console.log(`[MoviesDrive] Getting streams for movie ${imdbId}`);
      const result = yield this.searchAndGetDocument(imdbId);
      if (!result)
        return [];
      const { $ } = result;
      const allStreams = [];
      const resolutionBlocks = this.parseMovieDownloadBlocks($);
      console.log(`[MoviesDrive] Found ${resolutionBlocks.length} movie resolution block(s) for ${imdbId}`);
      for (const block of resolutionBlocks) {
        try {
          console.log(`[MoviesDrive] Processing ${block.parsedQuality}p block: ${block.titleFromH5}`);
          console.log(`[MoviesDrive] Archive page: ${block.mdrivePageUrl}`);
          const hubcloudWrapper = yield this.extractHubCloudWrapperFromMdrive(block.mdrivePageUrl);
          if (!hubcloudWrapper) {
            console.log(`[MoviesDrive] No HubCloud wrapper found for ${block.mdrivePageUrl}, skipping (strict mode)`);
            continue;
          }
          console.log(`[MoviesDrive] HubCloud wrapper: ${hubcloudWrapper}`);
          const extractedStreams = yield this.extractors.extractFromUrl(hubcloudWrapper, block.titleFromH5);
          if (!extractedStreams.length) {
            console.log(`[MoviesDrive] No final streams resolved from wrapper ${hubcloudWrapper}`);
            continue;
          }
          for (const stream of extractedStreams) {
            const normalizedSource = this.normalizeMovieSource(stream);
            if (!normalizedSource) {
              continue;
            }
            const finalUrl = stream == null ? void 0 : stream.url;
            if (!finalUrl || !String(finalUrl).startsWith("http")) {
              continue;
            }
            const fileSize = (stream == null ? void 0 : stream.fileSize) || this.extractFileSizeFromText(stream == null ? void 0 : stream.title) || this.extractFileSizeFromText(block.titleFromH5) || null;
            allStreams.push(__spreadProps(__spreadValues({}, stream), {
              url: finalUrl,
              quality: block.parsedQuality,
              source: normalizedSource,
              title: `${block.titleFromH5} [${normalizedSource}]`,
              fileSize,
              _sizeMb: this.parseFileSizeToMB(fileSize)
            }));
          }
        } catch (error) {
          console.error(`[MoviesDrive] Error processing movie block ${block.mdrivePageUrl}:`, error.message);
        }
      }
      const sourcePriority = { FSL: 2, Pixel: 1 };
      allStreams.sort((a, b) => {
        if (b.quality !== a.quality) {
          return b.quality - a.quality;
        }
        const sizeDiff = (b._sizeMb || 0) - (a._sizeMb || 0);
        if (sizeDiff !== 0) {
          return sizeDiff;
        }
        const sourceDiff = (sourcePriority[b.source] || 0) - (sourcePriority[a.source] || 0);
        if (sourceDiff !== 0) {
          return sourceDiff;
        }
        return String(a.url || "").localeCompare(String(b.url || ""));
      });
      const uniqueStreams = [];
      const seenUrls = /* @__PURE__ */ new Set();
      for (const stream of allStreams) {
        if (!seenUrls.has(stream.url)) {
          seenUrls.add(stream.url);
          const _a = stream, { _sizeMb } = _a, cleanStream = __objRest(_a, ["_sizeMb"]);
          uniqueStreams.push(cleanStream);
        }
      }
      console.log(`[MoviesDrive] Total streams: ${uniqueStreams.length}`);
      return uniqueStreams;
    });
  }
  /**
   * Extract series streams
   * @param {string} imdbId - IMDB ID
   * @param {number} season - Season number
   * @param {number} episode - Episode number
   * @returns {Promise<Array<Object>>} Array of streams
   */
  extractSeriesStreams(imdbId, season, episode) {
    return __async(this, null, function* () {
      console.log(`[MoviesDrive] Getting streams for series ${imdbId} S${season}E${episode}`);
      const result = yield this.searchAndGetDocument(imdbId, season);
      if (!result)
        return [];
      const { $, document } = result;
      const allStreams = [];
      try {
        const seriesBlocks = this.parseSeriesSingleEpisodeBlocks($, season);
        console.log(`[MoviesDrive] Found ${seriesBlocks.length} series resolution block(s) for S${season}`);
        for (const block of seriesBlocks) {
          console.log(`[MoviesDrive] Processing ${block.quality}p archive: ${block.mdriveArchiveUrl}`);
          const episodeData = yield this.extractEpisodeHubCloudFromArchive(block.mdriveArchiveUrl, episode);
          if (!(episodeData == null ? void 0 : episodeData.hubcloudWrapperUrl)) {
            console.log(`[MoviesDrive] No HubCloud episode wrapper found for ${block.mdriveArchiveUrl}, skipping (strict mode)`);
            continue;
          }
          const wrapperMeta = yield this.extractHubCloudDriveMetadata(episodeData.hubcloudWrapperUrl);
          const fallbackBaseTitle = this.buildSeriesFallbackBaseTitle(
            (document == null ? void 0 : document.post_title) || (document == null ? void 0 : document.title),
            season,
            episode
          );
          const inheritedFileSize = episodeData.episodeFileSize || block.perEpisodeSizeIfPresent || null;
          const extractedStreams = yield this.extractors.extractFromUrl(
            episodeData.hubcloudWrapperUrl,
            fallbackBaseTitle,
            inheritedFileSize
          );
          if (!extractedStreams.length) {
            console.log(`[MoviesDrive] No final streams resolved from wrapper ${episodeData.hubcloudWrapperUrl}`);
            continue;
          }
          for (const stream of extractedStreams) {
            const normalizedSource = this.normalizeSeriesSource(stream);
            if (!normalizedSource) {
              continue;
            }
            const finalUrl = String((stream == null ? void 0 : stream.url) || "").trim();
            if (!finalUrl.startsWith("http")) {
              continue;
            }
            const finalLower = finalUrl.toLowerCase();
            if (finalLower.includes("mdrive.lol") || finalLower.includes("hubcloud") || finalLower.includes("gamerxyt") || finalLower.includes("carnewz") || finalLower.includes("cryptoinsights")) {
              continue;
            }
            const streamDerivedBaseTitle = this.cleanSeriesHubCloudFilename(
              this.extractPreferredSeriesBaseTitle(stream == null ? void 0 : stream.title)
            );
            const preferredBaseTitle = (wrapperMeta == null ? void 0 : wrapperMeta.cleanBaseTitle) || streamDerivedBaseTitle || fallbackBaseTitle;
            const fileSize = (wrapperMeta == null ? void 0 : wrapperMeta.fileSize) || (stream == null ? void 0 : stream.fileSize) || this.extractFileSizeFromText(stream == null ? void 0 : stream.title) || inheritedFileSize;
            const titleParts = [preferredBaseTitle];
            if (!/\b(?:\d{3,4}p|4k)\b/i.test(preferredBaseTitle)) {
              titleParts.push(`[${block.quality}p]`);
            }
            if (fileSize) {
              titleParts.push(`[${fileSize}]`);
            }
            titleParts.push(`[${normalizedSource}]`);
            allStreams.push(__spreadProps(__spreadValues({}, stream), {
              url: finalUrl,
              quality: block.quality,
              source: normalizedSource,
              fileSize: fileSize || null,
              title: titleParts.join(" "),
              _sizeMb: this.parseFileSizeToMB(fileSize)
            }));
          }
        }
      } catch (error) {
        console.error(`[MoviesDrive] Error extracting series:`, error.message);
      }
      const serverPriority = { FSL: 2, Pixel: 1 };
      allStreams.sort((a, b) => {
        if (b.quality !== a.quality) {
          return b.quality - a.quality;
        }
        const sizeDiff = (b._sizeMb || 0) - (a._sizeMb || 0);
        if (sizeDiff !== 0) {
          return sizeDiff;
        }
        return (serverPriority[b.source] || 0) - (serverPriority[a.source] || 0);
      });
      const uniqueStreams = [];
      const seenUrls = /* @__PURE__ */ new Set();
      for (const stream of allStreams) {
        if (seenUrls.has(stream.url)) {
          continue;
        }
        seenUrls.add(stream.url);
        const _a = stream, { _sizeMb } = _a, cleanStream = __objRest(_a, ["_sizeMb"]);
        uniqueStreams.push(cleanStream);
      }
      console.log(`[MoviesDrive] Total streams: ${uniqueStreams.length}`);
      return uniqueStreams;
    });
  }
  /**
   * Get all streams for a title
   * @param {Object} item - Meta item with id and type
   * @param {number} season - Season number (for series)
   * @param {number} episode - Episode number (for series)
   * @returns {Promise<Array<Object>>} Array of streams
   */
  getStreams(item, season = 1, episode = 1) {
    return __async(this, null, function* () {
      if (!item.id || !item.id.startsWith("tt")) {
        console.warn(`[MoviesDrive] Invalid item ID: ${item.id}`);
        return [];
      }
      console.log(`[MoviesDrive] Getting streams for ${item.type} ${item.id} S${season}E${episode}`);
      if (item.type === "movie") {
        return yield this.extractMovieStreams(item.id, item.name);
      } else if (item.type === "series") {
        return yield this.extractSeriesStreams(item.id, season, episode);
      }
      return [];
    });
  }
  /**
   * Get subtitles for a title
   * @param {string} imdbId - IMDB ID
   * @returns {Promise<Array<Object>>} Array of subtitle objects
   */
  getSubtitles(imdbId) {
    return __async(this, null, function* () {
      if (!imdbId || !imdbId.startsWith("tt")) {
        return [];
      }
      try {
        const result = yield this.searchAndGetDocument(imdbId);
        if (!result)
          return [];
        const { document } = result;
        const htmlContent = document.html() || "";
        return yield this.subtitles.getSubtitles(imdbId, htmlContent);
      } catch (error) {
        console.error(`[MoviesDrive] Error getting subtitles:`, error.message);
        return [];
      }
    });
  }
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clearAll();
  }
  /**
   * Get cache stats
   */
  getCacheStats() {
    return this.cache.stats();
  }
};
var moviesdrive_default = MoviesDriveScraper;

// src/moviesdrive/index.js
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
function getImdbId(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const tmdbType = mediaType === "tv" ? "tv" : "movie";
    const r = yield fetch(
      `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`
    );
    const data = yield r.json();
    return data.imdb_id;
  });
}
var scraper = new moviesdrive_default();
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const imdbId = yield getImdbId(tmdbId, mediaType);
      if (!imdbId) {
        console.log(`[MoviesDrive] No IMDb ID found for TMDB ${tmdbId}`);
        return [];
      }
      const item = {
        id: imdbId,
        type: mediaType === "tv" ? "series" : "movie"
      };
      console.log(`[MoviesDrive] Request: ${item.type} ${item.id} S${season || 1}E${episode || 1}`);
      const streams = yield scraper.getStreams(item, season, episode);
      return streams.map((s) => ({
        name: "MoviesDrive",
        title: `${s.quality || "Auto"} \u2022 ${s.source || "HLS"}`,
        url: s.url,
        quality: s.quality === 2160 ? "4k" : s.quality ? `${s.quality}p` : "Auto",
        headers: s.headers || {}
      }));
    } catch (error) {
      console.error(`[MoviesDrive] Error: ${error.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
