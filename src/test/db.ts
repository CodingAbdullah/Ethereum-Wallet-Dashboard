import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, beforeEach } from "vitest";
import { sql } from "drizzle-orm";
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

// One database per test file (starting PGlite and running the migrations is the slow part),
// emptied before each test. Returns a getter for the current test's database.
export function setupTestDb(): () => Database {
    let db: Database | undefined;
    beforeAll(async () => {
        db = await createTestDb();
    }, 60_000);
    beforeEach(async () => {
        const result = await db!.execute(sql`select tablename from pg_tables where schemaname = 'public'`);
        const rows = (Array.isArray(result) ? result : (result as { rows: { tablename: string }[] }).rows) as { tablename: string }[];
        if (rows.length) await db!.execute(sql.raw(`truncate table ${rows.map(r => `"${r.tablename}"`).join(', ')} restart identity cascade`));
    });
    return () => db!;
}
