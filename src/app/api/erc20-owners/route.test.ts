import { describe, expect, it, vi } from "vitest";
import holders from "@/test/fixtures/ethplorer-top-holders.json";
import tokenInfo from "@/test/fixtures/ethplorer-token-info.json";
import { postRequest } from "@/test/helpers";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("@/lib/providers/ethplorer", () => ({
    ethplorer: vi.fn(async (path: string) => (path.startsWith("/getTopTokenHolders") ? holders : tokenInfo))
}));

const { POST } = await import("./route");

describe("POST /api/erc20-owners", () => {
    it("converts Ethplorer holders into the table's shape", async () => {
        const response = await POST(postRequest({ contract: "0x6b175474e89094c44da98b954eedeac495271d0f" }));
        const { result } = await response.json();

        expect(result[0]).toEqual({
            owner_address: "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503",
            balance: "2,500,000",
            usd_value: "2500000",
            percentage_relative_to_total_supply: 25
        });
    });

    it("rejects an invalid contract address before calling Ethplorer", async () => {
        const { ethplorer } = await import("@/lib/providers/ethplorer");
        vi.mocked(ethplorer).mockClear();

        const response = await POST(postRequest({ contract: "0x123" }));
        expect(response.status).toBe(400);
        expect(ethplorer).not.toHaveBeenCalled();
    });
});
