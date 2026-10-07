import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALERT_KINDS } from "./kinds";
import { plainText } from "./deliver";

// Keeps the exported n8n workflows (n8n/*.json) in step with the app
const workflow = (file: string) => JSON.parse(readFileSync(join(process.cwd(), 'n8n', file), 'utf8')) as {
    nodes: { name: string; type: string; parameters: Record<string, unknown> }[];
    connections: Record<string, { main: { node: string }[][] }>;
};

describe("n8n scheduler workflow", () => {
    const { nodes, connections } = workflow('alerts-scheduler.json');

    it("runs every alert type at its interval", () => {
        for (const kind of ALERT_KINDS) {
            const runner = nodes.find(n => String(n.parameters.url).endsWith(`/api/cron/alerts/${kind.id}' }}`));
            expect(runner, kind.id).toBeTruthy();
            const trigger = Object.entries(connections).find(([, c]) => c.main[0].some(t => t.node === runner!.name))![0];
            const rule = (nodes.find(n => n.name === trigger)!.parameters.rule as { interval: { field: string; minutesInterval?: number; expression?: string }[] }).interval[0];
            if (kind.everyMinutes === 1440) expect(rule.expression).toMatch(/^\d+ \d+ \* \* \*$/);
            else expect(rule).toEqual({ field: 'minutes', minutesInterval: kind.everyMinutes });
        }
        expect(nodes.filter(n => n.type === 'n8n-nodes-base.httpRequest')).toHaveLength(ALERT_KINDS.length);
    });
});

describe("n8n router workflow", () => {
    it("checks the signature before routing to each channel", () => {
        const { nodes, connections } = workflow('alerts-router.json');
        expect(connections['Alert webhook'].main[0][0].node).toBe('Expected signature');
        expect(connections['Route by channel'].main.map(out => out[0].node)).toEqual(['Telegram', 'Discord', 'Email (Resend)']);
        expect(nodes.find(n => n.name === 'Route by channel')!.parameters.output).toContain("['telegram', 'discord', 'email']");
    });

    it("can rebuild the exact signed body from n8n's parsed JSON", () => {
        // n8n hands the workflow parsed JSON; the HMAC is checked over JSON.stringify of it
        const delivery = { channel: { kind: 'telegram' as const, target: '42' }, title: 'Gas is 3.10 gwei — “cheap”', message: 'Line 1\nLine 2 <b>é</b> 🚀', url: 'https://ethereumdashboard.dev/gas-tracker', eventId: 7 };
        const body = JSON.stringify({ ...delivery, text: plainText(delivery) });
        expect(JSON.stringify(JSON.parse(body))).toBe(body);
    });
});
