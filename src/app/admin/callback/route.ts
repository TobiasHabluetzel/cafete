import { NextResponse } from "next/server";

import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  verifyMagicToken,
} from "@/lib/admin-auth";
import { resolveRequestOrigin } from "@/lib/request-origin";

/**
 * Lands here from the emailed link. Verifies the token, swaps it for a session
 * cookie and redirects — so the one-time token never stays in the address bar
 * to be copied out of a browser history or off a shared screen.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const email = verifyMagicToken(token);

  /*
   * Redirect targets are built from the forwarded headers, not `request.url`.
   * Behind Railway's proxy the latter is the container's own bind address, so
   * following a magic link landed the admin on https://0.0.0.0:8080/admin.
   * Exactly the bug that once sent Stripe's post-payment redirect to the same
   * dead host — `resolveRequestOrigin` exists for this and validates the host
   * against an allowlist, because the Host header is attacker-controlled.
   */
  const origin = resolveRequestOrigin(request);

  if (!email) {
    return NextResponse.redirect(`${origin}/admin?error=link`);
  }

  const session = createSessionToken(email);
  if (!session) {
    return NextResponse.redirect(`${origin}/admin?error=config`);
  }

  const response = NextResponse.redirect(`${origin}/admin`);
  response.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,                                   // never readable by script
    sameSite: "lax",                                  // survives the email hop
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
