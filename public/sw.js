// KothaKhoj push notifications service worker (messaging only — no app-shell cache)
// Bump SW_VERSION to force waiting workers to activate and purge stale app caches.
const SW_VERSION = "v3-2026-08-03";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      // This worker never caches anything; delete any app-shell caches left behind
      // by older builds so installed clients always get the latest HTML/JS.
      try {
        const names = await caches.keys();
        const stale = names.filter((n) =>
          /(^|-)precache-v\d+-|(^|-)runtime-|^workbox-|^kothakhoj-/.test(n),
        );
        await Promise.allSettled(stale.map((n) => caches.delete(n)));
      } catch (_e) {
        /* cache API unavailable — nothing to clean */
      }
      await self.clients.claim();
      console.log("KothaKhoj SW active", SW_VERSION);
    })(),
  ),
);

self.addEventListener("push", (event) => {
  let payload = { title: "KothaKhoj", body: "You have a new update.", url: "/" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch (_e) {
    if (event.data) payload.body = event.data.text();
  }
  const options = {
    body: payload.body,
    icon: payload.icon || "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: payload.url || "/" },
    tag: payload.tag,
  };
  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
