import { NextResponse } from "next/server";

import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  verifyMagicToken,
} from "@/lib/admin-auth";

/**
 * Lands here from the emailed link. Verifies the token, swaps it for a session
 * cookie and redirects — so the one-time token never stays in the address bar
 * to be copied out of a browser history or off a shared screen.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const email = verifyMagicToken(token);

  if (!email) {
    return NextResponse.redirect(new URL("/admin?error=link", request.url));
  }

  const session = createSessionToken(email);
  if (!session) {
    return NextResponse.redirect(new URL("/admin?error=config", request.url));
  }

  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,                                   // never readable by script
    sameSite: "lax",                                  // survives the email hop
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
