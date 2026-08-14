import "server-only";

import { site } from "@/config/site";

/**
 * Minimal Resend client over their REST API — no SDK dependency needed for the
 * one thing we do (send a plain notification mail).
 *
 * Until RESEND_API_KEY is set the route handlers report `not-configured` and the
 * forms tell the visitor to email us directly, rather than silently swallowing a
 * signup. Phase 2 reuses this for order confirmations.
 */
export type SendResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "send-failed"; detail?: string };

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Send to an explicit recipient — used for order confirmations. */
export async function sendMail({
  to,
  subject,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  return send({ to, subject, text, replyTo });
}

/** Send to the shop's own inbox — used for signups and internal alerts. */
export async function sendNotification({
  subject,
  text,
  replyTo,
}: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  return send({
    to: process.env.ORDER_NOTIFICATION_EMAIL ?? site.email,
    subject,
    text,
    replyTo,
  });
}

async function send({
  to,
  subject,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: "not-configured" };

  const from = process.env.RESEND_FROM ?? `CAFÉTÉ <${site.email}>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        ...(replyTo ? { reply_to: [replyTo] } : {}),
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: "send-failed",
        detail: `${response.status} ${await response.text()}`,
      };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: "send-failed",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL_PATTERN.test(value);
}
