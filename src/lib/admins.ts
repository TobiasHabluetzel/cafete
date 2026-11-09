import "server-only";

import { createHash } from "node:crypto";

import { eq } from "drizzle-orm";

import { getDb, isDatabaseConfigured } from "@/db";
import { adminEmails, type AdminEmail } from "@/db/schema";

/**
 * Who may sign in to the admin.
 *
 * Two sources, and the order matters:
 *
 * 1. `ADMIN_EMAILS` — the break-glass list. Cannot be changed from the UI, so
 *    no sequence of clicks locks everyone out, and it still works when the
 *    database is unreachable.
 * 2. the `admin_emails` table — managed on the admin page.
 * 3. `OWNER_ADMIN_HASHES` below — owners who may not have access to the hosting
 *    settings. Hashed, because this repository is public.
 *
 * Checked on every request rather than baked into the session, so removing
 * someone takes effect immediately instead of whenever their cookie expires.
 */

/** SHA-256 of the lowercased address. Remove a line to revoke that access. */
const OWNER_ADMIN_HASHES = [
  "0541a38d4b9dde1810192681d26b714ba3914276f0e84f82144fa5ffb88f0972",
];

function isOwnerAdmin(email: string): boolean {
  const hash = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  return OWNER_ADMIN_HASHES.includes(hash);
}

/** The env list, lowercased. */
export function bootstrapAdmins(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isBootstrapAdmin(email: string): boolean {
  return bootstrapAdmins().includes(email.trim().toLowerCase());
}

/** Admins added through the UI, oldest first. */
export async function listManagedAdmins(): Promise<AdminEmail[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    return await getDb().select().from(adminEmails).orderBy(adminEmails.createdAt);
  } catch (error) {
    console.error("[admins] list failed:", error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * May this address sign in?
 *
 * The env list is consulted first and without touching the database, so a
 * database outage cannot lock out the founders.
 */
export async function isAllowedAdmin(email: string): Promise<boolean> {
  const normalised = email.trim().toLowerCase();
  if (!normalised) return false;
  if (isBootstrapAdmin(normalised) || isOwnerAdmin(normalised)) return true;
  if (!isDatabaseConfigured()) return false;

  try {
    const rows = await getDb()
      .select({ email: adminEmails.email })
      .from(adminEmails)
      .where(eq(adminEmails.email, normalised))
      .limit(1);
    return rows.length > 0;
  } catch (error) {
    // Fail closed: an unreadable list must not grant access.
    console.error("[admins] lookup failed:", error instanceof Error ? error.message : error);
    return false;
  }
}

export async function addAdmin(email: string, addedBy: string): Promise<boolean> {
  const normalised = email.trim().toLowerCase();
  if (!normalised || !isDatabaseConfigured()) return false;
  // Already covered by the env list — adding a row would be noise.
  if (isBootstrapAdmin(normalised)) return false;

  try {
    await getDb()
      .insert(adminEmails)
      .values({ email: normalised, addedBy: addedBy.toLowerCase() })
      .onConflictDoNothing();
    return true;
  } catch (error) {
    console.error("[admins] add failed:", error instanceof Error ? error.message : error);
    return false;
  }
}

export async function removeAdmin(email: string): Promise<boolean> {
  const normalised = email.trim().toLowerCase();
  if (!normalised || !isDatabaseConfigured()) return false;

  try {
    await getDb().delete(adminEmails).where(eq(adminEmails.email, normalised));
    return true;
  } catch (error) {
    console.error("[admins] remove failed:", error instanceof Error ? error.message : error);
    return false;
  }
}
