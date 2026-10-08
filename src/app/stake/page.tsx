import type { Metadata } from "next";
import StakeForm from "../components/onchain/StakeForm";

export const metadata: Metadata = {
    title: "Stake & Wrap",
    description: "Stake ETH with Lido or Rocket Pool, and wrap or unwrap ETH, with a simulation before you sign"
};

export default function StakePage() {
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center"><span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">Stake & Wrap</span></h1>
            <p className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto">Stake ETH for stETH or rETH, or wrap and unwrap ETH. You see exactly what you&apos;ll receive before you sign.</p>
            <div className="container mx-auto px-4 w-full max-w-2xl"><StakeForm /></div>
        </div>
    );
}
