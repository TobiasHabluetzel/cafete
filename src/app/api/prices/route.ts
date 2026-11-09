import { NextResponse } from "next/server";

import { getCachedPackPrices } from "@/lib/pricing";

/** Pack prices for the cart drawer. Public data, and the same Stripe prices the shop shows. */
export const dynamic = "force-dynamic";

export async function GET() {
  const prices = await getCachedPackPrices();
  return NextResponse.json(
    { prices },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
  );
}
