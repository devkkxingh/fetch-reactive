import { createFetchStore } from "../src/index";

const store = createFetchStore("https://jsonplaceholder.typicode.com/posts", {
  retries: 2,
  retryDelay: 500,
  transformResponse: (data) => data.slice(0, 3),
  onError: (err) => console.error("Custom Error Handler:", err.message),
});

const unsubscribe = store.subscribe(({ loading, results, error }) => {
  if (loading) return console.log("⏳ Loading...");
  if (error) return console.error("❌ Error:", error.message);
  console.log(
    "✅ Results:",
    results.map((r: any) => r.title)
  );
});
