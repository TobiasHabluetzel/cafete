"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { site } from "@/config/site";
import {
  createMagicToken,
  isAdminConfigured,
  isAdminEmail,
  SESSION_COOKIE,
} from "@/lib/admin-auth";
import { isValidEmail, sendMail } from "@/lib/email";
import { setReviewReply, setReviewStatus } from "@/lib/reviews";
import { requireAdmin } from "@/lib/admin-session";

/**
 * Republish the product page.
 *
 * Reviews render there behind an hourly revalidation, which would mean a
 * moderator approving something and then not seeing it. Revalidating the route
 * pattern covers both locales in one call.
 */
function refreshProductPage() {
  revalidatePath("/[locale]/produkt", "page");
}

/** Email a sign-in link. */
export async function requestMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  /*
   * Always redirect to the same "check your inbox" state, whatever happened.
   * Saying "that address is not an admin" would turn this form into a way to
   * discover who the admins are.
   */
  const done = () => redirect("/admin?sent=1");

  if (!isAdminConfigured() || !isValidEmail(email) || !isAdminEmail(email)) {
    if (!isAdminConfigured()) {
      console.error("[admin] ADMIN_SECRET or ADMIN_EMAILS missing — no link can be sent");
    }
    return done();
  }

  const token = createMagicToken(email);
  if (!token) return done();

  const origin = (await headers()).get("origin") ?? site.url;
  const link = `${origin}/admin/callback?token=${encodeURIComponent(token)}`;

  const result = await sendMail({
    to: email,
    subject: "CAFÉTÉ Admin — Anmeldelink",
    text: [
      "Hier ist dein Anmeldelink für die CAFÉTÉ-Verwaltung:",
      "",
      link,
      "",
      "Der Link ist 15 Minuten gültig.",
      "Wenn du das nicht angefordert hast, kannst du diese Mail ignorieren.",
    ].join("\n"),
  });

  if (!result.ok) {
    console.error(`[admin] magic link not sent: ${result.reason} ${result.detail ?? ""}`);
  }

  return done();
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin");
}

export async function approveReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await setReviewStatus(id, "approved");
    refreshProductPage();
  }
  redirect("/admin");
}

export async function rejectReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    // Rejected rather than deleted: the row is the record if someone ever
    // disputes it, and it stops the same text being re-moderated from scratch.
    await setReviewStatus(id, "rejected");
    refreshProductPage();
  }
  redirect("/admin");
}

export async function unpublishReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await setReviewStatus(id, "pending");
    refreshProductPage();
  }
  redirect("/admin");
}

export async function replyToReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const body = String(formData.get("reply") ?? "");
  if (id) {
    await setReviewReply(id, body);
    refreshProductPage();
  }
  redirect("/admin");
}
