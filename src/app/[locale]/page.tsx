import { setRequestLocale } from "next-intl/server";

import { CoffeeFruit } from "@/components/sections/coffee-fruit";
import { EventBand } from "@/components/sections/event-band";
import { Hero } from "@/components/sections/hero";
import { Pillars } from "@/components/sections/pillars";
import { ShopTeaser } from "@/components/sections/shop-teaser";
import { Story } from "@/components/sections/story";
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

  return (
    <>
      <Hero />
      <CoffeeFruit />
      <Pillars />
      <Story />
      <ShopTeaser />
      <EventBand />
    </>
  );
}
