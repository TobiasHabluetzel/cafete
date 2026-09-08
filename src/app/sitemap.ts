import type { MetadataRoute } from "next";

import { site } from "@/config/site";
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
  { path: "/event", priority: 0.8 },
  { path: "/ueber-uns", priority: 0.7 },
  { path: "/faq", priority: 0.6 },
  { path: "/kontakt", priority: 0.5 },
  { path: "/impressum", priority: 0.2 },
  { path: "/agb", priority: 0.2 },
  { path: "/datenschutz", priority: 0.2 },
  { path: "/widerruf", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const absolute = (path: StaticPathname, locale: "de" | "en") =>
    new URL(getPathname({ locale, href: path }), site.url).toString();

  return INDEXABLE.flatMap(({ path, priority }) =>
    routing.locales.map((locale) => ({
      url: absolute(path, locale),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((other) => [other, absolute(path, other)]),
        ),
      },
    })),
  );
}
