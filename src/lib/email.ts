import "server-only";

import { promises as dns } from "node:dns";

import nodemailer from "nodemailer";

import { site } from "@/config/site";

/**
 * Outbound mail: event registrations, newsletter signups, order confirmations.
 *
 * Two transports. **On Railway, use Resend** — SMTP does not work there at all.
 *
 * 1. **Resend**, over HTTPS. Not the first choice on the merits: it puts a third
 *    party in the privacy policy and needs its own verified sending domain. But
 *    Railway blocks outbound SMTP, so it is the only one that delivers.
 * 2. **SMTP** through Infomaniak, where CAFÉTÉ's mailboxes already live. Needs no
 *    DNS work, costs nothing, sends from the real address and belongs to the
 *    founders. Verified working from a normal network — and verified *not* working
 *    from Railway, where ports 465, 587 and 2525 all time out on TCP connect
 *    (checked 16 Sept 2026). Keep it for a future move off Railway, or for
 *    running the app anywhere with open SMTP egress.
 *
 * SMTP is still tried first when its variables are set, with Resend picking up
 * anything it drops — see `send()`. If both are configured the SMTP timeout is
 * paid on every message, so unset the `SMTP_*` variables on Railway.
 *
 * Use a dedicated mailbox for `SMTP_USER`, not `info@`: a mailbox password can
 * *read* mail, unlike an API key, so the credential in the environment should be
 * able to do as little as possible. Infomaniak additionally requires an
 * application-specific password ("Gerätepasswort") rather than the login one.
 */
export type SendResult =
  | {
      ok: true;
      via: "smtp" | "resend";
      /** Set when the first transport failed and this one picked it up. */
      recoveredFrom?: { via: "smtp"; detail?: string };
    }
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
 * The From address, which depends on which transport is carrying the message —
 * the two do not accept the same senders.
 *
 * Over SMTP, `fallback` is the authenticated mailbox. Most providers, Infomaniak
 * included, reject a message whose From is an address the session did not log in
 * as, so defaulting to `info@` while authenticated as `noreply@` fails the send
 * outright rather than merely sending from the wrong name.
 *
 * Over Resend, only a verified domain may send, and that is the `send.`
 * subdomain — the root must not be verified there, because a domain gets one SPF
 * record and the root's already ends in `-all` and carries the founders' live
 * mail. So `RESEND_FROM` wins over `MAIL_FROM` on that path; taking them in the
 * other order would hand Resend a root-domain sender it will refuse.
 */
function fromAddress({
  transport,
  fallback,
}: {
  transport: "smtp" | "resend";
  fallback?: string;
}) {
  const configured =
    transport === "resend"
      ? (env("RESEND_FROM") ?? env("MAIL_FROM"))
      : (env("MAIL_FROM") ?? env("RESEND_FROM"));
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
  const resendConfigured = Boolean(env("RESEND_API_KEY"));

  if (smtpConfigured()) {
    const smtp = await sendViaSmtp({ to, subject, text, replyTo });
    if (smtp.ok || !resendConfigured) return smtp;

    /*
     * SMTP failed and there is an HTTP transport available, so use it rather than
     * losing the message. This matters because Railway blocks outbound SMTP
     * entirely — 465, 587 and 2525 all time out on connect — so a deployment that
     * still has the SMTP_* variables set would otherwise silently deliver nothing.
     *
     * The cost is the SMTP connection timeout before the retry, which is only
     * ever paid when SMTP is misconfigured — exactly the case where it saves the
     * mail. Remove the SMTP_* variables to skip it entirely. The failure is still
     * carried on the result so a broken transport cannot hide behind a working
     * fallback.
     */
    const viaHttp = await sendViaResend({ to, subject, text, replyTo });
    if (viaHttp.ok) {
      return { ...viaHttp, recoveredFrom: { via: "smtp", detail: smtp.detail } };
    }
    return viaHttp;
  }

  if (resendConfigured) return sendViaResend({ to, subject, text, replyTo });
  return { ok: false, reason: "not-configured" };
}

/**
 * Resolve the SMTP host to one IPv4 address.
 *
 * nodemailer does its own DNS work: it calls `resolve4` and `resolve6`, glues the
 * two lists together and then picks an address **at random** (`formatDNSValue` in
 * `nodemailer/dist/esm/shared/index.js`). Railway's containers have an IPv6
 * address on the interface — so nodemailer believes IPv6 is usable — but no IPv6
 * route off the box. `mail.infomaniak.com` publishes both, so roughly every other
 * send drew the AAAA record and died with `ENETUNREACH` before a single SMTP byte
 * moved. Intermittent, which is exactly why it first looked like a TLS stall.
 *
 * Handing nodemailer a literal address makes it skip its own lookup, so the
 * address family stops being a coin flip. `servername` then has to be passed
 * explicitly, because nodemailer only infers it from `host` when that is not an
 * IP — without it there is no SNI and no certificate hostname to check against.
 *
 * `NODE_OPTIONS=--dns-result-order=ipv4first` would not have helped: that changes
 * `dns.lookup`, which nodemailer never calls.
 */
async function ipv4Endpoint(host: string) {
  try {
    const [address] = await dns.resolve4(host);
    if (address) return { host: address, servername: host };
  } catch {
    // Not fatal. Fall back to the hostname and let nodemailer resolve it; a
    // random pick that might work beats refusing to try at all.
  }
  return { host, servername: undefined };
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
  const from = fromAddress({ transport: "smtp", fallback: user });

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok: false, reason: "send-failed", via: "smtp", detail: `bad SMTP_PORT` };
  }

  const endpoint = await ipv4Endpoint(host as string);

  try {
    const transport = nodemailer.createTransport({
      host: endpoint.host,
      // Only set when `host` is a literal address — see `ipv4Endpoint`.
      ...(endpoint.servername ? { servername: endpoint.servername } : {}),
      port,
      // 465 is implicit TLS; 587 starts plaintext and upgrades via STARTTLS.
      secure: port === 465,
      /*
       * On 587, refuse to continue if STARTTLS is not offered. Without this
       * nodemailer falls back to plaintext and sends the mailbox password in the
       * clear — and a mailbox password reads mail as well as sends it. Better a
       * failed registration than a leaked credential.
       */
      requireTLS: port !== 465,
      auth: {
        user: user as string,
        pass: process.env.SMTP_PASSWORD as string,
      },
      // Fail fast rather than hanging a request if the port is blocked. A stall
      // that runs the full socketTimeout, rather than a fast 5xx, is itself the
      // signal: it means the connection came up and then the TLS upgrade or the
      // auth exchange went quiet, not that the server said no.
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
      detail: `${error instanceof Error ? error.message : String(error)} (host=${host} addr=${endpoint.host} port=${port} user=${user} from=${from} to=${to})`,
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
        from: fromAddress({ transport: "resend" }),
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
