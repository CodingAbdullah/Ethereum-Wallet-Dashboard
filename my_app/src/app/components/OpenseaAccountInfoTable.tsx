import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import OpenseaAccountInfoType from "../utils/types/OpenseaAccountInfoType";

// Opensea Account Information Custom Component
export default async function OpenseaAccountInfoTable(props: { address: string }) {
    const response = await fetch('http://localhost:3000/api/opensea-account-information', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: props.address })
    });
  
    if (response.ok) {
        // After a successful request, render table with data
        const newData = await response.json();
        const metric: OpenseaAccountInfoType = newData;
        
        // Render Opensea Account Info Table Component
        return (
            <div className="p-4 bg-gray-900 mt-10 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Opensea Account Information</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Account Details</TableHead>
                            <TableHead className="text-gray-300">Data</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow key={metric.username} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Username</TableCell>
                            <TableCell className="text-gray-300">{metric.username}</TableCell>
                        </TableRow>
                        <TableRow key={metric.website} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Website</TableCell>
                            <TableCell className="text-gray-300">{metric.website ? metric.website : 'N/A'}</TableCell>
                        </TableRow>
                        {
                            metric.social_media_accounts.map(account => {
                                return (
                                    <TableRow key={account.platform} className="border-b border-gray-800">
                                        <TableCell className="font-medium text-gray-100">{account.platform}</TableCell>
                                        <TableCell className="text-gray-300">{account.username}</TableCell>
                                    </TableRow>
                                )
                            })
                        }
                        <TableRow key={metric.bio} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Bio</TableCell>
                            <TableCell className="text-gray-300">{metric.bio ? metric.bio : 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow key={metric.joined_date} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Join Date</TableCell>
                            <TableCell className="text-gray-300">{metric.joined_date}</TableCell>
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