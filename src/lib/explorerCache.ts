import { unstable_cache } from "next/cache";
import { chainInfo } from "./chains";
import { rpcClientFor } from "./providers/rpc";
import { getAddressDetails, getBlockDetails, getTokenDetails, getTxDetails, type ExplorerChain } from "./explorer";

// Cached explorer lookups for the server-rendered pages. Mined transactions and old blocks never
// change, so a few minutes of caching mostly saves RPC calls on repeat visits and crawlers.
const client = (chain: ExplorerChain) => rpcClientFor(chainInfo(chain).chainId);

export const cachedTx = (chain: ExplorerChain, hash: string) =>
    unstable_cache(() => getTxDetails(client(chain), chain, hash), ['explorer', 'tx', chain, hash.toLowerCase()], { revalidate: 300 })();

export const cachedBlock = (chain: ExplorerChain, param: string) =>
    unstable_cache(() => getBlockDetails(client(chain), chain, param), ['explorer', 'block', chain, param], { revalidate: param === 'latest' ? 5 : 3600 })();

export const cachedAddress = (chain: ExplorerChain, address: string) =>
    unstable_cache(() => getAddressDetails(client(chain), chain, address), ['explorer', 'address', chain, address.toLowerCase()], { revalidate: 30 })();

export const cachedToken = (chain: ExplorerChain, address: string) =>
    unstable_cache(() => getTokenDetails(client(chain), chain, address), ['explorer', 'token', chain, address.toLowerCase()], { revalidate: 3600 })();
