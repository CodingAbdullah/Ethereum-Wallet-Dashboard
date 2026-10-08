import BlobsSection from "../components/BlobsSection";
import ServerSection from "../components/ServerSection";
import { getBlobs } from "@/lib/blobs";
import type { Metadata } from "next";

// Custom Metadata for SEO
export const metadata: Metadata = {
    title: "Blobs",
    description: "Ethereum blob usage, blob fees and the rollups posting blobs"
}

// Blobs Page Custom Component
export default function Page() {

    // Render the Blobs Page Component
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">
                    Blobs
                </span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                How rollups use Ethereum&apos;s blob space
            </p>
            <ServerSection load={getBlobs} loading="Reading the last day of blocks…" failed="Could not load blob data. Please try again later.">
                {data => <BlobsSection data={data} />}
            </ServerSection>
        </div>
    )
}
