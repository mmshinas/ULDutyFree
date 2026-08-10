const CACHE_NAME = 'serendib-catalog-v3';
const ASSETS = [
  'index.html', 'manifest.json',
  'icon-192.png', 'icon-512.png',
  'icon-192-maskable.png', 'icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: always try to fetch the latest version when online (so
// updates — like newly-embedded photos — reach already-installed apps on
// their next open). Only fall back to the cached copy when offline, which
// is what actually matters for inflight use.
self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if(response && response.ok){
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
