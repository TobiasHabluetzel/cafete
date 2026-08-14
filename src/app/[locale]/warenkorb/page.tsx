import { getTranslations } from "next-intl/server";

import { PageHeader, Section } from "@/components/layout/section";
import { CartView } from "@/components/shop/cart-view";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata("cart");

export default async function CartPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "cart" });

  return (
    <>
      <PageHeader title={t("title")} />

      <Section tone="cream">
        <CartView />
      </Section>
    </>
  );
}
