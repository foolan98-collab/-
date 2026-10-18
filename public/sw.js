// Fares Tools Service Worker - Safe Static Cache
// Strict rules:
// 1. Only caches static application shell assets
// 2. Never caches user files, uploads, or output results
// 3. Network-first for HTML navigation to prevent stale site updates
// 4. Clean cache rotation on updates

const CACHE_VERSION = 'fares-tools-v1.0.0';
const STATIC_CACHE_NAME = `fares-tools-static-${CACHE_VERSION}`;

// Core static assets for initial app shell
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-96.png',
  '/fares-tools-full-logo.png',
  '/favicon-48.png',
  '/favicon-32.png',
  '/pwa-maskable-192x192.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

// Install: Cache core static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('[SW] Precache non-fatal error:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Remove outdated caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('fares-tools-') && name !== STATIC_CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Cautious handling
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests (e.g. POST/PUT)
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Ignore browser extensions, non-http(s) schemes, and blob/data URLs
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Strictly do NOT cache API requests, admin gateway, or dynamic server proxies
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-first with cache fallback
  // Guarantees users always see the freshest version of Fares Tools
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to cached root shell
          return caches.match('/');
        })
    );
    return;
  }

  // 2. Static hashed assets (Vite build outputs /assets/* and fonts): Cache-first with network fallback
  const isStaticHashedAsset =
    url.pathname.startsWith('/assets/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');

  if (isStaticHashedAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Return empty response or fail gracefully
            return new Response('', { status: 408, statusText: 'Network request failed' });
          });
      })
    );
    return;
  }

  // 3. For any other GET request (icons, images): Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for skip waiting message if needed
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
