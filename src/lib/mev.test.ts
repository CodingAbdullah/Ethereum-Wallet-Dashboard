import { describe, expect, it } from "vitest";
import { summarizeMev, toPayloads, type Payload } from "./mev";

const payload = (slot: number, hash: string, builder: string, valueEth: number): Payload =>
    ({ slot, blockNumber: slot + 1000, blockHash: hash, builder, valueEth, txCount: 100, gasUsed: 15e6 });

describe("toPayloads", () => {
    it("reads relay bid traces and converts wei to ETH", () => {
        expect(toPayloads([{ slot: '9000000', block_number: '20000000', block_hash: '0xabc', builder_pubkey: '0xb1', value: '50000000000000000', num_tx: '180', gas_used: '15000000' }, { junk: true }]))
            .toEqual([{ slot: 9000000, blockNumber: 20000000, blockHash: '0xabc', builder: '0xb1', valueEth: 0.05, txCount: 180, gasUsed: 15000000 }]);
        expect(toPayloads({ error: 'nope' })).toEqual([]);
    });
});

describe("summarizeMev", () => {
    it("compares relays over their shared window, dedupes blocks and ranks builders", () => {
        const s = summarizeMev([
            // Flashbots covers slots 100-109, Ultra Sound only 105-109, so the window is 105-109
            { name: 'Flashbots', payloads: [payload(100, '0x100', 'A', 1), payload(105, '0x105', 'A', 0.1), payload(107, '0x107', 'B', 0.3)] },
            { name: 'Ultra Sound', payloads: [payload(105, '0x105', 'A', 0.1), payload(106, '0x106', 'B', 0.2), payload(109, '0x109', 'B', 0.5)] },
            { name: 'Titan', payloads: null }
        ]);
        expect(s.window).toEqual({ fromSlot: 105, toSlot: 109, slots: 5 });
        expect(s.mevBoostBlocks).toBe(4);
        expect(s.mevBoostShare).toBe(0.8);
        // 5 deliveries in the window: Flashbots 2, Ultra Sound 3 (block 0x105 went through both)
        expect(s.relays).toEqual([
            { name: 'Flashbots', ok: true, payloads: 2, share: 2 / 5 },
            { name: 'Ultra Sound', ok: true, payloads: 3, share: 3 / 5 },
            { name: 'Titan', ok: false, payloads: 0, share: null }
        ]);
        expect(s.builders.map(b => [b.builder, b.blocks])).toEqual([['B', 3], ['A', 1]]);
        expect(s.recent[0]).toMatchObject({ slot: 109, relays: ['Ultra Sound'] });
        expect(s.recent.find(b => b.slot === 105)!.relays).toEqual(['Flashbots', 'Ultra Sound']);
        expect(s.medianValueEth).toBe(0.3);
        expect(s.totalValueEth).toBeCloseTo(1.1);
    });

    it("handles every relay failing", () => {
        const s = summarizeMev([{ name: 'Flashbots', payloads: null }]);
        expect(s).toMatchObject({ window: null, mevBoostBlocks: 0, mevBoostShare: null, medianValueEth: null });
    });
});
