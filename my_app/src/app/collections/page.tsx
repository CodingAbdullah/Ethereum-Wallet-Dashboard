'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

// Collections Page Custom Component
export default function CollectionsPage() {
    const router = useRouter();
    const [collectionURL, setCollectionURL] = useState("erc20-collection");

    // Dynamically handle collection URL settings
    const handleCollectionChange = (value: string) => {
        setCollectionURL(value);
    }

    // Push endpoint value to /collections path
    const handleViewCollection = () => {
        router.push(`/collections/${collectionURL}`);
    }

    // Render the Token Analytics Collections Page
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <div className="container mx-auto px-4 w-full max-w-3xl">
                <h1 className="text-5xl font-bold mb-6 text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                        Token Analytics
                    </span>
                </h1>
                <p className="text-xl text-gray-400 mb-12 text-center">
                    Dive deep into the world of token collections and their performance
                </p>
                <Card className="bg-gray-900 border-gray-800 shadow-xl w-full">
                    <CardHeader className="border-b border-gray-800 pb-6">
                        <CardTitle className="text-3xl text-gray-100">Select Collection Type</CardTitle>
                        <CardDescription className="text-gray-400 text-lg">
                            Choose a collection type to explore detailed analytics
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <Select onValueChange={handleCollectionChange} defaultValue="erc20-collection">
                            <SelectTrigger className="w-full bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-750 focus:ring-gray-400">
                                <SelectValue placeholder="Select collection type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 text-gray-100 border-gray-700">
                                <SelectItem value="erc20-collection">ERC20 Collection Analytics</SelectItem>
                                <SelectItem value="erc721-collection">ERC721 Collection Analytics</SelectItem>
                            </SelectContent>
                        </Select>         
                        <Button 
                            onClick={handleViewCollection} 
                            className="bg-gradient-to-r from-gray-600 to-gray-400 text-white py-2 px-6 rounded-md hover:from-gray-500 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 mx-auto block w-full max-w-xs"
                        >
                            View Analytics
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}