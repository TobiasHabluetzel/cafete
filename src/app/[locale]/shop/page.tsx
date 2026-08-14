import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { ctaClass } from "@/components/brand/cta-button";
import { PageHeader, Section } from "@/components/layout/section";
import { packSizes } from "@/config/site";
import { Link } from "@/i18n/navigation";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

import bottle from "../../../../public/bottle-photo.jpg";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata("shop");

/**
 * Phase 1 placeholder. Phase 2 replaces the static pack list with a real
 * selector, cart and Stripe Checkout session.
 */
export default async function ShopPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "shop" });
  const tPacks = await getTranslations({ locale, namespace: "packs" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <>
      <PageHeader label={tNav("shop")} title={t("title")} intro={t("intro")} />

      <Section tone="cream">
        <h2 className="text-h2">{t("packHeading")}</h2>
        <p className="text-charcoal/80 mt-4 max-w-prose text-lg leading-relaxed">
          {t("packBody")}
        </p>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packSizes.map((pack) => (
            <li
              key={pack.bottles}
              className="border-charcoal/10 shadow-brand flex flex-col items-center rounded-lg border bg-white p-6 text-center"
            >
              <Image
                src={bottle}
                alt=""
                sizes="18rem"
                placeholder="blur"
                className="border-ink/70 h-40 w-full rounded-md border-2 object-cover"
              />
              <h3 className="text-h3 mt-5">{tPacks(pack.labelKey)}</h3>
              <p className="text-charcoal/60 mt-1 text-sm">
                {tPacks("bottles", { count: pack.bottles })}
              </p>
              <p className="label-caps text-sunset-ink mt-4">{t("priceTbd")}</p>
            </li>
          ))}
        </ul>

        <Link href="/event" className={ctaClass({ size: "lg", className: "mt-12" })}>
          {t("notifyCta")}
        </Link>
      </Section>
    </>
  );
}
