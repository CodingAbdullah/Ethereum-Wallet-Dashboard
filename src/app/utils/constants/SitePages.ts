// Every page in the site, grouped as they appear in the navbar. Search (Cmd+K) uses the keywords.

export interface SitePage {
    name: string;
    href: string;
    keywords?: string;
}

export interface PageGroup {
    name: string;
    pages: SitePage[];
}

export const SITE_PAGES: PageGroup[] = [
    {
        name: 'Markets',
        pages: [
            { name: 'Coin Prices', href: '/prices', keywords: 'price coins top gainers losers market cap' },
            { name: 'ERC20 Token Prices', href: '/erc20-token-prices', keywords: 'token price chart contract' },
            { name: 'DeFi Overview', href: '/defi', keywords: 'tvl total value locked protocols stablecoins yields dex volume fees defillama' },
            { name: 'DEX Pools', href: '/dex-pools', keywords: 'pools pairs trending new liquidity geckoterminal uniswap' },
            { name: 'Derivatives', href: '/derivatives', keywords: 'funding rate open interest perpetual futures options deribit' },
            { name: 'Market Insights', href: '/market-insights', keywords: 'ai analysis commentary' }
        ]
    },
    {
        name: 'Ethereum',
        pages: [
            { name: 'Gas Tracker', href: '/gas-tracker', keywords: 'gas fees gwei base fee' },
            { name: 'ETH Supply & Burn', href: '/eth-supply', keywords: 'supply burn issuance inflation deflation ultrasound' },
            { name: 'Blobs', href: '/blobs', keywords: 'blobs 4844 rollups data availability blob fee' },
            { name: 'Staking & Validators', href: '/staking', keywords: 'staking validators queue lido rocket pool steth reth apr' },
            { name: 'MEV', href: '/mev', keywords: 'mev boost relays builders flashbots' },
            { name: 'Governance', href: '/governance', keywords: 'dao proposals votes snapshot' },
            { name: 'EIP Protocols', href: '/eip-protocols', keywords: 'eip erc standards upgrade hardfork glamsterdam fusaka' },
            { name: 'Latest Block', href: '/block/latest', keywords: 'block explorer latest' }
        ]
    },
    {
        name: 'Layer 2s',
        pages: [
            { name: 'Compare L2s', href: '/l2', keywords: 'layer 2 rollups l2beat stage compare' },
            { name: 'Arbitrum One', href: '/l2/arbitrum', keywords: 'arbitrum arb' },
            { name: 'Base', href: '/l2/base', keywords: 'base coinbase' },
            { name: 'Linea', href: '/l2/linea', keywords: 'linea consensys' },
            { name: 'OP Mainnet', href: '/l2/optimism', keywords: 'optimism op' },
            { name: 'Polygon PoS', href: '/l2/polygon', keywords: 'polygon matic pol' }
        ]
    },
    {
        name: 'Wallets',
        pages: [
            { name: 'My Dashboard', href: '/me', keywords: 'portfolio my wallets saved account sign in' },
            { name: 'Alerts', href: '/alerts', keywords: 'alerts notifications telegram discord email gas price validator ens depeg governance' },
            { name: 'ERC20 Holdings', href: '/erc20-holdings', keywords: 'tokens balances holdings transfers' },
            { name: 'ERC721 Holdings', href: '/erc721-holdings', keywords: 'nfts holdings collections' },
            { name: 'Wallet Analytics', href: '/wallet-analytics', keywords: 'pnl profit loss net worth stats' },
            { name: 'ENS Lookup', href: '/ens-lookup', keywords: 'ens names domains .eth resolve' }
        ]
    },
    {
        name: 'Actions',
        pages: [
            { name: 'Swap', href: '/swap', keywords: 'swap trade exchange uniswap buy sell' },
            { name: 'Send', href: '/send', keywords: 'send transfer pay eth tokens' },
            { name: 'Stake & Wrap', href: '/stake', keywords: 'stake staking lido steth rocket pool reth wrap unwrap weth' },
            { name: 'Approvals Manager', href: '/approvals', keywords: 'approvals revoke allowance spender security' },
            { name: 'Contract Explorer', href: '/contract', keywords: 'contract read write abi call interact' },
            { name: 'ENS Manager', href: '/ens-manager', keywords: 'ens register renew primary name records .eth' }
        ]
    },
    {
        name: 'Tokens & NFTs',
        pages: [
            { name: 'Token & NFT Analytics', href: '/collections', keywords: 'collection analytics erc20 erc721 holders' },
            { name: 'NFT Lookups', href: '/erc721-lookups', keywords: 'nft token id rarity traits sales' }
        ]
    },
    {
        name: 'More',
        pages: [
            { name: 'About', href: '/about' },
            { name: 'Feedback', href: '/feedback', keywords: 'contact suggestions bug' },
            { name: 'N8N Workflows', href: '/n8n-workflows', keywords: 'automation alerts workflows subscribe' },
            { name: 'MCP Server', href: '/mcp', keywords: 'mcp claude cursor ai api key connector model context protocol' },
            { name: 'API Docs', href: '/docs', keywords: 'api rest openapi developers documentation reference endpoints' }
        ]
    }
];
