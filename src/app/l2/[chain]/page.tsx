import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ChainDetailSection from "@/app/components/ChainDetailSection";
import { CHAIN_PAGES } from "@/lib/l2";

// One page per supported network other than Ethereum
export function generateStaticParams() {
    return CHAIN_PAGES.map(chain => ({ chain: chain.key }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ chain: string }> }): Promise<Metadata> {
    const key = (await params).chain;
    const chain = CHAIN_PAGES.find(c => c.key === key);
    return chain
        ? { title: `${chain.name} Overview`, description: `${chain.name}: value locked, top protocols, gas price and risk stage` }
        : {};
}

// Chain Overview Page Custom Component
export default async function ChainPage({ params }: { params: Promise<{ chain: string }> }) {
    const key = (await params).chain;
    const chain = CHAIN_PAGES.find(c => c.key === key);
    if (!chain) notFound();

    // Render the Chain Overview Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    {chain.name}
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                {chain.layer2 ? 'Ethereum layer 2' : 'Ethereum sidechain'} · chain {chain.chainId}
            </p>
            <ChainDetailSection chainKey={chain.key} />
        </div>
    )
}
