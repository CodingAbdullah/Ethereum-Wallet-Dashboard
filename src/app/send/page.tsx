import type { Metadata } from "next";
import SendForm from "../components/onchain/SendForm";

export const metadata: Metadata = {
    title: "Send",
    description: "Send ETH or tokens to an address or ENS name, with a simulation and security check before you sign"
};

export default function SendPage() {
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center"><span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">Send</span></h1>
            <p className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto">Send ETH or any token to an address or ENS name. The recipient is checked and the transfer simulated before you sign.</p>
            <div className="container mx-auto px-4 w-full max-w-2xl"><SendForm /></div>
        </div>
    );
}
