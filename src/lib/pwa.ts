// Browser side of the installable app: the service worker (offline page, push notifications) and
// subscribing this browser to alert notifications. Safe to import from client components only.

export const SERVICE_WORKER_URL = '/sw.js';

export function pushSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
    return navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: '/' });
}

// VAPID public keys are base64url; the Push API wants the raw bytes
export function urlBase64ToBytes(value: string): Uint8Array<ArrayBuffer> {
    const base64 = (value + '='.repeat((4 - value.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const bytes = new Uint8Array(new ArrayBuffer(raw.length));
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return bytes;
}

export class PushSetupError extends Error {}

// Asks for permission and returns this browser's push subscription as JSON (the channel target)
export async function subscribeToPush(vapidKey: string): Promise<string> {
    if (!pushSupported()) throw new PushSetupError("This browser can't show notifications. On iPhone, add the site to your Home Screen first.");
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new PushSetupError('Notifications are blocked for this site. Allow them in your browser settings and try again.');
    await registerServiceWorker();
    const registration = await navigator.serviceWorker.ready;
    const key = urlBase64ToBytes(vapidKey);
    let subscription = await registration.pushManager.getSubscription();
    // A subscription made with a different server key can't be reused
    if (subscription && !sameKey(subscription.options.applicationServerKey, key)) {
        await subscription.unsubscribe();
        subscription = null;
    }
    subscription ??= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    return JSON.stringify(subscription.toJSON());
}

function sameKey(a: ArrayBuffer | null, b: Uint8Array): boolean {
    if (!a || a.byteLength !== b.length) return false;
    const view = new Uint8Array(a);
    return view.every((byte, i) => byte === b[i]);
}

// Tells the user a transaction finished if they switched to another tab while waiting. Only when they
// already allowed notifications (for alerts): this never asks for permission itself.
export async function notifyIfHidden(title: string, body: string): Promise<void> {
    if (typeof document === 'undefined' || !document.hidden || !('Notification' in window) || Notification.permission !== 'granted') return;
    try {
        // Android only shows notifications through a service worker
        const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
        if (registration) await registration.showNotification(title, { body, icon: '/icons/icon-192.png', tag: 'tx-status' });
        else new Notification(title, { body, icon: '/icons/icon-192.png', tag: 'tx-status' });
    }
    catch { /* best effort */ }
}
