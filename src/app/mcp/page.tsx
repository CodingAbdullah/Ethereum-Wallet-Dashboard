import type { Metadata } from "next";
import Link from "next/link";
import McpSection from "../components/McpSection";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
    title: "MCP Server",
    description: "Use Ethereum Dashboard's data from Claude, Cursor and other AI assistants through the Model Context Protocol"
};

// MCP setup page: create an API key, copy the config for your client, and see every tool it gets
export default function McpPage() {
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">MCP Server</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto">
                Ask Claude, Cursor or any MCP client about wallets, gas, prices, staking and more, using this dashboard&apos;s data
            </p>
            <McpSection />
            <section className="container mx-auto px-4 w-full max-w-5xl mt-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-100 mb-1">Tools</h2>
                    <p className="text-gray-400 mb-6">{TOOLS.length} read-only tools. They can look things up but never sign or send transactions. The same tools and keys work over plain HTTP: see the <Link href="/docs" className="underline">API docs</Link>.</p>
                    <dl className="grid gap-4 sm:grid-cols-2">
                        {TOOLS.map(t => (
                            <div key={t.name} className="min-w-0">
                                <dt className="font-mono text-sm text-gray-100 break-all">{t.name}</dt>
                                <dd className="text-sm text-gray-400">{t.description}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>
        </div>
    );
}
