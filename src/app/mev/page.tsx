import MevSection from "../components/MevSection";
import type { Metadata } from "next";

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "MEV",
    description: "MEV-Boost relays, block builders and payments to Ethereum validators"
}

// MEV Page Custom Component
export default function Page() {

    // Render the MEV Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    MEV
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                Who builds Ethereum&apos;s blocks, and what they pay
            </p>
            <MevSection />
        </div>
    )
}
