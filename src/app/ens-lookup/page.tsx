import type { Metadata } from "next"
import ENSSelectorSection from "../components/ENSSelectorSection"

// Custom Metadata for SEO
export const metadata: Metadata = {
  title: "ENS Lookup",
  description: "Lookup and analyze ENS data using different conversion methods"
}

// ENS Lookup Page Custom Component
export default function ENSLookupPage() {

    // Render the ENS Lookup Page
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <div className="container mx-auto px-4 w-full max-w-3xl">
                <h1 className="text-5xl font-bold mb-6 text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                        ENS Conversions
                    </span>
                </h1>
                <p className="text-xl text-gray-400 mb-12 text-center">
                    Select conversion options from the menu below!
                </p>
                <ENSSelectorSection />
            </div>
        </div>
    )
}