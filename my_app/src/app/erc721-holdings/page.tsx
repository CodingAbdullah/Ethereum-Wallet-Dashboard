import ERC721HoldingsForm from "../components/ERC721HoldingsForm";
import type { Metadata } from "next"

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "Ethereum ERC721 Holdings",
    description: "Analyze Ethereum wallet ERC721 token holdings"
}

// ERC721 Holdings Custom Component
export default function ERC721HoldingsPage() {
    
    // Render the ERC721 Holdings Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-5xl font-bold mb-6 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    ERC721 Holdings
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                Dive deep into wallet Holdings
            </p>
            <ERC721HoldingsForm />
        </div>
    )
}