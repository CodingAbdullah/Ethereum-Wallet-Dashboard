'use client';

import { Sparkles } from 'lucide-react';
import { askAgent } from './askAgent';

// One-click "Explain" on transaction and contract pages: opens the assistant with a prepared question
export default function ExplainButton({ prompt, label = 'Explain' }: { prompt: string; label?: string }) {
    return (
        <button onClick={() => askAgent(prompt)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-gray-100 hover:bg-gray-700">
            <Sparkles className="h-4 w-4" /> {label}
        </button>
    );
}
