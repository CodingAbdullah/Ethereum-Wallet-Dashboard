import { NextResponse } from "next/server";
import { getValidatorQueue } from "@/lib/validators";
import { withErrorHandling } from "@/lib/api/route";

export const GET = withErrorHandling(async () => {
    return NextResponse.json(await getValidatorQueue());
});
