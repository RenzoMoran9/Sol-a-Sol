// Guarda la app en el celular para que abra sin internet.
const CACHE = "solasol-v2";
const SHELL = ["./", "index.html", "manifest.json", "icon.svg", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (event) => {
  // Cada archivo por separado: si uno falla, la app igual se instala.
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Red primero para la app (así ves las mejoras), caché si no hay conexión.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok && new URL(event.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then((hit) => hit || caches.match("index.html")))
  );
});

// Aviso que llega desde el recordatorio diario (GitHub Actions).
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data && event.data.text() }; }
  const title = data.title || "Sol a Sol";
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || "¿Cuánto gastaste hoy? Haz tu cierre del día.",
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: "cierre-diario",
    data: { url: data.url || "./?cierre=1" }
  }));
});

// Al tocar el aviso se abre la app en el cierre del día.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "./?cierre=1", self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if (c.url.startsWith(self.registration.scope) && "focus" in c) { c.navigate(target); return c.focus(); }
      return self.clients.openWindow(target);
    })
  );
});
