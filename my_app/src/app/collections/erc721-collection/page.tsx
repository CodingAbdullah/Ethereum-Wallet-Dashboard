import ERC721CollectionsAnalyticsForm from '@/app/components/ERC721CollectionsAnalyticsForm';
import type { Metadata } from "next"

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "Ethereum ERC721 Collection Analytics",
    description: "Lookup and analyze an Ethereum ERC721 collection"
}

// ERC721 Collection Analytics Page
export default function ERC721CollectionAnalyticsPage() {
    
    // Render the ERC721 Collection Analytics Page
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-5xl font-bold mb-6 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    ERC721 Collection Analytics
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                Dive deep into collection metrics
            </p>
            <ERC721CollectionsAnalyticsForm />
        </div>
    )
}