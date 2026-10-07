'use client';

import { useState, useSyncExternalStore } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Copy, Check, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Button } from './ui/button';
import SignInGate, { buttonClass, Panel } from './SignInGate';

interface ApiKeyRow { id: number; name: string; prefix: string; createdAt: string; lastUsedAt: string | null; usedToday: number; dailyLimit: number }

const smallButton = "h-8 px-3 text-sm bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700";
const noopSubscribe = () => () => {};
const PLACEHOLDER = 'YOUR_API_KEY';

async function fetchKeys(url: string): Promise<ApiKeyRow[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? 'Could not load your keys');
    return response.json();
}

function CopyBlock({ label, code }: { label: string; code: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
    };
    return (
        <div className="space-y-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-gray-400">{label}</p>
                <Button className={smallButton} onClick={copy} aria-label={`Copy ${label}`}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
            </div>
            <pre className="bg-gray-950 border border-gray-800 rounded-md p-3 text-xs text-gray-200 overflow-x-auto whitespace-pre">{code}</pre>
        </div>
    );
}

// Setup snippets for the common MCP clients, with the new key filled in when there is one
export function ClientSetup({ apiKey }: { apiKey?: string }) {
    const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => 'https://ethereumdashboard.dev');
    const url = origin + '/api/mcp';
    const key = apiKey ?? PLACEHOLDER;
    return (
        <div className="space-y-5">
            <CopyBlock label="Claude Code" code={`claude mcp add --transport http ethereum-dashboard ${url} \\\n  --header "Authorization: Bearer ${key}"`} />
            <CopyBlock label="Cursor (.cursor/mcp.json)" code={JSON.stringify({ mcpServers: { 'ethereum-dashboard': { url, headers: { Authorization: `Bearer ${key}` } } } }, null, 2)} />
            <CopyBlock label="Claude Desktop (claude_desktop_config.json)" code={JSON.stringify({ mcpServers: { 'ethereum-dashboard': { command: 'npx', args: ['-y', 'mcp-remote', url, '--header', `Authorization: Bearer ${key}`] } } }, null, 2)} />
            <CopyBlock label="Claude.ai and other clients that only take a URL (Settings → Connectors → Add custom connector)" code={`${url}?key=${key}`} />
            <p className="text-xs text-gray-500">Keep the URL form private: anyone with it can use your daily quota. Revoke the key below if it leaks.</p>
        </div>
    );
}

export default function McpSection() {
    return (
        <div className="container mx-auto px-4 w-full max-w-5xl space-y-8">
            <SignInGate notConfigured="This server needs AUTH_SECRET and DATABASE_URL for API keys.">
                <KeysManager />
            </SignInGate>
        </div>
    );
}

function KeysManager() {
    const { data: keys, error } = useSWR('/api/keys', fetchKeys);
    const { mutate } = useSWRConfig();
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [formError, setFormError] = useState<string>();
    const [newKey, setNewKey] = useState<string>();

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true); setFormError(undefined);
        const response = await fetch('/api/keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
        const data = await response.json().catch(() => ({}));
        setBusy(false);
        if (!response.ok) return setFormError(data.issues?.join(', ') || data.error || 'Could not create the key');
        setNewKey(data.key);
        setName('');
        mutate('/api/keys');
    };

    const revoke = async (id: number) => {
        if (!window.confirm('Revoke this key? Clients using it will stop working.')) return;
        await fetch('/api/keys', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        mutate('/api/keys');
    };

    return (
        <>
            <Panel title="1. Create an API key" description="Each key can make 200 tool calls a day. You can have up to 3.">
                {(formError || error) && <Alert variant="destructive"><AlertDescription>{formError ?? String(error?.message)}</AlertDescription></Alert>}
                {newKey && (
                    <Alert className="bg-gray-800 border-gray-700 text-gray-200">
                        <AlertDescription className="space-y-2">
                            <p>Copy your key now. It won&apos;t be shown again.</p>
                            <CopyBlock label="API key" code={newKey} />
                        </AlertDescription>
                    </Alert>
                )}
                <form onSubmit={create} className="flex flex-col sm:flex-row gap-3 sm:items-end">
                    <label className="text-sm text-gray-400 flex-1">Name
                        <Input value={name} onChange={e => setName(e.target.value)} maxLength={40} placeholder="e.g. Claude Desktop" required
                            className="w-full bg-gray-800 text-gray-100 border-gray-700 focus:ring-gray-400 placeholder-gray-500" />
                    </label>
                    <Button type="submit" className={buttonClass} disabled={busy}>{busy ? 'Creating…' : 'Create key'}</Button>
                </form>
                {keys === undefined ? <p className="text-gray-500">Loading…</p> : keys.length === 0 ? <p className="text-gray-500">No keys yet.</p> : (
                    <ul className="divide-y divide-gray-800 border-t border-gray-800">
                        {keys.map(k => (
                            <li key={k.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-gray-100 font-medium break-words">{k.name} <span className="font-mono text-sm text-gray-500">{k.prefix}…</span></p>
                                    <p className="text-sm text-gray-500">
                                        {k.usedToday} / {k.dailyLimit} calls today · {k.lastUsedAt ? 'last used ' + new Date(k.lastUsedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'never used'}
                                    </p>
                                </div>
                                <Button className={smallButton} onClick={() => revoke(k.id)} aria-label={`Revoke ${k.name}`}><Trash2 className="h-4 w-4" /></Button>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>
            <Panel title="2. Connect your client" description={newKey ? 'Your new key is filled in below.' : `Replace ${PLACEHOLDER} with your key.`}>
                <ClientSetup apiKey={newKey} />
            </Panel>
        </>
    );
}
