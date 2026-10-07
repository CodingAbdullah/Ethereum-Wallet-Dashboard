import type { Metadata } from "next";
import ContractExplorer from "../components/onchain/ContractExplorer";
import { CHAINS, type ChainKey } from "@/lib/chains";

export const metadata: Metadata = {
    title: "Contract Explorer",
    description: "Read any verified contract and call its write functions, with a simulation before you sign"
};

// ?address=0x…&chain=base opens a contract directly (linked from contract address pages)
export default async function ContractPage({ searchParams }: { searchParams: Promise<{ address?: string; chain?: string }> }) {
    const { address, chain } = await searchParams;
    const initialChain = chain && chain in CHAINS ? chain as ChainKey : undefined;
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center"><span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">Contract Explorer</span></h1>
            <p className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto">Load a verified contract to read its data or call its functions. Every write is simulated before you sign.</p>
            <div className="container mx-auto px-4 w-full max-w-4xl"><ContractExplorer key={`${address}-${initialChain}`} initialAddress={typeof address === 'string' ? address : undefined} initialChain={initialChain} /></div>
        </div>
    );
}
