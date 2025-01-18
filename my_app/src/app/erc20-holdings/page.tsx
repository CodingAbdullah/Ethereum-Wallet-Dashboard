import ERC20HoldingsForm from "../components/ERC20HoldingsForm";

// ERC20 Holdings Custom Component
export default function ERC20HoldingsPage() {    
    // Render the ERC20 Holdings Page Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <div className="container mx-auto px-4 w-full max-w-3xl">
                <h1 className="text-5xl font-bold mb-6 text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                        ERC20 Holdings
                    </span>
                </h1>
                <p className="text-xl text-gray-400 mb-12 text-center">
                    Dive deep into wallet ERC20 holdings
                </p>
            </div>
            <ERC20HoldingsForm />
        </div>
    )
}