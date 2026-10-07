import { unstable_cache } from "next/cache";
import { providerFetch } from "./providers/http";

// Governance proposals for major Ethereum protocols from Snapshot's public GraphQL API (keyless).
// Spaces are Snapshot space IDs; one that doesn't exist simply returns no proposals.

export const SPACES = [
    'aave.eth', 'aavedao.eth', 'uniswapgovernance.eth', 'ens.eth', 'lido-snapshot.eth', 'arbitrumfoundation.eth',
    'opcollective.eth', 'safe.eth', 'balancer.eth', 'cvx.eth', 'gitcoindao.eth', 'gnosis.eth', 'stgdao.eth',
    '1inch.eth', 'sushigov.eth', 'apecoin.eth', 'starknet.eth', 'comp-vote.eth', 'frax.eth', 'rocketpool-dao.eth'
];

export interface Proposal {
    id: string;
    space: string;
    spaceName: string;
    title: string;
    state: 'active' | 'closed' | 'pending';
    start: number;
    end: number;
    votes: number;
    leading: { choice: string; percent: number } | null;
    quorumReached: boolean | null;
    link: string;
}

type Json = Record<string, unknown>;
const obj = (value: unknown): Json => (value && typeof value === 'object' ? value as Json : {});
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const num = (value: unknown): number => { const n = Number(value); return Number.isFinite(n) ? n : 0; };
const str = (value: unknown): string => (typeof value === 'string' ? value : '');

const FIELDS = 'id title state start end votes choices scores scores_total quorum link space { id name }';

export const QUERY = `query Proposals($spaces: [String], $state: String, $first: Int, $direction: OrderDirection) {
  proposals(first: $first, where: { space_in: $spaces, state: $state }, orderBy: "end", orderDirection: $direction) { ${FIELDS} }
}`;

export function toProposals(data: unknown): Proposal[] {
    return list(obj(obj(data).data).proposals).map(raw => {
        const p = obj(raw);
        const space = obj(p.space);
        const choices = list(p.choices).map(str);
        const scores = list(p.scores).map(num);
        const total = num(p.scores_total);
        const top = scores.length ? scores.indexOf(Math.max(...scores)) : -1;
        const id = str(p.id);
        const spaceId = str(space.id);
        const quorum = num(p.quorum);
        return {
            id,
            space: spaceId,
            spaceName: str(space.name) || spaceId,
            title: str(p.title) || 'Untitled proposal',
            state: (['active', 'closed', 'pending'].includes(str(p.state)) ? str(p.state) : 'closed') as Proposal['state'],
            start: num(p.start),
            end: num(p.end),
            votes: num(p.votes),
            leading: top >= 0 && total > 0 && choices[top] ? { choice: choices[top], percent: scores[top] / total * 100 } : null,
            quorumReached: quorum > 0 ? total >= quorum : null,
            // Only Snapshot links are used, so a proposal can't point users somewhere unexpected
            link: /^https:\/\/(www\.)?snapshot\.(org|box)\//.test(str(p.link)) ? str(p.link) : `https://snapshot.box/#/s:${spaceId}/proposal/${id}`
        };
    }).filter(p => p.id && p.space);
}

const query = (variables: Record<string, unknown>) => providerFetch<unknown>('Snapshot', 'https://hub.snapshot.org/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables }),
    revalidate: false,
    timeoutMs: 15000
});

const cachedGovernance = unstable_cache(async () => {
    const [active, closed] = await Promise.all([
        query({ spaces: SPACES, state: 'active', first: 40, direction: 'asc' }),
        query({ spaces: SPACES, state: 'closed', first: 20, direction: 'desc' })
    ]);
    return { active: toProposals(active), closed: toProposals(closed) };
}, ['governance'], { revalidate: 900 });

export async function getGovernance(): Promise<{ data: { active: Proposal[]; closed: Proposal[] } } | { error: string }> {
    try { return { data: await cachedGovernance() }; }
    catch { return { error: 'Snapshot is unavailable right now' }; }
}
