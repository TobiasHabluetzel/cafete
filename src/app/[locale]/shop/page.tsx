import { getTranslations } from "next-intl/server";

import { ctaClass } from "@/components/brand/cta-button";
import { Sticker } from "@/components/brand/sticker";
import { PageHeader, Section } from "@/components/layout/section";
import { PackPicker } from "@/components/shop/pack-picker";
import { packSizes } from "@/config/site";
import { Link } from "@/i18n/navigation";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";
import { configuredPacks, isStripeConfigured } from "@/lib/stripe";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata("shop");

// Which packs are buyable depends on runtime env — which Stripe Price IDs are
// set — so this page must not be baked at build time.
export const dynamic = "force-dynamic";

export default async function ShopPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "shop" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tPacks = await getTranslations({ locale, namespace: "packs" });
  const tCheckout = await getTranslations({ locale, namespace: "checkout" });
  const tBadges = await getTranslations({ locale, namespace: "badges" });

  // Only offer packs that actually have a price in Stripe. Before the Products
  // exist that is none, and the page falls back to the teaser.
  const buyable = isStripeConfigured() ? configuredPacks() : [];
  const isOpen = buyable.length > 0;

  return (
    <>
      <PageHeader
        label={tNav("shop")}
        title={t("title")}
        intro={isOpen ? t("packBody") : t("intro")}
      >
        <div className="mt-7 flex flex-wrap gap-3">
          <Sticker tone="gold" className="-rotate-1">
            {tBadges("volume")}
          </Sticker>
          <Sticker tone="cherry" className="rotate-1">
            {tBadges("energizing")}
          </Sticker>
        </div>
      </PageHeader>

      <Section tone="cream">
        {isOpen ? (
          <>
            <h2 className="text-h2">{t("packHeading")}</h2>
            <div className="mt-10">
              <PackPicker packs={buyable.map((pack) => ({ ...pack }))} />
            </div>
            <p className="text-charcoal/60 mt-6 text-sm">
              {tCheckout("lineTotalNote")} {tCheckout("securePayment")}
            </p>
          </>
        ) : (
          <div className="max-w-2xl">
            <h2 className="text-h2">{t("packHeading")}</h2>
            <p className="text-charcoal/80 mt-4 text-lg leading-relaxed">
              {t("packBody")}
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {packSizes.map((pack) => (
                <li key={pack.bottles}>
                  <span className="border-charcoal/15 text-charcoal font-display inline-flex items-center rounded-full border bg-white px-4 py-2 text-sm font-bold">
                    {tPacks(pack.labelKey)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-sunset text-charcoal/80 mt-8 border-l-4 pl-5 leading-relaxed">
              {tCheckout("notConfigured")}
            </p>
            <Link href="/event" className={ctaClass({ size: "lg", className: "mt-8" })}>
              {t("notifyCta")}
            </Link>
          </div>
        )}
      </Section>
    </>
  );
}
