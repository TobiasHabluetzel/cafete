import type { MetadataRoute } from "next";

import { site } from "@/config/site";
import { portraits } from "@/content/portraits";
import { getPathname } from "@/i18n/navigation";
import { routing, type StaticPathname } from "@/i18n/routing";

/**
 * Every indexable route, in both locales, each declaring the other as a language
 * alternate. Cart and order pages are left out — they are per-visitor.
 */
const INDEXABLE: { path: StaticPathname; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/produkt", priority: 0.9 },
  { path: "/shop", priority: 0.9 },
  { path: "/monatsportraets", priority: 0.8 },
  { path: "/event", priority: 0.8 },
  { path: "/ueber-uns", priority: 0.7 },
  { path: "/faq", priority: 0.6 },
  { path: "/kontakt", priority: 0.5 },
  { path: "/impressum", priority: 0.2 },
  { path: "/agb", priority: 0.2 },
  { path: "/datenschutz", priority: 0.2 },
  { path: "/widerruf", priority: 0.2 },
];

/** Absolute URL for a route in one locale, via the slug map. */
function absolute(
  href: Parameters<typeof getPathname>[0]["href"],
  locale: "de" | "en",
) {
  return new URL(getPathname({ locale, href }), site.url).toString();
}

/** One sitemap entry per locale, cross-linked as language alternates. */
function entriesFor(
  href: Parameters<typeof getPathname>[0]["href"],
  priority: number,
  changeFrequency: "monthly" | "yearly",
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, absolute(href, locale)]),
  );

  return routing.locales.map((locale) => ({
    url: absolute(href, locale),
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...INDEXABLE.flatMap(({ path, priority }) => entriesFor(path, priority, "monthly")),
    // Each portrait keeps a permanent URL, so each belongs here in its own right.
    ...portraits.flatMap((portrait) =>
      entriesFor(
        { pathname: "/monatsportraets/[slug]", params: { slug: portrait.slug } },
        0.6,
        "yearly",
      ),
    ),
  ];
}
