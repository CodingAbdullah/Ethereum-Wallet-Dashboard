import EthSupplySection from "../components/EthSupplySection";
import ServerSection from "../components/ServerSection";
import { getEthSupply } from "@/lib/ethSupply";
import type { Metadata } from "next";

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "ETH Supply",
    description: "Is ETH supply growing or shrinking? Burn vs. issuance over the last day"
}

// ETH Supply Page Custom Component
export default function Page() {

    // Render the ETH Supply Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    ETH Supply
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                ETH burnt by fees vs. ETH issued to stakers
            </p>
            <ServerSection load={getEthSupply} loading="Measuring the last day of blocks…" failed="Could not load supply data. Please try again later.">
                {data => <EthSupplySection data={data} />}
            </ServerSection>
        </div>
    )
}
