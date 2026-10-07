'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { searchSuggestions, type Suggestion } from '@/lib/search';

const OPEN_EVENT = 'open-search';

// Opens the palette from anywhere (navbar button, homepage search box)
export function openSearch(initial = '') {
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: initial }));
}

export function SearchButton({ labelClassName }: { labelClassName?: string }) {
    return (
        <button
            type="button"
            onClick={() => openSearch()}
            aria-label="Search (Ctrl+K)"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 ring-1 ring-gray-700 hover:bg-gray-700 hover:text-white"
        >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className={labelClassName}>Search <kbd className="ml-1 rounded bg-gray-700 px-1 text-xs text-gray-300">⌘K</kbd></span>
        </button>
    );
}

// Global search: type an address, ENS name, transaction hash, block number, page or coin
export default function SearchPalette() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const [status, setStatus] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const returnFocus = useRef<HTMLElement | null>(null);
    const results = searchSuggestions(query);

    const show = useCallback((initial = '') => {
        returnFocus.current = document.activeElement as HTMLElement | null;
        setQuery(initial);
        setActive(0);
        setStatus(null);
        setOpen(true);
    }, []);

    const close = useCallback(() => {
        setOpen(false);
        returnFocus.current?.focus?.();
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                show();
            }
        };
        const onOpen = (e: Event) => show((e as CustomEvent<string>).detail ?? '');
        window.addEventListener('keydown', onKey);
        window.addEventListener(OPEN_EVENT, onOpen);
        return () => { window.removeEventListener('keydown', onKey); window.removeEventListener(OPEN_EVENT, onOpen); };
    }, [show]);

    useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

    const choose = async (s: Suggestion | undefined) => {
        if (!s) return;
        if (s.href) { close(); router.push(s.href); return; }
        if (s.resolveEns) {
            setStatus(`Looking up ${s.resolveEns}…`);
            const response = await fetch('/api/resolve-ens?name=' + encodeURIComponent(s.resolveEns)).catch(() => null);
            if (!response?.ok) { setStatus(`${s.resolveEns} doesn't point to an address.`); return; }
            const { address } = await response.json();
            close();
            router.push('/address/' + address);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh]" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
            <div role="dialog" aria-modal="true" aria-label="Search" className="w-full max-w-xl overflow-hidden rounded-lg bg-gray-900 shadow-2xl ring-1 ring-gray-700">
                <div className="flex items-center gap-3 border-b border-gray-800 px-4">
                    <Search className="h-5 w-5 text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setActive(0); setStatus(null); }}
                        onKeyDown={e => {
                            if (e.key === 'Escape') { e.preventDefault(); close(); }
                            else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
                            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
                            else if (e.key === 'Enter') { e.preventDefault(); choose(results[active]); }
                            else if (e.key === 'Tab') e.preventDefault();          // keep focus inside the dialog
                        }}
                        placeholder="Address, ENS name, tx hash, block, page or coin…"
                        aria-label="Search"
                        role="combobox"
                        aria-expanded={results.length > 0}
                        aria-controls="search-results"
                        aria-activedescendant={results[active] ? 'search-' + active : undefined}
                        autoComplete="off"
                        spellCheck={false}
                        className="h-14 w-full bg-transparent text-gray-100 placeholder-gray-500 outline-none"
                    />
                    <kbd className="hidden sm:inline rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">Esc</kbd>
                </div>
                {status && <p className="px-4 py-3 text-sm text-gray-300" role="status">{status}</p>}
                {results.length > 0 ? (
                    <ul id="search-results" role="listbox" className="max-h-80 overflow-y-auto py-2">
                        {results.map((r, i) => (
                            <li
                                key={r.id}
                                id={'search-' + i}
                                role="option"
                                aria-selected={i === active}
                                onMouseEnter={() => setActive(i)}
                                onMouseDown={e => { e.preventDefault(); choose(r); }}
                                className={`flex cursor-pointer items-center justify-between gap-4 px-4 py-2 ${i === active ? 'bg-gray-800' : ''}`}
                            >
                                <span className="text-gray-100">{r.label}</span>
                                <span className="truncate text-xs text-gray-400 max-w-[50%] font-mono">{r.hint}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="px-4 py-4 text-sm text-gray-400">{query ? 'No matches.' : 'Try vitalik.eth, a transaction hash, a block number, "gas" or "bitcoin".'}</p>
                )}
            </div>
        </div>
    );
}
