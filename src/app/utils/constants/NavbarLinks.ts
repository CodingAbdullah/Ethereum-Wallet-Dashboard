import NavbarLinkObject from "../types/NavbarLinkObject";

// Constants for working with Navbar Links
export const NavbarLinks: NavbarLinkObject[] = [
    {
        name: 'Extra Data',
        dropdown: [
            { name: 'EIP Protocols', href: '/eip-protocols' },
            { name: 'Feedback', href: '/feedback' },
            { name: 'Market Insights', href: '/market-insights' },
            { name: 'Staking/Validators', href: '/staking' },
            { name: 'Token Analytics', href: '/collections' },
            { name: 'Wallet Analytics', href: '/wallet-analytics' }
        ]
    },
    {
        name: 'Gas Info',
        dropdown: [{
            name: 'Gas Information', href: '/gas-tracker'
        }]
    },
    {
        name: 'Layer Two Chains',
        dropdown: [
            { name: 'Arbitrum', href: 'https://arbitrum.io', target: '_blank' },
            { name: 'Base', href: 'https://base.org', target: '_blank' },
            { name: 'Blast', href: 'https://blast.io', target: '_blank' },
            { name: 'Linea', href: 'https://linea.build', target: '_blank' },
            { name: 'Optimism', href: 'https://optimism.io', target: '_blank' },
            { name: 'Polygon', href: 'https://polygon.technology', target: '_blank' },
            { name: 'Starknet', href: 'https://starknet.io', target: '_blank' },
            { name: 'ZkSync Era', href: 'https://zksync.io', target: '_blank' }
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