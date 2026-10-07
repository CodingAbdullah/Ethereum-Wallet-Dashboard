import { withErrorHandling } from "@/lib/api/route";
import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { listWatchedWallets } from "@/lib/accounts";
import { getPortfolio } from "@/lib/portfolio";
import { toCsv } from "@/lib/csv";
import { utcDay } from "@/lib/snapshots";
import { hasMarketValue } from "@/lib/chains";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const HEADER = ['wallet', 'label', 'network', 'symbol', 'name', 'token_address', 'balance', 'usd_price', 'usd_value'];

// GET: the signed-in user's holdings as a CSV file, one row per token per wallet
export const GET = withErrorHandling(async () => {
    const { address } = await requireSession();
    const portfolio = await getPortfolio(await listWatchedWallets(getDb(), address));

    const rows = portfolio.wallets.flatMap(({ wallet, tokens }) => 'data' in tokens
        ? tokens.data.map(t => [wallet.address, wallet.label, wallet.chain, t.symbol, t.name, t.tokenAddress, t.balance, t.usdPrice, hasMarketValue(wallet.chain) ? t.usdValue.toFixed(2) : 0])
        // Keep a row for wallets whose holdings failed to load, so the export doesn't silently drop them
        : [[wallet.address, wallet.label, wallet.chain, '', 'Holdings unavailable: ' + tokens.error, '', '', '', '']]);

    return new Response(toCsv(HEADER, rows), {
        headers: {
            'content-type': 'text/csv; charset=utf-8',
            'content-disposition': `attachment; filename="portfolio-${utcDay()}.csv"`,
            'cache-control': 'private, no-store'
        }
    });
});
