import RocketPoolStatsInfoTable from "../components/RocketPoolStatsInfoTable";
import StakingWebsiteSection from "../components/StakingWebsitesSection";
import ValidatorLeaderboardInfoTable from "../components/ValidatorLeaderboardInfoTable";
import ValidatorQueueInfoTable from "../components/ValidatorQueueInfoTable";

// Staking Page Custom Page Component
export default function StakingPage() {

    // Render the Staking Page
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h5 className="text-5xl font-bold mb-6 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    Ethereum Staking & Validators
                </span>
            </h5>
            <p className="text-xl text-gray-400 mb-12 mb-5 text-center">
                <i>Learn about staking and validators within the Ethereum ecosystem.</i>
            </p>
            <RocketPoolStatsInfoTable />
            <ValidatorLeaderboardInfoTable />
            <ValidatorQueueInfoTable />
            <hr className='mt-10 mb-10' />           
            <StakingWebsiteSection />
        </div>
    )
}