import { NextResponse } from "next/server";

/**
 * Railway healthcheck target. Kept outside `[locale]` on purpose — the proxy
 * matcher skips `/api`, so this never gets locale-redirected.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok" });
}
