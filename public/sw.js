const BASE_PATH = new URL('./', self.location.href).pathname;
const CACHE_NAME = 'radiolala-cache-v2';

// Installation : on pré-cache uniquement la page d'entrée
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.add(BASE_PATH))
      .then(() => self.skipWaiting())
  );
});

// Activation : suppression des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// On ne met en cache que les réponses 200 OK (jamais les 206 partial, ni les erreurs)
const cacheIfOk = (request, response) => {
  if (response.ok && response.status !== 206) {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
  }
  return response;
};

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Requêtes externes (flux radio, API Radio-Browser) → laisser le browser gérer
  // Pas de respondWith : le SW se retire, les directives CSP media-src/connect-src
  // s'appliquent normalement (sinon tout passe par connect-src et bloque l'audio).
  if (url.origin !== self.location.origin) {
    return;
  }

  // Assets statiques hashés (JS, CSS, fonts, images, audio) → cache-first
  if (/\.(js|css|woff2?|ttf|otf|png|ico|mp3)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => cacheIfOk(event.request, response));
      })
    );
    return;
  }

  // Navigation HTML → network-first, fallback sur le cache puis sur BASE_PATH
  event.respondWith(
    fetch(event.request)
      .then(response => cacheIfOk(event.request, response))
      .catch(() => caches.match(event.request).then(cached => cached || caches.match(BASE_PATH)))
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'CHECK_FOR_UPDATES') {
    event.source.postMessage({ message: 'Update check triggered' });
  }
});
