import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";
import { isValidEmail } from "@/lib/email";
import { createReview, recentCountByIp } from "@/lib/reviews";

/**
 * Submit a review. It is stored as `pending` and published only once a founder
 * approves it, so nothing here reaches the site on its own.
 *
 * Validation mirrors the table's check constraints exactly. The database is the
 * backstop, not the first line: a value rejected here never reaches it, and
 * anything that does get through gets a clear 422 rather than a 500 from a
 * constraint violation.
 */

/** Same bounds as the CHECK constraints in `src/db/schema.ts`. */
const LIMITS = {
  name: { min: 2, max: 80 },
  body: { min: 10, max: 2000 },
  rating: { min: 1, max: 5 },
} as const;

/** A form filled in faster than this was not filled in by a person. */
const MIN_FILL_MS = 3_000;

/** Per address, per day. Generous — a household can review more than once. */
const MAX_PER_IP_PER_DAY = 3;

/**
 * Hash of the submitter's address, salted so the table cannot be turned back
 * into a list of who visited.
 *
 * Without `REVIEW_IP_SALT` no hash is stored at all, and rate limiting is off.
 * An unsalted hash of an IPv4 address is reversible in seconds by brute force,
 * so storing one would be worse than storing nothing: it would look like a
 * safeguard while providing none.
 */
function hashIp(request: Request): string | undefined {
  const salt = process.env.REVIEW_IP_SALT?.trim();
  if (!salt) return undefined;

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  if (!ip) return undefined;

  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { name, email, rating, body, locale, website, startedAt } = (payload ?? {}) as {
    name?: unknown;
    email?: unknown;
    rating?: unknown;
    body?: unknown;
    locale?: unknown;
    /** Honeypot. Hidden from people, irresistible to form-filling bots. */
    website?: unknown;
    /** When the form was rendered, for the fill-time check. */
    startedAt?: unknown;
  };

  /*
   * Both spam checks answer 200 with a success-shaped body on purpose. Telling a
   * bot which signal caught it is free information for whoever tunes it next,
   * and a human will never see either branch.
   */
  if (typeof website === "string" && website.trim().length > 0) {
    console.warn("[reviews] honeypot triggered");
    return NextResponse.json({ ok: true });
  }

  const started = Number(startedAt);
  if (Number.isFinite(started) && Date.now() - started < MIN_FILL_MS) {
    console.warn("[reviews] submitted in under the minimum fill time");
    return NextResponse.json({ ok: true });
  }

  if (typeof name !== "string" || name.trim().length < LIMITS.name.min || name.trim().length > LIMITS.name.max) {
    return NextResponse.json({ error: "invalid-name" }, { status: 422 });
  }
  if (email !== undefined && email !== null && email !== "" && !isValidEmail(email)) {
    return NextResponse.json({ error: "invalid-email" }, { status: 422 });
  }

  const ratingValue = Number(rating);
  if (!Number.isInteger(ratingValue) || ratingValue < LIMITS.rating.min || ratingValue > LIMITS.rating.max) {
    return NextResponse.json({ error: "invalid-rating" }, { status: 422 });
  }

  if (typeof body !== "string" || body.trim().length < LIMITS.body.min || body.trim().length > LIMITS.body.max) {
    return NextResponse.json({ error: "invalid-body" }, { status: 422 });
  }

  const localeValue =
    typeof locale === "string" && (routing.locales as readonly string[]).includes(locale)
      ? locale
      : routing.defaultLocale;

  const ipHash = hashIp(request);
  if (ipHash && (await recentCountByIp(ipHash)) >= MAX_PER_IP_PER_DAY) {
    return NextResponse.json({ error: "too-many" }, { status: 429 });
  }

  const result = await createReview({
    locale: localeValue,
    authorName: name,
    authorEmail: typeof email === "string" ? email : undefined,
    rating: ratingValue,
    body,
    ipHash,
  });

  if (!result.ok) {
    console.error(`[reviews] not stored: ${result.reason}`);
    return NextResponse.json({ error: result.reason }, { status: 503 });
  }

  // "Received", not "published" — the UI must not imply it is live.
  return NextResponse.json({ ok: true, status: "pending" }, { status: 201 });
}
