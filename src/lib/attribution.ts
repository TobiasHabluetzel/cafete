/**
 * Where an order came from — the campaign tags on the link someone arrived by.
 *
 * Instagram Reels and the ManyChat DMs link to the shop with `utm_*` parameters
 * (e.g. `?utm_source=instagram&utm_medium=manychat&utm_campaign=reel03`). The
 * shop is a client-side basket followed by a Stripe redirect, so by the time the
 * order exists the landing URL is long gone. This keeps the tags from the visit
 * in `localStorage` and the checkout carries them into the Stripe session's
 * metadata, where they show up in the order notification and the Dashboard.
 *
 * Last touch wins, within a 30-day window: a later tagged visit replaces an
 * earlier one, an untagged visit leaves it alone.
 */

export const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "fbclid",
] as const;

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
export type Attribution = Partial<Record<AttributionKey, string>>;

const STORAGE_KEY = "cafete.attribution.v1";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
/** Stripe metadata values cap at 500 characters; campaign tags never need that. */
const MAX_VALUE_LENGTH = 100;

/** Shared by the browser capture and the checkout route, which must not trust input. */
export function sanitizeAttribution(raw: unknown): Attribution {
  if (!raw || typeof raw !== "object") return {};
  const result: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value !== "string") continue;
    const cleaned = value.trim().slice(0, MAX_VALUE_LENGTH);
    if (cleaned.length > 0) result[key] = cleaned;
  }
  return result;
}

/** Read the tags off the current URL and remember them. Browser only. */
export function captureAttribution(search: string) {
  const params = new URLSearchParams(search);
  const found = sanitizeAttribution(
    Object.fromEntries(ATTRIBUTION_KEYS.map((key) => [key, params.get(key) ?? undefined])),
  );
  if (Object.keys(found).length === 0) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now(), tags: found }));
  } catch {
    // Private mode or a full quota: attribution is a nice-to-have, never a blocker.
  }
}

/** The remembered tags, or nothing once they are older than the window. Browser only. */
export function readAttribution(): Attribution {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const stored = JSON.parse(raw) as { at?: unknown; tags?: unknown };
    if (typeof stored.at !== "number" || Date.now() - stored.at > MAX_AGE_MS) return {};
    return sanitizeAttribution(stored.tags);
  } catch {
    return {};
  }
}

/** One readable line for the order notification, e.g. "instagram / manychat / reel03". */
export function describeAttribution(metadata: Record<string, string> | null | undefined) {
  if (!metadata) return null;
  const parts = [metadata.utm_source, metadata.utm_medium, metadata.utm_campaign, metadata.utm_content]
    .filter((value) => value && value.length > 0);
  if (parts.length === 0) return metadata.fbclid ? "facebook/instagram (fbclid)" : null;
  return parts.join(" / ");
}
