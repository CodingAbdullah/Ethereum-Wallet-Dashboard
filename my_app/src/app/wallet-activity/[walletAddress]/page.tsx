import OpenseaAccountInfoTable from "@/app/components/OpenseaAccountInfoTable";
import addressValidator from "@/app/utils/functions/addressValidator";

// Custom Transactions Page Component
export default async function WalletActivityPage({ params }: { params: { walletAddress: string } }) {
    const parameters = await params;
    const walletAddress = parameters.walletAddress;

    if (!addressValidator(walletAddress)) {
        throw new Error();
    }
    else {
        return (
            <main className="bg-gradient-to-b from-gray-900 to-gray-800 text-gray-300 min-h-screen">
                <section className="text-center py-10 px-4">
                    <div className="container mx-auto max-w-4xl">
                        <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400">
                            Wallet Transaction Activity
                        </h1>
                        <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                            Activity for Wallet: { walletAddress }
                        </p>
                        <hr className='p-5' />
                        <OpenseaAccountInfoTable address={walletAddress} />
                    </div>
                </section>
            </main>
        )
    }
}