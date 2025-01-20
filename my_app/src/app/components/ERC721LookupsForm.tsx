'use client';

import { useState } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import NetworkSelector from './NetworkSelector';
import addressValidator from '../utils/functions/addressValidator';
import ERC721LookupsInfoTable from './ERC721LookupsInfoTable';

// ERC721 Lookups Form Custom Component
export default function ERC721LookupsForm() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [tokenID, setTokenID] = useState("");
    const [network, setNetwork] = useState("eth");
    const [showAlert, setShowAlert] = useState(false);
    const [tableStatus, updateTableStatus] = useState(false);

    // Handle form submissions here
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Handle form Submission logic here
        if (addressValidator(tokenAddress.trim())){
            setShowAlert(false);
            updateTableStatus(true);
        }
        else {
            // If address is not valid, set alerts
            setShowAlert(true);
            updateTableStatus(false);
        }
    }

    // Network Selection Handler Function
    const handleNetworkChange = (selectedNetwork: string) => {
        setNetwork(selectedNetwork);
    }

    // Render the ERC721 Lookups Form Custom Component
    return (
        <>            
            {showAlert && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>
                        There was an error processing your request. Please ensure you are entering a correct contract address.
                    </AlertDescription>
                </Alert>
            )}
            <Card className="bg-gray-900 border-gray-800 shadow-xl w-full">
                <CardHeader className="border-b border-gray-800 pb-6">
                    <CardTitle className="text-3xl font-bold text-gray-100">Analyze ERC721 Token</CardTitle>
                    <CardDescription className="text-gray-400 text-lg font-light">
                        Enter collection address and token ID for in-depth analysis
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="Enter Collection Address"
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            className="w-full bg-gray-800 text-gray-100 border-gray-700 focus:ring-gray-400 placeholder-gray-500"
                            required
                        />
                        <Input
                            placeholder="Enter Token ID"
                            value={tokenID}
                            onChange={(e) => setTokenID(e.target.value)}
                            className="w-full bg-gray-800 text-gray-100 border-gray-700 focus:ring-gray-400 placeholder-gray-500"
                            required
                        />
                        <NetworkSelector networkSelector={handleNetworkChange} />
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
            { tableStatus ? <ERC721LookupsInfoTable address={tokenAddress} tokenID={tokenID} network={network} /> : null }
        </>
    )
}