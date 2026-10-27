/**
 * Apply pending database migrations, then get out of the way.
 *
 * Run by the container before the Next server starts, so a deploy that adds a
 * table needs nothing but `git push`. Previously every schema change meant
 * pasting SQL into the Railway console by hand, which is easy to forget and
 * leaves the new code running against the old schema.
 *
 * Three things this deliberately does *not* do:
 *
 * - **It does not stop the site from booting.** A failed migration is logged
 *   loudly and the server starts anyway. Most of CAFÉTÉ — the shop, Stripe
 *   checkout, every content page — does not touch Postgres, and taking all of
 *   that down over the reviews table would be the wrong trade. The code that
 *   does use the database already degrades on its own.
 * - **It does not run without `DATABASE_URL`.** That is a valid configuration
 *   (local development, a preview without a database) and not an error.
 * - **It does not assume it is alone.** An advisory lock means two containers
 *   starting at once cannot apply the same migration twice.
 *
 * Plain JavaScript on purpose: it runs from the standalone output, outside the
 * Next build, where there is no TypeScript.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsFolder = join(root, "drizzle");

/**
 * Any 64-bit constant works; it only has to be the same in every container.
 * Derived from a name so it cannot collide with a lock taken by something else.
 */
const LOCK_KEY = BigInt.asIntN(
  64,
  BigInt("0x" + createHash("sha256").update("cafete:migrations").digest("hex").slice(0, 16)),
);

/**
 * Kept in step with `sslFor()` in src/db/index.ts — see the reasoning there.
 * Duplicated rather than imported because that module is TypeScript and pulls
 * in `server-only`, neither of which exists at this point.
 */
function sslFor(url) {
  try {
    const { hostname } = new URL(url);
    if (hostname.endsWith(".railway.internal")) return { rejectUnauthorized: false };
    if (hostname === "localhost" || hostname === "127.0.0.1") return undefined;
    return { rejectUnauthorized: true };
  } catch {
    return undefined;
  }
}

/** How many migrations exist on disk, for a one-line summary in the log. */
function migrationCount() {
  try {
    const journal = JSON.parse(readFileSync(join(migrationsFolder, "meta", "_journal.json"), "utf8"));
    return journal.entries?.length ?? 0;
  } catch {
    return 0;
  }
}

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.log("[migrate] DATABASE_URL not set — skipping.");
  process.exit(0);
}

const pool = new pg.Pool({
  connectionString: url,
  ssl: sslFor(url),
  max: 1,
  connectionTimeoutMillis: 15_000,
});

let locked = false;
try {
  const started = Date.now();

  // Blocks until any other container's migration finishes, rather than failing.
  await pool.query("SELECT pg_advisory_lock($1)", [LOCK_KEY.toString()]);
  locked = true;

  await migrate(drizzle(pool), { migrationsFolder });

  console.log(`[migrate] up to date (${migrationCount()} migrations) in ${Date.now() - started}ms`);
} catch (error) {
  /*
   * Loud, because nothing downstream will fail in an obvious way: the site
   * will serve normally and only the database-backed features will misbehave.
   */
  console.error("=".repeat(70));
  console.error("[migrate] MIGRATION FAILED — starting the server anyway.");
  console.error("[migrate] Database-backed features (reviews, admin list) may not work.");
  console.error(`[migrate] ${error instanceof Error ? error.stack : error}`);
  console.error("=".repeat(70));
} finally {
  if (locked) {
    await pool.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY.toString()]).catch(() => {});
  }
  await pool.end().catch(() => {});
}
