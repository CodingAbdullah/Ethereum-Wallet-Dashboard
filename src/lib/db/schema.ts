import { index, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// Phase 1 tables. Later phases add their own (watchlists, alert_subscriptions, notification_channels, api_keys).

// A user is a wallet that signed in with Ethereum; the checksummed address is the ID
export const users = pgTable('users', {
    address: text('address').primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastSignInAt: timestamp('last_sign_in_at', { withTimezone: true }).notNull().defaultNow()
});

// Wallets a user follows on /me. `chain` uses the same values as the network selector ('eth', 'sepolia', 'hoodi')
// and is ready for the extra chains in Phase 2.
export const watchedWallets = pgTable('watched_wallets', {
    id: serial('id').primaryKey(),
    userAddress: text('user_address').notNull().references(() => users.address, { onDelete: 'cascade' }),
    address: text('address').notNull(),
    chain: text('chain').notNull().default('eth'),
    label: text('label'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, table => [
    uniqueIndex('watched_wallets_user_address_chain_idx').on(table.userAddress, table.address, table.chain),
    index('watched_wallets_user_idx').on(table.userAddress)
]);

export type WatchedWallet = typeof watchedWallets.$inferSelect;
