import { BaseError, HttpRequestError, TimeoutError, decodeEventLog, erc20Abi, formatEther, formatGwei, formatUnits, getAddress, isAddress, isHash, parseAbi, type Hash, type PublicClient } from "viem";
import { CHAINS, chainInfo } from "./chains";

// Block explorer data for /tx, /block, /address and /token, read straight from free public RPCs.
// Functions take a viem client so tests can pass a fake one.

export type ExplorerChain = keyof typeof CHAINS;

// Explorer pages work on every mainnet with a reliable public RPC (testnets are left out)
export const EXPLORER_CHAINS = (Object.keys(CHAINS) as ExplorerChain[]).filter(key => !CHAINS[key].testnet);

export function explorerChain(value: string | string[] | undefined): ExplorerChain {
    const key = Array.isArray(value) ? value[0] : value;
    return key && (EXPLORER_CHAINS as string[]).includes(key) ? key as ExplorerChain : 'eth';
}

type Client = Pick<PublicClient, 'getTransaction' | 'getTransactionReceipt' | 'getBlock' | 'getBalance' | 'getBytecode' | 'getTransactionCount' | 'readContract'>;

const erc721Transfer = parseAbi(['event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)']);
const erc1155Single = parseAbi(['event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)']);

export interface TokenMeta { symbol: string | null; decimals: number | null; name: string | null }

export interface DecodedLog {
    index: number;
    address: string;
    event: string;                 // Transfer, Approval, TransferSingle, or the raw topic for unknown events
    from?: string;
    to?: string;
    amount?: string;               // formatted with the token's decimals when known
    tokenId?: string;
    symbol?: string | null;
}

export interface TxDetails {
    hash: string;
    chain: ExplorerChain;
    status: 'success' | 'failed' | 'pending';
    blockNumber: number | null;
    timestamp: number | null;
    from: string;
    to: string | null;
    contractCreated: string | null;
    valueEth: string;
    feeEth: string | null;
    gasUsed: string | null;
    gasLimit: string;
    gasPriceGwei: string | null;
    nonce: number;
    methodId: string | null;       // first 4 bytes of the input, null for plain transfers
    logs: DecodedLog[];
}

export function isNetworkError(err: unknown): boolean {
    return err instanceof BaseError && !!err.walk(e => e instanceof HttpRequestError || e instanceof TimeoutError);
}

// Reads symbol, decimals and name for each token contract (reverts become null)
async function tokenMeta(client: Client, addresses: string[]): Promise<Map<string, TokenMeta>> {
    const unique = [...new Set(addresses.map(a => a.toLowerCase()))].slice(0, 25);
    const read = async (address: string, functionName: 'symbol' | 'decimals' | 'name') => {
        try { return await client.readContract({ address: address as `0x${string}`, abi: erc20Abi, functionName }); }
        catch (err) {
            // A revert or empty result just means "not a token"; a node that can't be reached is an outage,
            // so it's rethrown (otherwise the page would show "not found" and cache it)
            if (isNetworkError(err)) throw err;
            return null;
        }
    };
    const entries = await Promise.all(unique.map(async address => {
        const [symbol, decimals, name] = await Promise.all([read(address, 'symbol'), read(address, 'decimals'), read(address, 'name')]);
        return [address, { symbol: typeof symbol === 'string' ? symbol : null, decimals: typeof decimals === 'number' ? decimals : null, name: typeof name === 'string' ? name : null }] as const;
    }));
    return new Map(entries);
}

export function decodeLog(log: { address: string; topics: readonly `0x${string}`[]; data: `0x${string}`; logIndex: number | null }): DecodedLog {
    const base = { index: log.logIndex ?? 0, address: getAddress(log.address) };
    const topics = log.topics as [`0x${string}`, ...`0x${string}`[]];
    // ERC721 Transfer has the token ID as a 4th indexed topic; ERC20 Transfer keeps the amount in data
    for (const abi of [erc721Transfer, erc20Abi, erc1155Single] as const) {
        try {
            const decoded = decodeEventLog({ abi, data: log.data, topics, strict: true }) as { eventName: string; args: Record<string, unknown> };
            const args = decoded.args;
            if (decoded.eventName === 'Transfer' && 'tokenId' in args) {
                return { ...base, event: 'Transfer', from: getAddress(String(args.from)), to: getAddress(String(args.to)), tokenId: String(args.tokenId) };
            }
            if (decoded.eventName === 'Transfer') return { ...base, event: 'Transfer', from: String(args.from), to: String(args.to), amount: String(args.value) };
            if (decoded.eventName === 'Approval') return { ...base, event: 'Approval', from: String(args.owner), to: String(args.spender), amount: String(args.value) };
            if (decoded.eventName === 'TransferSingle') return { ...base, event: 'TransferSingle', from: String(args.from), to: String(args.to), tokenId: String(args.id), amount: String(args.value) };
        }
        catch { /* not this event */ }
    }
    return { ...base, event: topics[0] ?? 'Anonymous event' };
}

