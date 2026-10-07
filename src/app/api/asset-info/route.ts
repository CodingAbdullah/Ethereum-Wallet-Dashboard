import { NextResponse } from "next/server";
import { z } from "zod";
import { erc20Abi, formatUnits, isAddress, type Address } from "viem";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { CHAIN_KEYS, chainInfo } from "@/lib/chains";
import { addressSchema } from "@/lib/validation";
import { chainClient } from "@/lib/providers/rpc";

export const dynamic = 'force-dynamic';

const body = z.object({
    chain: z.enum(CHAIN_KEYS),
    owner: addressSchema,
    token: z.string().refine(v => isAddress(v, { strict: false }), 'Invalid token address').optional()
});

// POST: the owner's balance of the native coin or an ERC20 token, with its symbol and decimals (read on-chain)
export const POST = withErrorHandling(async (request: Request) => {
    const { chain, owner, token } = await parseBody(request, body);
    const client = chainClient(chain);
    if (!token) {
        const balance = await client.getBalance({ address: owner as Address });
        return NextResponse.json({ symbol: chainInfo(chain).native, name: chainInfo(chain).native, decimals: 18, balance: formatUnits(balance, 18), raw: balance.toString() });
    }
    // Four plain reads (no Multicall3 needed, so this works on any chain)
    const read = <T>(functionName: 'symbol' | 'name' | 'decimals' | 'balanceOf', args?: readonly [Address]) =>
        client.readContract({ address: token as Address, abi: erc20Abi, functionName, args } as never).then(result => ({ status: 'success' as const, result: result as T }), () => ({ status: 'failure' as const, result: undefined }));
    const [symbol, name, decimals, balance] = await Promise.all([read<string>('symbol'), read<string>('name'), read<number>('decimals'), read<bigint>('balanceOf', [owner as Address])]);
    if (decimals.status !== 'success' || balance.status !== 'success') throw new HttpError(404, 'That address is not an ERC20 token on ' + chainInfo(chain).name);
    return NextResponse.json({
        symbol: symbol.status === 'success' ? symbol.result : '?',
        name: name.status === 'success' ? name.result : 'Unknown token',
        decimals: decimals.result!,
        balance: formatUnits(balance.result!, decimals.result!),
        raw: balance.result.toString()
    });
});
