'use client';

import { useState } from "react";
import { Input } from "./../components/ui/input";
import { Button } from "./../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./../components/ui/card";
import { Alert, AlertDescription } from "./../components/ui/alert";
import ENSValidator from "../utils/functions/ENSValidator";
import ENSTransferByNameInfoTable from "./ENSTransferByNameInfoTable";
import ENSTransfersByNameType from "../utils/types/ENSTransfersByNameType";

// ENS Transfer By Name Custom Component
export default function ENSTransferByNameForm()  {
    const [walletDomain, setWalletDomain] = useState<string>("");
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [addressInformation, updateAddressInformation] = useState<ENSTransfersByNameType[]>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Handle form submission logic here
        if (!ENSValidator(walletDomain)){
            setShowAlert(true);
        }
        else {
            // FETCH API for ENS data from a given wallet address
            setShowAlert(false);
            const res = await fetch('/api/ens-transfers-by-name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: walletDomain })
            });

            // Check condition of FETCH request
            if (res.ok) {
                const data = await res.json();
                updateAddressInformation(data.results);
            }
            else {
                throw new Error();
            }
        }
    }

    // Render the ENS Transfers By Name Component
    return (
        <>
            {showAlert && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>
                        There was an error processing your request. Please ensure you are entering a valid ENS domain.
                    </AlertDescription>
                </Alert>
            )}
            <Card className="bg-gray-900 border-gray-800 shadow-xl w-full">
                <CardHeader className="border-b border-gray-800 pb-6">
                    <CardTitle className="text-3xl font-bold text-gray-100">Analyze Transfers</CardTitle>
                    <CardDescription className="text-gray-400 text-lg font-light">
                        Enter ENS domain for in-depth analysis
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="Enter Wallet Domain"
                            value={walletDomain}
                            onChange={(e) => setWalletDomain(e.target.value)}
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
            { addressInformation ? <ENSTransferByNameInfoTable data={addressInformation} /> : null }
        </>
    )
}