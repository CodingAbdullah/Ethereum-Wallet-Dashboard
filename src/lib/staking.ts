import { encodePacked, formatEther, keccak256, parseAbi } from "viem";
import { rpcClient } from "./providers/rpc";
import { providerFetch } from "./providers/http";

// Staking data read directly from on-chain contracts over free RPC

const ROCKET_STORAGE = '0x1d8f8f00cfa6758d7bE78336684788Fb0ee0Fa46';
const RETH = '0xae78736Cd615f374D3085123A210448E74Fc6393';
const STETH = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
const CBETH = '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704';

const BLOCKS_PER_DAY = 7200;
const APR_WINDOW_DAYS = 7;

const rocketStorageAbi = parseAbi(['function getAddress(bytes32 key) view returns (address)']);
const rethAbi = parseAbi(['function getExchangeRate() view returns (uint256)', 'function totalSupply() view returns (uint256)']);
const cbethAbi = parseAbi(['function exchangeRate() view returns (uint256)', 'function totalSupply() view returns (uint256)']);
const erc20Abi = parseAbi(['function totalSupply() view returns (uint256)']);
const uintGetterAbi = (name: string) => parseAbi([`function ${name}() view returns (uint256)`]);

const toEth = (wei: bigint) => Number(formatEther(wei));

// Rocket Pool resolves its contract addresses through RocketStorage
async function rocketContract(name: string): Promise<`0x${string}`> {
    return rpcClient.readContract({
        address: ROCKET_STORAGE,
        abi: rocketStorageAbi,
        functionName: 'getAddress',
        args: [keccak256(encodePacked(['string', 'string'], ['contract.address', name]))]
    });
}

async function rocketUint(contractName: string, functionName: string): Promise<bigint> {
    return rpcClient.readContract({
        address: await rocketContract(contractName),
        abi: uintGetterAbi(functionName),
        functionName
    }) as Promise<bigint>;
}

// Annualized growth of a liquid staking token's exchange rate over the last week.
// Needs historical state, so it returns null on RPC endpoints without archive access.
async function exchangeRateApr(read: (blockNumber?: bigint) => Promise<bigint>): Promise<number | null> {
    try {
        const latest = await rpcClient.getBlockNumber();
        const [now, past] = await Promise.all([read(), read(latest - BigInt(BLOCKS_PER_DAY * APR_WINDOW_DAYS))]);
        if (past === BigInt(0)) return null;
        const growth = toEth(now) / toEth(past) - 1;
        return Number(((growth * 365) / APR_WINDOW_DAYS * 100).toFixed(2));
    }
    catch {
        return null;
    }
}

const settled = (result: PromiseSettledResult<unknown>): unknown => (result.status === 'fulfilled' ? result.value : null);

const rethRate = (blockNumber?: bigint) => rpcClient.readContract({ address: RETH, abi: rethAbi, functionName: 'getExchangeRate', blockNumber });
const cbethRate = (blockNumber?: bigint) => rpcClient.readContract({ address: CBETH, abi: cbethAbi, functionName: 'exchangeRate', blockNumber });

export async function getRocketPoolStats() {
    const results = await Promise.allSettled([
        rocketUint('rocketNetworkFees', 'getNodeFee'),
        rocketUint('rocketNodeManager', 'getNodeCount'),
        rocketUint('rocketMinipoolManager', 'getMinipoolCount'),
        rethRate(),
        rpcClient.readContract({ address: RETH, abi: rethAbi, functionName: 'totalSupply' }),
        rocketUint('rocketNetworkPrices', 'getRPLPrice'),
        rocketUint('rocketNetworkBalances', 'getTotalETHBalance'),
        rocketUint('rocketNetworkBalances', 'getStakingETHBalance'),
        exchangeRateApr(rethRate)
    ]);

    const [nodeFee, nodeCount, minipoolCount, exchangeRate, rethSupply, rplPrice, totalEth, stakingEth, rethApr] = results.map(settled);

    return {
        current_node_fee: nodeFee !== null ? Number((toEth(nodeFee as bigint) * 100).toFixed(2)) : null,
        node_count: nodeCount !== null ? Number(nodeCount) : null,
        minipool_count: minipoolCount !== null ? Number(minipoolCount) : null,
        reth_apr: rethApr as number | null,
        reth_exchange_rate: exchangeRate !== null ? toEth(exchangeRate as bigint) : null,
        reth_supply: rethSupply !== null ? toEth(rethSupply as bigint) : null,
        rpl_price: rplPrice !== null ? toEth(rplPrice as bigint) : null,
        total_eth_balance: totalEth !== null ? toEth(totalEth as bigint) : null,
        total_eth_staking: stakingEth !== null ? toEth(stakingEth as bigint) : null
    };
}

export interface LiquidStakingToken {
    protocol: string;
    token: string;
    eth_staked: number | null;
    exchange_rate: number | null;
    apr: number | null;
}

// Lido publishes a 7-day moving average APR on its free public API
async function lidoApr(): Promise<number | null> {
    try {
        const data = await providerFetch<{ data: { smaApr: number } }>('Lido', 'https://eth-api.lido.fi/v1/protocol/steth/apr/sma', { revalidate: 3600 });
        return Number(data.data.smaApr.toFixed(2));
    }
    catch {
        return null;
    }
}

export async function getLiquidStaking(): Promise<LiquidStakingToken[]> {
    const [stethSupply, stethApr, rethRateNow, rethSupply, rethApr, cbethRateNow, cbethSupply, cbethApr] = (await Promise.allSettled([
        rpcClient.readContract({ address: STETH, abi: erc20Abi, functionName: 'totalSupply' }),
        lidoApr(),
        rethRate(),
        rpcClient.readContract({ address: RETH, abi: rethAbi, functionName: 'totalSupply' }),
        exchangeRateApr(rethRate),
        cbethRate(),
        rpcClient.readContract({ address: CBETH, abi: cbethAbi, functionName: 'totalSupply' }),
        exchangeRateApr(cbethRate)
    ])).map(settled);

    const backing = (supply: unknown, rate: unknown) =>
        supply !== null && rate !== null ? toEth(supply as bigint) * toEth(rate as bigint) : null;

    return [
        {
            protocol: 'Lido',
            token: 'stETH',
            // stETH is rebasing, so its supply equals the ETH it represents
            eth_staked: stethSupply !== null ? toEth(stethSupply as bigint) : null,
            exchange_rate: 1,
            apr: stethApr as number | null
        },
        {
            protocol: 'Rocket Pool',
            token: 'rETH',
            eth_staked: backing(rethSupply, rethRateNow),
            exchange_rate: rethRateNow !== null ? toEth(rethRateNow as bigint) : null,
            apr: rethApr as number | null
        },
        {
            protocol: 'Coinbase',
            token: 'cbETH',
            eth_staked: backing(cbethSupply, cbethRateNow),
            exchange_rate: cbethRateNow !== null ? toEth(cbethRateNow as bigint) : null,
            apr: cbethApr as number | null
        }
    ];
}
