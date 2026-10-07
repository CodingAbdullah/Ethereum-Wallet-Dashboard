import { describe, expect, it } from "vitest";
import { keccak256, toBytes } from "viem";
import { signBody, verifyMoralisSignature, verifySignature, verifyTelegramSecret } from "./signing";

describe("webhook signatures", () => {
    const body = '{"hello":"world"}';

    it("accepts a fresh signature and rejects tampering, other secrets and old timestamps", () => {
        const header = signBody('s3cret', body, 1_700_000_000);
        expect(verifySignature('s3cret', body, header, 1_700_000_100)).toBe(true);
        expect(verifySignature('s3cret', body + ' ', header, 1_700_000_100)).toBe(false);
        expect(verifySignature('other', body, header, 1_700_000_100)).toBe(false);
        expect(verifySignature('s3cret', body, header, 1_700_000_000 + 301)).toBe(false);
        expect(verifySignature('s3cret', body, null)).toBe(false);
        expect(verifySignature('s3cret', body, 'garbage')).toBe(false);
        expect(verifySignature('', body, header, 1_700_000_100)).toBe(false);
    });

    it("checks Moralis Streams signatures (keccak256 of body + secret)", () => {
        const sig = keccak256(toBytes(body + 'streams-secret'));
        expect(verifyMoralisSignature('streams-secret', body, sig)).toBe(true);
        expect(verifyMoralisSignature('streams-secret', body, sig.toUpperCase().replace('0X', '0x'))).toBe(true);
        expect(verifyMoralisSignature('wrong', body, sig)).toBe(false);
        expect(verifyMoralisSignature('', body, sig)).toBe(false);
    });

    it("checks Telegram's secret token header", () => {
        expect(verifyTelegramSecret('abc', 'abc')).toBe(true);
        expect(verifyTelegramSecret('abc', 'abd')).toBe(false);
        expect(verifyTelegramSecret('', '')).toBe(false);
    });
});
