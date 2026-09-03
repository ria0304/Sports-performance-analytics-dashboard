// fetch() with a hard timeout so one slow upstream API never hangs a request.
export async function fetchJson(url, { timeoutMs = 7000, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers });
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Wraps a route handler with the cache-then-fallback pattern every sport uses:
// 1. Serve fresh cache if we have it.
// 2. Otherwise fetch live. On success, cache it and serve it ("live").
// 3. On failure, serve stale cache if any ("cache"), else the bundled
//    fallback data ("fallback") - the dashboard should never show a blank tab.
import { cacheGet, cacheSet, cacheGetStale } from './cache.js';

export async function liveOrCached(key, ttlMs, liveFn, fallbackData) {
  const cached = cacheGet(key);
  if (cached && cached.fresh) {
    return { ...cached.value, source: 'live-cache', updatedAt: new Date(cached.savedAt).toISOString() };
  }
  try {
    const data = await liveFn();
    cacheSet(key, data, ttlMs);
    return { ...data, source: 'live', updatedAt: new Date().toISOString() };
  } catch (err) {
    const stale = cacheGetStale(key);
    if (stale) {
      return { ...stale, source: 'cache-stale', warning: err.message, updatedAt: new Date().toISOString() };
    }
    return { ...fallbackData, source: 'fallback', warning: err.message, updatedAt: new Date().toISOString() };
  }
}
