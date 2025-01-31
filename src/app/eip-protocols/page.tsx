import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./../components/ui/card"
import Link from "next/link";
import { protocolsList } from "../utils/constants/EIPProtocolsList";
import type { Metadata } from "next"

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "EIP Protocols Section",
    description: "Lookup and analyze EIP protocols within the Ethereum ecosystem"
}

// EIP Protocols Custom Page Component
export default function EIPProtocols() {
  return (
    <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
        <h5 className="text-5xl font-bold mb-6 text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                EIP Protocols
            </span>
        </h5>
        <p className="text-xl text-gray-400 mb-12 mb-5 text-center">
            <i>Learn about the common protocols within the Ethereum ecosystem.</i>
            <br />
            <i>Full list of the protocols can be found
                <Link
                    href="https://eips.ethereum.org/erc"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                        {" "}<u>here</u>.
                </Link>
            </i>
        </p>     
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {protocolsList.map(protocol => (
                <Card key={protocol.id} className="bg-gray-900 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm text-gray-300">{protocol.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-500">{protocol.description}</CardDescription>
                            <p className="mt-2 text-sm text-gray-500">
                                <strong className="text-gray-300">Key Features:</strong> {protocol.keyFeatures}
                            </p>
                            <Link
                                href={protocol.link}
                                className="mt-4 inline-block text-sm text-gray-300 font-bold hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Learn More
                            </Link>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  )
}