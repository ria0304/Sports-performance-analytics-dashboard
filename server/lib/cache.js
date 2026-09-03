// Tiny in-memory TTL cache. No Redis needed for a dashboard this size.
// Every route stores its last-known-good payload here too, so if the
// upstream API is slow/down we can still answer with slightly-stale data
// instead of an error.

const store = new Map(); // key -> { value, expiresAt, savedAt }

export function cacheGet(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) return { ...hit, fresh: false };
  return { ...hit, fresh: true };
}

export function cacheSet(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs, savedAt: Date.now() });
}

// Always returns the last successful value for `key`, regardless of TTL.
// Used as the last-resort fallback when a live fetch fails.
export function cacheGetStale(key) {
  const hit = store.get(key);
  return hit ? hit.value : null;
}
