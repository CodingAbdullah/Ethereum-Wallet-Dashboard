'use client';

import { useState } from 'react';
import { Input } from "./../components/ui/input";
import { Button } from "./../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "./../components/ui/alert";
import addressValidator from '../utils/functions/addressValidator';
import TopERC721CollectionsInfoTable from './TopERC721CollectionsInfoTable';
import ERC721CollectionDataInfoTable from './ERC721CollectionDataInfoTable';
import ERC721CollectionExtraDataInfoTable from './ERC721CollectionExtraDataInfoTable';
import ERC721CollectionSalesInfoTable from './ERC721CollectionSalesInfoTable';
import ERC721CollectionTransfersInfoTable from './ERC721CollectionTransfersInfoTable';
import ERC721CollectionAttributeSummaryInfoTable from './ERC721CollectionAttributeSummaryInfoTable';
import ERC721CollectionFloorPriceInfoTable from './ERC721CollectionFloorPriceInfoTable';

// ERC721 Collections Analytics Form Custom Component
export default function ERC721CollectionsAnalyticsForm() {
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [collectionAddress, updateCollectionAddress] = useState<string>('');
    const [setCollectionAddress, updateSetCollectionAddress] = useState<string>('');
    const [tableStatus, updateTableStatus] = useState<boolean>(false);

    // Handle Submit Function
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Check address validity
        // If correct, make a request call to fetch ERC20 Collection Analytics data
        if (addressValidator(collectionAddress.trim())) {
            updateTableStatus(true);
            setShowAlert(false);
        }
        else {
            updateTableStatus(false);
            updateSetCollectionAddress(collectionAddress.trim());
            setShowAlert(true);
        }
    }

    // ERC721 Collection Analytics Form Custom Component
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
                    <CardTitle className="text-3xl font-bold text-gray-100">Analyze Collection</CardTitle>
                    <CardDescription className="text-gray-400 text-lg font-light">
                        Enter collection address for in-depth analysis
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="Enter Collection Address"
                            value={collectionAddress}
                            onChange={(e) => updateCollectionAddress(e.target.value)}
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
            { tableStatus ? null : <TopERC721CollectionsInfoTable /> }
            { tableStatus ? <ERC721CollectionDataInfoTable address={setCollectionAddress} /> : null }
            { tableStatus ? <ERC721CollectionFloorPriceInfoTable address={setCollectionAddress} /> : null }
            { tableStatus ? <ERC721CollectionExtraDataInfoTable address={setCollectionAddress} /> : null }
            { tableStatus ? <ERC721CollectionAttributeSummaryInfoTable address={setCollectionAddress} /> : null }
            { tableStatus ? <ERC721CollectionTransfersInfoTable address={setCollectionAddress} /> : null }
            { tableStatus ? <ERC721CollectionSalesInfoTable address={setCollectionAddress} /> : null }
        </>
    )
}