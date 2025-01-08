'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import NetworkSelector from '../components/NetworkSelector';

// ERC721 Lookups Page Custom Component
export default function ERC721LookupsPage() {
    const router = useRouter();
    const [tokenID, setTokenID] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [network, setNetwork] = useState("eth");
    const [showAlert, setShowAlert] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
    }
    
    // Render the ERC721 Token Lookups Page Component
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center">
            <div className="container mx-auto px-4 py-16 w-full max-w-3xl">
                <h1 className="text-5xl font-bold mb-6 text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                        ERC721 Token Lookups
                    </span>
                </h1>
                <p className="text-xl text-gray-400 mb-12 text-center">
                    Analyze an ERC721 token from a collection
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
                        <CardTitle className="text-3xl font-bold text-gray-100">Analyze Token</CardTitle>
                        <CardDescription className="text-gray-400 text-lg font-light">
                            Enter collection address and token ID for in-depth analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                placeholder="Enter Collection Address"
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                className="w-full bg-gray-800 text-gray-100 border-gray-700 focus:ring-gray-400 placeholder-gray-500"
                                required
                            />
                            <Input
                                placeholder="Enter Token ID"
                                value={walletAddress}
                                onChange={(e) => setTokenID(e.target.value)}
                                className="w-full bg-gray-800 text-gray-100 border-gray-700 focus:ring-gray-400 placeholder-gray-500"
                                required
                            />
                            <NetworkSelector />
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