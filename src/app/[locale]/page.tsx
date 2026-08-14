import { getTranslations, setRequestLocale } from "next-intl/server";

import { Hero } from "@/components/sections/hero";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <Hero />

      {/* Phase 1 fills in: coffee fruit, four pillars, story, shop teaser,
          launch event band. */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="label-caps text-sunset-deep">{t("comingSoon")}</p>
        <p className="text-charcoal/70 mt-3 max-w-prose">{t("placeholderNotice")}</p>
      </section>
    </>
  );
}
