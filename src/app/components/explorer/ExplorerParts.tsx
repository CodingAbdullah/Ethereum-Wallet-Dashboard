import Link from 'next/link';
import { CHAINS } from '@/lib/chains';
import { EXPLORER_CHAINS, type ExplorerChain } from '@/lib/explorer';
import { labelFor } from '@/lib/labels';

// Server-rendered building blocks shared by /tx, /block, /address and /token

const q = (chain: ExplorerChain) => chain === 'eth' ? '' : '?chain=' + chain;

// Labels (src/lib/labels.ts) are Ethereum mainnet addresses, so they're only shown there
export function AddressLink({ address, chain, short = false }: { address: string; chain: ExplorerChain; short?: boolean }) {
    const label = chain === 'eth' ? labelFor(address) : null;
    const text = short ? address.slice(0, 6) + '…' + address.slice(-4) : address;
    return (
        <Link href={`/address/${address}${q(chain)}`} title={address} className="text-gray-200 underline break-all">
            {label ? <>{label.name}{!short && <span className="ml-2 font-mono text-xs text-gray-400">{text}</span>}</> : <span className="font-mono">{text}</span>}
        </Link>
    );
}

export function TxLink({ hash, chain, short = false }: { hash: string; chain: ExplorerChain; short?: boolean }) {
    return <Link href={`/tx/${hash}${q(chain)}`} className="font-mono text-gray-200 underline break-all">{short ? hash.slice(0, 12) + '…' + hash.slice(-6) : hash}</Link>;
}

export function BlockLink({ number, chain }: { number: number; chain: ExplorerChain }) {
    return <Link href={`/block/${number}${q(chain)}`} className="text-gray-200 underline tabular-nums">{number.toLocaleString('en-US')}</Link>;
}

export function ExplorerPage({ title, subtitle, chain, path, action, children }: { title: string; subtitle: React.ReactNode; chain: ExplorerChain; path: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">{title}</span>
            </h1>
            <div className="text-gray-400 mb-6 text-center break-all">{subtitle}</div>
            {action && <div className="mb-6 flex justify-center">{action}</div>}
            <nav aria-label="Network" className="mb-10 flex flex-wrap justify-center gap-2">
                {EXPLORER_CHAINS.map(key => (
                    <Link
                        key={key}
                        href={path + q(key)}
                        aria-current={key === chain ? 'page' : undefined}
                        className={`rounded-full px-3 py-1 text-sm ring-1 ${key === chain ? 'bg-gray-200 text-gray-900 ring-gray-200' : 'text-gray-300 ring-gray-600 hover:bg-gray-700'}`}
                    >
                        {CHAINS[key].name}
                    </Link>
                ))}
            </nav>
            <div className="container mx-auto w-full max-w-5xl space-y-8">{children}</div>
        </div>
    );
}

export function DetailList({ rows }: { rows: [string, React.ReactNode][] }) {
    return (
        <dl className="divide-y divide-gray-800">
            {rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-1 sm:gap-4 py-3">
                    <dt className="text-sm text-gray-400">{label}</dt>
                    <dd className="text-gray-100 min-w-0 break-words">{value}</dd>
                </div>
            ))}
        </dl>
    );
}

export function RpcError({ chain }: { chain: ExplorerChain }) {
    return (
        <p className="text-center text-red-400">
            Couldn&apos;t reach the {CHAINS[chain].name} node right now. Please try again in a moment.
        </p>
    );
}

export const when = (timestamp: number) => new Date(timestamp * 1000).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'long', timeZone: 'UTC' });
export const trimNumber = (value: string, digits = 6) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: digits }) : value;
};
