import { afterEach, describe, expect, it, vi } from "vitest";
import { posthogConfig, redactUrl, safeProps, track } from "./analytics";

describe("analytics", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("only lets short labels through, never addresses, hashes or free text", () => {
        expect(safeProps({ chain: 'base', calls: 2, withWallet: true, kind: 'gas_below', wallet: 'io.metamask' }))
            .toEqual({ chain: 'base', calls: 2, withWallet: true, kind: 'gas_below', wallet: 'io.metamask' });
        expect(safeProps({
            address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
            short: '0xd8dA6BF2',
            question: 'what is in my wallet?',
            long: 'x'.repeat(41),
            nan: Number.NaN
        })).toEqual({});
    });

    it("strips addresses, ENS names and hashes from page URLs", () => {
        expect(redactUrl('https://ethereumdashboard.dev/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?tab=nfts')).toBe('https://ethereumdashboard.dev/address/[id]');
        expect(redactUrl('/wallet-activity/vitalik.eth')).toBe('/wallet-activity/[id]');
        expect(redactUrl('/block/21000000')).toBe('/block/[id]');
        expect(redactUrl('/gas-tracker')).toBe('/gas-tracker');
    });

    it("configures PostHog only with a key, cookieless and without autocapture or recordings", () => {
        expect(posthogConfig({})).toBeNull();
        const config = posthogConfig({ NEXT_PUBLIC_POSTHOG_KEY: 'phc_test' })!;
        expect(config.options).toMatchObject({ api_host: 'https://us.i.posthog.com', persistence: 'memory', person_profiles: 'never', autocapture: false, disable_session_recording: true });
        const event = config.options.before_send({ properties: { $current_url: 'https://ethereumdashboard.dev/tx/0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060' } });
        expect(event!.properties!.$current_url).toBe('https://ethereumdashboard.dev/tx/[id]');
    });

    it("sends events to Umami when it is loaded, with filtered properties", () => {
        const umami = { track: vi.fn() };
        vi.stubGlobal('window', { umami });
        track('tx_confirmed', { chain: 'eth', to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' });
        expect(umami.track).toHaveBeenCalledWith('tx_confirmed', { chain: 'eth' });
    });
});
