const CACHE_NAME = 'v1';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Service Worker installeren
self.addEventListener('install', (event) => {
    console.log('Service Worker geïnstalleerd');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Bestanden gecached');
                return cache.addAll(CACHE_ASSETS);
            })
            .catch((error) => {
                console.error('Caching mislukt:', error);
            })
    );
});

// Service Worker activeren
self.addEventListener('activate', (event) => {
    console.log('Service Worker geactiveerd');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Oude cache verwijderen:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Netwerkverzoeken afhandelen
self.addEventListener('fetch', (event) => {
    console.log('Network request:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
