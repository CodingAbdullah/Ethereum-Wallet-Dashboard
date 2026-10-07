import { explorerChain } from "@/lib/explorer";
import { LIVE_REFRESH_MS, sharedLatestBlock, sseEvent } from "@/lib/live";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Serverless functions can't hold WebSockets, so this streams Server-Sent Events for ~50 seconds and
// then closes; the browser's EventSource reconnects automatically (after `retry` ms).
const STREAM_MS = 50_000;
const HEARTBEAT_MS = 15_000;

// GET ?chain=eth: a "block" event whenever a new block appears
export async function GET(request: Request) {
    const chain = explorerChain(new URL(request.url).searchParams.get('chain') ?? undefined);
    const encoder = new TextEncoder();
    const started = Date.now();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (text: string) => controller.enqueue(encoder.encode(text));
            send('retry: 2000\n\n');
            let lastBlock = 0;
            let lastBeat = Date.now();
            while (!request.signal.aborted && Date.now() - started < STREAM_MS) {
                try {
                    const block = await sharedLatestBlock(chain);
                    if (block.number !== lastBlock) {
                        lastBlock = block.number;
                        send(sseEvent('block', block));
                    }
                }
                catch {
                    send(sseEvent('unavailable', { chain }));
                }
                if (Date.now() - lastBeat > HEARTBEAT_MS) { send(': keep-alive\n\n'); lastBeat = Date.now(); }
                await new Promise(resolve => setTimeout(resolve, LIVE_REFRESH_MS));
            }
            controller.close();
        }
    });

    return new Response(stream, {
        headers: {
            'content-type': 'text/event-stream; charset=utf-8',
            'cache-control': 'no-cache, no-transform',
            'x-accel-buffering': 'no'
        }
    });
}
