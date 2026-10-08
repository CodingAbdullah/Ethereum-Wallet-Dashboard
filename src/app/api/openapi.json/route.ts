import { NextResponse } from "next/server";
import { openApiDocument } from "@/lib/openapi";

export const dynamic = 'force-static';

// The OpenAPI 3.1 document for the public API (generated from the tool registry's Zod schemas)
export function GET() {
    return NextResponse.json(openApiDocument(), { headers: { 'access-control-allow-origin': '*' } });
}
