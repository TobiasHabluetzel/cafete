import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Admin access by magic link.
 *
 * No passwords and no user table. Two founders need to approve reviews
 * occasionally; a password would be shared between them, written down, and
 * never rotated. A link to an address on an allowlist is both less to build and
 * harder to lose.
 *
 * Nothing is stored. The magic token and the session are both HMAC-signed
 * strings carrying their own expiry, so there is no sessions table to keep and
 * no cleanup job. The trade is that a session cannot be revoked individually —
 * **changing `ADMIN_SECRET` invalidates every link and every session at once**,
 * which is the escape hatch if a laptop goes missing.
 */

const MAGIC_TTL_MS = 15 * 60 * 1000;      // long enough to find the email
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE = "cafete_admin";

function secret(): string | undefined {
  const value = process.env.ADMIN_SECRET?.trim();
  // A short secret is worse than none, because it looks configured.
  return value && value.length >= 32 ? value : undefined;
}

/**
 * Whether links can be signed at all. Says nothing about *who* may sign in —
 * that is `isAllowedAdmin` in `lib/admins.ts`, which reads the database and so
 * cannot live in this module.
 */
export function isSigningConfigured() {
  return Boolean(secret());
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** Constant-time compare, so a wrong token cannot be guessed byte by byte. */
function signatureMatches(expected: string, actual: string) {
  const a = Buffer.from(expected);
  const b = Buffer.from(actual);
  return a.length === b.length && timingSafeEqual(a, b);
}

function encode(kind: "magic" | "session", email: string, expiresAt: number, key: string) {
  const payload = `${kind}:${email.toLowerCase()}:${expiresAt}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload, key)}`;
}

function decode(kind: "magic" | "session", token: string): string | null {
  const key = secret();
  if (!key || !token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }

  if (!signatureMatches(sign(payload, key), signature)) return null;

  const [tokenKind, email, expiry] = payload.split(":");
  if (tokenKind !== kind) return null;              // a magic link is not a session
  if (!email || !Number.isFinite(Number(expiry))) return null;
  if (Date.now() > Number(expiry)) return null;

  /*
   * Returns who the token says they are, not whether they are still allowed in.
   * Authorisation is checked per request in `currentAdmin()`, which can reach
   * the database — so removing an admin takes effect immediately rather than
   * when their cookie expires, and this module stays pure and synchronous.
   */
  return email;
}

/** The caller must have checked the address is allowed before calling this. */
export function createMagicToken(email: string): string | null {
  const key = secret();
  if (!key) return null;
  return encode("magic", email, Date.now() + MAGIC_TTL_MS, key);
}

/**
 * Verify a magic link. Note it is *not* single use — within its 15 minutes the
 * same link works twice. Making it one-shot would need a store of spent tokens,
 * which is the one table this design avoids. For two founders and a
 * quarter-hour window that is the right trade; add a nonce table if the
 * audience ever widens.
 */
export function verifyMagicToken(token: string): string | null {
  return decode("magic", token);
}

export function createSessionToken(email: string): string | null {
  const key = secret();
  if (!key) return null;
  return encode("session", email, Date.now() + SESSION_TTL_MS, key);
}

export function verifySessionToken(token: string | undefined): string | null {
  return token ? decode("session", token) : null;
}

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
