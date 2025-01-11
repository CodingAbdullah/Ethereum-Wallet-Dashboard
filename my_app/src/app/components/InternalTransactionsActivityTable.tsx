import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import InternalTransactionsActivityType from "../utils/types/InternalTransactionsActivityType";

export default async function InternalTransactionsActivityTable( props : { address: string }) {
    const walletAddress = props.address;
    
    return (
        <div className='transaction-activity-table'>

        </div>
    )
}