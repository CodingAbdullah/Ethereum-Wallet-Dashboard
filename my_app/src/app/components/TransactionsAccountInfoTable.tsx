import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import TransactionsAccountInformationType from "../utils/types/TransactionsAccountInformationType";

// Transactions Account Information Custom Components
export default async function TransactionsAccountInfoTable( props : { address: string }) {
    const walletAddress = props.address;
    
    return (
        <div className='transaction-activity-table'>

        </div>
    )
}