# fetch-reactive

🧠 A zero-dependency **reactive fetch wrapper** for JavaScript & TypeScript.

> Subscribe to loading, error, and data states in a clean, observable way — no frameworks, no fluff.

---

## 🚀 Features

- ✅ Reactive subscription API (`subscribe` / `unsubscribe`)
- 🔁 `refetch()` & `abort()` built-in
- ⏱ Retry with delay on failure
- 🔧 Easy `transformResponse` hook
- 📦 TypeScript support with types included
- 🪶 Lightweight & framework-agnostic

---

## 📦 Install

```bash
npm install fetch-reactive
```

---

## 🎯 Basic Example

```typescript
import { createFetchStore } from "fetch-reactive";

// Create a reactive fetch store
const store = createFetchStore("https://jsonplaceholder.typicode.com/posts");

// Subscribe to state changes
const unsubscribe = store.subscribe(({ loading, results, error }) => {
  if (loading) {
    console.log("⏳ Loading...");
    return;
  }

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  console.log("✅ Data received:", results);
});

// Clean up when done
// unsubscribe();
```

---

## 🔧 Custom Options

```typescript
const store = createFetchStore("https://api.example.com/data", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your-token",
  },
  body: JSON.stringify({ key: "value" }),
  retries: 3,
  retryDelay: 1000,
  transformResponse: (data) => data.items || data,
  onError: (error) => console.error("Custom error handler:", error),
});
```

---

## 🔄 Refetch Data

```typescript
const store = createFetchStore("https://api.example.com/data");

// Manually trigger a new request
store.refetch();

// Example: Refetch on button click
button.addEventListener("click", () => {
  store.refetch();
});
```

---

## 🛑 Unsubscribe & Abort

```typescript
const store = createFetchStore("https://api.example.com/data");

// Subscribe returns an unsubscribe function
const unsubscribe = store.subscribe((state) => {
  console.log(state);
});

// Stop listening to state changes
unsubscribe();

// Abort the ongoing request and cleanup
store.abort();
```

---

## 📋 API Reference

### `createFetchStore<T>(url: string, options?: FetchOptions): FetchStore<T>`

Creates a reactive fetch store for the given URL.

### `FetchOptions`

```typescript
interface FetchOptions {
  method?: string; // HTTP method (default: 'GET')
  headers?: Record<string, string>; // Request headers
  body?: any; // Request body
  retries?: number; // Number of retry attempts (default: 0)
  retryDelay?: number; // Delay between retries in ms (default: 1000)
  transformResponse?: (data: any) => any; // Transform response data
  onError?: (err: Error) => void; // Custom error handler
}
```

### `FetchStore<T>`

```typescript
interface FetchStore<T> {
  subscribe(listener: (state: FetchState<T>) => void): () => void; // Subscribe to state changes
  refetch(): void; // Trigger a new fetch
  abort(): void; // Abort request and cleanup
  readonly state: FetchState<T>; // Current state snapshot
}
```

### `FetchState<T>`

```typescript
interface FetchState<T> {
  results: T; // Response data
  loading: boolean; // Loading state
  error: Error | null; // Error state
}
```

---

## 🎨 Advanced Examples

### With TypeScript Types

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const userStore = createFetchStore<User[]>("https://api.example.com/users", {
  transformResponse: (data) => data.users,
});

userStore.subscribe(({ loading, results, error }) => {
  if (!loading && results) {
    // results is typed as User[]
    results.forEach((user) => console.log(user.name));
  }
});
```

### Error Handling & Retries

```typescript
const store = createFetchStore("https://unreliable-api.com/data", {
  retries: 3,
  retryDelay: 2000,
  onError: (error) => {
    // Custom error logging
    console.error("Fetch failed:", error.message);
    // Could send to error tracking service
  },
});
```

### React Integration

```typescript
import { useEffect, useState } from "react";
import { createFetchStore } from "fetch-reactive";

function useReactiveFetch<T>(url: string, options?: FetchOptions) {
  const [state, setState] = useState<FetchState<T>>({
    results: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const store = createFetchStore<T>(url, options);
    const unsubscribe = store.subscribe(setState);

    return () => {
      unsubscribe();
      store.abort();
    };
  }, [url]);

  return state;
}
```

---

## 📝 License

MIT
