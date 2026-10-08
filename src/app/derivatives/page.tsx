import DerivativesSection from "../components/DerivativesSection";
import ServerSection from "../components/ServerSection";
import { getDerivatives } from "@/lib/derivatives";
import type { Metadata } from "next";

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "Derivatives",
    description: "ETH perpetual funding rates, open interest and options data"
}

// Derivatives Page Custom Component
export default function Page() {

    // Render the Derivatives Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    Derivatives
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                Funding, open interest and options
            </p>
            <ServerSection load={getDerivatives} loading="Loading derivatives data…" failed="Could not load derivatives data. Please try again later.">
                {data => <DerivativesSection data={data} />}
            </ServerSection>
        </div>
    )
}
