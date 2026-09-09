import "server-only";

import nodemailer from "nodemailer";

import { site } from "@/config/site";

/**
 * Outbound mail: event registrations, newsletter signups, order confirmations.
 *
 * Two transports, chosen by which environment variables are present:
 *
 * 1. **SMTP** (preferred). CAFÉTÉ's mailboxes already live at Infomaniak, so
 *    sending through them needs no DNS work — the domain's SPF already authorises
 *    it — costs nothing extra, sends from the real `info@drink-cafete.ch`, keeps a
 *    third-party processor out of the privacy policy, and belongs to the founders
 *    rather than to an agency account that would later need handing over.
 * 2. **Resend** as a fallback, if only `RESEND_API_KEY` is configured.
 *
 * Use a dedicated mailbox for `SMTP_USER`, not `info@`: a mailbox password can
 * *read* mail, unlike an API key, so the credential in the environment should be
 * able to do as little as possible.
 */
export type SendResult =
  | { ok: true; via: "smtp" | "resend" }
  | { ok: false; reason: "not-configured" | "send-failed"; detail?: string };

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

export function isEmailConfigured() {
  return smtpConfigured() || Boolean(process.env.RESEND_API_KEY);
}

/** Send to an explicit recipient — used for order confirmations. */
export async function sendMail(args: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  return send(args);
}

/** Send to the shop's own inbox — used for signups and internal alerts. */
export async function sendNotification(args: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  return send({
    ...args,
    to: process.env.ORDER_NOTIFICATION_EMAIL ?? site.email,
  });
}

function fromAddress() {
  return process.env.MAIL_FROM ?? process.env.RESEND_FROM ?? `CAFÉTÉ <${site.email}>`;
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
  if (smtpConfigured()) return sendViaSmtp({ to, subject, text, replyTo });
  if (process.env.RESEND_API_KEY) return sendViaResend({ to, subject, text, replyTo });
  return { ok: false, reason: "not-configured" };
}

/**
 * A fresh transport per send. These are a handful of messages a day, so pooling
 * buys nothing, and a long-lived connection in a container that may be paused
 * between requests is more likely to be stale than useful.
 */
async function sendViaSmtp({
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
  const port = Number(process.env.SMTP_PORT ?? 587);

  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // 465 is implicit TLS; 587 starts plaintext and upgrades via STARTTLS.
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER as string,
        pass: process.env.SMTP_PASSWORD as string,
      },
      // Fail fast rather than hanging a request if the port is blocked.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });

    await transport.sendMail({
      from: fromAddress(),
      to,
      subject,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    return { ok: true, via: "smtp" };
  } catch (error) {
    return {
      ok: false,
      reason: "send-failed",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Minimal Resend client over their REST API — no SDK needed for one call. */
async function sendViaResend({
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
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
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
    return { ok: true, via: "resend" };
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
