CREATE TABLE "alert_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_id" integer NOT NULL,
	"user_address" text NOT NULL,
	"kind" text NOT NULL,
	"dedupe_key" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"url" text,
	"delivered" boolean DEFAULT false NOT NULL,
	"delivery_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_address" text NOT NULL,
	"channel_id" integer NOT NULL,
	"kind" text NOT NULL,
	"params" jsonb NOT NULL,
	"state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_triggered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_address" text NOT NULL,
	"kind" text NOT NULL,
	"target" text,
	"label" text,
	"verified" boolean DEFAULT false NOT NULL,
	"verify_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_subscription_id_alert_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."alert_subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_subscriptions" ADD CONSTRAINT "alert_subscriptions_user_address_users_address_fk" FOREIGN KEY ("user_address") REFERENCES "public"."users"("address") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_subscriptions" ADD CONSTRAINT "alert_subscriptions_channel_id_notification_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."notification_channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_channels" ADD CONSTRAINT "notification_channels_user_address_users_address_fk" FOREIGN KEY ("user_address") REFERENCES "public"."users"("address") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "alert_events_dedupe_idx" ON "alert_events" USING btree ("subscription_id","dedupe_key");--> statement-breakpoint
CREATE INDEX "alert_events_user_idx" ON "alert_events" USING btree ("user_address","created_at");--> statement-breakpoint
CREATE INDEX "alert_subscriptions_user_idx" ON "alert_subscriptions" USING btree ("user_address");--> statement-breakpoint
CREATE INDEX "alert_subscriptions_kind_idx" ON "alert_subscriptions" USING btree ("kind","enabled");--> statement-breakpoint
CREATE INDEX "notification_channels_user_idx" ON "notification_channels" USING btree ("user_address");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_channels_token_idx" ON "notification_channels" USING btree ("verify_token");