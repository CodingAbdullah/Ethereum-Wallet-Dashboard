'use client';

import { useState } from 'react';
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import ENSValidator from '@/app/utils/functions/ENSValidator';

// Address Lookup By Name Custom Component
export default function ENSTransfersByNamePage() {
    const [walletDomain, setWalletDomain] = useState("")
    const [showAlert, setShowAlert] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Handle form submission logic here
        if (!ENSValidator(walletDomain)){
            setShowAlert(true);
        }
        else {
            setShowAlert(false);
        }

    }
    
    // Render the Wallet Analytics Page Component
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center">
            <div className="container mx-auto px-4 py-16 w-full max-w-3xl">
                <h1 className="text-5xl font-bold mb-6 text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                        ENS Transfers By Name
                    </span>
                </h1>
                <p className="text-xl text-gray-400 mb-12 text-center">
                    Get detailed ENS transfer information by looking up an ENS domain
                </p>
                {showAlert && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            There was an error processing your request. Please try again.
                        </AlertDescription>
                    </Alert>
                )}
                <Card className="bg-gray-900 border-gray-800 shadow-xl w-full">
                    <CardHeader className="border-b border-gray-800 pb-6">
                        <CardTitle className="text-3xl font-bold text-gray-100">Analyze Wallet</CardTitle>
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
            </div>
        </div>
    )
}