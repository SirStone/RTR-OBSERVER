const cacheName = 'rtrwebgui';
const precache = [
  '/',
  '/img/RTR_192x192.png',
  '/img/RTR_512x512.png',
  '/favicon.ico',
  '/css/index.css',
  '/manifest.json',
  '/js/index.js',
  '/js/observer.js',
];

self.addEventListener('install', event => {
  console.log("installing Service Worker");
  self.skipWaiting();

  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(precache);
      })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  console.log('New Service Worker activated');
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        return cached || fetch(event.request);
      })
  );
});