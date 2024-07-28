const channel = new BroadcastChannel('sw-messages');

const cacheName = 'rtrwebgui';
const precache = [
  '/',
  '/img/RTR_192x192.png',
  '/img/RTR_512x512.png',
  '/favicon.ico',
  '/css/index.css',
  '/manifest.json',
  '/js/index.js',
];

var version = '1.0.0';
self.skipWaiting();

self.addEventListener('install', event => {
  console.log("installing app worker");
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

  console.log('Service Worker activated');
  channel.postMessage({message: Date.now()});
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        return cached || fetch(event.request);
      })
  );
});
