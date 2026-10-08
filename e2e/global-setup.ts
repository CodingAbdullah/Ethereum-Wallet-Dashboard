import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setupChain, startAnvil } from "./chain";

// Starts the local Ethereum and Base chains (ports match playwright.config.ts) and writes the
// deployed addresses for the tests. Returns the teardown that stops them.
export const STATE_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '.state.json');
export const PORTS = { eth: 8645, base: 8646 } as const;

export default async function globalSetup() {
    const chains = await Promise.all([startAnvil(PORTS.eth, 1), startAnvil(PORTS.base, 8453)]);
    try {
        const [eth, base] = await Promise.all([setupChain(PORTS.eth, 1), setupChain(PORTS.base, 8453)]);
        fs.writeFileSync(STATE_FILE, JSON.stringify({ eth, base }, null, 2));
    }
    catch (err) {
        chains.forEach(c => c.kill());
        throw err;
    }
    return async () => { chains.forEach(c => c.kill()); fs.rmSync(STATE_FILE, { force: true }); };
}
