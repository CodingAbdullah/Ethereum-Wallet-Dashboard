// A small curated set of well-known Ethereum mainnet addresses, shown as names next to addresses on
// explorer pages, token approvals and blob posters. It's deliberately short: only widely documented
// contracts and wallets are listed, and anything unlisted simply shows its address. Extend it by
// adding lowercase addresses below (open datasets such as eth-labels are a good source).

export type LabelKind = 'token' | 'dex' | 'nft' | 'exchange' | 'bridge' | 'staking' | 'lending' | 'rollup' | 'infrastructure' | 'person' | 'burn';

export interface AddressLabel {
    name: string;
    kind: LabelKind;
}

const LABELS: Record<string, AddressLabel> = {
    // Tokens
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { name: 'WETH', kind: 'token' },
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { name: 'USDC', kind: 'token' },
    '0xdac17f958d2ee523a2206206994597c13d831ec7': { name: 'Tether USD (USDT)', kind: 'token' },
    '0x6b175474e89094c44da98b954eedeac495271d0f': { name: 'DAI', kind: 'token' },
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': { name: 'Wrapped BTC (WBTC)', kind: 'token' },
    // Liquid staking
    '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': { name: 'Lido: stETH', kind: 'staking' },
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': { name: 'Lido: wstETH', kind: 'staking' },
    '0xae78736cd615f374d3085123a210448e74fc6393': { name: 'Rocket Pool: rETH', kind: 'staking' },
    '0xbe9895146f7af43049ca1c1ae358b0541ea49704': { name: 'Coinbase: cbETH', kind: 'staking' },
    '0x00000000219ab540356cbb839cbe05303d7705fa': { name: 'Beacon Deposit Contract', kind: 'staking' },
    // DEXs and aggregators
    '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': { name: 'Uniswap V2: Router 2', kind: 'dex' },
    '0xe592427a0aece92de3edee1f18e0157c05861564': { name: 'Uniswap V3: Router', kind: 'dex' },
    '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': { name: 'Uniswap V3: Router 2', kind: 'dex' },
    '0x000000000022d473030f116ddee9f6b43ac78ba3': { name: 'Uniswap: Permit2', kind: 'dex' },
    '0x1111111254eeb25477b68fb85ed929f73a960582': { name: '1inch v5: Aggregation Router', kind: 'dex' },
    '0x111111125421ca6dc452d289314280a0f8842a65': { name: '1inch v6: Aggregation Router', kind: 'dex' },
    '0xdef1c0ded9bec7f1a1670819833240f027b25eff': { name: '0x: Exchange Proxy', kind: 'dex' },
    '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7': { name: 'Curve: 3pool', kind: 'dex' },
    // NFT marketplaces
    '0x00000000000000adc04c56bf30ac9d3c0aaf14dc': { name: 'OpenSea: Seaport 1.5', kind: 'nft' },
    '0x0000000000000068f116a894984e2db1123eb395': { name: 'OpenSea: Seaport 1.6', kind: 'nft' },
    // Lending
    '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2': { name: 'Aave V3: Pool', kind: 'lending' },
    // Exchanges
    '0x28c6c06298d514db089934071355e5743bf21d60': { name: 'Binance 14', kind: 'exchange' },
    '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8': { name: 'Binance 7', kind: 'exchange' },
    '0x71660c4005ba85c37ccec55d0c4493e66fe775d3': { name: 'Coinbase 1', kind: 'exchange' },
    '0x2910543af39aba0cd09dbb2d50200b3e800a63d2': { name: 'Kraken 1', kind: 'exchange' },
    // Bridges
    '0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a': { name: 'Arbitrum One: Bridge', kind: 'bridge' },
    '0xbeb5fc579115071764c7423a4f12edde41f106ed': { name: 'OP Mainnet: Portal', kind: 'bridge' },
    '0x49048044d57e1c92a77f79988d21fa8faf74e97e': { name: 'Base: Portal', kind: 'bridge' },
    // Rollup batch posters (send blob transactions)
    '0x5050f69a9786f081509234f1a7f4684b5e5b76c9': { name: 'Base: Batch Sender', kind: 'rollup' },
    '0x6887246668a3b87f54deb3b94ba47a6f63f32985': { name: 'OP Mainnet: Batch Sender', kind: 'rollup' },
    '0xc1b634853cb333d3ad8663715b08f41a3aec47cc': { name: 'Arbitrum One: Batch Poster', kind: 'rollup' },
    // Infrastructure and other well-known addresses
    '0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e': { name: 'ENS: Registry', kind: 'infrastructure' },
    '0xd8da6bf26964af9d7eed9e03e53415d37aa96045': { name: 'vitalik.eth', kind: 'person' },
    '0x0000000000000000000000000000000000000000': { name: 'Null Address', kind: 'burn' },
    '0x000000000000000000000000000000000000dead': { name: 'Burn Address', kind: 'burn' }
};

export function labelFor(address: string | null | undefined): AddressLabel | null {
    return address ? LABELS[address.toLowerCase()] ?? null : null;
}

export const LABEL_COUNT = Object.keys(LABELS).length;
