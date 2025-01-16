import InternalTransactionsActivityTable from "@/app/components/InternalTransactionsActivityTable";
import OpenseaAccountInfoTable from "@/app/components/OpenseaAccountInfoTable";
import TransactionActivityTable from "@/app/components/TransactionActivityTable";
import TransactionsAccountInfoTable from "@/app/components/TransactionsAccountInfoTable";
import addressValidator from "@/app/utils/functions/addressValidator";

// Custom Transactions Page Component
export default async function WalletActivityPage({ params }: { params: { walletAddress: string } }) {
    const parameters = await params;
    const walletAddress = parameters.walletAddress;

    // Dynamically render this page based on wallet address validity
    if (!addressValidator(walletAddress)) {
        throw new Error();
    }
    else {
        return (
            <>
                <div className="bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
                    <h1 className="text-5xl font-bold mb-6 text-center">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                            Wallet Transaction Activity
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-12 text-center">
                        Get detailed activity of a particular wallet 
                    </p>
                    <TransactionsAccountInfoTable address={walletAddress} />
                    <OpenseaAccountInfoTable address={walletAddress} />
                    <TransactionActivityTable address={walletAddress} />
                    <InternalTransactionsActivityTable address={walletAddress} />
                </div>
            </>
        )
    }
}