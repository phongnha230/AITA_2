// Self-unregistering service worker for lingering registrations on localhost:3000
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => {
        if ('navigate' in client) {
          client.navigate(client.url);
        }
      });
    })
  );
});
