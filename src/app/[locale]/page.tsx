import { setRequestLocale } from "next-intl/server";

import { SloganMarquee } from "@/components/brand/marquee";
import { CoffeeFruit } from "@/components/sections/coffee-fruit";
import { Hero } from "@/components/sections/hero";
import { Pillars } from "@/components/sections/pillars";
import { ShopTeaser } from "@/components/sections/shop-teaser";
import { Story } from "@/components/sections/story";
import { VideoClip } from "@/components/sections/video-clip";
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
      <VideoClip />
      <CoffeeFruit />
      <Pillars />
      <Story variant="teaser" />
      <ShopTeaser entryPrice={entryPrice} />
      <SloganMarquee />
    </>
  );
}
