import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { withErrorHandling } from "@/lib/api/route";
import { rocketContract } from "@/lib/staking";

// GET: the current Rocket Pool deposit pool (Rocket Pool moves it on upgrades, so it is read from RocketStorage)
const getDepositPool = unstable_cache(() => rocketContract('rocketDepositPool'), ['rocket-deposit-pool'], { revalidate: 3600 });

export const GET = withErrorHandling(async () => {
    return NextResponse.json({ rocketDepositPool: await getDepositPool() });
});
