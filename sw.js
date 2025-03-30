const CACHE_NAME = "pwa-cache-v1";
const ASSETS_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json"
];

// Installeer de service worker en cache de bestanden
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Bestanden gecached");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Haal bestanden uit de cache of van het netwerk
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Verwijder oude caches bij update
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});
