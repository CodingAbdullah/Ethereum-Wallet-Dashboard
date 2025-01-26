import type { Metadata } from "next"
import ERC20TokenPricesForm from '../components/ERC20TokenPricesForm';

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "Ethereum ERC20 Token Prices",
    description: "Analyze an ERC20 token based on recent market data"
}

// ERC20 Token Prices Page Custom Component
export default function ERC20TokenPricesPage() {
    
    // Render the ERC20 Token Prices Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-5xl font-bold mb-6 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    ERC20 Prices
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                Dive deep into token market metrics
            </p>
            <ERC20TokenPricesForm />
        </div>
    )
}