import { timingSafeEqual } from "node:crypto";
import { HttpError } from "./api/errors";

// Vercel sends cron requests with "Authorization: Bearer <CRON_SECRET>"
export function isAuthorizedCron(header: string | null, secret: string | undefined = process.env.CRON_SECRET): boolean {
    if (!secret) throw new HttpError(503, 'Scheduled jobs are not configured on this server (CRON_SECRET is missing)');
    const expected = Buffer.from('Bearer ' + secret);
    const actual = Buffer.from(header ?? '');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
}
