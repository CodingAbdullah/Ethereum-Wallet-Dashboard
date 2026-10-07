import { describe, expect, it } from "vitest";
import { isAuthorizedCron } from "./cron";

describe("isAuthorizedCron", () => {
    it("accepts only the exact bearer secret", () => {
        expect(isAuthorizedCron('Bearer s3cret', 's3cret')).toBe(true);
        expect(isAuthorizedCron('Bearer wrong!', 's3cret')).toBe(false);
        expect(isAuthorizedCron(null, 's3cret')).toBe(false);
        expect(isAuthorizedCron('s3cret', 's3cret')).toBe(false);
    });

    it("returns 503 when CRON_SECRET is not set", () => {
        expect(() => isAuthorizedCron('Bearer x', '')).toThrow(expect.objectContaining({ status: 503 }));
    });
});
