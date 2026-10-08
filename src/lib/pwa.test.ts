import { describe, expect, it } from "vitest";
import webpush from "web-push";
import { urlBase64ToBytes } from "./pwa";
import manifest from "@/app/manifest";
import fs from "node:fs";

describe("pwa", () => {
    it("turns a VAPID public key into the 65-byte key the Push API wants", () => {
        const { publicKey } = webpush.generateVAPIDKeys();
        const bytes = urlBase64ToBytes(publicKey);
        expect(bytes.length).toBe(65);
        expect(bytes[0]).toBe(4);                 // uncompressed P-256 point
        expect(Buffer.from(bytes).toString('base64url')).toBe(publicKey);
    });

    it("has an installable manifest whose icons exist", () => {
        const m = manifest();
        expect(m).toMatchObject({ start_url: '/', display: 'standalone' });
        expect(m.icons!.some(i => i.sizes === '512x512' && i.purpose === 'maskable')).toBe(true);
        for (const icon of m.icons!) expect(fs.existsSync('public' + icon.src)).toBe(true);
    });
});
