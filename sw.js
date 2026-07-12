/* Service worker — offline-capable parish app.
   Bump VERSION whenever site files change; old caches are cleaned up. */

const VERSION = "stanthony-v1.0.1";
const PRECACHE = [
  "./",
  "./index.html",
  "./visit.html",
  "./about.html",
  "./services.html",
  "./give.html",
  "./connect.html",
  "./offline.html",
  "./favicon.svg",
  "./manifest.webmanifest",
  "./assets/css/main.css",
  "./assets/js/config.js",
  "./assets/js/liturgical.js",
  "./assets/js/main.js",
  "./assets/js/give.js",
  "./assets/js/connect.js",
  "./assets/services.ics",
  "./assets/img/church-hero.jpg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // never touch PayPal/external requests

  // Pages and the parish config: fresh when online, cached when not —
  // so edits to config.js (PayPal ID, schedule) reach phones immediately.
  if (req.mode === "navigate" || url.pathname.endsWith("/assets/js/config.js")) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) =>
            hit || (req.mode === "navigate" ? caches.match("./offline.html") : Response.error())
          )
        )
    );
    return;
  }

  // Static assets: cache-first, refreshed in the background.
  e.respondWith(
    caches.match(req).then((hit) => {
      const refresh = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || refresh;
    })
  );
});
