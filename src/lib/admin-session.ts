import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

/**
 * The signed-in admin, or null.
 *
 * Separate from `admin-auth.ts` because that module is pure — it does the
 * signing and verifying and nothing else — while this one reaches for the
 * request's cookies. Keeping them apart means the crypto can be exercised
 * without a request context.
 */
export async function currentAdmin(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * Guard for anything that changes data. Every mutating server action calls
 * this: a server action is a public endpoint, so rendering the page behind a
 * check is not on its own enough to protect the actions it contains.
 */
export async function requireAdmin(): Promise<string> {
  const email = await currentAdmin();
  if (!email) throw new Error("not-authenticated");
  return email;
}
