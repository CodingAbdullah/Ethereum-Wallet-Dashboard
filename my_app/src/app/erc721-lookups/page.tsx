import ERC721LookupsForm from '../components/ERC721LookupsForm';

// ERC721 Lookups Page Custom Component
export default function ERC721LookupsPage() {
    
    // Render the ERC721 Token Lookups Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <div className="container mx-auto px-4 w-full max-w-3xl">
                <h1 className="text-5xl font-bold mb-6 text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                        ERC721 Token Lookups
                    </span>
                </h1>
                <p className="text-xl text-gray-400 mb-12 text-center">
                    Analyze a token from a collection
                </p>
            </div>
            <ERC721LookupsForm />
        </div>
    )
}