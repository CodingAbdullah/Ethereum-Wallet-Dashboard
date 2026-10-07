import { defineConfig } from "drizzle-kit";

// Migrations: `npm run db:generate` after changing src/lib/db/schema.ts, then `npm run db:migrate`
export default defineConfig({
    schema: './src/lib/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: { url: process.env.DATABASE_URL ?? '' }
});
