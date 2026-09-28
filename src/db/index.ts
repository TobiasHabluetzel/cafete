import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

/**
 * The Postgres connection, lazily.
 *
 * Lazy for the same reason the Stripe client is: `DATABASE_URL` is absent in
 * local development and during `next build`, and a module-level connection would
 * turn that into a build failure rather than a feature that is simply switched
 * off. `isDatabaseConfigured()` lets callers degrade instead — the review section
 * hides itself rather than erroring.
 */
let pool: Pool | undefined;
let client: ReturnType<typeof drizzle<typeof schema>> | undefined;

function connectionString(): string | undefined {
  const raw = process.env.DATABASE_URL?.trim();
  return raw && raw.length > 0 ? raw : undefined;
}

export function isDatabaseConfigured() {
  return Boolean(connectionString());
}

/**
 * Railway exposes Postgres two ways, and they need different TLS handling.
 *
 * `*.railway.internal` is the private network: traffic never leaves the project,
 * costs no egress, and is not served a publicly-valid certificate — so verifying
 * one fails. The public `*.proxy.rlwy.net` host is reachable from a laptop and
 * does present a real certificate.
 *
 * Verification is therefore skipped *only* on the internal hostname, where the
 * network itself is the boundary. Doing it unconditionally would silently accept
 * a forged certificate on the public route, which is exactly where it matters.
 */
function sslFor(url: string) {
  try {
    const { hostname } = new URL(url);
    if (hostname.endsWith(".railway.internal")) return { rejectUnauthorized: false };
    if (hostname === "localhost" || hostname === "127.0.0.1") return undefined;
    return { rejectUnauthorized: true };
  } catch {
    return undefined;
  }
}

export function getDb() {
  if (client) return client;

  const url = connectionString();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Guard calls with isDatabaseConfigured() so the " +
        "feature degrades instead of throwing.",
    );
  }

  /*
   * One pool per process. In development Next re-evaluates modules on every hot
   * reload, so without the global the pools accumulate until Postgres refuses
   * new connections — which looks like a database outage and is not one.
   */
  const globalForDb = globalThis as typeof globalThis & { __cafetePool?: Pool };

  pool =
    globalForDb.__cafetePool ??
    new Pool({
      connectionString: url,
      ssl: sslFor(url),
      // Small on purpose: one container, a handful of review queries a day.
      // A large pool just holds connections Postgres could give someone else.
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

  if (process.env.NODE_ENV !== "production") globalForDb.__cafetePool = pool;

  client = drizzle(pool, { schema });
  return client;
}

export { schema };
