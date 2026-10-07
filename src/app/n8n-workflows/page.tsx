import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ALERT_CATALOG, scheduleLabel } from "@/lib/alerts/catalog";

export const metadata: Metadata = {
    title: "N8N Workflows",
    description: "The live alert workflows behind Ethereum Dashboard, run by n8n"
};

const REPO_N8N = 'https://github.com/CodingAbdullah/Ethereum-Wallet-Dashboard/tree/main/n8n';

// N8N Workflows page: every live alert workflow, with a Subscribe button that opens /alerts with it selected
export default function N8NWorkflowsPage() {
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">N8N Workflows</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 text-center">
                Live alert workflows, scheduled and delivered by <Link href="https://n8n.io" target="_blank" rel="noopener noreferrer" className="underline">n8n</Link>
            </p>
            <section className="max-w-4xl mx-auto mb-12 bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-3">
                <h2 className="text-2xl font-semibold text-gray-200">How it works</h2>
                <p className="text-gray-400">
                    n8n runs each check on a schedule. The dashboard compares fresh data with what it saw last time,
                    records anything new (so nothing is sent twice), and n8n delivers it to your Telegram, Discord or inbox.
                    Wallet activity and approvals can also arrive in real time through Moralis Streams.
                </p>
                <p className="text-gray-400">
                    The workflows are read-only: they never sign or send transactions. Their exports are{' '}
                    <Link href={REPO_N8N} target="_blank" rel="noopener noreferrer" className="underline text-gray-300">version-controlled on GitHub</Link>.
                </p>
            </section>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {ALERT_CATALOG.map(entry => (
                    <Card key={entry.id} className="bg-gray-900 border-gray-700 flex flex-col min-w-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-gray-100">{entry.title}</CardTitle>
                            <p className="text-xs text-gray-500">{scheduleLabel(entry)}</p>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1 justify-between gap-4">
                            <CardDescription className="text-gray-400">{entry.description}</CardDescription>
                            <Link href={`/alerts?new=${entry.id}`} className="self-start rounded-md bg-gradient-to-r from-gray-600 to-gray-400 text-white py-2 px-4 text-sm font-medium hover:from-gray-500 hover:to-gray-300">
                                Subscribe
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
