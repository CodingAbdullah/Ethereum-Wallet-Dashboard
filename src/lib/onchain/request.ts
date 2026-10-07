import { z } from "zod";
import { isAddress, isHex, type Address, type Hex } from "viem";
import { CHAIN_KEYS } from "../chains";
import type { TxCall } from "./simulate";

// The shape of a transaction request, shared by the simulation API and the browser.
// Values are wei as decimal strings, so they survive JSON.

const address = z.string().refine(v => isAddress(v, { strict: false }), 'Invalid address');

export const callSchema = z.object({
    to: address,
    data: z.string().refine(v => isHex(v) && v.length <= 100_000, 'Invalid calldata').optional(),
    value: z.string().regex(/^\d{1,78}$/, 'Value must be wei as a whole number').optional()
});

export const simulateRequest = z.object({
    chain: z.enum(CHAIN_KEYS),
    from: address,
    calls: z.array(callSchema).min(1).max(8),
    screen: z.array(address).max(3).optional()       // extra addresses to check, e.g. a send recipient
});

export type CallJson = z.infer<typeof callSchema>;
export type SimulateRequest = z.infer<typeof simulateRequest>;

export const toCall = (c: CallJson): TxCall => ({ to: c.to as Address, data: c.data as Hex | undefined, value: c.value ? BigInt(c.value) : undefined });
export const toCallJson = (c: TxCall): CallJson => ({ to: c.to, data: c.data, value: c.value !== undefined ? c.value.toString() : undefined });
