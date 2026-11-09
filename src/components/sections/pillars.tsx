import { useTranslations } from "next-intl";

import { CherryMark } from "@/components/brand/sticker";
import { Section, SectionHeader } from "@/components/layout/section";

/**
 * The four pillars from the content pack (Funktional · Sozial · Ökologisch ·
 * Ökonomisch). Note: the earlier kickoff brief mentioned three pillars named
 * after the slogan — the brand-tokens v2 doc and the content pack both supersede
 * that with these four, which are the ones with real copy. "Fruity · Fizzy ·
 * Focus" stays as the hero slogan banner.
 */
export function Pillars() {
  const t = useTranslations("pillars");
  const keys = ["functional", "social", "ecological", "economic"] as const;

  return (
    <Section tone="sunset" className="relative isolate overflow-hidden">
      <CherryMark className="absolute -top-8 -right-10 w-64 rotate-12 opacity-20 lg:w-96" />

      <SectionHeader
        label={t("label")}
        title={t("title")}
        align="center"
        labelClassName="text-cherry-ink"
        className="relative"
      />

      <ol
        tabIndex={0}
        aria-label={t("title")}
        className="pillar-rail relative -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pt-1 pb-3 sm:mx-0 sm:mt-14 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:p-0 lg:grid-cols-4"
      >
        {keys.map((key, index) => (
          <li
            key={key}
            className="reveal border-ink/85 bg-cream flex w-[84%] shrink-0 snap-center flex-col rounded-lg border-2 p-6 sm:w-auto shadow-[5px_5px_0_rgba(0,0,0,0.45)]"
          >
            <span
              aria-hidden
              className="font-display text-numeral text-sunset-ink/25 font-extrabold tabular-nums"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-h3 text-charcoal mt-2">{t(`${key}.title`)}</h3>
            <p className="text-charcoal/75 mt-3 text-sm leading-relaxed">
              {t.rich(`${key}.body`, {
                b: (chunks) => <strong className="text-charcoal font-bold">{chunks}</strong>,
              })}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
