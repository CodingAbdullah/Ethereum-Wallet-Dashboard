import { SignJWT, jwtVerify } from "jose";
import { getAddress, isAddress, type Address } from "viem";
import { HttpError } from "../api/errors";

// Session for a signed-in wallet: a short JWT in an httpOnly cookie, signed with AUTH_SECRET.
// The checksummed address is the user ID.

export const SESSION_COOKIE = 'eth_dashboard_session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const ISSUER = 'ethereum-dashboard';

export interface Session {
    address: Address;
    chainId: number;
}

export class AuthNotConfiguredError extends HttpError {
    constructor() {
        super(503, 'Sign-in is not configured on this server (AUTH_SECRET is missing)');
    }
}

function secretKey(secret: string | undefined): Uint8Array {
    if (!secret || secret.length < 32) throw new AuthNotConfiguredError();
    return new TextEncoder().encode(secret);
}

export function isAuthConfigured(secret: string | undefined = process.env.AUTH_SECRET): boolean {
    return !!secret && secret.length >= 32;
}

export async function createSessionToken(session: Session, secret = process.env.AUTH_SECRET, now = Date.now()): Promise<string> {
    const issuedAt = Math.floor(now / 1000);
    return new SignJWT({ chainId: session.chainId })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(session.address)
        .setIssuer(ISSUER)
        .setIssuedAt(issuedAt)
        .setExpirationTime(issuedAt + SESSION_MAX_AGE_SECONDS)
        .sign(secretKey(secret));
}

// Returns the session, or null if the token is missing, tampered with or expired
export async function readSessionToken(token: string | undefined, secret = process.env.AUTH_SECRET, now = Date.now()): Promise<Session | null> {
    if (!token || !isAuthConfigured(secret)) return null;
    try {
        const { payload } = await jwtVerify(token, secretKey(secret), {
            issuer: ISSUER,
            algorithms: ['HS256'],
            currentDate: new Date(now)
        });
        if (!payload.sub || !isAddress(payload.sub) || typeof payload.chainId !== 'number') return null;
        return { address: getAddress(payload.sub), chainId: payload.chainId };
    }
    catch {
        return null;
    }
}

export const sessionCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS
};

// Reads the session from the request cookies (route handlers and server components)
export async function getSession(): Promise<Session | null> {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    return readSessionToken(store.get(SESSION_COOKIE)?.value);
}

// Like getSession, but throws 401 when nobody is signed in
export async function requireSession(): Promise<Session> {
    if (!isAuthConfigured()) throw new AuthNotConfiguredError();
    const session = await getSession();
    if (!session) throw new HttpError(401, 'Sign in with your wallet first');
    return session;
}
