import type { Metadata } from "next"
import CollectionsSelectorSection from "../components/CollectionsSelectorSection"

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "Ethereum Collections Analytics",
    description: "Lookup and analyze Ethereum collections"
}

// Collections Page Custom Component
export default function CollectionsPage() {

    // Render the Token Analytics Collections Page
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-5xl font-bold mb-6 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    Token Analytics
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                Dive deep into token collections and evaluate metrics
            </p>
            <CollectionsSelectorSection />
        </div>
    )
}