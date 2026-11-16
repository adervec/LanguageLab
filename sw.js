// ponytail: network-first, cache fallback. Always fresh online, still works offline.
const C = 'll-v8';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['.', 'index.html', 'app.js', 'core.js', 'content/first.json', 'content/fr.json', 'content/es.json', 'content/de.json', 'content/it.json', 'content/pt.json', 'content/nl.json', 'content/hr.json', 'content/zh.json', 'content/ja.json', 'content/ko.json', 'content/sv.json', 'content/en.json',
    'content/ru.json', 'content/uk.json', 'content/pl.json', 'content/cs.json', 'content/sk.json', 'content/sl.json', 'content/sr.json', 'content/bg.json', 'manifest.webmanifest', 'icon.svg', 'app-data.json'])));
  self.skipWaiting();
});
// claim: take charge of the page that installed it, so a first visit can keep what it loaded (app.js fetches it again)
self.addEventListener('activate', e =>
  e.waitUntil(Promise.all([self.clients.claim(), caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('ll-') && k !== C).map(k => caches.delete(k))))])));
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
