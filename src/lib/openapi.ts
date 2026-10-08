import { z } from "zod";
import { DAILY_TOOL_CALLS } from "./apiKeys";
import { TOOLS, type DashboardTool } from "./tools";

// The public REST API (/api/v1/tools/{name}) as an OpenAPI 3.1 document, generated from the same Zod
// schemas the MCP server and the in-app assistant use, so the docs can't drift from the code.

export const API_BASE = '/api/v1/tools';
const SITE = 'https://ethereumdashboard.dev';

type JsonSchema = Record<string, unknown>;

// The JSON Schema of what a caller sends (defaults are optional, before transforms run)
export function inputSchema(t: DashboardTool): JsonSchema {
    const schema = z.toJSONSchema(t.input, { io: 'input', unrepresentable: 'any' }) as JsonSchema;
    delete schema.$schema;
    return schema;
}

export interface Parameter { name: string; type: string; required: boolean; description?: string; default?: unknown; options?: unknown[] }

// A flat list of a tool's top-level inputs, for the docs page
export function parameters(t: DashboardTool): Parameter[] {
    const schema = inputSchema(t) as { properties?: Record<string, JsonSchema>; required?: string[] };
    return Object.entries(schema.properties ?? {}).map(([name, p]) => ({
        name,
        type: Array.isArray(p.enum) ? 'string' : String(p.type ?? (p.anyOf ? 'string' : 'any')),
        required: (schema.required ?? []).includes(name),
        description: typeof p.description === 'string' ? p.description : undefined,
        default: p.default,
        options: Array.isArray(p.enum) ? p.enum : undefined
    }));
}

// An example body: required inputs filled with plausible values
export function exampleBody(t: DashboardTool): Record<string, unknown> {
    const samples: Record<string, unknown> = { address: 'vitalik.eth', nameOrAddress: 'vitalik.eth', coin: 'ethereum', collection: 'pudgypenguins', token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', hash: '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060' };
    const body: Record<string, unknown> = {};
    for (const p of parameters(t).filter(p => p.required)) body[p.name] = samples[p.name] ?? (p.options?.[0] ?? (p.type === 'number' || p.type === 'integer' ? 1 : 'example'));
    return body;
}

const errorResponse = (description: string) => ({ description, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } });

export function openApiDocument() {
    const paths = Object.fromEntries(TOOLS.map(t => [`${API_BASE}/${t.name}`, {
        post: {
            operationId: t.name,
            summary: t.title,
            description: t.description,
            tags: ['Tools'],
            requestBody: { required: false, content: { 'application/json': { schema: inputSchema(t), example: exampleBody(t) } } },
            responses: {
                200: { description: 'The result', content: { 'application/json': { schema: { type: 'object', properties: { data: { description: 'Tool output (shape depends on the tool)' } }, required: ['data'] } } } },
                400: errorResponse('Invalid input'),
                401: errorResponse('Missing or invalid API key'),
                429: errorResponse(`Daily quota used (${DAILY_TOOL_CALLS} calls per key, resets 00:00 UTC)`),
                502: errorResponse('A data source failed')
            }
        }
    }]));

    return {
        openapi: '3.1.0',
        info: {
            title: 'Ethereum Dashboard API',
            version: '1.0.0',
            description: `Read-only Ethereum data: wallets, ENS, gas, prices, staking, DeFi, layer 2s and more. Every endpoint is a POST with a JSON body. `
                + `Create a free API key at ${SITE}/mcp; each key gets ${DAILY_TOOL_CALLS} calls a day, shared with the MCP server. Nothing here can sign or send transactions.`
        },
        servers: [{ url: SITE }],
        security: [{ apiKey: [] }],
        tags: [{ name: 'Tools', description: 'The same tools as the MCP server' }],
        paths: {
            [API_BASE]: {
                get: {
                    operationId: 'listTools',
                    summary: 'List the tools',
                    tags: ['Tools'],
                    security: [],
                    responses: { 200: { description: 'Every tool with its input schema', content: { 'application/json': { schema: { type: 'object' } } } } }
                }
            },
            ...paths
        },
        components: {
            securitySchemes: { apiKey: { type: 'http', scheme: 'bearer', description: 'An API key from /mcp (starts with ethd_)' } },
            schemas: { Error: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] } }
        }
    };
}
