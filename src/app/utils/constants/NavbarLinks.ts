import NavbarLinkObject from "../types/NavbarLinkObject";

// Constants for working with Navbar Links
export const NavbarLinks: NavbarLinkObject[] = [
    {
        name: 'Extra Data',
        dropdown: [
            { name: 'DeFi Overview', href: '/defi' },
            { name: 'Derivatives', href: '/derivatives' },
            { name: 'DEX Pools', href: '/dex-pools' },
            { name: 'EIP Protocols', href: '/eip-protocols' },
            { name: 'Feedback', href: '/feedback' },
            { name: 'Governance', href: '/governance' },
            { name: 'Market Insights', href: '/market-insights' },
            { name: 'MEV', href: '/mev' },
            { name: 'My Dashboard', href: '/me' },
            { name: 'N8N Workflows', href: '/n8n-workflows' },
            { name: 'Staking/Validators', href: '/staking' },
            { name: 'Token Analytics', href: '/collections' },
            { name: 'Wallet Analytics', href: '/wallet-analytics' }
        ]
    },
    {
        name: 'Gas Info',
        dropdown: [
            { name: 'Gas Information', href: '/gas-tracker' },
            { name: 'ETH Supply & Burn', href: '/eth-supply' },
            { name: 'Blobs', href: '/blobs' }
        ]
    },
    {
        name: 'Layer Two Chains',
        dropdown: [
            { name: 'Compare L2s', href: '/l2' },
            { name: 'Arbitrum One', href: '/l2/arbitrum' },
            { name: 'Base', href: '/l2/base' },
            { name: 'Linea', href: '/l2/linea' },
            { name: 'OP Mainnet', href: '/l2/optimism' },
            { name: 'Polygon PoS', href: '/l2/polygon' }
        ]
    },
    {
        name: 'Prices',
        dropdown: [
            { name: 'Coin Prices', href: '/prices' },
            { name: 'ERC20 Token Prices', href: '/erc20-token-prices' }
        ]
    },
    {
        name: 'Token Holdings',
        dropdown: [
            { name: 'ERC20 Holdings', href: '/erc20-holdings' },
            { name: 'ERC721 Holdings', href: '/erc721-holdings' }
        ]
    },
    {
        name: 'Token Lookups',
        dropdown: [
            { name: 'ENS', href: '/ens-lookup' },
            { name: 'ERC721 Token Lookups', href: '/erc721-lookups' }
        ]
    }
];