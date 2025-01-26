"use client";

import { useRef, useState } from "react";
import { Input } from "./../components/ui/input";
import { Button } from "./../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./../components/ui/card";
import { Alert, AlertDescription } from "./../components/ui/alert";
import ENSValidator from "../utils/functions/ENSValidator";
import ENSToAddressInfoTable from "./ENSToAddressInfoTable";
import ENSOwnershipInfoTable from "./ENSOwnershipInfoTable";
import ENSResolverInfoTable from "./ENSResolverInfoTable";

// ENS To Address Form Custom Component
export default function ENSToAddressForm() {
    const walletDomainRef = useRef<HTMLInputElement>(null); 
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [addressInformation, updateAddressInformation] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Handle form submission logic here
        if (!ENSValidator(walletDomainRef.current!.value.trim())){
            setShowAlert(true);
        }
        else {
            // FETCH API for ENS data from a given wallet address
            setShowAlert(false);

            const res = await fetch('/api/additional-address-to-ens-information', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ensName: walletDomainRef.current!.value.trim() })
            });

            // Check condition of FETCH request
            if (res.ok) {
                const data = await res.json();
                updateAddressInformation(data.results[0].owner);
            }
            else {
                throw new Error();
            }
        }
    }

    // Render the ENS To Address Form Component
    return (
        <>
            <div className="container mx-auto px-4 w-full max-w-3xl">
                {showAlert && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>
                            There was an error processing your request. Please ensure you are entering a valid ENS domain.
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
                                ref={walletDomainRef}
                                className="w-full bg-gray-800 text-gray-100 border-gray-700 focus:ring-gray-400 placeholder-gray-500"
                                required
                            />
                            <div className="flex justify-center space-x-4 pt-4">
                                <Button 
                                    type="submit"
                                    className="bg-gradient-to-r from-gray-600 to-gray-400 text-white py-2 px-6 rounded-md hover:from-gray-500 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 font-medium"
                                >
                                    Analyze Conversion
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            {
                addressInformation ? 
                    <>
                        <ENSToAddressInfoTable data={{ name: walletDomainRef.current!.value.trim(), address: addressInformation }} />
                        <ENSOwnershipInfoTable data={walletDomainRef.current!.value.trim()} />
                        <ENSResolverInfoTable data={walletDomainRef.current!.value.trim()} />
                    </> 
                : null 
            }
        </>
    )
}