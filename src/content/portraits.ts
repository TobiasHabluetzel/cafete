import type { StaticImageData } from "next/image";

/**
 * "Die andere Hälfte der Geschichte" — one portrait per calendar month.
 *
 * Rotation is derived, never manual: the newest portrait whose `month` has
 * arrived is the current one, everything older is archive. Adding October's
 * entry therefore moves September's back by itself, and no editing step can be
 * forgotten. The slug is the permanent URL and does not change when that happens.
 */
export type PortraitText = {
  /** e.g. "Matyas – Die andere Hälfte der Barrierefreiheit" */
  title: string;
  /** One-line summary for the index and the archive cards. */
  lead: string;
  /** Body copy, one string per paragraph. */
  paragraphs: string[];
};

export type PortraitCaption = {
  /** BCP-47, e.g. "de" or "en". */
  srclang: string;
  /** Shown in the player's subtitle menu. */
  label: string;
  /** Path to a WebVTT file. */
  src: string;
};

export type Portrait = {
  /** Permanent URL segment. Never change it once published. */
  slug: string;
  /** "YYYY-MM" — sorts lexicographically, which is why it is a string. */
  month: string;
  image?: StaticImageData;
  imageAlt?: Record<string, string>;
  /** Local path under /public or an absolute URL if hosted elsewhere. */
  video?: string;
  captions?: PortraitCaption[];
  de: PortraitText;
  en: PortraitText;
};

/**
 * Newest first is not assumed — `publishedPortraits` sorts — so entries can be
 * added in any order.
 */
export const portraits: Portrait[] = [
  // Matyas lands here once the portrait photo, interview video and text arrive.
];

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

/** Everything whose month has arrived, newest first. */
export function publishedPortraits(now: Date = new Date()): Portrait[] {
  const current = monthKey(now);
  return portraits
    .filter((portrait) => portrait.month <= current)
    .sort((a, b) => b.month.localeCompare(a.month));
}

export function currentPortrait(now?: Date): Portrait | null {
  return publishedPortraits(now)[0] ?? null;
}

export function archivedPortraits(now?: Date): Portrait[] {
  return publishedPortraits(now).slice(1);
}

export function portraitBySlug(slug: string): Portrait | undefined {
  return portraits.find((portrait) => portrait.slug === slug);
}

export function portraitText(portrait: Portrait, locale: string): PortraitText {
  return locale === "en" ? portrait.en : portrait.de;
}
