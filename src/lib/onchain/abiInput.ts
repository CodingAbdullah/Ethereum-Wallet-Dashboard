import { getAddress, isAddress, isHex, type AbiFunction, type AbiParameter } from "viem";

// Turns what someone types into a function argument for its ABI type, and results back into text.
// Arrays and tuples are entered as JSON, e.g. ["0xabc…", "0xdef…"] or [1, "0x…"].

export class InputError extends Error {}

function parseValue(param: AbiParameter, value: unknown): unknown {
    const type = param.type;
    const array = type.match(/^(.*)\[(\d*)\]$/);
    if (array) {
        if (!Array.isArray(value)) throw new InputError(`${param.name || type}: expected a JSON array`);
        if (array[2] && value.length !== Number(array[2])) throw new InputError(`${param.name || type}: expected ${array[2]} items`);
        return value.map(v => parseValue({ ...param, type: array[1] } as AbiParameter, v));
    }
    if (type === 'tuple') {
        const components = (param as { components?: readonly AbiParameter[] }).components ?? [];
        const values = Array.isArray(value) ? value : components.map(c => (value as Record<string, unknown>)?.[c.name ?? '']);
        if (values.length !== components.length) throw new InputError(`${param.name || 'tuple'}: expected ${components.length} values`);
        return Object.fromEntries(components.map((c, i) => [c.name ?? String(i), parseValue(c, values[i])]));
    }
    const text = String(value ?? '').trim();
    if (type === 'address') {
        if (!isAddress(text, { strict: false })) throw new InputError(`${param.name || 'address'}: not a valid address`);
        return getAddress(text);
    }
    if (type === 'bool') {
        if (!/^(true|false|1|0)$/i.test(text)) throw new InputError(`${param.name || 'bool'}: enter true or false`);
        return /^(true|1)$/i.test(text);
    }
    if (/^u?int\d*$/.test(type)) {
        if (!/^-?\d+$/.test(text)) throw new InputError(`${param.name || type}: enter a whole number (raw units, no decimals)`);
        const n = BigInt(text);
        if (type.startsWith('uint') && n < BigInt(0)) throw new InputError(`${param.name || type}: can't be negative`);
        return n;
    }
    if (/^bytes\d*$/.test(type)) {
        if (!isHex(text)) throw new InputError(`${param.name || type}: enter hex starting with 0x`);
        const size = type.slice(5);
        if (size && text.length !== 2 + Number(size) * 2) throw new InputError(`${param.name || type}: must be exactly ${size} bytes`);
        return text;
    }
    if (type === 'string') return String(value ?? '');
    throw new InputError(`Unsupported type ${type}`);
}

export function parseArgs(fn: AbiFunction, raw: string[]): unknown[] {
    return fn.inputs.map((param, i) => {
        const text = raw[i] ?? '';
        const complex = /\[\d*\]$/.test(param.type) || param.type === 'tuple';
        if (!complex) return parseValue(param, text);
        try { return parseValue(param, JSON.parse(text)); }
        catch (err) { throw err instanceof InputError ? err : new InputError(`${param.name || param.type}: expected JSON`); }
    });
}

// Results as readable JSON (bigints as plain numbers in strings)
export function formatResult(value: unknown): string {
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') return String(value);
    return JSON.stringify(value, (_k, v) => typeof v === 'bigint' ? v.toString() : v, 2);
}

export const isRead = (fn: AbiFunction) => fn.stateMutability === 'view' || fn.stateMutability === 'pure';
