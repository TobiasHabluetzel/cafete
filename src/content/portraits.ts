import type { StaticImageData } from "next/image";

import matyas from "../../public/portrait-matyas.jpg";

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
  /**
   * Path to a WebVTT file, served from our own `/public`.
   *
   * Keep these same-origin even when the video itself is not. A `<track>` loaded
   * cross-origin needs CORS headers *and* `crossorigin` on the `<video>`, and
   * silently shows no subtitles when either is missing. The files are a few kB,
   * so there is nothing to gain by putting them on the video host.
   */
  src: string;
};

/**
 * Where a portrait's video lives. Exactly one of `src` or `youtubeId`.
 *
 * `src` is a self-hosted MP4: no third party, the browser's own controls, nothing
 * to declare in the privacy policy. The host must answer HTTP Range requests, or
 * the player cannot seek, and the file must be written with `-movflags
 * +faststart`, or playback waits for the whole download. Google Drive does
 * neither and cannot be used. Its weakness is that one file means one quality —
 * fine for a short cut, poor for an hour on mobile data.
 *
 * `youtubeId` is the pragmatic option for a long interview: adaptive streaming,
 * and automatic captions, which a self-hosted MP4 cannot produce on its own. It
 * is embedded click-to-load through youtube-nocookie.com, so nothing reaches
 * Google until the visitor decides to play it.
 */
export type PortraitVideo = {
  src?: string;
  /** The bare ID, e.g. "dQw4w9WgXcQ" — not the whole watch URL. */
  youtubeId?: string;
  /** e.g. "58 Min." — sets expectations before anyone commits to pressing play. */
  duration?: Record<string, string>;
  /** Only used with `src`. A YouTube embed carries its own captions. */
  captions?: PortraitCaption[];
};

export type Portrait = {
  /** Permanent URL segment. Never change it once published. */
  slug: string;
  /** "YYYY-MM" — sorts lexicographically, which is why it is a string. */
  month: string;
  /**
   * Overrides the month shown on archive cards, e.g. "September – Oktober 2026"
   * for a portrait that deliberately covers two months. Rotation still runs off
   * `month` alone: a portrait stays current until a newer one is published, so
   * spanning two months needs no entry for the second one.
   */
  monthLabel?: Record<string, string>;
  image?: StaticImageData;
  imageAlt?: Record<string, string>;
  /** The short cut, played inline. This is what most visitors will watch. */
  video?: PortraitVideo;
  /** The full interview, offered under the short cut for anyone who wants it. */
  fullVideo?: PortraitVideo;
  /**
   * The conversation as text, one string per paragraph, per locale.
   *
   * Not optional in spirit. An hour of video is invisible to search engines and
   * useless to anyone who cannot or would rather not watch it — and the first
   * portrait is about accessibility, so shipping it without one would undercut
   * the subject.
   */
  transcript?: Record<string, string[]>;
  de: PortraitText;
  en: PortraitText;
};

/**
 * Newest first is not assumed — `publishedPortraits` sorts — so entries can be
 * added in any order.
 */
export const portraits: Portrait[] = [
  {
    slug: "matyas-sagi-kiss",
    /*
     * Deliberately covers September and October. Nothing special is needed for
     * that: rotation is "newest published wins", so with no October entry this
     * stays current until November's portrait is added. `monthLabel` only
     * changes how the archive card reads once it gets there.
     */
    month: "2026-09",
    monthLabel: {
      de: "September – Oktober 2026",
      en: "September – October 2026",
    },
    image: matyas,
    imageAlt: {
      de: "Matyas Sagi-Kiss sitzt lächelnd in seinem Elektrorollstuhl auf einem sonnigen Platz unter Bäumen. Links neben ihm sitzt sein schwarzer Assistenzhund an der Leine.",
      en: "Matyas Sagi-Kiss sitting and smiling in his electric wheelchair on a sunny square under trees. His black assistance dog sits on a lead to his left.",
    },
    /*
     * No short cut for now, so this is the only video and the page drops the
     * "Das ganze Gespräch" sub-heading, putting the length on the section
     * heading instead.
     *
     * 4254 s as reported by YouTube. The track is German ASR
     * ("Deutsch (automatisch erzeugt)"), so captions are on — worth a read
     * through in YouTube Studio when there is time, since automatic German
     * transcription is unreliable with names and with Swiss speech.
     */
    fullVideo: {
      youtubeId: "iaF2jXMdkA0",
      duration: { de: "1 Std. 11 Min.", en: "1 hr 11 min" },
    },
    de: {
      title: "Matyas – Die andere Hälfte der Barrierefreiheit",
      lead: "Matyas Sagi-Kiss lebt im Zollhaus. Barrierefreiheit prägt seinen Alltag und ist ihm ein wichtiges Anliegen.",
      paragraphs: [
        "Im Monatsporträt erzählt er, wo ihm im Alltag noch Barrieren begegnen und was aus seiner Sicht verbessert werden sollte.",
        "Mit viel Charme erzählt Matyas aus seinem spannenden Alltag und zeigt, welche Rolle Barrierefreiheit dabei spielt. So ermöglicht er uns einen Perspektivenwechsel.",
      ],
    },
    en: {
      title: "Matyas – The other half of accessibility",
      lead: "Matyas Sagi-Kiss lives at the Zollhaus. Accessibility shapes his everyday life, and it matters to him.",
      paragraphs: [
        "In this month's portrait he talks about the barriers he still runs into day to day, and what he thinks should change.",
        "Matyas describes his eventful everyday life with a lot of charm, and shows the part accessibility plays in it — offering us a change of perspective.",
      ],
    },
  },
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

/**
 * How the month reads on an archive card: "September 2026", not "2026-09".
 *
 * `monthLabel` wins when set, which is how a portrait covering two months names
 * both. Falls back to the raw key if the month cannot be parsed, so a typo shows
 * up rather than throwing.
 */
export function portraitMonthLabel(portrait: Portrait, locale: string): string {
  const override = portrait.monthLabel?.[locale];
  if (override) return override;

  const [year, month] = portrait.month.split("-").map(Number);
  if (!year || !month) return portrait.month;

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "de-CH", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}
