'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useAccount } from 'wagmi';
import { MessageCircle, X, Send, Square, RotateCcw } from 'lucide-react';
import { chainByChainId } from '@/lib/chains';
import ChatMarkdown from './ChatMarkdown';
import { ASK_EVENT } from './askAgent';

const SUGGESTIONS_WALLET = ['Explain my portfolio risk', 'Do I have any risky token approvals?', 'Summarize my recent activity'];
const SUGGESTIONS = ['How much is gas right now?', 'How is ETH staking doing?', 'Compare the main layer 2s'];

// "get_wallet_portfolio" -> "wallet portfolio"
const toolLabel = (type: string) => type.replace(/^tool-/, '').replace(/^(get|check|resolve|decode)_/, '').replace(/_/g, ' ');

function errorText(error: Error): string {
    try {
        const parsed = JSON.parse(error.message);
        if (parsed?.error) return String(parsed.error);
    }
    catch { /* not JSON */ }
    return error.message && error.message.length < 200 ? error.message : 'Something went wrong. Try again.';
}

function Message({ message }: { message: UIMessage }) {
    if (message.role === 'user') {
        const text = message.parts.map(p => (p.type === 'text' ? p.text : '')).join('');
        return <div className="ml-auto max-w-[85%] rounded-lg bg-gray-700 text-gray-100 px-3 py-2 whitespace-pre-wrap break-words">{text}</div>;
    }
    return (
        <div className="max-w-[95%] space-y-2 text-gray-300">
            {message.parts.map((part, i) => {
                if (part.type === 'text') return <ChatMarkdown key={i} text={part.text} />;
                if (part.type.startsWith('tool-')) {
                    const state = (part as { state?: string }).state;
                    const done = state === 'output-available' || state === 'output-error';
                    return (
                        <p key={i} className="text-xs text-gray-500">
                            {done ? 'Checked' : 'Checking'} {toolLabel(part.type)}{done ? '' : '…'}
                        </p>
                    );
                }
                return null;
            })}
        </div>
    );
}

// The "Ask ETH Dashboard" chat: a button in the corner of every page that opens a panel
export default function AgentChat() {
    const { address, chainId } = useAccount();
    const chain = chainId ? chainByChainId(chainId)?.key : undefined;
    const [transport] = useState(() => new DefaultChatTransport({ api: '/api/agent' }));
    const { messages, sendMessage, status, stop, error, setMessages, clearError } = useChat({ transport });
    // The connected wallet goes with every question, so "my wallet" always means the current one
    const ask = useCallback((text: string) => sendMessage({ text }, { body: { wallet: address, chain } }), [sendMessage, address, chain]);
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const bottom = useRef<HTMLDivElement>(null);
    const busy = status === 'submitted' || status === 'streaming';

    // Explain buttons elsewhere on the page open the panel with a question
    useEffect(() => {
        const onAsk = (event: Event) => {
            const prompt = (event as CustomEvent<string>).detail;
            setOpen(true);
            if (prompt) ask(prompt);
        };
        window.addEventListener(ASK_EVENT, onAsk);
        return () => window.removeEventListener(ASK_EVENT, onAsk);
    }, [ask]);

    useEffect(() => { bottom.current?.scrollIntoView({ block: 'end' }); }, [messages, status]);

    const send = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || busy) return;
        clearError();
        ask(trimmed);
        setInput('');
    };

    if (!open) {
        return (
            <button onClick={() => setOpen(true)} aria-label="Ask ETH Dashboard"
                className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-gray-100 text-gray-900 px-4 py-3 shadow-lg hover:bg-white font-medium">
                <MessageCircle className="h-5 w-5" /> Ask
            </button>
        );
    }

    return (
        <section aria-label="Ask ETH Dashboard"
            className="fixed z-50 inset-0 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[26rem] sm:h-[36rem] sm:max-h-[calc(100vh-2rem)] flex flex-col bg-gray-900 sm:border border-gray-700 sm:rounded-xl shadow-2xl">
            <header className="flex items-center justify-between gap-2 border-b border-gray-800 px-4 py-3">
                <div className="min-w-0">
                    <h2 className="font-bold text-gray-100">Ask ETH Dashboard</h2>
                    <p className="text-xs text-gray-500 truncate">{address ? 'Knows your connected wallet · ' : ''}Read-only · not financial advice</p>
                </div>
                <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                        <button onClick={() => { stop(); setMessages([]); clearError(); }} aria-label="New chat" className="p-2 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-800"><RotateCcw className="h-4 w-4" /></button>
                    )}
                    <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-800"><X className="h-5 w-5" /></button>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-sm" aria-live="polite">
                {messages.length === 0 && (
                    <div className="space-y-3">
                        <p className="text-gray-400">Ask about wallets, tokens, gas, staking, DeFi or any transaction. I look up live data, but I can&apos;t send transactions.</p>
                        <div className="flex flex-wrap gap-2">
                            {(address ? SUGGESTIONS_WALLET : SUGGESTIONS).map(s => (
                                <button key={s} onClick={() => send(s)} className="rounded-full border border-gray-700 px-3 py-1 text-gray-300 hover:bg-gray-800">{s}</button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map(m => <Message key={m.id} message={m} />)}
                {status === 'submitted' && <p className="text-xs text-gray-500">Thinking…</p>}
                {error && <p className="text-sm text-red-400" role="alert">{errorText(error)}</p>}
                <div ref={bottom} />
            </div>
            <form onSubmit={e => { e.preventDefault(); send(input); }} className="border-t border-gray-800 p-3 flex items-end gap-2">
                <textarea value={input} onChange={e => setInput(e.target.value)} rows={1} maxLength={2000} placeholder="Ask a question…" aria-label="Your question"
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                    className="flex-1 resize-none max-h-32 rounded-md bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400" />
                {busy
                    ? <button type="button" onClick={() => stop()} aria-label="Stop" className="p-2.5 rounded-md bg-gray-700 text-gray-100 hover:bg-gray-600"><Square className="h-4 w-4" /></button>
                    : <button type="submit" aria-label="Send" disabled={!input.trim()} className="p-2.5 rounded-md bg-gray-100 text-gray-900 hover:bg-white disabled:opacity-40"><Send className="h-4 w-4" /></button>}
            </form>
        </section>
    );
}
