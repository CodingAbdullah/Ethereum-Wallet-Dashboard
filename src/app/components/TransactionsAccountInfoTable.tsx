import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import TransactionsAccountInformationType from "../utils/types/TransactionsAccountInformationType";

// Transactions Account Information Table Custom Component
export default async function TransactionsAccountInfoTable( props : { address: string }) {
    const { address } = props;
    
    const response = await fetch('http://localhost:3000/api/address-transaction-amount', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
    });

    // Conditionally render data table
    if (response.ok) {
        const data = await response.json();
        const tableData: TransactionsAccountInformationType = data;

        // Render Account Transactions Activity
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Account Information</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">ETH Price</TableHead>
                            <TableHead className="text-gray-300">ETH Balance</TableHead>
                            <TableHead className="text-gray-300">USD Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="border-b border-gray-800">
                            <TableCell className="text-gray-100">{tableData?.ethPrice}</TableCell>
                            <TableCell className="text-gray-300">{tableData?.ethBalance}</TableCell>
                            <TableCell className="text-gray-300">{tableData?.usdValue}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
    else {
        throw new Error();
    }
}
