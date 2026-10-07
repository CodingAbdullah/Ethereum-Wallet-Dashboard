import { describe, expect, it, vi } from "vitest";
import { baseStakingApr, LIQUID_STAKING, RESTAKING, summarizeStaking, toStakingProtocols } from "./stakingOverview";

vi.mock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }));

const protocols = [
    { name: 'Lido', category: 'Liquid Staking', tvl: 30e9, chainTvls: { Ethereum: 28e9, Solana: 2e9 }, change_7d: -1.5, url: 'https://lido.fi' },
    { name: 'Rocket Pool', category: 'Liquid Staking', tvl: 3e9, chainTvls: {}, change_7d: 0.4 },
    { name: 'EigenLayer', category: 'Restaking', tvl: 12e9, chainTvls: { Ethereum: 12e9 } },
    { name: 'ether.fi Stake', category: 'Liquid Restaking', tvl: 6e9, chainTvls: { Ethereum: 6e9 } },
    { name: 'Aave V3', category: 'Lending', tvl: 25e9, chainTvls: { Ethereum: 20e9 } },
    { name: 'Dead LST', category: 'Liquid Staking', tvl: 0 }
];

describe("staking overview", () => {
    it("ranks liquid staking by value on Ethereum, falling back to total", () => {
        expect(toStakingProtocols(protocols, LIQUID_STAKING).map(p => [p.name, p.tvl])).toEqual([['Lido', 28e9], ['Rocket Pool', 3e9]]);
    });

    it("includes both restaking categories and nothing else", () => {
        expect(toStakingProtocols(protocols, RESTAKING).map(p => p.name)).toEqual(['EigenLayer', 'ether.fi Stake']);
        expect(toStakingProtocols(null, RESTAKING)).toEqual([]);
    });

    it("computes the staking ratio and base reward rate", () => {
        // ~34M staked -> about 2.85% a year from consensus rewards
        expect(baseStakingApr(34e6)).toBeCloseTo(2.852, 2);
        expect(summarizeStaking(34e6, 120e6)).toMatchObject({ validators: 1062500, stakingRatio: 34 / 120 });
        expect(summarizeStaking(null, 120e6)).toEqual({ stakedEth: null, validators: null, supply: 120e6, stakingRatio: null, baseApr: null });
    });
});
