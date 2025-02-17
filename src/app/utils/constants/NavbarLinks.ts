import NavbarLinkObject from "../types/NavbarLinkObject";

// Constants for working with Navbar Links
export const NavbarLinks: NavbarLinkObject[] = [
    {
        name: 'Extra Data',
        dropdown: [
            { name: 'EIP Protocols', href: '/eip-protocols' },
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
        name: 'Layer Two Dashboards',
        dropdown: [
            { name: 'Arbitrum', href: 'https://arbdashboard.xyz' },
            { name: 'Optimism', href: 'https://optimismdashboard.xyz' },
            { name: 'Polygon', href: 'https://polygondashboard.xyz' }
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