import * as Sentry from "@sentry/nextjs";

// Sentry for the Edge runtime. Disabled unless NEXT_PUBLIC_SENTRY_DSN is set (Sentry free Developer plan).
Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0
});
