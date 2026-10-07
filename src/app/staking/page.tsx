import RocketPoolStatsInfoTable from "../components/RocketPoolStatsInfoTable";
import StakingWebsiteSection from "../components/StakingWebsitesSection";
import LiquidStakingInfoTable from "../components/LiquidStakingInfoTable";
import ValidatorQueueInfoTable from "../components/ValidatorQueueInfoTable";
import StakingOverviewSection from "../components/StakingOverviewSection";
import type { Metadata } from "next"

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "Ethereum Staking and Validators",
    description: "Lookup and analyze Ethereum validators and staking metrics"
}

// Staking Page Custom Page Component
export default function StakingPage() {

    // Render the Staking Page
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    Ethereum Staking & Validators
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                <i>How much ETH is staked, what it earns, and where it&apos;s staked.</i>
            </p>
            <StakingOverviewSection />
            <RocketPoolStatsInfoTable />
            <LiquidStakingInfoTable />
            <ValidatorQueueInfoTable />
            <hr className='mt-10 mb-10' />           
            <StakingWebsiteSection />
        </div>
    )
}