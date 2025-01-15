"use client";

import { useState } from "react";
import { Input } from "./../components/ui/input";
import { Button } from "./../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./../components/ui/card";
import { Alert, AlertDescription } from "./../components/ui/alert";
import ENSTransfersByIDType from "../utils/types/ENSTransferByIDType";
import ENSTransferByIDInfoTable from "./ENSTransferByIDInfoTable";

// ENS Transfer by ID Custom Component
export default function ENSTransferByIDForm() {
    const [tokenID, setTokenID] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [transferInformation, updateTransferInformation] = useState<ENSTransfersByIDType[]>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (tokenID.length === 0) {
            setShowAlert(true);
        }
        else {
            // FETCH API for ENS data from a given wallet address
            setShowAlert(false);
            const res = await fetch('/api/ens-transfers-by-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tokenID })
              });

            // Check condition of FETCH request
            if (res.ok) {
                const data = await res.json();
                updateTransferInformation(data.results);
            }
            else {
                throw new Error();
            } 
        }
    }

    // Render the ENS Transfers By ID Component
    return (
       <>
            {showAlert && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>
                        There was an error processing your request. Please ensure you are entering a valid ENS token ID.
                    </AlertDescription>
                </Alert>
            )}
            <Card className="bg-gray-900 border-gray-800 shadow-xl w-full">
                <CardHeader className="border-b border-gray-800 pb-6">
                    <CardTitle className="text-3xl font-bold text-gray-100">Analyze Wallet</CardTitle>
                    <CardDescription className="text-gray-400 text-lg font-light">
                        Enter ENS token ID for in-depth analysis
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="Enter ENS Token ID"
                            value={tokenID}
                            onChange={(e) => setTokenID(e.target.value)}
                            className="w-full bg-gray-800 text-gray-100 border-gray-700 focus:ring-gray-400 placeholder-gray-500"
                            required
                        />
                        <div className="flex justify-center space-x-4 pt-4">
                            <Button 
                                type="submit"
                                className="bg-gradient-to-r from-gray-600 to-gray-400 text-white py-2 px-6 rounded-md hover:from-gray-500 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 font-medium"
                            >
                                Analyze
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            {
                transferInformation ? <ENSTransferByIDInfoTable data={transferInformation} /> : null
            }
       </> 
    )
}