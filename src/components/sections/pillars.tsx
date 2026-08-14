import { Recycle, TrendingUp, Users, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

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

  const pillars = [
    { key: "functional", Icon: Zap },
    { key: "social", Icon: Users },
    { key: "ecological", Icon: Recycle },
    { key: "economic", Icon: TrendingUp },
  ] as const;

  return (
    <Section tone="charcoal">
      <SectionHeader
        label={t("label")}
        title={t("title")}
        align="center"
        labelClassName="text-gold"
      />

      <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map(({ key, Icon }) => (
          <li
            key={key}
            className="bg-charcoal-soft border-cream/10 flex flex-col rounded-lg border p-6"
          >
            <span className="bg-sunset-gradient mb-5 inline-flex size-11 items-center justify-center rounded-full text-white">
              <Icon className="size-5" aria-hidden />
            </span>
            <h3 className="text-gold text-h3">{t(`${key}.title`)}</h3>
            <p className="text-cream/75 mt-3 text-sm leading-relaxed">
              {t(`${key}.body`)}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
