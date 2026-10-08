import { NextResponse } from "next/server";
import { TOOLS } from "@/lib/tools";
import { API_BASE, inputSchema } from "@/lib/openapi";

export const dynamic = 'force-static';

// GET /api/v1/tools: every tool with its input schema (no key needed)
export function GET() {
    return NextResponse.json({
        tools: TOOLS.map(t => ({ name: t.name, title: t.title, description: t.description, endpoint: `${API_BASE}/${t.name}`, input: inputSchema(t) }))
    });
}
