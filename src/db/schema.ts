import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Reviews are held back until a founder approves them, which is the decision the
 * whole feature is built around: nothing a stranger types reaches the site on its
 * own. That makes spam an inbox problem rather than a public one, and it means
 * there is no takedown flow, no "removed" placeholder and no cache purge on
 * delete to get wrong.
 *
 * `rejected` is kept rather than deleted so the same person cannot be moderated
 * twice over, and so there is a record if someone disputes it.
 */
export const reviewStatus = pgEnum("review_status", ["pending", "approved", "rejected"]);

/**
 * One table, on purpose.
 *
 * - The brand's reply is two columns rather than a replies table. Only CAFÉTÉ
 *   replies, and only once per review; a thread table would be speculation.
 * - There is no sessions or tokens table. Admin magic links are HMAC-signed and
 *   carry their own expiry, and the session is a signed cookie, so neither needs
 *   storage. Rotating the signing secret invalidates everything, which is the
 *   escape hatch if a laptop goes missing.
 */
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /**
     * What is being reviewed, as "type:slug" — "product:cafete" today.
     *
     * A text key rather than a foreign key to a products table, because there is
     * one product and no such table. It costs nothing now and means a monthly
     * portrait could take comments later without a migration.
     */
    subject: text("subject").notNull(),

    /** Which language it was written in, so the list can match the reader. */
    locale: varchar("locale", { length: 5 }).notNull(),

    authorName: text("author_name").notNull(),

    /**
     * Never published. Used to reply privately, and to recognise a repeat
     * reviewer during moderation. Optional, so leaving it blank is allowed.
     */
    authorEmail: text("author_email"),

    rating: smallint("rating").notNull(),
    body: text("body").notNull(),

    status: reviewStatus("status").notNull().default("pending"),

    replyBody: text("reply_body"),
    replyAt: timestamp("reply_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),

    /**
     * Salted hash of the submitter's IP, for rate limiting only — never the
     * address itself. Cleared by a retention job rather than kept forever, since
     * it is personal data that stops being useful within the hour.
     */
    ipHash: text("ip_hash"),
  },
  (table) => [
    /*
     * These live in the database rather than only in the route handler because
     * the route handler is one caller among several — a migration, a fix applied
     * by hand, a future import. Bad rows are much harder to find later than a
     * rejected insert is now.
     */
    check("reviews_rating_range", sql`${table.rating} between 1 and 5`),
    check(
      "reviews_body_length",
      sql`char_length(${table.body}) between 10 and 2000`,
    ),
    check(
      "reviews_author_name_length",
      sql`char_length(${table.authorName}) between 2 and 80`,
    ),
    // Duplicates the locale list in `src/i18n/routing.ts`. Worth it: a typo'd
    // locale would render nowhere and be invisible until someone went looking.
    check("reviews_locale", sql`${table.locale} in ('de', 'en')`),
    // A reply and its timestamp are set together or not at all.
    check(
      "reviews_reply_paired",
      sql`(${table.replyBody} is null) = (${table.replyAt} is null)`,
    ),

    // The public list: approved reviews for one subject, newest first.
    index("reviews_public_idx").on(table.subject, table.status, table.createdAt),
    // The moderation queue: everything pending, oldest first.
    index("reviews_moderation_idx").on(table.status, table.createdAt),
  ],
);

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

/** The only subject there is today. */
export const PRODUCT_SUBJECT = "product:cafete";
