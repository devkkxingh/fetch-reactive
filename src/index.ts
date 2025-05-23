// src/index.ts
export interface FetchState<T = any> {
  results: T;
  loading: boolean;
  error: Error | null;
}

export interface FetchStore<T = any> {
  subscribe(listener: (state: FetchState<T>) => void): () => void;
  refetch(): void;
  abort(): void;
  readonly state: FetchState<T>;
}

export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  retries?: number;
  retryDelay?: number;
  transformResponse?: (data: any) => any;
  onError?: (err: Error) => void;
}

export function createFetchStore<T = any>(
  url: string,
  options: FetchOptions = {}
): FetchStore<T> {
  const {
    method = "GET",
    headers = {},
    body = undefined,
    retries = 0,
    retryDelay = 1000,
    transformResponse = (d: any) => d,
    onError = null,
  } = options;

  const state: FetchState<T> = {
    results: null as any,
    loading: true,
    error: null,
  };

  const listeners = new Set<(s: FetchState<T>) => void>();
  const controller = new AbortController();
  let retryCount = 0;
  let aborted = false;

  const notify = () => listeners.forEach((cb) => cb({ ...state }));

  const subscribe = (cb: (s: FetchState<T>) => void) => {
    listeners.add(cb);
    cb({ ...state });
    return () => listeners.delete(cb);
  };

  const fetchWithRetry = () => {
    state.loading = true;
    state.error = null;
    notify();

    const run = () => {
      fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((data) => {
          state.results = transformResponse(data);
        })
        .catch((err) => {
          if (aborted) return;
          state.error = err;
          if (onError) onError(err);
          if (retryCount < retries) {
            retryCount++;
            setTimeout(run, retryDelay);
            return;
          }
        })
        .finally(() => {
          state.loading = false;
          notify();
        });
    };

    run();
  };

  const refetch = () => {
    retryCount = 0;
    fetchWithRetry();
  };

  const abort = () => {
    aborted = true;
    controller.abort();
    listeners.clear();
  };

  fetchWithRetry();

  return {
    subscribe,
    refetch,
    abort,
    get state() {
      return { ...state };
    },
  };
}
