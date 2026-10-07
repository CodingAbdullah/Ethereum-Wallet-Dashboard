import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import Link from "next/link";
import { N8NWorkflowList } from "../utils/constants/N8NWorkflowList";
import type { Metadata } from "next";

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "N8N Workflows Section",
    description: "Automate Ethereum data pipelines and alerts using N8N workflows"
}

// N8N Workflows Custom Page Component
export default function N8NWorkflowsPage() {
  return (
    <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
        <h5 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                N8N Workflows
            </span>
        </h5>
        <p className="text-xl text-gray-400 mb-5 text-center">
            <i>A look at the automated workflows this dashboard will roll out.</i>
            <br />
            <i>
                Built on top of
                <Link
                    href="https://n8n.io"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {" "}<u>N8N</u>
                </Link> and the same on-chain APIs powering the rest of the app.
            </i>
        </p>
        <section className="max-w-4xl mx-auto mb-12 bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-3 text-gray-200">What this section is</h2>
            <p className="text-gray-400 mb-3">
                This dashboard already surfaces wallet activity, ERC20/721 holdings, ENS records, gas
                metrics, validator stats, and live coin prices. The next step is turning that data into
                <strong className="text-gray-300"> scheduled automations</strong> &mdash; recurring jobs
                that summarize, alert, and deliver crypto information without anyone having to open the
                app.
            </p>
            <p className="text-gray-400 mb-3">
                The card below previews the first workflow planned for this dashboard. It is not live
                yet &mdash; consider this a roadmap entry that describes what the integration will do
                and which existing endpoints it will lean on.
            </p>
            <p className="text-gray-500 text-sm">
                <strong className="text-gray-300">Note:</strong> workflows shipped through this
                dashboard will be read-only by design. Anything that signs transactions on your behalf
                will be handled separately through a proper key-management service.
            </p>
        </section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {N8NWorkflowList.map(workflow => (
                <Card key={workflow.id} className="bg-gray-900 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm text-gray-300">{workflow.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-500">{workflow.description}</CardDescription>
                        <p className="mt-2 text-sm text-gray-500">
                            <strong className="text-gray-300">Key Features:</strong> {workflow.keyFeatures}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            <strong className="text-gray-300">Crypto Use Case:</strong> {workflow.cryptoUseCase}
                        </p>
                        <Link
                            href={workflow.link}
                            className="mt-4 inline-block text-sm text-gray-300 font-bold hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Learn About N8N
                        </Link>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  )
}
