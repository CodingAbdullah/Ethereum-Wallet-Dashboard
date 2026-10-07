import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { verifyApiKey } from "@/lib/apiKeys";
import { MCP_INSTRUCTIONS, registerDashboardTools } from "@/lib/mcp";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const mcp = createMcpHandler(server => registerDashboardTools(server, getDb), {
    serverInfo: { name: 'ethereum-dashboard', version: '1.0.0' },
    instructions: MCP_INSTRUCTIONS
});

// API key from "Authorization: Bearer <key>", or ?key=<key> for clients that can't set headers
const handler = withMcpAuth(mcp, async (request, bearer) => {
    if (!isDatabaseConfigured()) return undefined;
    const key = bearer ?? new URL(request.url).searchParams.get('key');
    const verified = await verifyApiKey(getDb(), key);
    if (!verified) return undefined;
    return { token: key!, clientId: 'api-key-' + verified.keyId, scopes: ['read'], extra: { keyId: verified.keyId, userAddress: verified.userAddress } };
}, { required: true });

export { handler as GET, handler as POST, handler as DELETE };
