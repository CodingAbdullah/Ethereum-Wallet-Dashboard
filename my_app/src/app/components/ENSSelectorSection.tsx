'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

// ENS Selector Section Custom Component
export default function ENSSelectorSection() {
    const router = useRouter();
    const [collectionURL, setCollectionURL] = useState<string>("address-to-ens-lookup");

    // Dynamically handle collection URL settings
    const handleCollectionChange = (value: string) => {
        setCollectionURL(value);
    }

    // Push endpoint value to /ens-lookup path
    const handleViewCollection = () => {
        router.push(`/ens-lookup/${collectionURL}`);
    }
    
    // Render the ENS Selector Section Component
    return (
        <Card className="bg-gray-900 border-gray-800 shadow-xl w-full">
            <CardHeader className="border-b border-gray-800 pb-6">
                <CardTitle className="text-3xl text-gray-100">Select Lookup</CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                    Choose a collection type to explore detailed analytics
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <Select onValueChange={ handleCollectionChange } defaultValue="address-to-ens-lookup">
                    <SelectTrigger className="w-full bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-750 focus:ring-gray-400">
                        <SelectValue placeholder="Select collection type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                        <SelectItem defaultChecked value="address-to-ens-lookup">Address → ENS</SelectItem>
                        <SelectItem value="ens-to-address-lookup">ENS → Address</SelectItem>
                        <SelectItem value="ens-transfers-by-name">ENS Transfers By Name</SelectItem>
                        <SelectItem value="ens-transfers-by-id">ENS Transfers By ID</SelectItem>
                    </SelectContent>
                </Select>         
                <Button 
                    onClick={handleViewCollection} 
                    className="bg-gradient-to-r from-gray-600 to-gray-400 text-white py-2 px-6 rounded-md hover:from-gray-500 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 mx-auto block w-full max-w-xs"
                >
                    View Analytics
                </Button>
            </CardContent>
        </Card>
    )
}