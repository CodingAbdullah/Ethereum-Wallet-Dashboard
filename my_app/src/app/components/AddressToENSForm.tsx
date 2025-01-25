"use client";

import { useState } from "react";
import { Input } from "./../components/ui/input";
import { Button } from "./../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./../components/ui/card";
import { Alert, AlertDescription } from "./../components/ui/alert";
import addressValidator from "../utils/functions/addressValidator";
import AccountToENSInfoTable from "./AccountToENSInfoTable";
import AccountInformationType from "../utils/types/AccountInformationType";
import ENSOwnershipInfoTable from "./ENSOwnershipInfoTable";
import ENSResolverInfoTable from "./ENSResolverInfoTable";

// Address To ENS Form Custom Component
export default function AddressToENSForm() {
    const [walletAddress, updateWalletAddress] = useState<string>("");
    const [setWalletAddress, updateSetWalletAddress] = useState<string>("");
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [accountInformation, setAccountInformation] = useState<AccountInformationType>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Handle form submission logic here
        // Set the token address to what the form value is for evaluation
        if (!addressValidator(walletAddress.trim())){
            updateSetWalletAddress(walletAddress.trim());
            setShowAlert(true);
            setAccountInformation({ name: '' });
        }
        else {
            // FETCH API for ENS data from a given wallet address
            setShowAlert(false);
            
            const res = await fetch('/api/address-to-ens-information', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: setWalletAddress })
            });

            // Check condition of FETCH request
            if (res.ok) {
                const data = await res.json();
                setAccountInformation(data);
            }
            else {
                throw new Error();
            }
        }
    }

    // Render the Address To ENS Form Component
    return (
        <>
            {showAlert && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>
                        There was an error processing your request. Please ensure you are entering a valid wallet address.
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
            {
                accountInformation?.name ? 
                    <>
                        <AccountToENSInfoTable data={accountInformation} />
                        <ENSOwnershipInfoTable data={setWalletAddress} />
                        <ENSResolverInfoTable data={setWalletAddress} />
                    </> 
                : null 
            }
        </>
    )
}