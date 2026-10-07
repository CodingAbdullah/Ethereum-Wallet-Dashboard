CREATE TABLE "portfolio_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"chain" text NOT NULL,
	"day" date NOT NULL,
	"usd_value" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_snapshots_wallet_day_idx" ON "portfolio_snapshots" USING btree ("address","chain","day");