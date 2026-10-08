import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";

// Loads a read-only section on the server and streams it in: the page shell (header, nav) is sent at once,
// and each section arrives as soon as its data is ready. Data comes from the same cached server functions
// as the API routes, so there is no browser round trip and nothing to fetch after the page loads.
// Data is loaded per request (never at build time); the functions' own caches keep that cheap.
// `loading` is a message, or any placeholder (e.g. the section with empty values, so the layout doesn't jump)
interface Props<T> { load: () => Promise<T>; loading: ReactNode; failed: string; children: (data: T) => ReactNode }

async function Loaded<T>({ load, failed, children }: Omit<Props<T>, 'loading'>) {
    await connection();
    let data: T;
    try {
        data = await load();
    }
    catch (err) {
        console.warn('Section failed to load:', err instanceof Error ? err.message : err);
        return <p className="text-center text-red-400">{failed}</p>;
    }
    return <>{children(data)}</>;
}

export default function ServerSection<T>({ loading, ...props }: Props<T>) {
    return (
        <Suspense fallback={typeof loading === 'string' ? <p className="text-center text-gray-400" role="status">{loading}</p> : loading}>
            <Loaded {...props} />
        </Suspense>
    );
}
