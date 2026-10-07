import { afterEach, describe, expect, it, vi } from "vitest";
import nfts from "@/test/fixtures/moralis-ens-nfts.json";

vi.mock("./providers/moralis", () => ({ moralis: vi.fn(async () => nfts) }));
vi.mock("./ens", () => ({
    ENS_BASE_REGISTRAR: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
    toAddress: vi.fn(async (input: string) => (input === "unknown.eth" ? null : "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"))
}));

const { getEnsHoldings } = await import("./ensHoldings");

afterEach(() => { vi.useRealTimers(); });

describe("getEnsHoldings", () => {
    it("computes expiry, grace (90 days) and premium (21 days) periods", async () => {
        vi.useFakeTimers({ now: new Date("2026-10-07T00:00:00Z") });
        const [active, grace] = (await getEnsHoldings("vitalik.eth"))!;

        expect(active).toMatchObject({ ens_name: "active.eth", expiration_timestamp: "2030-01-01T00:00:00.000Z", in_grace_period: false, is_expired: false });

        // Expired 2026-09-01 (stored in seconds), so on 2026-10-07 it is inside the 90-day grace period
        expect(grace).toMatchObject({
            ens_name: "grace.eth",
            registration_timestamp: "2020-01-01T00:00:00.000Z",
            expiration_timestamp: "2026-09-01T00:00:00.000Z",
            grace_period_ends: "2026-11-30T00:00:00.000Z",
            premium_period_ends: "2026-12-21T00:00:00.000Z",
            in_grace_period: true,
            in_premium_period: false,
            is_expired: false
        });
    });

    it("returns null when an ENS name does not resolve", async () => {
        await expect(getEnsHoldings("unknown.eth")).resolves.toBeNull();
    });
});
