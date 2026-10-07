'use client';

import { Search } from 'lucide-react';
import { openSearch } from './SearchPalette';

// Looks like a search field; typing or clicking opens the global search with what was typed
export default function HomeSearchBox() {
    return (
        <button
            type="button"
            onClick={() => openSearch()}
            onKeyDown={e => { if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) { e.preventDefault(); openSearch(e.key); } }}
            className="flex w-full items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-left text-gray-400 ring-1 ring-gray-700 hover:ring-gray-500"
        >
            <Search className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="flex-1 truncate">Search an address, ENS name, transaction, block or page</span>
            <kbd className="hidden sm:inline rounded bg-gray-800 px-1.5 py-0.5 text-xs">⌘K</kbd>
        </button>
    );
}
