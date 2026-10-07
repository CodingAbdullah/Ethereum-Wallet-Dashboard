import { vi } from "vitest";

// Replaces global fetch with a queue of canned responses and records each call
export function mockFetch(...responses: Array<Response | Error>) {
    const fetchMock = vi.fn<typeof fetch>(async () => {
        const next = responses.shift();
        if (!next) throw new Error('Unexpected fetch call');
        if (next instanceof Error) throw next;
        return next;
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

export const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const postRequest = (body: unknown) =>
    new Request('http://localhost/api/test', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
