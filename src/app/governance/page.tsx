import GovernanceSection from "../components/GovernanceSection";
import type { Metadata } from "next";

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "Governance",
    description: "Active Snapshot governance votes for major Ethereum protocols"
}

// Governance Page Custom Component
export default function Page() {

    // Render the Governance Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    Governance
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                What the major DAOs are voting on
            </p>
            <GovernanceSection />
        </div>
    )
}
