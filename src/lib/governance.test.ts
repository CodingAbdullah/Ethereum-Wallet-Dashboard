import { describe, expect, it, vi } from "vitest";
import { json, mockFetch } from "@/test/helpers";
import { getGovernance, toProposals } from "./governance";

vi.mock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }));

const response = (state: string) => ({ data: { proposals: [
    { id: '0xp1', title: 'Enable fee switch', state, start: 1700000000, end: 1700600000, votes: 1234, choices: ['For', 'Against', 'Abstain'], scores: [7000, 2500, 500], scores_total: 10000, quorum: 4000, link: 'https://snapshot.box/#/s:uniswapgovernance.eth/proposal/0xp1', space: { id: 'uniswapgovernance.eth', name: 'Uniswap' } },
    { id: '0xp2', title: '', state, start: 1, end: 2, votes: 0, choices: ['Yes', 'No'], scores: [0, 0], scores_total: 0, quorum: 0, link: 'https://evil.example/phish', space: { id: 'ens.eth', name: '' } },
    { id: '', space: null }
] } });

describe("toProposals", () => {
    it("reads proposals, the leading choice and quorum", () => {
        const [p1, p2] = toProposals(response('active'));
        expect(p1).toMatchObject({ space: 'uniswapgovernance.eth', spaceName: 'Uniswap', title: 'Enable fee switch', state: 'active', votes: 1234, quorumReached: true, leading: { choice: 'For', percent: 70 } });
        expect(p1.link).toBe('https://snapshot.box/#/s:uniswapgovernance.eth/proposal/0xp1');
        expect(p2).toMatchObject({ title: 'Untitled proposal', spaceName: 'ens.eth', leading: null, quorumReached: null });
        expect(toProposals({ errors: [{ message: 'bad' }] })).toEqual([]);
    });

    it("never links outside Snapshot", () => {
        expect(toProposals(response('active'))[1].link).toBe('https://snapshot.box/#/s:ens.eth/proposal/0xp2');
    });
});

describe("getGovernance", () => {
    it("loads active and recently closed proposals", async () => {
        const fetchMock = mockFetch();
        fetchMock.mockImplementation(async (_url: RequestInfo | URL, init?: RequestInit) => json(response(JSON.parse(String(init?.body)).variables.state)));
        const result = await getGovernance();
        expect('data' in result && result.data.active[0].state).toBe('active');
        expect('data' in result && result.data.closed[0].state).toBe('closed');
        const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
        expect(body.variables.spaces).toContain('ens.eth');
    });

    it("reports Snapshot being down", async () => {
        mockFetch(new Error('down'), new Error('down'), new Error('down'), new Error('down'));
        expect(await getGovernance()).toEqual({ error: 'Snapshot is unavailable right now' });
    });
});
