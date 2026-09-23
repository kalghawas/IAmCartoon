// I Am Cartoon - Minimal Reliable Service Worker for Offline Mode
const CACHE_NAME = 'iam-cartoon-offline-v1';

const STATIC_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache core shell
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('[SW] Pre-cache non-fatal warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
      // Notify active clients that offline assets are ready
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'OFFLINE_READY' });
        });
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NEVER cache /api/* routes or non-GET requests
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. NEVER cache external AI endpoints or cloud storage
  if (
    url.hostname.includes('googleapis.com') && url.pathname.includes('/v1beta/') ||
    url.hostname.includes('pollinations.ai') ||
    url.hostname.includes('firebase')
  ) {
    return;
  }

  // 3. Stale-while-revalidate for local static assets, fonts, and scripts
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);

      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Only cache valid basic responses and Google Fonts
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.origin === self.location.origin || url.hostname.includes('fonts.gstatic.com') || url.hostname.includes('fonts.googleapis.com'))
        ) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch((err) => {
        // If offline and cache miss, return fallback if available
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
