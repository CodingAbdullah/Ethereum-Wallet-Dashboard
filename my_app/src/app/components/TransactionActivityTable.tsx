import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import TransactionActivityType from "../utils/types/TransactionActivityType";

// Transaction Activity Table Custom Component
export default async function TransactionActivityTable( props : { address: string }) {
    const walletAddress = props.address;
    
    return (
        <div className='transaction-activity-table'>

        </div>
    )
}