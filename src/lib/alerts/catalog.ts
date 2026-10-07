// What the /alerts form needs to know about each alert type. Safe to import in the browser
// (src/lib/alerts/kinds.ts holds the server-side checks; catalog.test.ts keeps the two in step).

export type FieldType = 'address' | 'chain' | 'number' | 'text' | 'select' | 'spaces';

export interface AlertField {
    name: string;
    label: string;
    type: FieldType;
    options?: { value: string; label: string }[];
    defaultValue?: string;
    placeholder?: string;
    help?: string;
    optional?: boolean;
}

export interface AlertCatalogEntry { id: string; title: string; description: string; everyMinutes: number; realtime?: boolean; fields: AlertField[] }

const address: AlertField = { name: 'address', label: 'Wallet address', type: 'address', placeholder: '0x…' };
const chain: AlertField = { name: 'chain', label: 'Network', type: 'chain', defaultValue: 'eth' };

export const ALERT_CATALOG: AlertCatalogEntry[] = [
    { id: 'market_digest', title: 'Daily market digest', everyMinutes: 1440, description: 'Every morning: ETH price, market cap, gas and the biggest movers.', fields: [] },
    {
        id: 'wallet_activity', title: 'Wallet activity', everyMinutes: 10, realtime: true, description: 'Incoming and outgoing transactions on a wallet, optionally only above a size.',
        fields: [address, chain, { name: 'minEth', label: 'Only transfers of at least (ETH)', type: 'number', defaultValue: '0', optional: true, help: 'Leave at 0 for every transaction, token transfers included.' }]
    },
    { id: 'gas_below', title: 'Gas below a price', everyMinutes: 5, description: 'Tells you when Ethereum gas drops under your price, then waits until it rises again.', fields: [{ name: 'maxGwei', label: 'Base fee at or under (gwei)', type: 'number', placeholder: '5' }] },
    {
        id: 'price', title: 'Price alert', everyMinutes: 5, description: 'ETH or any top-250 coin crossing a price you choose.',
        fields: [
            { name: 'coin', label: 'Coin', type: 'text', defaultValue: 'ethereum', help: 'CoinGecko ID, e.g. ethereum, bitcoin, chainlink (the last part of the coin\'s CoinGecko URL).' },
            { name: 'direction', label: 'When the price goes', type: 'select', defaultValue: 'above', options: [{ value: 'above', label: 'Above' }, { value: 'below', label: 'Below' }] },
            { name: 'usd', label: 'Price (USD)', type: 'number', placeholder: '4000' }
        ]
    },
    { id: 'validator', title: 'Validator alerts', everyMinutes: 15, description: 'Slashing, exits, and balance drops (a sign of missed attestations) for your validator.', fields: [{ name: 'validator', label: 'Validator index or public key', type: 'text', placeholder: '123456' }] },
    { id: 'risky_approval', title: 'Risky token approvals', everyMinutes: 30, realtime: true, description: 'A new unlimited approval, or one to an unknown contract, on your wallet.', fields: [address, { ...chain, help: 'Mainnets only; testnet tokens have no value at risk.' }] },
    {
        id: 'nft_floor', title: 'NFT floor moves', everyMinutes: 30, description: 'A collection\'s floor price moving more than a percentage you set.',
        fields: [
            { name: 'collection', label: 'OpenSea collection slug', type: 'text', placeholder: 'pudgypenguins', help: 'The last part of the collection\'s OpenSea URL.' },
            { name: 'movePercent', label: 'Alert on a move of at least (%)', type: 'number', defaultValue: '10' }
        ]
    },
    { id: 'ens_expiry', title: 'ENS expiry reminders', everyMinutes: 1440, description: 'Reminders 30, 7 and 1 day before a .eth name owned by your wallet expires.', fields: [address] },
    {
        id: 'depeg', title: 'Depeg alerts', everyMinutes: 10, description: 'stETH trading away from ETH, or USDT/USDC/DAI away from $1.',
        fields: [
            { name: 'asset', label: 'Asset', type: 'select', defaultValue: 'steth', options: [{ value: 'steth', label: 'stETH (vs ETH)' }, { value: 'usdt', label: 'USDT' }, { value: 'usdc', label: 'USDC' }, { value: 'dai', label: 'DAI' }] },
            { name: 'thresholdPercent', label: 'Off its peg by at least (%)', type: 'number', defaultValue: '1' }
        ]
    },
    { id: 'governance', title: 'New governance proposals', everyMinutes: 30, description: 'New Snapshot votes for the DAOs you pick.', fields: [{ name: 'spaces', label: 'Snapshot spaces', type: 'spaces', placeholder: 'aave.eth, ens.eth', help: 'Up to 20, separated by commas.' }] }
];

export const catalogEntry = (id: string) => ALERT_CATALOG.find(k => k.id === id);

export function scheduleLabel(entry: AlertCatalogEntry): string {
    const every = entry.everyMinutes === 1440 ? 'Daily' : `Every ${entry.everyMinutes} minutes`;
    return entry.realtime ? `Real time (or ${every.toLowerCase()})` : every;
}

// Form strings to the params the API expects
export function toParams(entry: AlertCatalogEntry, values: Record<string, string>): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    for (const field of entry.fields) {
        const raw = (values[field.name] ?? field.defaultValue ?? '').trim();
        if (raw === '' && field.optional) continue;
        if (field.type === 'number') params[field.name] = raw === '' ? NaN : Number(raw);
        else if (field.type === 'spaces') params[field.name] = raw.split(/[\s,]+/).map(s => s.toLowerCase()).filter(Boolean);
        else params[field.name] = raw;
    }
    return params;
}
