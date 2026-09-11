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
  | {
      ok: false;
      reason: "not-configured" | "send-failed";
      /** Which transport failed — the first thing you need to know from a log. */
      via?: "smtp" | "resend";
      detail?: string;
    };

/**
 * Read an environment variable that holds a plain value.
 *
 * Strips surrounding quotes as well as whitespace. In a `.env` file the quotes
 * around `MAIL_FROM="CAFÉTÉ <noreply@…>"` are syntax, but pasted into Railway's
 * variable field — which is how these get set, and what its "Suggested Variables"
 * offers straight from `.env.local.example` — they become part of the value, and
 * a From header with literal quotes round it is rejected or mangled.
 */
function env(name: string): string | undefined {
  const raw = process.env[name]?.trim();
  if (!raw) return undefined;
  // `[\s\S]` rather than `.` with the `s` flag, which this tsconfig target rejects.
  const unquoted = raw.replace(/^(["'])([\s\S]*)\1$/, "$2").trim();
  return unquoted.length > 0 ? unquoted : undefined;
}

function smtpConfigured() {
  // Note: the password is read directly, not through `env()`. Trimming a
  // password would silently change a credential, and stripping quotes from one
  // that legitimately contains them would break it.
  return Boolean(env("SMTP_HOST") && env("SMTP_USER") && process.env.SMTP_PASSWORD);
}

export function isEmailConfigured() {
  return smtpConfigured() || Boolean(env("RESEND_API_KEY"));
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
    to: env("ORDER_NOTIFICATION_EMAIL") ?? site.email,
  });
}

/**
 * The From address.
 *
 * `fallback` is the SMTP transport's authenticated mailbox, and it matters: most
 * providers, Infomaniak included, reject a message whose From is an address the
 * session did not log in as. Defaulting to `info@` while authenticated as
 * `noreply@` therefore fails the send outright rather than sending from the wrong
 * name — which is why `MAIL_FROM` being unset used to break SMTP entirely.
 */
function fromAddress(fallback?: string) {
  const configured = env("MAIL_FROM") ?? env("RESEND_FROM");
  if (configured) return configured;
  return `${site.name} <${fallback ?? site.email}>`;
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
  const host = env("SMTP_HOST");
  const user = env("SMTP_USER");
  const port = Number(env("SMTP_PORT") ?? 587);
  const from = fromAddress(user);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok: false, reason: "send-failed", via: "smtp", detail: `bad SMTP_PORT` };
  }

  try {
    const transport = nodemailer.createTransport({
      host,
      port,
      // 465 is implicit TLS; 587 starts plaintext and upgrades via STARTTLS.
      secure: port === 465,
      auth: {
        user: user as string,
        pass: process.env.SMTP_PASSWORD as string,
      },
      // Fail fast rather than hanging a request if the port is blocked.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });

    await transport.sendMail({
      from,
      to,
      subject,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    return { ok: true, via: "smtp" };
  } catch (error) {
    // The configuration is echoed back, minus the password. Every plausible cause
    // — wrong host, blocked port, a From the mailbox may not send as, a value with
    // the quotes still attached — is visible from this one line in the Railway log,
    // which otherwise needs a round of guessing per attempt.
    return {
      ok: false,
      reason: "send-failed",
      via: "smtp",
      detail: `${error instanceof Error ? error.message : String(error)} (host=${host} port=${port} user=${user} from=${from} to=${to})`,
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
        Authorization: `Bearer ${env("RESEND_API_KEY")}`,
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
        via: "resend",
        detail: `${response.status} ${await response.text()}`,
      };
    }
    return { ok: true, via: "resend" };
  } catch (error) {
    return {
      ok: false,
      reason: "send-failed",
      via: "resend",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL_PATTERN.test(value);
}
