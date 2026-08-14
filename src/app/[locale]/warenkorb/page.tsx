import { getTranslations } from "next-intl/server";

import { ctaClass } from "@/components/brand/cta-button";
import { PageHeader, Section } from "@/components/layout/section";
import { Link } from "@/i18n/navigation";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata("cart");

/** Phase 2 turns this into the real cart. */
export default async function CartPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "cart" });

  return (
    <>
      <PageHeader title={t("title")} />

      <Section tone="cream">
        <p className="text-charcoal/80 max-w-prose text-lg leading-relaxed">
          {t("empty")}
        </p>
        <Link href="/shop" className={ctaClass({ size: "lg", className: "mt-8" })}>
          {t("continue")}
        </Link>
      </Section>
    </>
  );
}
