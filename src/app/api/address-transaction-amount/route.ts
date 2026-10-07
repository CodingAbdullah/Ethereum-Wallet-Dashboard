import { NextResponse } from "next/server";
import { formatEther } from "viem";
import { etherscan } from "@/lib/providers/etherscan";
import { getEthPrice } from "@/lib/providers/ethPrice";
import { withErrorHandling, parseBody } from "@/lib/api/route";
import { addressBody } from "@/lib/validation";

// ETH balance and its USD value for a wallet (Etherscan V2 free plan + free ETH price)
export const POST = withErrorHandling(async (request: Request) => {
    const { address } = await parseBody(request, addressBody);

    const [balance, price] = await Promise.all([
        etherscan<string>({ module: 'account', action: 'balance', address, tag: 'latest' }, 'eth', 30),
        getEthPrice()
    ]);

    const ethBalance = Number(formatEther(BigInt(balance.result)));

    return NextResponse.json({
        ethPrice: '$' + price.usd.toFixed(2),
        ethBalance: ethBalance + ' ETH',
        usdValue: '$' + (ethBalance * price.usd).toFixed(2)
    });
});
