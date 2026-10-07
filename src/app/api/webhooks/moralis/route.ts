import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { getDb } from "@/lib/db";
import { verifyMoralisSignature } from "@/lib/alerts/signing";
import { activeSubscriptions, fire } from "@/lib/alerts/engine";
import { parseStreamPayload, REALTIME_KINDS, streamTriggers } from "@/lib/alerts/streams";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// POST from Moralis Streams: one block's worth of transactions for the watched addresses.
// Signed with "x-signature: keccak256(body + MORALIS_STREAMS_SECRET)".
export const POST = withErrorHandling(async (request: Request) => {
    const secret = process.env.MORALIS_STREAMS_SECRET;
    if (!secret) throw new HttpError(503, 'Moralis Streams is not configured on this server (MORALIS_STREAMS_SECRET is missing)');
    const body = await request.text();
    if (!verifyMoralisSignature(secret, body, request.headers.get('x-signature'))) throw new HttpError(401, 'Invalid signature');

    let json: unknown;
    try { json = JSON.parse(body); }
    catch { throw new HttpError(400, 'Invalid JSON'); }

    // Moralis sends an empty test delivery when the stream is created
    const payload = parseStreamPayload(json);
    if (!payload.chain || payload.txs.length + payload.erc20Transfers.length + payload.erc20Approvals.length === 0) {
        return NextResponse.json({ fired: 0 });
    }

    const db = getDb();
    let fired = 0;
    for (const sub of await activeSubscriptions(db, REALTIME_KINDS)) {
        const triggers = streamTriggers(payload, sub);
        if (triggers.length > 0) fired += (await fire(db, sub, triggers)).fired;
    }
    return NextResponse.json({ fired });
});
