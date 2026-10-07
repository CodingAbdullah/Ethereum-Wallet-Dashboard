'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { CHAINS } from "@/lib/chains";

const MAINNETS = Object.values(CHAINS).filter(c => !c.testnet);
const TESTNETS = Object.values(CHAINS).filter(c => c.testnet);

// Network Selector Custom Component: every supported network, mainnets first (src/lib/chains.ts)
export default function NetworkSelector(props: { networkSelector: (network: string) => void, only?: (key: string) => boolean }) {
    const { networkSelector, only = () => true } = props;

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
                    <SelectGroup>
                        <SelectLabel className="text-gray-500">Mainnets</SelectLabel>
                        {MAINNETS.filter(c => only(c.key)).map(c => <SelectItem key={c.key} value={c.key}>{c.name}</SelectItem>)}
                    </SelectGroup>
                    <SelectGroup>
                        <SelectLabel className="text-gray-500">Testnets</SelectLabel>
                        {TESTNETS.filter(c => only(c.key)).map(c => <SelectItem key={c.key} value={c.key}>{c.name} Testnet</SelectItem>)}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}
