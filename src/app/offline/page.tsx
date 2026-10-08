import type { Metadata } from "next";
import ReloadButton from "./ReloadButton";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

// Shown by the service worker when a page can't be loaded without a connection
export default function OfflinePage() {
    return (
        <div className="min-h-[60vh] bg-gray-800 text-gray-300 py-16 px-4 flex flex-col items-center text-center gap-4">
            <h1 className="text-4xl font-bold text-gray-100">You&apos;re offline</h1>
            <p className="max-w-md text-gray-400">This page needs live on-chain data. Check your connection and try again.</p>
            <ReloadButton />
        </div>
    );
}
