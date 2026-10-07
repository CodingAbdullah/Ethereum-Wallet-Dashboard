'use client';

import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useAccount } from 'wagmi';
import { Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Button } from './ui/button';
import SignInGate, { buttonClass, Panel } from './SignInGate';
import { ALERT_CATALOG, catalogEntry, scheduleLabel, toParams, type AlertField } from '@/lib/alerts/catalog';
import { CHAINS } from '@/lib/chains';

interface Channel { id: number; kind: 'telegram' | 'discord' | 'email'; label: string | null; verified: boolean; display: string }
interface Subscription { id: number; kind: string; title: string; summary: string; channelId: number; enabled: boolean; lastTriggeredAt: string | null }
interface AlertEventRow { id: number; title: string; message: string; url: string | null; delivered: boolean; deliveryError: string | null; createdAt: string }

export interface AlertsSetup { telegram: boolean; email: boolean; spaces: string[] }

const CHANNEL_NAMES = { telegram: 'Telegram', discord: 'Discord', email: 'Email' } as const;
const selectClass = "w-full h-10 rounded-md bg-gray-800 text-gray-100 border border-gray-700 px-3 focus:outline-none focus:ring-2 focus:ring-gray-400";
const inputClass = "w-full bg-gray-800 text-gray-100 border-gray-700 focus:ring-gray-400 placeholder-gray-500";
const smallButton = "h-8 px-3 text-sm bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700";

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? 'Could not load');
    return response.json();
}

// Sends a JSON request and returns the error message, if any
async function send(url: string, method: string, body: unknown): Promise<{ error?: string; data?: Record<string, unknown> }> {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { error: data.issues?.join(', ') || data.error || 'Something went wrong' };
    return { data };
}

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function AlertsSection({ setup, initialKind }: { setup: AlertsSetup; initialKind?: string }) {
    return (
        <div className="container mx-auto px-4 w-full max-w-5xl space-y-8">
            <SignInGate notConfigured="This server needs AUTH_SECRET and DATABASE_URL for alerts.">
                <AlertsManager setup={setup} initialKind={initialKind} />
            </SignInGate>
        </div>
    );
}

function AlertsManager({ setup, initialKind }: { setup: AlertsSetup; initialKind?: string }) {
    const channels = useSWR('/api/alerts/channels', fetchJson<Channel[]>);
    const subscriptions = useSWR('/api/alerts/subscriptions', fetchJson<Subscription[]>);
    const events = useSWR('/api/alerts/events', fetchJson<AlertEventRow[]>, { refreshInterval: 60_000 });
    const loadError = channels.error ?? subscriptions.error ?? events.error;

    return (
        <>
            {loadError && <Alert variant="destructive"><AlertDescription>{String(loadError.message)}</AlertDescription></Alert>}
            <ChannelsPanel setup={setup} channels={channels.data} />
            <NewAlertPanel setup={setup} channels={channels.data ?? []} initialKind={initialKind} />
            <SubscriptionsPanel subscriptions={subscriptions.data} channels={channels.data ?? []} />
            <HistoryPanel events={events.data} />
        </>
    );
}

