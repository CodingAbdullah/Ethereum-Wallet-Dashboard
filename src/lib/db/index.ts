import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { HttpError } from "../api/errors";

// Neon Postgres (free tier) over HTTP, which suits serverless route handlers.
// Without DATABASE_URL the rest of the app keeps working and account routes return 503.

export type Database = NeonHttpDatabase<typeof schema>;

export class DatabaseNotConfiguredError extends HttpError {
    constructor() {
        super(503, 'Accounts are not configured on this server (DATABASE_URL is missing)');
    }
}

let db: Database | undefined;

export function isDatabaseConfigured(): boolean {
    return !!process.env.DATABASE_URL;
}

export function getDb(): Database {
    const url = process.env.DATABASE_URL;
    if (!url) throw new DatabaseNotConfiguredError();
    db ??= drizzle(neon(url), { schema });
    return db;
}
