const CACHE_NAME = "wijnvinder-v13";

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

// Personal / auth / transactional pages: never served from a stale cache, so a
// logged-in or just-changed state is always correct.
function isPrivatePage(url) {
  const { pathname } = url;
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/registreren") ||
    pathname.startsWith("/wachtwoord-") ||
    pathname.startsWith("/favorieten") ||
    pathname.startsWith("/profiel") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/stats")
  );
}

function offlineFallback() {
  return caches.match("/offline").then(
    (cached) =>
      cached ??
      new Response("Je bent offline", {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
  );
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(PRECACHE_URLS);
      // Warm the app shell so the first PWA launch paints instantly. Non-fatal:
      // a slow/failed homepage fetch must not break the install.
      await cache.add("/").catch(() => {});
    })
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
    // Private pages stay network-first so auth/changed state is never stale.
    if (isPrivatePage(url)) {
      event.respondWith(fetch(request).catch(offlineFallback));
      return;
    }

    // Public pages: stale-while-revalidate. Show the last cached page instantly
    // (so opening the PWA is immediate), then refresh the cache in the
    // background for the next visit. Falls back to /offline when there is
    // neither cache nor network.
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request)
            .then((response) => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached ?? offlineFallback());
          return cached ?? networkFetch;
        })
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
