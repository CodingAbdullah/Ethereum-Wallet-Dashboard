// Ethereum Dashboard service worker: an offline page for navigations and alert notifications.
// Data is never cached: prices, balances and transactions must always be live.

const CACHE = 'eth-dashboard-v1';
const OFFLINE_URL = '/offline';
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png'];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

// Page loads go to the network; only if that fails is the offline page shown
self.addEventListener('fetch', event => {
    if (event.request.mode !== 'navigate') return;
    event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});

// Alerts sent by the server (src/lib/alerts/deliver.ts): { title, body, url?, tag? }
self.addEventListener('push', event => {
    let data = {};
    try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data ? event.data.text() : '' }; }
    const title = typeof data.title === 'string' && data.title ? data.title : 'Ethereum Dashboard';
    event.waitUntil(self.registration.showNotification(title, {
        body: typeof data.body === 'string' ? data.body : '',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: typeof data.tag === 'string' ? data.tag : undefined,
        data: { url: safeUrl(data.url) }
    }));
});

// Opens the alert's link, reusing an open tab of the dashboard when there is one
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || new URL('/alerts', self.location.origin).href;
    event.waitUntil((async () => {
        if (new URL(url).origin !== self.location.origin) return self.clients.openWindow(url);
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const existing = windows.find(client => new URL(client.url).origin === self.location.origin);
        if (existing) {
            await existing.focus();
            return existing.navigate(url);
        }
        return self.clients.openWindow(url);
    })());
});

// Only https links (or this site); anything else opens /alerts
function safeUrl(value) {
    const fallback = new URL('/alerts', self.location.origin).href;
    if (typeof value !== 'string') return fallback;
    try {
        const url = new URL(value, self.location.origin);
        if (url.protocol !== 'https:' && url.origin !== self.location.origin) return fallback;
        return url.href;
    }
    catch {
        return fallback;
    }
}
