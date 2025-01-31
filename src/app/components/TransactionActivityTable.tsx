import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import TransactionActivityType from "../utils/types/TransactionActivityType";

// Transaction Activity Table Custom Component
export default async function TransactionActivityTable( props : { address: string }) {
    const { address } = props;

    const response = await fetch('/api/address-transaction-history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
    });

    // Conditionally render data table
    if (response.ok) {
        const data = await response.json();
        const tableData: TransactionActivityType[] = data.result;

        // Render Account Transactions Activity
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Transactions History</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Time Stamp</TableHead>
                            <TableHead className="text-gray-300">From</TableHead>
                            <TableHead className="text-gray-300">To</TableHead>
                            <TableHead className="text-gray-300">Direction</TableHead>
                            <TableHead className="text-gray-300">Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {
                        tableData?.splice(0, 100).map((transaction, index: number) => { 
                            return (
                                <TableRow key={index} className="border-b border-gray-800">
                                    <TableCell className="text-gray-100">{new Date(Number(transaction.timeStamp)*1000).toISOString().split("T")[0] + ' ' + new Date(Number(transaction.timeStamp)*1000).toISOString().split("T")[1].split('.')[0]}</TableCell>
                                    <TableCell className="text-gray-300">{transaction.from}</TableCell>
                                    <TableCell className="text-gray-300">{transaction.to}</TableCell>
                                    <TableCell className={String(transaction.to).toLowerCase() === address.toLowerCase() ? 'text-green-500' : 'text-red-500'}>
                                        {String(transaction.to).toLowerCase() === address.toLowerCase() ? 'IN' : 'OUT'}
                                    </TableCell>
                                    <TableCell className="text-gray-300">{Number(transaction.value)/1e18 + ' ETH'}</TableCell>
                                </TableRow>
                            )
                        })
                    }
                    </TableBody>
                </Table>
            </div>
        )
    }
    else {
        throw new Error();
    }
}