'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import NetworkSelector from './NetworkSelector';
import addressValidator from '../utils/functions/addressValidator';
import TransactionBalanceInfoTable from './TransactionBalanceInfoTable';

// Wallet Analytics Form Custom Component
export default function WalletAnalyticsForm() {
    const [walletAddress, setWalletAddress] = useState("")
    const [network, setNetwork] = useState("eth")
    const [showAlert, setShowAlert] = useState(false)
    const [tableStatus, updateTableStatus] = useState(false);

    // Network Selection Handler Function
    const handleNetworkChange = (selectedNetwork: string) => {
        setNetwork(selectedNetwork);
    }
    
    // Validate wallet address and proceed to presenting information
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (addressValidator(walletAddress)) {
            setShowAlert(false);
            updateTableStatus(true);
        }
        else {
            setShowAlert(true);
            updateTableStatus(false);
        }
    }

    // Render the Wallet Analytics Form
    return (
        <>
            {showAlert && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>
                        There was an error processing your request. Please try again.
                    </AlertDescription>
                </Alert>
            )}
            <Card className="bg-gray-900 border-gray-800 shadow-xl w-full">
                <CardHeader className="border-b border-gray-800 pb-6">
                    <CardTitle className="text-3xl font-bold text-gray-100">Analyze Wallet</CardTitle>
                    <CardDescription className="text-gray-400 text-lg font-light">
                        Enter wallet details for in-depth analysis
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="Enter Wallet Address"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
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
            { tableStatus ? <TransactionBalanceInfoTable address={walletAddress} network={network} /> : null }
        </>
    )
}