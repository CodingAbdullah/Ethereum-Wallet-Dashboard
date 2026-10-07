import { boolean, date, doublePrecision, index, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// Phase 1 tables, plus Phase 3's alerts tables at the bottom. Phase 4 adds api_keys.

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

// One USD value per wallet per day, for the portfolio-over-time chart. Keyed by wallet (not user),
// so a wallet saved by several users is only fetched once. Written by the daily cron job and when /me loads.
export const portfolioSnapshots = pgTable('portfolio_snapshots', {
    id: serial('id').primaryKey(),
    address: text('address').notNull(),
    chain: text('chain').notNull(),
    day: date('day', { mode: 'string' }).notNull(),
    usdValue: doublePrecision('usd_value').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, table => [
    uniqueIndex('portfolio_snapshots_wallet_day_idx').on(table.address, table.chain, table.day)
]);

// Phase 3: alerts.

// Where a user's alerts go: a Telegram chat, a Discord webhook or an email address.
// Telegram and email start unverified, with a one-time token (linking the bot / clicking the email link).
export const notificationChannels = pgTable('notification_channels', {
    id: serial('id').primaryKey(),
    userAddress: text('user_address').notNull().references(() => users.address, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),                       // 'telegram' | 'discord' | 'email'
    target: text('target'),                             // chat id, webhook URL or email; null until a Telegram chat is linked
    label: text('label'),
    verified: boolean('verified').notNull().default(false),
    verifyToken: text('verify_token'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, table => [
    index('notification_channels_user_idx').on(table.userAddress),
    uniqueIndex('notification_channels_token_idx').on(table.verifyToken)
]);

// What a user wants to hear about. `params` depends on the kind (e.g. { address } or { maxGwei }),
// and `state` is the checker's memory (last value seen, whether it has fired, ...).
export const alertSubscriptions = pgTable('alert_subscriptions', {
    id: serial('id').primaryKey(),
    userAddress: text('user_address').notNull().references(() => users.address, { onDelete: 'cascade' }),
    channelId: integer('channel_id').notNull().references(() => notificationChannels.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    params: jsonb('params').notNull().$type<Record<string, unknown>>(),
    state: jsonb('state').notNull().default({}).$type<Record<string, unknown>>(),
    enabled: boolean('enabled').notNull().default(true),
    lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, table => [
    index('alert_subscriptions_user_idx').on(table.userAddress),
    index('alert_subscriptions_kind_idx').on(table.kind, table.enabled)
]);

// Every alert that fired, and whether it was delivered. `dedupeKey` stops the same thing being sent twice
// (Moralis Streams sends each transaction once unconfirmed and again once confirmed).
export const alertEvents = pgTable('alert_events', {
    id: serial('id').primaryKey(),
    subscriptionId: integer('subscription_id').notNull().references(() => alertSubscriptions.id, { onDelete: 'cascade' }),
    userAddress: text('user_address').notNull(),
    kind: text('kind').notNull(),
    dedupeKey: text('dedupe_key').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    url: text('url'),
    delivered: boolean('delivered').notNull().default(false),
    deliveryError: text('delivery_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, table => [
    uniqueIndex('alert_events_dedupe_idx').on(table.subscriptionId, table.dedupeKey),
    index('alert_events_user_idx').on(table.userAddress, table.createdAt)
]);

export type NotificationChannel = typeof notificationChannels.$inferSelect;
export type AlertSubscription = typeof alertSubscriptions.$inferSelect;
export type AlertEvent = typeof alertEvents.$inferSelect;
