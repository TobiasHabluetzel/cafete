import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { site } from "@/config/site";
import { getPathname } from "@/i18n/navigation";
import { routing, type StaticPathname } from "@/i18n/routing";

export type LocaleParams = { params: Promise<{ locale: string }> };

export const OG_IMAGE = "/og-image.jpg";

/**
 * The full Open Graph block for a page.
 *
 * Next *replaces* `openGraph` rather than deep-merging it, so a page that sets
 * only a title and description silently drops the image, type, locale and site
 * name inherited from the layout — which is exactly how the OG image went
 * missing. Both the layout and every page build the whole object from here.
 */
export function buildOpenGraph({
  title,
  description,
  locale,
}: {
  title: string;
  description: string;
  locale: string;
}) {
  return {
    title,
    description,
    siteName: site.name,
    locale: locale === "de" ? "de_CH" : "en_GB",
    type: "website" as const,
    images: [
      { url: OG_IMAGE, width: 1200, height: 630, alt: `${site.name} — ${description}` },
    ],
  };
}

/** Every page under `[locale]` is prerendered for both locales. */
export function generateLocaleParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Await the params and opt the page into static rendering. Must be called before
 * any `useTranslations` in the tree, otherwise next-intl falls back to dynamic.
 */
export async function resolvePageLocale(params: LocaleParams["params"]) {
  const { locale } = await params;
  setRequestLocale(locale);
  return locale;
}

/**
 * Canonical URL plus the hreflang set for one page.
 *
 * Built from the slug map, so `/de/produkt` and `/en/product` correctly declare
 * each other as alternates rather than looking like two unrelated pages. Without
 * this, search engines treat the DE and EN trees as duplicates.
 */
export function alternatesFor(pathname: StaticPathname, locale: string): Metadata["alternates"] {
  const absolute = (target: string) =>
    new URL(getPathname({ locale: target as "de" | "en", href: pathname }), site.url).toString();

  const languages: Record<string, string> = {};
  for (const candidate of routing.locales) languages[candidate] = absolute(candidate);
  // x-default points at the default locale for users we cannot match.
  languages["x-default"] = absolute(routing.defaultLocale);

  return { canonical: absolute(locale), languages };
}

/**
 * Per-page metadata: its own title, its own description, and its canonical and
 * hreflang set. Every page had been inheriting one shared description, which
 * makes them look like near-duplicates to a crawler.
 */
export function createMetadata({
  namespace,
  titleKey = "title",
  descriptionKey,
  pathname,
}: {
  namespace: string;
  titleKey?: string;
  /** Key inside the `pageMeta` namespace. */
  descriptionKey: string;
  pathname: StaticPathname;
}) {
  return async function generateMetadata({
    params,
  }: LocaleParams): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace });
    const tMeta = await getTranslations({ locale, namespace: "pageMeta" });

    const title = t(titleKey);
    const description = tMeta(descriptionKey);

    return {
      title,
      description,
      alternates: alternatesFor(pathname, locale),
      openGraph: buildOpenGraph({
        title: `${title} — ${site.name}`,
        description,
        locale,
      }),
      twitter: {
        card: "summary_large_image" as const,
        title: `${title} — ${site.name}`,
        description,
        images: [OG_IMAGE],
      },
    };
  };
}
