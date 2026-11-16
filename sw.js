/* Offline shell for the current อุ่นใจทุกวัน PWA. Bump CACHE_NAME after code changes. */
const CACHE_NAME = 'aunjai-current-pwa-v13';
const APP_ROOT = new URL('./', self.registration.scope);
const PRECACHE = [APP_ROOT.href, new URL('./manifest.webmanifest', APP_ROOT).href, new URL('./icons/icon-192.png', APP_ROOT).href, new URL('./icons/icon-512.png', APP_ROOT).href];
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))); self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('aunjai-current-pwa-') && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (event) => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(APP_ROOT.href, copy)); } return res; }).catch(async () => (await caches.match(req)) || (await caches.match(APP_ROOT.href))));
    return;
  }
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)); } return res; })));
});
