import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/live", async () => {
    const actual = await vi.importActual<typeof import("@/lib/live")>("@/lib/live");
    return { ...actual, LIVE_REFRESH_MS: 10, sharedLatestBlock: vi.fn(async (chain: string) => ({ chain, number: 42, timestamp: 1, baseFeeGwei: 1, gasUsedPercent: 50, txCount: 3 })) };
});

describe("/api/live", () => {
    it("streams block events as Server-Sent Events and stops when the client goes away", async () => {
        const { GET } = await import("./route");
        const abort = new AbortController();
        const response = await GET(new Request('http://localhost/api/live?chain=base', { signal: abort.signal }));
        expect(response.headers.get('content-type')).toContain('text/event-stream');

        const reader = response.body!.getReader();
        let text = '';
        while (!text.includes('event: block')) text += new TextDecoder().decode((await reader.read()).value);
        abort.abort();
        expect(text).toContain('retry: 2000');
        expect(text).toContain('"chain":"base","number":42');
        // The same block isn't sent twice
        await new Promise(r => setTimeout(r, 50));
        const rest = await reader.read().then(r => r.done ? '' : new TextDecoder().decode(r.value));
        expect(rest).not.toContain('event: block');
    });
});
