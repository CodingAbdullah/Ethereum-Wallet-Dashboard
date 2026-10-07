import * as Sentry from "@sentry/nextjs";

// Sentry in the browser. Disabled unless NEXT_PUBLIC_SENTRY_DSN is set (Sentry free Developer plan).
Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
