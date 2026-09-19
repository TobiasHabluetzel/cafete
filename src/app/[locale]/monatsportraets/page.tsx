import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { ctaClass } from "@/components/brand/cta-button";
import { CherryMark } from "@/components/brand/sticker";
import { PageHeader, Section, SectionHeader } from "@/components/layout/section";
import {
  archivedPortraits,
  currentPortrait,
  portraitMonthLabel,
  portraitText,
} from "@/content/portraits";
import { Link } from "@/i18n/navigation";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata({
  namespace: "portraits",
  descriptionKey: "portraits",
  pathname: "/monatsportraets",
});

// Which portrait is "current" depends on today's date, so this must not be
// frozen at build time. A day is ample for a monthly rotation.
export const revalidate = 86400;

export default async function PortraitsPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "portraits" });

  const intro = t.raw("intro") as string[];
  const current = currentPortrait();
  const archive = archivedPortraits();

  return (
    <>
      <PageHeader label={t("label")} title={t("title")} />

      {/* The essay that explains the series. */}
      <Section tone="cream" className="relative isolate overflow-hidden">
        <CherryMark className="absolute -right-16 -bottom-12 w-56 rotate-12 opacity-20 lg:w-72" />
        <div className="relative max-w-3xl">
          {intro.map((paragraph) => (
            <p key={paragraph} className="text-charcoal/80 mb-5 text-lg leading-relaxed">
              {paragraph}
            </p>
          ))}
          <p className="border-sunset font-display text-charcoal text-h3 mt-8 border-l-4 pl-5 font-extrabold">
            {t("closing")}
          </p>
        </div>
      </Section>

      {current ? (
        <Section tone="night">
          <SectionHeader
            label={t("currentLabel")}
            title={portraitText(current, locale).title}
            intro={portraitText(current, locale).lead}
            labelClassName="text-gold"
          />
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-12">
            {current.image ? (
              <Image
                src={current.image}
                alt={current.imageAlt?.[locale] ?? portraitText(current, locale).title}
                sizes="(max-width: 1024px) 90vw, 26rem"
                placeholder="blur"
                className="border-ink/80 w-full rounded-lg border-2 shadow-[7px_7px_0_rgba(0,0,0,0.45)]"
              />
            ) : null}
            <div>
              <p className="text-cream/80 leading-relaxed">
                {portraitText(current, locale).paragraphs[0]}
              </p>
              <Link
                href={{ pathname: "/monatsportraets/[slug]", params: { slug: current.slug } }}
                className={ctaClass({ variant: "gold", size: "lg", className: "mt-8" })}
              >
                {t("readMore")}
              </Link>
            </div>
          </div>
        </Section>
      ) : (
        <Section tone="night">
          <p className="text-cream/80 max-w-prose text-lg leading-relaxed">{t("empty")}</p>
        </Section>
      )}

      {archive.length > 0 ? (
        <Section tone="cream">
          <SectionHeader
            label={t("archiveLabel")}
            title={t("archiveLabel")}
            intro={t("archiveIntro")}
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {archive.map((portrait) => {
              const text = portraitText(portrait, locale);
              return (
                <li
                  key={portrait.slug}
                  className="border-ink/85 flex flex-col rounded-lg border-2 bg-white p-5 shadow-[5px_5px_0_rgba(0,0,0,0.35)]"
                >
                  {portrait.image ? (
                    <Image
                      src={portrait.image}
                      alt={portrait.imageAlt?.[locale] ?? text.title}
                      sizes="20rem"
                      placeholder="blur"
                      className="border-ink/20 aspect-[4/3] w-full rounded-md border object-cover"
                    />
                  ) : null}
                  <p className="label-caps text-sunset-ink mt-4">{portraitMonthLabel(portrait, locale)}</p>
                  <h3 className="text-h3 mt-2">{text.title}</h3>
                  <p className="text-charcoal/70 mt-2 text-sm leading-relaxed">{text.lead}</p>
                  <Link
                    href={{
                      pathname: "/monatsportraets/[slug]",
                      params: { slug: portrait.slug },
                    }}
                    className={ctaClass({ variant: "dark", size: "md", className: "mt-5" })}
                  >
                    {t("readMore")}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
