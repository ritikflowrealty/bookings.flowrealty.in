/* Flow Realty service worker.
   - Receives Web Push messages and shows OS-level notifications.
   - Caches the hero video and poster on first visit so repeat visits
     are served from disk in <50ms. */

const HERO_CACHE = 'flow-hero-v1';
const HERO_PATTERNS = [/\.r2\.dev\//, /\.mp4(\?|$)/, /\.webm(\?|$)/];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Drop older hero caches.
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith('flow-hero-') && k !== HERO_CACHE).map((k) => caches.delete(k)))
      ),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = req.url;

  // Only cache hero-style media (video on R2, poster image on R2). Everything
  // else falls through to the network as normal.
  const isHero = HERO_PATTERNS.some((p) => p.test(url));
  if (!isHero) return;

  // Stale-while-revalidate: serve cached copy immediately, then refresh.
  event.respondWith(
    caches.open(HERO_CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const fetchPromise = fetch(req)
        .then((response) => {
          // Only cache successful, full-content responses.
          if (response && response.status === 200 && response.type === 'cors') {
            cache.put(req, response.clone()).catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Flow Realty', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Flow Realty';
  const options = {
    body: data.body || '',
    icon: data.icon || '/favicon.png',
    badge: '/favicon.png',
    tag: data.tag,
    data: { url: data.url || '/' },
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) {
          w.navigate(url).catch(() => {});
          return w.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
