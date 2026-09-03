import { useEffect, useRef, useState, useCallback } from 'react';

interface LiveDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Polls `fetcher` every `intervalMs` while the tab is visible. Pausing on a
// hidden tab avoids burning through the backend's rate-limited upstream
// calls when nobody's looking at the dashboard.
export function useLiveData<T>(fetcher: () => Promise<T>, intervalMs = 30000): LiveDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load live data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, intervalMs);
    return () => clearInterval(id);
  }, [load, intervalMs]);

  return { data, loading, error, refresh: load };
}
