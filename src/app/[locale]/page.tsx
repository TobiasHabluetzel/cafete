import { setRequestLocale } from "next-intl/server";

import { SloganMarquee } from "@/components/brand/marquee";
import { CoffeeFruit } from "@/components/sections/coffee-fruit";
import { EventBand } from "@/components/sections/event-band";
import { Hero } from "@/components/sections/hero";
import { Pillars } from "@/components/sections/pillars";
import { ShopTeaser } from "@/components/sections/shop-teaser";
import { Story } from "@/components/sections/story";
import { SugarNote } from "@/components/sections/sugar-note";
import { routing } from "@/i18n/routing";
import { getEntryPrice } from "@/lib/pricing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// The entry price comes from Stripe, so the page is revalidated hourly rather
// than frozen at build time. A price change shows up without a redeploy.
export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const entryPrice = await getEntryPrice(locale);

  return (
    <>
      <Hero entryPrice={entryPrice} />
      <SloganMarquee />
      <CoffeeFruit />
      <SugarNote />
      <Pillars />
      <Story variant="teaser" />
      <ShopTeaser entryPrice={entryPrice} />
      <SloganMarquee />
      <EventBand />
    </>
  );
}
