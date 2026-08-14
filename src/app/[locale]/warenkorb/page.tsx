import { getTranslations } from "next-intl/server";

import { PageHeader, Section } from "@/components/layout/section";
import { CartView } from "@/components/shop/cart-view";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";
import { getPackPrices } from "@/lib/pricing";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata("cart");

// Prices are read from Stripe per request, so this cannot be baked at build time.
export const dynamic = "force-dynamic";

export default async function CartPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "cart" });
  const prices = await getPackPrices();

  return (
    <>
      <PageHeader title={t("title")} />

      <Section tone="cream">
        <CartView prices={prices} />
      </Section>
    </>
  );
}
