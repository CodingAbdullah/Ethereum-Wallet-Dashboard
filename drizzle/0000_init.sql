CREATE TABLE "users" (
	"address" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_sign_in_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watched_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_address" text NOT NULL,
	"address" text NOT NULL,
	"chain" text DEFAULT 'eth' NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "watched_wallets" ADD CONSTRAINT "watched_wallets_user_address_users_address_fk" FOREIGN KEY ("user_address") REFERENCES "public"."users"("address") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "watched_wallets_user_address_chain_idx" ON "watched_wallets" USING btree ("user_address","address","chain");--> statement-breakpoint
CREATE INDEX "watched_wallets_user_idx" ON "watched_wallets" USING btree ("user_address");