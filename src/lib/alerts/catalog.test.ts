import { describe, expect, it } from "vitest";
import { ALERT_CATALOG, catalogEntry, toParams } from "./catalog";
import { ALERT_KINDS, alertKind } from "./kinds";

describe("alert catalog", () => {
    it("matches the server-side alert types", () => {
        expect(ALERT_CATALOG.map(e => e.id)).toEqual(ALERT_KINDS.map(k => k.id));
        for (const entry of ALERT_CATALOG) {
            const kind = alertKind(entry.id)!;
            expect({ title: entry.title, description: entry.description, everyMinutes: entry.everyMinutes, realtime: !!entry.realtime })
                .toEqual({ title: kind.title, description: kind.description, everyMinutes: kind.everyMinutes, realtime: !!kind.realtime });
        }
    });

    it("turns the form's defaults plus typical input into params the server accepts", () => {
        const input: Record<string, Record<string, string>> = {
            wallet_activity: { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
            gas_below: { maxGwei: '5' },
            price: { usd: '4000' },
            validator: { validator: '123456' },
            risky_approval: { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
            nft_floor: { collection: 'pudgypenguins' },
            ens_expiry: { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
            governance: { spaces: 'Aave.eth,  ens.eth' }
        };
        for (const entry of ALERT_CATALOG) {
            expect(() => alertKind(entry.id)!.params.parse(toParams(entry, input[entry.id] ?? {})), entry.id).not.toThrow();
        }
        expect(toParams(catalogEntry('governance')!, input.governance)).toEqual({ spaces: ['aave.eth', 'ens.eth'] });
        expect(() => alertKind('gas_below')!.params.parse(toParams(catalogEntry('gas_below')!, {}))).toThrow();
    });
});
