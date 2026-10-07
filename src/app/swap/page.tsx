import type { Metadata } from "next";
import SwapForm from "../components/onchain/SwapForm";

export const metadata: Metadata = {
    title: "Swap",
    description: "Swap tokens through Uniswap v3 on Ethereum, Base, Arbitrum and OP Mainnet, with a simulation before you sign"
};

export default function SwapPage() {
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center"><span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">Swap</span></h1>
            <p className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto">Swap tokens through Uniswap. The swap is simulated first, so you see exactly what you&apos;ll receive before you sign.</p>
            <div className="container mx-auto px-4 w-full max-w-xl"><SwapForm /></div>
        </div>
    );
}
