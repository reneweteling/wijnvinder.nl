const CACHE_NAME = "wijnvinder-v6";

const PRECACHE_URLS = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

// Routes that must always go to the network, never intercepted.
function shouldBypass(url) {
  const { pathname } = url;
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/uit/") ||
    pathname.startsWith("/monitoring") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/auth/")
  );
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests.
  if (request.method !== "GET") return;

  // Let cross-origin requests pass through.
  if (url.origin !== self.location.origin) return;

  // Let bypassed routes pass through.
  if (shouldBypass(url)) return;

  if (request.mode === "navigate") {
    // Network-first for navigation: fall back to /offline when the network fails.
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline").then(
          (cached) =>
            cached ??
            new Response("Je bent offline", {
              status: 200,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            })
        )
      )
    );
    return;
  }

  // Stale-while-revalidate for other same-origin GET assets (fonts, images, etc.).
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        });
        return cached ?? networkFetch;
      })
    )
  );
});