function ChannelsPanel({ setup, channels }: { setup: AlertsSetup; channels?: Channel[] }) {
    const { mutate } = useSWRConfig();
    const [kind, setKind] = useState<Channel['kind']>(setup.telegram ? 'telegram' : 'discord');
    const [target, setTarget] = useState('');
    const [label, setLabel] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string>();
    const [notice, setNotice] = useState<string>();
    const [telegramLink, setTelegramLink] = useState<string>();

    const add = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true); setError(undefined); setNotice(undefined); setTelegramLink(undefined);
        const { error, data } = await send('/api/alerts/channels', 'POST', { kind, target: kind === 'telegram' ? undefined : target, label: label || undefined });
        setBusy(false);
        if (error) return setError(error);
        setTarget(''); setLabel('');
        if (kind === 'telegram') setTelegramLink(String(data?.link));
        else setNotice(kind === 'email' ? 'Check your inbox and open the link to confirm this address.' : 'Connected. We sent a message to the channel.');
        mutate('/api/alerts/channels');
    };

    const test = async (id: number) => {
        setError(undefined); setNotice(undefined);
        const { error } = await send('/api/alerts/test', 'POST', { channelId: id });
        if (error) setError(error); else setNotice('Test alert sent.');
    };

    const remove = async (id: number) => {
        if (!window.confirm('Remove this channel and every alert that uses it?')) return;
        const { error } = await send('/api/alerts/channels', 'DELETE', { id });
        if (error) setError(error);
        mutate('/api/alerts/channels'); mutate('/api/alerts/subscriptions');
    };

    return (
        <Panel title="1. Where to send alerts" description="Add Telegram, a Discord channel webhook or an email address.">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {notice && <Alert className="bg-gray-800 border-gray-700 text-gray-200"><AlertDescription>{notice}</AlertDescription></Alert>}
            {telegramLink && (
                <Alert className="bg-gray-800 border-gray-700 text-gray-200">
                    <AlertDescription>
                        Open the bot and press <strong>Start</strong> to link your chat (the link works once, for 24 hours):{' '}
                        <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="underline font-semibold break-all">Open Telegram</a>
                    </AlertDescription>
                </Alert>
            )}
            {channels === undefined ? <p className="text-gray-500">Loading…</p> : channels.length === 0 ? <p className="text-gray-500">No channels yet.</p> : (
                <ul className="divide-y divide-gray-800">
                    {channels.map(c => (
                        <li key={c.id} className="py-3 flex flex-wrap items-center gap-3 justify-between">
                            <div className="min-w-0">
                                <p className="text-gray-100 font-medium">{CHANNEL_NAMES[c.kind]}{c.label ? ` · ${c.label}` : ''}</p>
                                <p className="text-sm text-gray-500 break-all">{c.display}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${c.verified ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/40 text-yellow-300'}`}>{c.verified ? 'Active' : 'Pending'}</span>
                                {c.verified && <Button className={smallButton} onClick={() => test(c.id)}>Send test</Button>}
                                <Button className={smallButton} aria-label={`Remove ${CHANNEL_NAMES[c.kind]} channel`} onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <form onSubmit={add} className="grid gap-3 sm:grid-cols-[10rem_1fr_10rem_auto] items-end border-t border-gray-800 pt-4">
                <label className="text-sm text-gray-400">Channel
                    <select className={selectClass} value={kind} onChange={e => setKind(e.target.value as Channel['kind'])}>
                        <option value="telegram" disabled={!setup.telegram}>Telegram{setup.telegram ? '' : ' (not set up)'}</option>
                        <option value="discord">Discord</option>
                        <option value="email" disabled={!setup.email}>Email{setup.email ? '' : ' (not set up)'}</option>
                    </select>
                </label>
                <label className="text-sm text-gray-400">{kind === 'discord' ? 'Webhook URL' : kind === 'email' ? 'Email address' : 'Telegram'}
                    {kind === 'telegram'
                        ? <p className="h-10 flex items-center text-gray-500">You&apos;ll get a link to the bot</p>
                        : <Input className={inputClass} value={target} onChange={e => setTarget(e.target.value)} required type={kind === 'email' ? 'email' : 'url'}
                            placeholder={kind === 'discord' ? 'https://discord.com/api/webhooks/…' : 'you@example.com'} />}
                </label>
                <label className="text-sm text-gray-400">Label (optional)
                    <Input className={inputClass} value={label} onChange={e => setLabel(e.target.value)} maxLength={40} />
                </label>
                <Button type="submit" className={buttonClass} disabled={busy}>{busy ? 'Adding…' : 'Add'}</Button>
            </form>
            {kind === 'discord' && <p className="text-sm text-gray-500">In Discord: channel settings → Integrations → Webhooks → New Webhook → Copy Webhook URL.</p>}
        </Panel>
    );
}

function FieldInput({ field, value, onChange, spaces }: { field: AlertField; value: string; onChange: (v: string) => void; spaces: string[] }) {
    const id = 'alert-field-' + field.name;
    let control: React.ReactNode;
    if (field.type === 'chain') {
        control = (
            <select id={id} className={selectClass} value={value} onChange={e => onChange(e.target.value)}>
                {Object.values(CHAINS).map(c => <option key={c.key} value={c.key}>{c.name}{c.testnet ? ' Testnet' : ''}</option>)}
            </select>
        );
    }
    else if (field.type === 'select') {
        control = (
            <select id={id} className={selectClass} value={value} onChange={e => onChange(e.target.value)}>
                {field.options!.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        );
    }
    else {
        control = <Input id={id} className={inputClass} value={value} onChange={e => onChange(e.target.value)} placeholder={field.placeholder}
            inputMode={field.type === 'number' ? 'decimal' : undefined} required={!field.optional} list={field.type === 'spaces' ? 'snapshot-spaces' : undefined} />;
    }
    return (
        <div className="space-y-1 min-w-0">
            <label htmlFor={id} className="text-sm text-gray-400">{field.label}</label>
            {control}
            {field.help && <p className="text-xs text-gray-500">{field.help}</p>}
            {field.type === 'spaces' && <p className="text-xs text-gray-500 break-words">Popular: {spaces.slice(0, 8).join(', ')}</p>}
        </div>
    );
}

function NewAlertPanel({ setup, channels, initialKind }: { setup: AlertsSetup; channels: Channel[]; initialKind?: string }) {
    const { mutate } = useSWRConfig();
    const { address } = useAccount();
    const [kindId, setKindId] = useState(catalogEntry(initialKind ?? '')?.id ?? 'wallet_activity');
    const [values, setValues] = useState<Record<string, string>>({});
    const [channelId, setChannelId] = useState<number>();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string>();
    const [notice, setNotice] = useState<string>();
    const entry = catalogEntry(kindId)!;
    const selectedChannel = channelId ?? channels[0]?.id;

    const value = (f: AlertField) => values[f.name] ?? (f.type === 'address' ? address ?? '' : f.defaultValue ?? '');

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChannel) return setError('Add a channel first');
        const filled = Object.fromEntries(entry.fields.map(f => [f.name, value(f)]));
        setBusy(true); setError(undefined); setNotice(undefined);
        const { error } = await send('/api/alerts/subscriptions', 'POST', { kind: kindId, channelId: selectedChannel, params: toParams(entry, filled) });
        setBusy(false);
        if (error) return setError(error);
        setValues({});
        setNotice(`Alert created: ${entry.title}.`);
        mutate('/api/alerts/subscriptions');
    };

    return (
        <Panel title="2. Create an alert" description="Pick what to watch. Checks run on a schedule; wallet alerts can arrive within a block.">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {notice && <Alert className="bg-gray-800 border-gray-700 text-gray-200"><AlertDescription>{notice}</AlertDescription></Alert>}
            <form onSubmit={create} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <label htmlFor="alert-kind" className="text-sm text-gray-400">Alert type</label>
                        <select id="alert-kind" className={selectClass} value={kindId} onChange={e => { setKindId(e.target.value); setValues({}); setError(undefined); }}>
                            {ALERT_CATALOG.map(k => <option key={k.id} value={k.id}>{k.title}</option>)}
                        </select>
                        <p className="text-xs text-gray-500">{entry.description} {scheduleLabel(entry)}.</p>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="alert-channel" className="text-sm text-gray-400">Send to</label>
                        <select id="alert-channel" className={selectClass} value={selectedChannel ?? ''} onChange={e => setChannelId(Number(e.target.value))} disabled={channels.length === 0}>
                            {channels.length === 0 && <option value="">Add a channel above first</option>}
                            {channels.map(c => <option key={c.id} value={c.id}>{CHANNEL_NAMES[c.kind]}{c.label ? ` · ${c.label}` : ''}{c.verified ? '' : ' (pending)'}</option>)}
                        </select>
                    </div>
                    {entry.fields.map(f => <FieldInput key={kindId + f.name} field={f} value={value(f)} spaces={setup.spaces} onChange={v => setValues(prev => ({ ...prev, [f.name]: v }))} />)}
                </div>
                <datalist id="snapshot-spaces">{setup.spaces.map(s => <option key={s} value={s} />)}</datalist>
                <div className="flex justify-center">
                    <Button type="submit" className={buttonClass} disabled={busy || channels.length === 0}>{busy ? 'Creating…' : 'Create alert'}</Button>
                </div>
            </form>
        </Panel>
    );
}

function SubscriptionsPanel({ subscriptions, channels }: { subscriptions?: Subscription[]; channels: Channel[] }) {
    const { mutate } = useSWRConfig();
    const [error, setError] = useState<string>();
    const channelName = (id: number) => {
        const c = channels.find(x => x.id === id);
        return c ? CHANNEL_NAMES[c.kind] + (c.label ? ` · ${c.label}` : '') + (c.verified ? '' : ' (pending)') : '';
    };
    const update = async (method: 'PATCH' | 'DELETE', body: Record<string, unknown>) => {
        const { error } = await send('/api/alerts/subscriptions', method, body);
        setError(error);
        mutate('/api/alerts/subscriptions');
    };

    return (
        <Panel title="Your alerts" description="Pause or remove alerts at any time. You can have up to 20.">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {subscriptions === undefined ? <p className="text-gray-500">Loading…</p> : subscriptions.length === 0 ? <p className="text-gray-500">No alerts yet.</p> : (
                <ul className="divide-y divide-gray-800">
                    {subscriptions.map(s => (
                        <li key={s.id} className="py-3 flex flex-wrap items-center gap-3 justify-between">
                            <div className="min-w-0">
                                <p className={`font-medium ${s.enabled ? 'text-gray-100' : 'text-gray-500 line-through'}`}>{s.summary}</p>
                                <p className="text-sm text-gray-500 break-words">
                                    {s.title} → {channelName(s.channelId)}{s.lastTriggeredAt ? ` · last alert ${when(s.lastTriggeredAt)}` : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button className={smallButton} onClick={() => update('PATCH', { id: s.id, enabled: !s.enabled })}>{s.enabled ? 'Pause' : 'Resume'}</Button>
                                <Button className={smallButton} aria-label={`Delete alert: ${s.summary}`} onClick={() => update('DELETE', { id: s.id })}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}

function HistoryPanel({ events }: { events?: AlertEventRow[] }) {
    return (
        <Panel title="Alert history" description="Your 50 most recent alerts.">
            {events === undefined ? <p className="text-gray-500">Loading…</p> : events.length === 0 ? <p className="text-gray-500">Nothing yet. Alerts you receive will show up here.</p> : (
                <ul className="divide-y divide-gray-800">
                    {events.map(e => (
                        <li key={e.id} className="py-3 space-y-1 min-w-0">
                            <div className="flex flex-wrap justify-between gap-2">
                                <p className="text-gray-100 font-medium break-words">{e.url ? <a href={e.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{e.title}</a> : e.title}</p>
                                <span className="text-xs text-gray-500">{when(e.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-400 whitespace-pre-line break-words">{e.message}</p>
                            {!e.delivered && <p className="text-xs text-red-400 break-words">Not delivered{e.deliveryError ? `: ${e.deliveryError}` : ''}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}
