import ENSToAddressForm from '@/app/components/ENSToAddressForm';

// ENS To Address Lookup Page Custom Component
export default function ENSToAddressLookupPage() {

    // Render the ENS To Address Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-5xl font-bold mb-6 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    ENS To Address Lookup
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                Get detailed wallet information by looking up an ENS domain
            </p>
            <ENSToAddressForm />
        </div>
    )
}