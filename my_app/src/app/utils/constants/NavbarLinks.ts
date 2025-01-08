import NavbarLinkObject from "../types/NavbarLinkObject";

// Constants for working with Navbar Links
export const NavbarLinks: NavbarLinkObject[] = [
    {
        name: 'Analytics',
        dropdown: [
            { name: 'Token Analytics', href: '/collections' },
            { name: 'Wallet Analytics', href: '/wallet-analytics' }
        ]
    },
    {
        name: 'Gas Station',
        dropdown: []
    },
    {
        name: 'Layer Two Dashboards',
        dropdown: [
            { name: 'Polygon', href: 'https://aws.d2n4l9is533l0n.amplifyapp.com/' },
            { name: 'Arbitrum', href: 'https://arbitrum-aws.d1pqf6famiyi96.amplifyapp.com' },
            { name: 'Optimism', href: 'https://optimism-aws.d22w7ozmz21la.amplifyapp.com/' }
        ]
    },
    {
        name: 'Prices',
        dropdown: [
            { name: 'Coin Prices', href: '/prices/coins' },
            { name: 'ERC20 Token Prices', href: '/prices/erc20' }
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
            { name: 'ERC721 Token Lookups', href: '/lookups/erc721' }
        ]
    }
];