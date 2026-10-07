import { Fragment } from 'react';

// Renders the small subset of Markdown the model writes (paragraphs, bullet and numbered lists,
// headings, **bold** and `code`) as React elements. No HTML is ever injected.
function inline(text: string, key: string) {
    return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((piece, i) => {
        if (piece.startsWith('**') && piece.endsWith('**') && piece.length > 4) return <strong key={key + i} className="text-gray-100">{piece.slice(2, -2)}</strong>;
        if (piece.startsWith('`') && piece.endsWith('`') && piece.length > 2) return <code key={key + i} className="bg-gray-800 rounded px-1 text-[0.85em] break-all">{piece.slice(1, -1)}</code>;
        return <Fragment key={key + i}>{piece}</Fragment>;
    });
}

export default function ChatMarkdown({ text }: { text: string }) {
    const blocks: React.ReactNode[] = [];
    let list: { ordered: boolean; items: string[] } | null = null;
    const flush = () => {
        if (!list) return;
        const items = list.items.map((item, i) => <li key={i}>{inline(item, `li${blocks.length}-${i}-`)}</li>);
        blocks.push(list.ordered
            ? <ol key={blocks.length} className="list-decimal pl-5 space-y-1">{items}</ol>
            : <ul key={blocks.length} className="list-disc pl-5 space-y-1">{items}</ul>);
        list = null;
    };
    for (const raw of text.split('\n')) {
        const line = raw.trimEnd();
        const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
        const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
        if (bullet || numbered) {
            const ordered = !!numbered;
            if (list && list.ordered !== ordered) flush();
            list ??= { ordered, items: [] };
            list.items.push((bullet ?? numbered)![1]);
            continue;
        }
        flush();
        if (!line.trim()) continue;
        const heading = line.match(/^#{1,6}\s+(.*)$/);
        blocks.push(heading
            ? <p key={blocks.length} className="font-semibold text-gray-100">{inline(heading[1], `h${blocks.length}-`)}</p>
            : <p key={blocks.length}>{inline(line, `p${blocks.length}-`)}</p>);
    }
    flush();
    return <div className="space-y-2 break-words">{blocks}</div>;
}
