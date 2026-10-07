import type { Metadata } from "next";
import EnsManager from "../components/onchain/EnsManager";

export const metadata: Metadata = {
    title: "ENS Manager",
    description: "Register and renew .eth names, set your primary name and edit records, with a simulation before you sign"
};

export default function EnsManagerPage() {
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center"><span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">ENS Manager</span></h1>
            <p className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto">Register or renew a .eth name, set your primary name, and edit its records. Every change is simulated before you sign.</p>
            <div className="container mx-auto px-4 w-full max-w-3xl"><EnsManager /></div>
        </div>
    );
}
