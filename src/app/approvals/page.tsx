import type { Metadata } from "next";
import ApprovalsManager from "../components/onchain/ApprovalsManager";

export const metadata: Metadata = {
    title: "Approvals Manager",
    description: "See which contracts can spend your tokens and revoke approvals, with a simulation before you sign"
};

export default function ApprovalsPage() {
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">Approvals Manager</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto">
                Contracts you approved can spend your tokens until you revoke them. Every revoke is simulated before you sign.
            </p>
            <div className="container mx-auto px-4 w-full max-w-4xl"><ApprovalsManager /></div>
        </div>
    );
}
