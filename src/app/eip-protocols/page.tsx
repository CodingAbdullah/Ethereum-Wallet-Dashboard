import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./../components/ui/card"
import Link from "next/link";
import Panel from "../components/DashboardPanel";
import { protocolsList } from "../utils/constants/EIPProtocolsList";
import { getEipData, type EipInfo, type UpgradeInfo } from "@/lib/eips";
import type { Metadata } from "next"

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "EIP Protocols & Upgrades",
    description: "Key Ethereum standards with their live status, and the EIPs planned for upcoming network upgrades"
}

// Live data from GitHub, refreshed daily
export const revalidate = 86400;

const STANDARD_NUMBERS = protocolsList.map(p => Number(p.id.replace(/\D/g, ''))).filter(Boolean);

function StatusBadge({ status }: { status: string }) {
    return <span className="inline-block rounded border border-gray-600 px-2 py-0.5 text-xs text-gray-200 whitespace-nowrap">{status}</span>;
}

function UpgradeTracker({ upgrade }: { upgrade: UpgradeInfo }) {
    return (
        <Panel
            title={`${upgrade.name} Upgrade`}
            description={<>
                Tracked in <a href={upgrade.meta.url} target="_blank" rel="noopener noreferrer" className="underline">EIP-{upgrade.meta.number}</a> · <StatusBadge status={upgrade.meta.status} />
                {upgrade.mainnetActivation && <> · Live on mainnet since {upgrade.mainnetActivation} UTC</>}
            </>}
        >
            <div className="grid gap-6 md:grid-cols-2">
                {upgrade.groups.map(group => (
                    <div key={group.heading}>
                        <h3 className="text-sm font-semibold text-gray-300 mb-2">{group.heading} ({group.eips.length})</h3>
                        <ul className="space-y-2">
                            {group.eips.map((e: EipInfo) => (
                                <li key={e.number} className="flex items-start justify-between gap-3 text-sm">
                                    <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-gray-100 hover:underline">
                                        <span className="font-mono text-gray-400">EIP-{e.number}</span> {e.title === `EIP-${e.number}` ? '' : e.title}
                                    </a>
                                    <StatusBadge status={e.status} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

// EIP Protocols Custom Page Component
export default async function EIPProtocols() {
    // GitHub being unreachable only hides the live parts; the standards cards always render
    const live = await getEipData(STANDARD_NUMBERS).catch(() => null);

  return (
    <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                EIP Protocols
            </span>
        </h1>
        <p className="text-xl text-gray-400 mb-12 text-center">
            Key Ethereum standards, and what&apos;s coming in the next network upgrades.
            <br />
            <span className="text-base">Full lists: <Link href="https://eips.ethereum.org/" target="_blank" rel="noopener noreferrer" className="underline">EIPs</Link> · <Link href="https://ercs.ethereum.org/" target="_blank" rel="noopener noreferrer" className="underline">ERCs</Link></span>
        </p>

        <div className="container mx-auto w-full max-w-6xl space-y-8">
            {live?.upgrades.map(upgrade => <UpgradeTracker key={upgrade.name} upgrade={upgrade} />)}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {protocolsList.map(protocol => {
                    const status = live?.standards[Number(protocol.id.replace(/\D/g, ''))]?.status;
                    return (
                        <Card key={protocol.id} className="bg-gray-900 border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                <CardTitle className="text-sm text-gray-300">{protocol.title}</CardTitle>
                                {status && <StatusBadge status={status} />}
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-gray-500">{protocol.description}</CardDescription>
                                <p className="mt-2 text-sm text-gray-500">
                                    <strong className="text-gray-300">Key Features:</strong> {protocol.keyFeatures}
                                </p>
                                <Link href={protocol.link} className="mt-4 inline-block text-sm text-gray-300 font-bold hover:underline" target="_blank" rel="noopener noreferrer">
                                    Learn More
                                </Link>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            <p className="text-center text-xs text-gray-500">Statuses are read from the ethereum/EIPs and ethereum/ERCs repositories on GitHub and refreshed daily.</p>
        </div>
    </div>
  )
}
