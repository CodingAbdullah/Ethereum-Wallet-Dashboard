'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import addressValidator from '../utils/functions/addressValidator';
import TransactionBalanceInfoTable from './TransactionBalanceInfoTable';
import WalletStatsInfoTable from './WalletStatsInfoTable';
import WalletPnLBreakdownInfoTable from './WalletPnLBreakdownInfoTable';
import WalletPnLInfoTable from './WalletPnLInfoTable';

// Wallet Analytics Form Custom Component
export default function WalletAnalyticsForm() {
    const [walletAddress, updateWalletAddress] = useState<string>("");
    const [setWalletAddress, updateSetWalletAddress] = useState<string>("");
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [tableStatus, updateTableStatus] = useState<boolean>(false);

    // Validate wallet address and proceed to presenting information
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (addressValidator(walletAddress.trim())) {
            setShowAlert(false);
            updateTableStatus(true);
            updateSetWalletAddress(walletAddress.trim());
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
                            onChange={(e) => updateWalletAddress(e.target.value)}
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
            { tableStatus ? <TransactionBalanceInfoTable address={setWalletAddress} network="eth" /> : null }
            { tableStatus ? <WalletStatsInfoTable address={setWalletAddress} /> : null }
            { tableStatus ? <WalletPnLInfoTable address={setWalletAddress} /> : null }
            { tableStatus ? <WalletPnLBreakdownInfoTable address={setWalletAddress} /> : null }
        </>   
    )
}