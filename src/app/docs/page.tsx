import type { Metadata } from "next";
import Link from "next/link";
import { DAILY_TOOL_CALLS } from "@/lib/apiKeys";
import { API_BASE, exampleBody, parameters } from "@/lib/openapi";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
    title: "API Docs",
    description: "Free REST API and MCP server for read-only Ethereum data: wallets, ENS, gas, prices, staking, DeFi and layer 2s"
};

const SITE = 'https://ethereumdashboard.dev';
const card = "bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 min-w-0";
const code = "bg-gray-950 border border-gray-800 rounded-md p-3 text-xs sm:text-sm text-gray-200 overflow-x-auto whitespace-pre";

const curl = (name: string, body: Record<string, unknown>) =>
    `curl -X POST ${SITE}${API_BASE}/${name} \\\n  -H "Authorization: Bearer $ETHD_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body)}'`;

// API reference, generated from the tool registry's Zod schemas (the same ones /api/openapi.json uses)
export default function DocsPage() {
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">API Docs</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center max-w-3xl mx-auto">
                The dashboard&apos;s data as a free REST API and an MCP server. Read-only: nothing here can sign or send transactions.
            </p>
            <div className="container mx-auto w-full max-w-5xl space-y-6">
                <section className={card}>
                    <h2 className="text-2xl font-bold text-gray-100 mb-3">Getting started</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                        <li>Sign in with your wallet on the <Link href="/mcp" className="underline">MCP Server</Link> page and create an API key (free, up to 3 per wallet).</li>
                        <li>Send it as <code className="text-gray-100">Authorization: Bearer &lt;key&gt;</code>. Each key gets <strong>{DAILY_TOOL_CALLS} calls a day</strong>, shared between REST and MCP, and resets at 00:00 UTC.</li>
                        <li>Every endpoint is a <code className="text-gray-100">POST</code> with a JSON body and returns <code className="text-gray-100">{'{ "data": … }'}</code>, or <code className="text-gray-100">{'{ "error": "…" }'}</code> with status 400 (bad input), 401 (key), 429 (quota) or 502 (a data source failed).</li>
                    </ol>
                    <pre className={code + ' mt-4'}>{curl('get_gas', {})}</pre>
                    <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <li><a href="/api/openapi.json" className="underline">OpenAPI 3.1 spec</a> <span className="text-gray-500">(import into Postman, Insomnia or a client generator)</span></li>
                        <li><a href={API_BASE} className="underline">GET {API_BASE}</a> <span className="text-gray-500">(every tool and its JSON Schema, no key needed)</span></li>
                        <li><Link href="/mcp" className="underline">MCP setup</Link> <span className="text-gray-500">(Claude, Cursor and other AI clients)</span></li>
                    </ul>
                </section>

                <nav className={card} aria-label="Endpoints">
                    <h2 className="text-2xl font-bold text-gray-100 mb-3">Endpoints</h2>
                    <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                        {TOOLS.map(t => <li key={t.name}><a href={`#${t.name}`} className="font-mono text-gray-200 hover:underline break-all">{t.name}</a></li>)}
                    </ul>
                </nav>

                {TOOLS.map(t => {
                    const params = parameters(t);
                    return (
                        <section key={t.name} id={t.name} className={card + ' scroll-mt-24 space-y-3'}>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-100">{t.title}</h3>
                                <p className="font-mono text-sm text-gray-400 break-all"><span className="text-green-400">POST</span> {API_BASE}/{t.name}</p>
                            </div>
                            <p className="text-gray-300">{t.description}</p>
                            {params.length === 0 ? <p className="text-sm text-gray-500">No parameters: send an empty body.</p> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="text-left text-gray-500 border-b border-gray-800"><th className="py-2 pr-4">Parameter</th><th className="py-2 pr-4">Type</th><th className="py-2">Description</th></tr></thead>
                                        <tbody>
                                            {params.map(p => (
                                                <tr key={p.name} className="border-b border-gray-800/60 align-top">
                                                    <td className="py-2 pr-4 font-mono text-gray-100 whitespace-nowrap">{p.name}{p.required && <span className="text-red-400" title="required">*</span>}</td>
                                                    <td className="py-2 pr-4 text-gray-400 whitespace-nowrap">{p.type}</td>
                                                    <td className="py-2 text-gray-300">
                                                        {p.description}
                                                        {p.default !== undefined && <span className="text-gray-500"> Default: <code>{JSON.stringify(p.default)}</code>.</span>}
                                                        {p.options && <span className="block text-gray-500 break-words">One of: {p.options.map(String).join(', ')}</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <pre className={code}>{curl(t.name, exampleBody(t))}</pre>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
