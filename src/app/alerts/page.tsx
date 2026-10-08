import type { Metadata } from "next";
import AlertsSection from "../components/AlertsSection";
import { SPACES } from "@/lib/governance";

export const metadata: Metadata = {
    title: "Alerts",
    description: "Wallet, gas, price, validator, NFT, ENS, depeg and governance alerts on Telegram, Discord, email or browser notifications"
};

// Which channels this server can deliver to (the form greys out the rest)
function setup() {
    return {
        telegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_USERNAME),
        email: !!(process.env.RESEND_API_KEY && process.env.ALERTS_FROM_EMAIL),
        // Read at request time, so the key can be set without rebuilding
        vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : null,
        spaces: SPACES
    };
}

// Alerts page: ?new=<type> preselects an alert type (used by the Subscribe buttons on /n8n-workflows)
export default async function AlertsPage({ searchParams }: { searchParams: Promise<{ new?: string | string[] }> }) {
    const { new: kind } = await searchParams;
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-center break-words">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-100">Alerts</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 text-center">
                Get told when something happens on-chain, on Telegram, Discord, email or as browser notifications
            </p>
            <AlertsSection setup={setup()} initialKind={typeof kind === 'string' ? kind : undefined} />
        </div>
    );
}
