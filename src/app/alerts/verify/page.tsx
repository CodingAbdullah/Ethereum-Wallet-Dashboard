import type { Metadata } from "next";
import Link from "next/link";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { verifyEmailChannel } from "@/lib/alerts/accounts";

export const metadata: Metadata = { title: "Confirm email alerts", robots: { index: false } };
export const dynamic = 'force-dynamic';

// The link in the verification email lands here. (A page rather than an API route, because
// clicks from webmail are cross-site and /api rejects cross-site requests.)
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
    const { token } = await searchParams;
    const ok = typeof token === 'string' && isDatabaseConfigured() && await verifyEmailChannel(getDb(), token);
    return (
        <div className="min-h-screen bg-gray-800 text-gray-300 py-20 px-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-100">{ok ? 'Email confirmed' : 'This link has expired'}</h1>
            <p className="text-lg text-gray-400 mb-8">
                {ok ? 'Alerts will now be sent to this address.' : 'The link was already used or is more than 24 hours old. Add the email channel again to get a new one.'}
            </p>
            <Link href="/alerts" className="underline text-gray-200">Go to your alerts</Link>
        </div>
    );
}
