// ponytail: network-first, cache fallback. Always fresh online, still works offline.
const C = 'll-v3';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['.', 'index.html', 'app.js', 'core.js', 'content/fr.json', 'content/es.json', 'content/de.json', 'content/it.json', 'content/pt.json', 'content/en.json', 'manifest.webmanifest', 'icon.svg', 'app-data.json'])));
  self.skipWaiting();
});
self.addEventListener('activate', e =>
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('ll-') && k !== C).map(k => caches.delete(k))))));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return; // never cache Google sign-in or Drive
  e.respondWith(
    fetch(e.request).then(r => {
      const cp = r.clone();
      caches.open(C).then(c => c.put(e.request, cp));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
