import { setRequestLocale } from "next-intl/server";

import { CoffeeFruit } from "@/components/sections/coffee-fruit";
import { FactStrip } from "@/components/sections/fact-strip";
import { FlavourJourney } from "@/components/sections/flavour-journey";
import { Hero } from "@/components/sections/hero";
import { MoodReel } from "@/components/sections/mood-reel";
import { Pillars } from "@/components/sections/pillars";
import { ShopTeaser } from "@/components/sections/shop-teaser";
import { Story } from "@/components/sections/story";
import { routing } from "@/i18n/routing";
import { createMetadata } from "@/lib/page";
import { getEntryPrice } from "@/lib/pricing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const generateMetadata = createMetadata({
  namespace: "meta",
  descriptionKey: "home",
  pathname: "/",
});

// The entry price comes from Stripe, and the build has no Stripe keys, so this is
// rendered per request. getCachedPackPrices keeps that from hitting Stripe each time.
export const dynamic = "force-dynamic";

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
      <FlavourJourney entryPrice={entryPrice} />
      <FactStrip />
      <CoffeeFruit />
      <Pillars />
      <Story variant="teaser" />
      <MoodReel />
      <ShopTeaser entryPrice={entryPrice} />
    </>
  );
}
