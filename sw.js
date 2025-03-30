// Service Worker installeren
self.addEventListener('install', (event) => {
    console.log('Service Worker geïnstalleerd');
  });
  
  // Service Worker activeren
  self.addEventListener('activate', (event) => {
    console.log('Service Worker geactiveerd');
  });
  
  // Netwerkverzoeken afhandelen (zonder caching)
  self.addEventListener('fetch', (event) => {
    console.log('Network request:', event.request);
    // Je kunt hier specifieke netwerkaanvragen afhandelen
    event.respondWith(fetch(event.request)); // Verzoek rechtstreeks van het netwerk afhandelen
  });
  