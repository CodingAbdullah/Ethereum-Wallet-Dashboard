import MyDashboardSection from "../components/MyDashboardSection";
import type { Metadata } from "next";

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "My Dashboard",
    description: "Your saved Ethereum wallets in one place"
}

// My Dashboard Page Custom Component
export default function MyDashboardPage() {

    // Render the My Dashboard Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-5xl font-bold mb-6 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    My Dashboard
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                Save the wallets you follow and see them in one place
            </p>
            <MyDashboardSection />
        </div>
    )
}
