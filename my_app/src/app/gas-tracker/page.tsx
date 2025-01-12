// Gas Tracker Page
export default async function GasTrackerPage() {
    // Render the Gas Tracker Page Component
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center">
            <div className="container mx-auto px-4 py-16 w-full max-w-3xl">
                <h1 className="text-5xl font-bold mb-6 text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                        Gas Tracker
                    </span>
                </h1>
                <p className="text-xl text-gray-400 mb-12 text-center">
                    Dive deep into Ethereum Gas metrics
                </p>
            </div>
        </div>
    )
}