import FooterLinksObject from "../types/FooterLinkObject";

// Footer Links Constant: every data provider the dashboard calls (all free or keyless), and social links.
// Keep this in sync with the "Data Providers" table in the README.
export const FooterLinks: FooterLinksObject = {
    providers: [
        {
            group: 'Wallet & chain data',
            links: [
                { name: 'Moralis', href: 'https://docs.moralis.com/' },
                { name: 'Etherscan', href: 'https://docs.etherscan.io/' },
                { name: 'Ethplorer', href: 'https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API' },
                { name: 'OpenSea', href: 'https://docs.opensea.io/reference/api-overview' },
                { name: 'PublicNode', href: 'https://www.publicnode.com/' },
                { name: 'Beacon API', href: 'https://ethereum.github.io/beacon-APIs/' },
                { name: 'GoPlus', href: 'https://gopluslabs.io/' },
                { name: 'Sourcify', href: 'https://sourcify.dev/' }
            ]
        },
        {
            group: 'Markets & DeFi',
            links: [
                { name: 'CoinGecko', href: 'https://www.coingecko.com/en/api' },
                { name: 'GeckoTerminal', href: 'https://www.geckoterminal.com/' },
                { name: 'Coinbase Exchange', href: 'https://exchange.coinbase.com/' },
                { name: 'DefiLlama', href: 'https://defillama.com/docs/api' },
                { name: 'Deribit', href: 'https://docs.deribit.com/' },
                { name: 'OKX', href: 'https://www.okx.com/docs-v5/en/' },
                { name: 'Bybit', href: 'https://bybit-exchange.github.io/docs/' },
                { name: 'Lido', href: 'https://lido.fi/' },
                { name: 'Rocket Pool', href: 'https://rocketpool.net/' },
                { name: 'Uniswap', href: 'https://docs.uniswap.org/contracts/v3/overview' }
            ]
        },
        {
            group: 'Ethereum & L2s',
            links: [
                { name: 'L2BEAT', href: 'https://l2beat.com/' },
                { name: 'MEV-Boost Relays', href: 'https://boost.flashbots.net/' },
                { name: 'Snapshot', href: 'https://snapshot.box/' },
                { name: 'EIPs', href: 'https://eips.ethereum.org/' }
            ]
        },
        {
            group: 'AI & automation',
            links: [
                { name: 'Groq', href: 'https://console.groq.com/docs' },
                { name: 'n8n', href: 'https://n8n.io/' }
            ]
        }
    ],
    social: [
        { name: 'Twitter', href: 'https://twitter.com/KA95doteth' },
        { name: 'GitHub', href: 'https://github.com/CodingAbdullah' }
    ]
}
