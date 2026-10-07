import { describe, expect, it } from "vitest";
import { walletConnectors } from "./wagmi";

describe("walletConnectors", () => {
    it("offers browser and Coinbase wallets without a Reown project ID", () => {
        expect(walletConnectors('')).toHaveLength(2);
    });

    it("adds WalletConnect when a Reown project ID is set", () => {
        expect(walletConnectors('test-project-id')).toHaveLength(3);
    });
});
