import ENSTransferByNameForm from '@/app/components/ENSTransferByNameForm';
import type { Metadata } from "next"

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "Ethereum ENS Transfers By Name",
    description: "Lookup and analyze ENS transfers by name"
}

// ENS Transfers By Name Custom Component
export default function ENSTransfersByNamePage() {
    
    // Render the ENS Transfers By Name Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-5xl font-bold mb-6 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    ENS Transfers By Name
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                Detailed transfers by ENS name
            </p>
            <ENSTransferByNameForm />
        </div>
    )
}