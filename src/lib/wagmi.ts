import { cookieStorage, createConfig, createStorage, http, type CreateConnectorFn } from "wagmi";
import { mainnet, base, arbitrum, optimism, polygon, linea, sepolia, hoodi } from "wagmi/chains";
import { CHAINS } from "./chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

// Wallet connection config (wagmi). The same networks the address forms support (src/lib/chains.ts).
// Connectors load their wallet SDKs only when the user picks them, so pages stay light.
//  - injected: any browser-extension wallet (MetaMask, Rabby, ...), discovered through EIP-6963
//  - coinbaseWallet: Coinbase Wallet app and extension, plus its passkey smart wallet (no extension needed)
//  - walletConnect: mobile wallets by QR code, only when NEXT_PUBLIC_REOWN_PROJECT_ID is set (free Reown Cloud project)

export const APP_NAME = 'Ethereum Dashboard';

export function walletConnectors(projectId: string | undefined = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID): CreateConnectorFn[] {
    const connectors: CreateConnectorFn[] = [
        injected(),
        coinbaseWallet({ appName: APP_NAME, preference: { options: 'all' } })
    ];

    if (projectId) {
        connectors.push(walletConnect({
            projectId,
            metadata: {
                name: APP_NAME,
                description: 'Ethereum wallet analytics',
                url: 'https://ethereumdashboard.dev',
                icons: ['https://ethereumdashboard.dev/favicon.ico']
            }
        }));
    }
    return connectors;
}

export function createWagmiConfig() {
    return createConfig({
        chains: [mainnet, base, arbitrum, optimism, polygon, linea, sepolia, hoodi],
        connectors: walletConnectors(),
        // Remembers the last wallet in a cookie so it reconnects on the next visit
        storage: createStorage({ storage: cookieStorage }),
        ssr: true,
        // Each chain's free public RPC from the chain registry (the browser can't read ETH_RPC_URL);
        // testnets use viem's default public RPCs
        transports: {
            [mainnet.id]: http(CHAINS.eth.rpc),
            [base.id]: http(CHAINS.base.rpc),
            [arbitrum.id]: http(CHAINS.arbitrum.rpc),
            [optimism.id]: http(CHAINS.optimism.rpc),
            [polygon.id]: http(CHAINS.polygon.rpc),
            [linea.id]: http(CHAINS.linea.rpc),
            [sepolia.id]: http(),
            [hoodi.id]: http()
        }
    });
}

declare module "wagmi" {
    interface Register {
        config: ReturnType<typeof createWagmiConfig>;
    }
}
