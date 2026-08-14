import "server-only";

import { site } from "@/config/site";

/**
 * The public origin to send a visitor back to — for Stripe's success/cancel URLs.
 *
 * `new URL(request.url).origin` cannot be used: behind Railway's proxy the server
 * sees its own bind address, so it produced `https://0.0.0.0:8080/...` and the
 * post-payment redirect went nowhere.
 *
 * The forwarded host is what the visitor actually typed, so it is the right
 * answer — but a `Host` header is attacker-controlled, and feeding it into a
 * redirect that Stripe will follow after payment would be an open redirect. So it
 * is only trusted when it matches a host we recognise; anything else falls back to
 * the canonical site URL.
 */
function isAllowedHost(host: string): boolean {
  if (/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host)) return true;

  // Railway injects this for the service's generated domain.
  if (process.env.RAILWAY_PUBLIC_DOMAIN === host) return true;

  // Any Railway-generated domain for this project (preview/staging services).
  if (/^[a-z0-9-]+\.up\.railway\.app$/i.test(host)) return true;

  try {
    if (new URL(site.url).host === host) return true;
  } catch {
    // site.url is validated at construction, so this should not happen.
  }

  return false;
}

export function resolveRequestOrigin(request: Request): string {
  const headers = request.headers;
  // x-forwarded-* can be a comma-separated chain; the first entry is the client.
  const first = (value: string | null) => value?.split(",")[0]?.trim() ?? null;

  const host = first(headers.get("x-forwarded-host")) ?? first(headers.get("host"));
  if (host && isAllowedHost(host)) {
    const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
    const proto = first(headers.get("x-forwarded-proto")) ?? (isLocal ? "http" : "https");
    return `${proto}://${host}`;
  }

  if (host) {
    console.warn(`[origin] untrusted forwarded host "${host}" — using ${site.url}`);
  }
  return site.url;
}
