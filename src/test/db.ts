import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "@/lib/db/schema";
import type { Database } from "@/lib/db";

// An in-memory Postgres (PGlite) with the real migrations applied, for testing database code
export async function createTestDb(): Promise<Database> {
    const client = new PGlite();
    const dir = join(process.cwd(), 'drizzle');
    for (const file of readdirSync(dir).filter(f => f.endsWith('.sql')).sort()) {
        for (const statement of readFileSync(join(dir, file), 'utf8').split('--> statement-breakpoint')) {
            if (statement.trim()) await client.exec(statement);
        }
    }
    return drizzle(client, { schema }) as unknown as Database;
}
