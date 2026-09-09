import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ctaClass } from "@/components/brand/cta-button";
import { PageHeader, Section } from "@/components/layout/section";
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

      {portrait.video ? (
        <Section tone="night">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-h2 text-gold">{t("videoHeading")}</h2>
            {/*
              * No autoplay, native controls, and the portrait photo as the poster
              * so the frame is a face rather than a black box. `preload="metadata"`
              * keeps an interview-length file off the wire until someone presses
              * play. Caption tracks appear in the player's own subtitle menu.
              */}
            <video
              controls
              preload="metadata"
              playsInline
              poster={portrait.image?.src}
              className="border-ink/80 bg-charcoal mt-6 w-full rounded-lg border-2 shadow-[6px_6px_0_rgba(0,0,0,0.45)]"
            >
              <source src={portrait.video} type="video/mp4" />
              {portrait.captions?.map((caption) => (
                <track
                  key={caption.srclang}
                  kind="captions"
                  src={caption.src}
                  srcLang={caption.srclang}
                  label={caption.label}
                  default={caption.srclang === locale}
                />
              ))}
            </video>
            {portrait.captions && portrait.captions.length > 0 ? (
              <p className="text-cream/60 mt-3 text-sm">{t("captionsHint")}</p>
            ) : null}
          </div>
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
