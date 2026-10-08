import { createECDH, randomBytes } from "node:crypto";
import webpush from "web-push";

// A browser push subscription and server VAPID keys for tests (real keys, so web-push can encrypt)
export function testPushSubscription(endpoint = 'https://fcm.googleapis.com/fcm/send/abc123') {
    const ecdh = createECDH('prime256v1');
    ecdh.generateKeys();
    return { endpoint, keys: { p256dh: ecdh.getPublicKey().toString('base64url'), auth: randomBytes(16).toString('base64url') } };
}

export function testVapidEnv() {
    const keys = webpush.generateVAPIDKeys();
    return { NEXT_PUBLIC_VAPID_PUBLIC_KEY: keys.publicKey, VAPID_PRIVATE_KEY: keys.privateKey, VAPID_SUBJECT: 'mailto:alerts@ethereumdashboard.dev' };
}
