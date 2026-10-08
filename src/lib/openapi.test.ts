import { describe, expect, it } from "vitest";
import { TOOLS } from "./tools";
import { API_BASE, exampleBody, openApiDocument, parameters } from "./openapi";

describe("openapi", () => {
    const doc = openApiDocument();

    it("documents every tool as a POST with its input schema", () => {
        expect(doc.openapi).toBe('3.1.0');
        for (const t of TOOLS) {
            const op = (doc.paths as Record<string, { post?: { operationId: string; requestBody: { content: { 'application/json': { schema: { type: string } } } } } }>)[`${API_BASE}/${t.name}`].post!;
            expect(op.operationId).toBe(t.name);
            expect(op.requestBody.content['application/json'].schema.type).toBe('object');
        }
        // Plain JSON (no functions or undefined), so it serialises as-is
        expect(JSON.parse(JSON.stringify(doc))).toEqual(doc);
    });

    it("describes every parameter and gives examples the schemas accept", () => {
        for (const t of TOOLS) {
            for (const p of parameters(t)) expect(p.description, `${t.name}.${p.name}`).toBeTruthy();
            expect(t.input.safeParse(exampleBody(t)).success, t.name).toBe(true);
        }
    });
});
