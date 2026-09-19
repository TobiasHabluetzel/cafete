import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ctaClass } from "@/components/brand/cta-button";
import { PageHeader, Section } from "@/components/layout/section";
import { hasCaptions, PortraitPlayer } from "@/components/portraits/portrait-player";
import { JsonLd } from "@/components/seo/json-ld";
import { site } from "@/config/site";
import { portraitBySlug, portraits, portraitText } from "@/content/portraits";
import { Link } from "@/i18n/navigation";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buildOpenGraph, resolvePageLocale } from "@/lib/page";

type Props = { params: Promise<{ locale: string; slug: string }> };

/**
 * A portrait's own page. This URL is permanent: it is the same address whether
 * the portrait is the current one or has moved into the archive, which is the
 * whole point of deriving rotation from the month rather than the route.
 */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    portraits.map((portrait) => ({ locale, slug: portrait.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const portrait = portraitBySlug(slug);
  if (!portrait) return {};

  const text = portraitText(portrait, locale);
  const absolute = (target: string) =>
    new URL(
      getPathname({
        locale: target as "de" | "en",
        href: { pathname: "/monatsportraets/[slug]", params: { slug } },
      }),
      site.url,
    ).toString();

  const languages: Record<string, string> = {};
  for (const candidate of routing.locales) languages[candidate] = absolute(candidate);
  languages["x-default"] = absolute(routing.defaultLocale);

  return {
    title: text.title,
    description: text.lead,
    alternates: { canonical: absolute(locale), languages },
    openGraph: buildOpenGraph({ title: text.title, description: text.lead, locale }),
  };
}

export default async function PortraitPage({ params }: Props) {
  const { locale, slug } = await params;
  await resolvePageLocale(Promise.resolve({ locale }));

  const portrait = portraitBySlug(slug);
  if (!portrait) notFound();

  const t = await getTranslations({ locale, namespace: "portraits" });
  const text = portraitText(portrait, locale);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: text.title,
          description: text.lead,
          inLanguage: locale,
          isPartOf: { "@type": "CreativeWorkSeries", name: t("title") },
          publisher: { "@type": "Organization", name: site.name, url: site.url },
        }}
      />

      <PageHeader label={t("currentLabel")} title={text.title} intro={text.lead} />

      <Section tone="cream">
        <div className="max-w-3xl">
          {portrait.image ? (
            <Image
              src={portrait.image}
              alt={portrait.imageAlt?.[locale] ?? text.title}
              sizes="(max-width: 1024px) 90vw, 48rem"
              placeholder="blur"
              className="border-ink/80 mb-10 w-full rounded-lg border-2 shadow-[7px_7px_0_rgba(0,0,0,0.35)]"
            />
          ) : null}

          {text.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-charcoal/80 mb-5 text-lg leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </Section>

      {portrait.video || portrait.fullVideo ? (
        <Section tone="night">
          <div className="mx-auto max-w-3xl">
            {/* With only one video there is nothing to distinguish it from, so
                its length goes on the section heading and the "Das ganze
                Gespräch" sub-heading below is dropped as redundant. */}
            <h2 className="text-h2 text-gold">
              {t("videoHeading")}
              {!portrait.video && portrait.fullVideo?.duration?.[locale] ? (
                <span className="text-cream/55 ml-3 text-base font-normal">
                  {portrait.fullVideo.duration[locale]}
                </span>
              ) : null}
            </h2>

            {portrait.video ? (
              <PortraitPlayer
                video={portrait.video}
                poster={portrait.image?.src}
                locale={locale}
                title={text.title}
                /* The short cut is the one people actually watch, so its metadata
                   may load with the page. */
                preload="metadata"
                className="mt-6"
              />
            ) : null}

            {/*
              * The full interview runs about an hour. It sits below the short cut
              * with `preload="none"`, so it costs a visitor nothing at all unless
              * they choose it — no metadata request, no bytes.
              */}
            {portrait.fullVideo ? (
              <div className={portrait.video ? "mt-10" : ""}>
                {portrait.video ? (
                  <h3 className="text-h3 text-cream">
                    {t("fullVideoHeading")}
                    {portrait.fullVideo.duration?.[locale] ? (
                      <span className="text-cream/55 ml-2 text-base font-normal">
                        {portrait.fullVideo.duration[locale]}
                      </span>
                    ) : null}
                  </h3>
                ) : null}
                <PortraitPlayer
                  video={portrait.fullVideo}
                  poster={portrait.image?.src}
                  locale={locale}
                  title={text.title}
                  preload="none"
                  className="mt-6"
                />
              </div>
            ) : null}

            {hasCaptions(portrait.video) || hasCaptions(portrait.fullVideo) ? (
              <p className="text-cream/60 mt-4 text-sm">{t("captionsHint")}</p>
            ) : null}
          </div>
        </Section>
      ) : null}

      {/*
        * The conversation as text. Collapsed so an hour of transcript does not
        * bury the page, but rendered in the markup rather than fetched on demand,
        * so search engines and screen readers still get all of it.
        */}
      {portrait.transcript?.[locale]?.length ? (
        <Section tone="cream">
          <details className="border-charcoal/15 mx-auto max-w-3xl rounded-lg border-2 bg-white/60 p-6">
            <summary className="font-display cursor-pointer text-lg font-extrabold">
              {t("transcriptHeading")}
            </summary>
            <div className="mt-5">
              {portrait.transcript[locale].map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-charcoal/80 mb-4 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </details>
        </Section>
      ) : null}

      <Section tone="cream">
        <Link
          href="/monatsportraets"
          className={ctaClass({ variant: "dark", size: "md" })}
        >
          {t("backToOverview")}
        </Link>
      </Section>
    </>
  );
}
