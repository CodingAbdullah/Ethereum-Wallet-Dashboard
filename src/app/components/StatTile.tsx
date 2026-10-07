// A headline number with a label and an optional note underneath
export default function StatTile({ label, value, note }: { label: string; value: React.ReactNode; note?: React.ReactNode }) {
    return (
        <div className="rounded-lg bg-gray-900 border border-gray-800 p-4">
            <p className="text-sm text-gray-400">{label}</p>
            <div className="text-2xl sm:text-3xl font-bold text-gray-100 tabular-nums">{value}</div>
            {note && <p className="text-sm mt-1 text-gray-400">{note}</p>}
        </div>
    );
}
