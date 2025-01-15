import ENSTransfersByIDForm from '@/app/components/ENSTransferByIDForm';

// ENS Transfers By ID Custom Component
export default function ENSTransfersByIDPage() {
    
    // Render the ENS Transfers By ID Component
    return (
        <div className="bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-5xl font-bold mb-6 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    ENS Transfers By ID
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                Detailed ENS transfers by token ID
            </p>
            <ENSTransfersByIDForm />
        </div>
    )
}