// Browser-side replacement for the old server-side cache. Persists to
// localStorage so a page reload still has "last known good" data instantly,
// and survives GitHub Pages having zero backend of its own.

const PREFIX = 'sports-dash:';

interface Entry<T> {
  value: T;
  savedAt: number;
}

function read<T>(key: string): Entry<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as Entry<T>) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ value, savedAt: Date.now() }));
  } catch {
    // localStorage full/unavailable (private browsing etc) - fine, just skip persistence
  }
}

export type DataSource = 'live' | 'live-cache' | 'cache-stale' | 'fallback';

interface WithMeta {
  source: DataSource;
  updatedAt: string;
  warning?: string;
  note?: string;
}

// Same live -> fresh-cache -> stale-cache -> fallback pattern the old
// Express backend used, just running in the browser against localStorage
// instead of an in-memory Map.
export async function liveOrCached<T extends object>(
  key: string,
  ttlMs: number,
  liveFn: () => Promise<T>,
  fallbackData: T
): Promise<T & WithMeta> {
  const cached = read<T>(key);
  const fresh = cached && Date.now() - cached.savedAt < ttlMs;

  if (fresh && cached) {
    return { ...cached.value, source: 'live-cache', updatedAt: new Date(cached.savedAt).toISOString() };
  }

  try {
    const data = await liveFn();
    write(key, data);
    return { ...data, source: 'live', updatedAt: new Date().toISOString() };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (cached) {
      return { ...cached.value, source: 'cache-stale', warning: message, updatedAt: new Date().toISOString() };
    }
    return { ...fallbackData, source: 'fallback', warning: message, updatedAt: new Date().toISOString() };
  }
}

// fetch() with a hard timeout so one slow public API never hangs a tab.
export async function fetchJson<T = unknown>(url: string, timeoutMs = 7000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
