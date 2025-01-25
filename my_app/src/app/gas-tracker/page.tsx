import GenericGasMetricsInfoTable from "../components/GenericGasMetricsInfoTable";
import GasBlockInfoTable from "../components/GasBlockInfoTable";
import type { Metadata } from "next"

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "Ethereum Gas",
    description: "Analyze Ethereum Gas metrics and block data"
}

// Gas Tracker Page
export default function GasTrackerPage() {

    // Render the Gas Tracker Page
    // Include the Generic Gas Metrics Table and the Gas Block Info Table Components
    return (
        <div className="bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
                <h1 className="text-5xl font-bold mb-6 text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                        Gas Tracker
                    </span>
                </h1>
                <p className="text-xl text-gray-400 mb-12 text-center">
                    Dive deep into Ethereum Gas metrics
                </p>
                <hr className='p-3' /> 
                <GenericGasMetricsInfoTable  />
                <GasBlockInfoTable />
            </div>
    )
}