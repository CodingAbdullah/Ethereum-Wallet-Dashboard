import { NextResponse } from "next/server";
import { z } from "zod";
import type { Address } from "viem";
import { parseBody, withErrorHandling } from "@/lib/api/route";
import { HttpError } from "@/lib/api/errors";
import { CHAIN_KEYS, CHAINS } from "@/lib/chains";
import { addressSchema } from "@/lib/validation";
import { chainClient } from "@/lib/providers/rpc";
import { getContractAbi } from "@/lib/onchain/contractAbi";

export const dynamic = 'force-dynamic';

// POST: a verified contract's functions (Etherscan or Sourcify, following EIP-1967 proxies)
export const POST = withErrorHandling(async (request: Request) => {
    const { chain, address } = await parseBody(request, z.object({ chain: z.enum(CHAIN_KEYS), address: addressSchema }));
    const client = chainClient(chain);
    const code = await client.getCode({ address: address as Address });
    if (!code || code === '0x') throw new HttpError(404, `There is no contract at this address on ${CHAINS[chain].name}`);
    const abi = await getContractAbi(client, chain, address as Address);
    if (!abi) throw new HttpError(404, `This contract isn't verified on Etherscan or Sourcify, so its functions are unknown`);
    return NextResponse.json(abi);
});
