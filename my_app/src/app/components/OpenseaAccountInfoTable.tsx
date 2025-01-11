import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import OpenseaAccountInfoType from "../utils/types/OpenseaAccountInfoType";

// Opensea Account Information Custom Component
export default async function OpenseaAccountInfoTable(props: { address: string }) {
    const response = await fetch('api/opensea-account-information', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: props.address }),
      });
  
      if (response.ok) {
        // After a successful POST, mutate SWR to update the data
        const newData = await response.json();
        const metric: OpenseaAccountInfoType = newData;
        
        return (
            <div className="p-4 bg-gray-900 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Ethereum Metrics</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-300">Opensea Account Information</TableHead>
                            <TableHead className="text-gray-300">Data</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow key={metric.username} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Username</TableCell>
                            <TableCell className="text-gray-300">{metric.username}</TableCell>
                        </TableRow>
                        <TableRow key={metric.profileImage} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Profile Image</TableCell>
                            <TableCell className="text-gray-300">{metric.profileImage}</TableCell>
                        </TableRow>
                        <TableRow key={metric.website} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Website</TableCell>
                            <TableCell className="text-gray-300">{metric.website}</TableCell>
                        </TableRow>
                        <TableRow key={metric.twitter} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Twitter</TableCell>
                            <TableCell className="text-gray-300">{metric.twitter}</TableCell>
                        </TableRow>
                        <TableRow key={metric.instagram} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Instagram</TableCell>
                            <TableCell className="text-gray-300">{metric.instagram}</TableCell>
                        </TableRow>
                        <TableRow key={metric.bio} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Bio</TableCell>
                            <TableCell className="text-gray-300">Bio</TableCell>
                        </TableRow>
                        <TableRow key={metric.joinDate} className="border-b border-gray-800">
                            <TableCell className="font-medium text-gray-100">Join Date</TableCell>
                            <TableCell className="text-gray-300">{metric.joinDate}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
    else {
        return <div>Could not fetch Opensea Account information</div>
    }
}