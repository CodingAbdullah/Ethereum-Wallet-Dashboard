'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

// Network Selector Custom Component
export default function NetworkSelector(props: { networkSelector: (network: string) => void }) {
    const { networkSelector } = props;

    // Render the Network Selector Component
    return (
        <div className="w-full max-w-md mx-auto mt-8 text-center">
            <label className="block pt-2 mb-4">
                <p className="text-xl pt-2 text-gray-400">
                    Network Selector
                </p>
            </label>
            <Select onValueChange={networkSelector} defaultValue="eth">
                <SelectTrigger className="w-full bg-gray-900 text-gray-100 border-gray-700 hover:bg-gray-800 focus:ring-gray-400 rounded-md">
                    <SelectValue placeholder="Select Network" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-gray-100 border-gray-700">
                    <SelectItem value="eth">Ethereum Mainnet</SelectItem>
                    <SelectItem value="sepolia">Sepolia Testnet</SelectItem>
                    <SelectItem value="holesky">Holesky Testnet</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}