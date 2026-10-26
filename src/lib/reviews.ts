import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { getDb, isDatabaseConfigured } from "@/db";
import { PRODUCT_SUBJECT, reviews, type Review } from "@/db/schema";

/**
 * Reading and writing reviews.
 *
 * Every function here tolerates there being no database. `DATABASE_URL` is unset
 * locally and during `next build`, and a review section is not worth taking a
 * page down for — callers get an empty result and render nothing.
 */

/** What the public list needs. Never exposes the email or the IP hash. */
export type PublicReview = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: Date;
  reply: { body: string; at: Date } | null;
};

export type ReviewSummary = {
  count: number;
  /** Mean of approved ratings, one decimal. Null when there are none. */
  average: number | null;
  /** How many approved reviews gave each rating, 1–5. */
  distribution: Record<number, number>;
};

/**
 * Below this many approved reviews the section stays hidden.
 *
 * An empty or near-empty review block reads worse than none at all — "1
 * Bewertung" invites the question of whether anyone buys this. The *form* is
 * not gated, or the first three could never be collected.
 */
export const MIN_PUBLIC_REVIEWS = 3;

function toPublic(row: Review): PublicReview {
  return {
    id: row.id,
    authorName: row.authorName,
    rating: row.rating,
    body: row.body,
    createdAt: row.createdAt,
    reply: row.replyBody && row.replyAt ? { body: row.replyBody, at: row.replyAt } : null,
  };
}

/** Approved reviews for a subject, newest first. */
export async function listApprovedReviews(
  subject: string = PRODUCT_SUBJECT,
  limit = 20,
): Promise<PublicReview[]> {
  if (!isDatabaseConfigured()) return [];

  try {
    const rows = await getDb()
      .select()
      .from(reviews)
      .where(and(eq(reviews.subject, subject), eq(reviews.status, "approved")))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
    return rows.map(toPublic);
  } catch (error) {
    // A reporting query must never take the product page down.
    console.error("[reviews] list failed:", error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Count, mean and star distribution over **approved** reviews only.
 *
 * Pending and rejected rows are excluded here rather than filtered by the
 * caller, so there is no route by which an unapproved rating reaches a public
 * average or the `aggregateRating` in structured data.
 */
export async function getReviewSummary(
  subject: string = PRODUCT_SUBJECT,
): Promise<ReviewSummary> {
  const empty: ReviewSummary = { count: 0, average: null, distribution: {} };
  if (!isDatabaseConfigured()) return empty;

  try {
    const rows = await getDb()
      .select({ rating: reviews.rating, n: sql<number>`count(*)::int` })
      .from(reviews)
      .where(and(eq(reviews.subject, subject), eq(reviews.status, "approved")))
      .groupBy(reviews.rating);

    const distribution: Record<number, number> = {};
    let count = 0;
    let total = 0;
    for (const row of rows) {
      distribution[row.rating] = row.n;
      count += row.n;
      total += row.rating * row.n;
    }

    return {
      count,
      average: count > 0 ? Math.round((total / count) * 10) / 10 : null,
      distribution,
    };
  } catch (error) {
    console.error("[reviews] summary failed:", error instanceof Error ? error.message : error);
    return empty;
  }
}

/**
 * Store a new review. Always lands as `pending` — the column default does this,
 * and nothing here overrides it.
 */
export async function createReview(input: {
  subject?: string;
  locale: string;
  authorName: string;
  authorEmail?: string;
  rating: number;
  body: string;
  ipHash?: string;
}): Promise<{ ok: true } | { ok: false; reason: "not-configured" | "rejected" }> {
  if (!isDatabaseConfigured()) return { ok: false, reason: "not-configured" };

  try {
    await getDb().insert(reviews).values({
      subject: input.subject ?? PRODUCT_SUBJECT,
      locale: input.locale,
      authorName: input.authorName.trim(),
      authorEmail: input.authorEmail?.trim() || null,
      rating: input.rating,
      body: input.body.trim(),
      ipHash: input.ipHash ?? null,
    });
    return { ok: true };
  } catch (error) {
    // The check constraints are the last line of defence behind the route's own
    // validation; a rejection here means something got past it.
    console.error("[reviews] insert rejected:", error instanceof Error ? error.message : error);
    return { ok: false, reason: "rejected" };
  }
}

/**
 * How many reviews this address has submitted in the last day, used to rate
 * limit. Counts every status, so spamming and then being rejected does not
 * reset the allowance.
 */
export async function recentCountByIp(ipHash: string, hours = 24): Promise<number> {
  if (!isDatabaseConfigured() || !ipHash) return 0;

  try {
    const [row] = await getDb()
      .select({ n: sql<number>`count(*)::int` })
      .from(reviews)
      .where(
        and(
          eq(reviews.ipHash, ipHash),
          sql`${reviews.createdAt} > now() - make_interval(hours => ${hours})`,
        ),
      );
    return row?.n ?? 0;
  } catch (error) {
    // Fail open: a broken rate-limit query must not block genuine reviews.
    console.error("[reviews] rate-limit check failed:", error instanceof Error ? error.message : error);
    return 0;
  }
}
