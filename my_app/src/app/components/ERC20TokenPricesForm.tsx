'use client';

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "./ui/card";
import addressValidator from "../utils/functions/addressValidator";
import ERC20TokenInformationSection from "./ERC20TokenInformationSection";

// ERC20 Token Prices Form Custom Component
export default function ERC20TokenPricesForm() {
    const [tokenAddress, updateTokenAddress] = useState("");
    const [setTokenAddress, updateSetTokenAddress] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [tableStatus, updateTableStatus] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Handle form submission logic here
        if (addressValidator(tokenAddress.trim())){
            setShowAlert(false);
            updateTableStatus(true);
            updateSetTokenAddress(tokenAddress.trim());
        }
        else {
            setShowAlert(true);
            updateTableStatus(false);
        }
    }

    // Render the ERC20 Token Prices Form Component
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
                    <CardTitle className="text-3xl font-bold text-gray-100">Analyze ERC20 Token</CardTitle>
                    <CardDescription className="text-gray-400 text-lg font-light">
                        Enter token address for in-depth analysis
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="Enter Token Address"
                            value={tokenAddress}
                            onChange={(e) => updateTokenAddress(e.target.value)}
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
            { tableStatus ? <ERC20TokenInformationSection address={setTokenAddress} /> : null }
        </>
    )
}