export async function getTxDetails(client: Client, chain: ExplorerChain, hash: string): Promise<TxDetails | null> {
    if (!isHash(hash)) return null;
    let tx;
    try { tx = await client.getTransaction({ hash: hash as Hash }); }
    catch (err) { if (/not be found|not found/i.test(String((err as Error).message))) return null; throw err; }

    const receipt = tx.blockNumber !== null ? await client.getTransactionReceipt({ hash: hash as Hash }).catch(() => null) : null;
    const block = tx.blockNumber !== null ? await client.getBlock({ blockNumber: tx.blockNumber }).catch(() => null) : null;

    const logs = (receipt?.logs ?? []).map(decodeLog);
    // Look up symbols (and decimals for ERC20 amounts) for the token events we could decode
    const tokenLogs = logs.filter(l => l.amount !== undefined || l.tokenId !== undefined);
    const meta = await tokenMeta(client, tokenLogs.map(l => l.address));
    for (const log of tokenLogs) {
        const m = meta.get(log.address.toLowerCase());
        if (!m) continue;
        log.symbol = m.symbol;
        const isErc20Amount = log.tokenId === undefined && log.amount !== undefined;
        if (isErc20Amount && m.decimals !== null) log.amount = formatUnits(BigInt(log.amount!), m.decimals);
    }

    const gasPrice = receipt?.effectiveGasPrice ?? tx.gasPrice ?? null;
    return {
        hash: tx.hash,
        chain,
        status: receipt ? (receipt.status === 'success' ? 'success' : 'failed') : 'pending',
        blockNumber: tx.blockNumber === null ? null : Number(tx.blockNumber),
        timestamp: block ? Number(block.timestamp) : null,
        from: getAddress(tx.from),
        to: tx.to ? getAddress(tx.to) : null,
        contractCreated: receipt?.contractAddress ? getAddress(receipt.contractAddress) : null,
        valueEth: formatEther(tx.value),
        feeEth: receipt && gasPrice !== null ? formatEther(receipt.gasUsed * gasPrice) : null,
        gasUsed: receipt ? receipt.gasUsed.toString() : null,
        gasLimit: tx.gas.toString(),
        gasPriceGwei: gasPrice !== null ? formatGwei(gasPrice) : null,
        nonce: tx.nonce,
        methodId: tx.input && tx.input.length >= 10 ? tx.input.slice(0, 10) : null,
        logs
    };
}

export interface BlockDetails {
    number: number;
    chain: ExplorerChain;
    hash: string;
    timestamp: number;
    miner: string;
    txCount: number;
    gasUsed: string;
    gasLimit: string;
    gasUsedPercent: number;
    baseFeeGwei: string | null;
    burntEth: string | null;      // base fee × gas used, destroyed by EIP-1559
    blobGasUsed: string | null;
    transactions: string[];
}

export function parseBlockParam(value: string): bigint | 'latest' | null {
    if (value === 'latest') return 'latest';
    return /^\d{1,12}$/.test(value) ? BigInt(value) : null;
}

export async function getBlockDetails(client: Client, chain: ExplorerChain, param: string): Promise<BlockDetails | null> {
    const which = parseBlockParam(param);
    if (which === null) return null;
    let block;
    try { block = which === 'latest' ? await client.getBlock() : await client.getBlock({ blockNumber: which }); }
    catch (err) { if (/not be found|not found/i.test(String((err as Error).message))) return null; throw err; }

    const baseFee = block.baseFeePerGas ?? null;
    return {
        number: Number(block.number),
        chain,
        hash: block.hash ?? '',
        timestamp: Number(block.timestamp),
        miner: getAddress(block.miner),
        txCount: block.transactions.length,
        gasUsed: block.gasUsed.toString(),
        gasLimit: block.gasLimit.toString(),
        gasUsedPercent: block.gasLimit > BigInt(0) ? Number((block.gasUsed * BigInt(10000)) / block.gasLimit) / 100 : 0,
        baseFeeGwei: baseFee === null ? null : formatGwei(baseFee),
        burntEth: baseFee === null ? null : formatEther(baseFee * block.gasUsed),
        blobGasUsed: block.blobGasUsed === undefined ? null : block.blobGasUsed.toString(),
        transactions: (block.transactions as string[]).slice(0, 100)
    };
}

export interface AddressDetails {
    address: string;
    chain: ExplorerChain;
    balance: string;
    native: string;
    isContract: boolean;
    codeSize: number;
    txCount: number;
    token: TokenMeta | null;      // set when the contract looks like an ERC20
}

export async function getAddressDetails(client: Client, chain: ExplorerChain, value: string): Promise<AddressDetails | null> {
    if (!isAddress(value, { strict: false })) return null;
    const address = getAddress(value);
    const [balance, code, txCount] = await Promise.all([
        client.getBalance({ address }),
        client.getBytecode({ address }).catch(() => undefined),
        client.getTransactionCount({ address })
    ]);
    const isContract = !!code && code !== '0x';
    const meta = isContract ? (await tokenMeta(client, [address])).get(address.toLowerCase()) ?? null : null;
    return {
        address,
        chain,
        balance: formatEther(balance),
        native: chainInfo(chain).native,
        isContract,
        codeSize: isContract ? (code!.length - 2) / 2 : 0,
        txCount,
        token: meta && meta.symbol !== null && meta.decimals !== null ? meta : null
    };
}

export interface TokenDetails extends TokenMeta {
    address: string;
    chain: ExplorerChain;
    totalSupply: string | null;
}

export async function getTokenDetails(client: Client, chain: ExplorerChain, value: string): Promise<TokenDetails | null> {
    if (!isAddress(value, { strict: false })) return null;
    const address = getAddress(value);
    const meta = (await tokenMeta(client, [address])).get(address.toLowerCase());
    if (!meta || meta.symbol === null || meta.decimals === null) return null;
    const supply = await client.readContract({ address, abi: erc20Abi, functionName: 'totalSupply' }).catch(() => null);
    return { address, chain, ...meta, totalSupply: typeof supply === 'bigint' ? formatUnits(supply, meta.decimals) : null };
}
