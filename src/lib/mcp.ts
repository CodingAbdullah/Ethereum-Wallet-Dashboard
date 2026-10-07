import type { McpServer } from "@modelcontextprotocol/server";
import type { Database } from "./db";
import { consumeQuota } from "./apiKeys";
import { TOOLS, toolErrorMessage } from "./tools";

// The MCP server (/api/mcp): every tool in the shared registry, behind per-user API keys with a daily quota.

export const MCP_INSTRUCTIONS = 'Read-only Ethereum data from Ethereum Dashboard (ethereumdashboard.dev): wallet portfolios, PnL, activity, '
    + 'approvals and DeFi positions; ENS; gas; token and NFT prices; staking, validators, DeFi TVL, layer 2s, ETH supply, governance and derivatives; '
    + 'and transaction decoding. Wallet tools accept an address or an ENS name. These tools cannot sign or send transactions.';

const MAX_TEXT = 60_000;
const text = (value: string, isError = false) => ({ content: [{ type: 'text' as const, text: value }], ...(isError ? { isError: true } : {}) });

export function registerDashboardTools(server: McpServer, getDb: () => Database) {
    for (const t of TOOLS) {
        server.registerTool(t.name, {
            title: t.title,
            description: t.description,
            inputSchema: t.input as never,
            annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true }
        }, (async (args: unknown, ctx: { http?: { authInfo?: { extra?: Record<string, unknown> } } }) => {
            const keyId = Number(ctx.http?.authInfo?.extra?.keyId);
            if (!keyId) return text('Missing API key', true);
            const quota = await consumeQuota(getDb(), keyId);
            if (!quota.allowed) return text(`This API key has used its ${quota.limit} tool calls for today. The limit resets at 00:00 UTC.`, true);
            try {
                const result = JSON.stringify(await t.run(t.input.parse(args ?? {})));
                return text(result.length > MAX_TEXT ? result.slice(0, MAX_TEXT) + '… (truncated)' : result);
            }
            catch (err) {
                return text(toolErrorMessage(err), true);
            }
        }) as never);
    }
}
