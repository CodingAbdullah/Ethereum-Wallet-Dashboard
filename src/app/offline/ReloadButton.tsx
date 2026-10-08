'use client';

export default function ReloadButton() {
    return (
        <button onClick={() => window.location.reload()} className="rounded-md bg-gray-200 px-4 py-2 font-semibold text-gray-900 hover:bg-white">
            Try again
        </button>
    );
}
