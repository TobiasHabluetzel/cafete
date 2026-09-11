import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { ctaClass } from "@/components/brand/cta-button";
import { SloganMarquee } from "@/components/brand/marquee";
import { Sticker } from "@/components/brand/sticker";
import { SunburstRays, WarmGlow } from "@/components/brand/sunburst";
import { LogoSticker } from "@/components/brand/wordmark";
import { Section } from "@/components/layout/section";
import { Link } from "@/i18n/navigation";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";
import { getPackPrices, lowestPriceFrom } from "@/lib/pricing";

import bottlePhoto from "../../../../public/bottle-photo.jpg";
import bottle from "../../../../public/bottle-transparent.png";

export const generateStaticParams = generateLocaleParams;

const baseMetadata = createMetadata({
  namespace: "qr",
  descriptionKey: "discover",
  pathname: "/entdecken",
});

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  return {
    ...(await baseMetadata(props)),
    /*
     * Kept out of search on purpose: this is the homepage's pitch rewritten
     * shorter, and two pages competing for the same query only splits their
     * ranking. `follow` stays on so the links out still count, and the page is
     * deliberately *not* disallowed in robots.txt — a crawler has to be able to
     * fetch it to see this instruction at all.
     */
    robots: { index: false, follow: true },
  };
}

// The price comes from Stripe, so the page refreshes hourly rather than being
// frozen at build time — the same arrangement as the homepage and the shop.
export const revalidate = 3600;

/**
 * The QR landing page, reached from the flyers and stickers via `/qr`.
 *
 * One job: someone is standing there with a phone in their hand and about ten
 * seconds of patience. So it is the hook, three facts, and the shop — in that
 * order, with the first call to action above the fold on a phone. Everything
 * deeper (ingredients, the founders, the story) is a link away rather than on
 * the page.
 */
export default async function DiscoverPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "qr" });
  const tBadges = await getTranslations({ locale, namespace: "badges" });

  const price = lowestPriceFrom(await getPackPrices(), locale);

  const facts = [
    { title: t("factOneTitle"), body: t("factOneBody") },
    { title: t("factTwoTitle"), body: t("factTwoBody") },
    { title: t("factThreeTitle"), body: t("factThreeBody") },
  ];

  return (
    <>
      <section className="bg-night text-cream relative isolate overflow-hidden">
        {/* The bottle shot as atmosphere rather than as subject — the product
            gets its own full-size showing in the closing band. */}
        <Image
          src={bottlePhoto}
          alt=""
          priority
          fill
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div aria-hidden className="photo-scrim absolute inset-0" />
        <SunburstRays className="-top-28" size="w-[38rem]" opacity="opacity-20" />
        <WarmGlow className="top-[-7rem] left-[52%] size-[26rem] max-w-[80vw]" />

        <div className="relative mx-auto max-w-3xl px-4 pt-9 pb-14 text-center sm:px-6 sm:pt-14 sm:pb-20">
          <p className="label-caps text-gold">{t("label")}</p>

          <LogoSticker
            priority
            sizes="(max-width: 640px) 45vw, 12rem"
            className="mt-5 w-[9rem] sm:w-[11rem]"
          />

          {/* The page's H1. Short enough to stay one or two lines on a phone,
              which is what keeps the button below it above the fold. */}
          <h1 className="text-h1 text-sticker sm:text-display mt-6 text-balance">
            {t("title")}
          </h1>

          <p className="text-cream/85 mx-auto mt-5 max-w-xl text-lg leading-relaxed text-balance">
            {t("lead")}
          </p>

          <ul className="mt-7 flex flex-wrap justify-center gap-2.5">
            <li>
              <Sticker tone="cherry" className="-rotate-2">
                {tBadges("volume")}
              </Sticker>
            </li>
            <li>
              <Sticker tone="gold" className="rotate-1">
                {tBadges("lessSugar")}
              </Sticker>
            </li>
            <li>
              <Sticker tone="cream" className="-rotate-1">
                {tBadges("energizing")}
              </Sticker>
            </li>
          </ul>

          {/* The CTA label is nowrap, so the horizontal padding is reduced on the
              narrowest phones to keep "Zum Shop — ab CHF 24.50" inside the pill. */}
          <div className="mt-8">
            <Link
              href="/shop"
              className={ctaClass({
                variant: "gold",
                size: "lg",
                className: "w-full px-6 sm:w-auto sm:px-8",
              })}
            >
              {price ? t("ctaShopWithPrice", { price: price.formatted }) : t("ctaShop")}
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>

          {/* A text link, not a second pill: the event line is too long to fit a
              nowrap button on a phone, and it is genuinely the lesser action. */}
          <p className="mt-5">
            <Link
              href="/event"
              className="text-gold hover:text-gold-soft font-semibold underline decoration-2 underline-offset-4"
            >
              {t("ctaEvent")}
            </Link>
          </p>
        </div>
      </section>

      <SloganMarquee />

      <Section tone="sunset">
        <p className="label-caps text-cherry-ink text-center">{t("factsLabel")}</p>
        <ul className="mt-8 grid gap-5 sm:grid-cols-3">
          {facts.map((fact) => (
            <li
              key={fact.title}
              className="border-ink/85 bg-cream text-charcoal rounded-lg border-2 p-6 shadow-[5px_5px_0_rgba(0,0,0,0.35)]"
            >
              <h2 className="text-h3 text-balance">{fact.title}</h2>
              <p className="text-charcoal/75 mt-2 leading-relaxed">{fact.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <section className="bg-charcoal text-cream relative isolate overflow-hidden py-14 lg:py-20">
        <WarmGlow className="inset-y-0 left-[6%] my-auto size-[22rem] max-w-[70vw] lg:left-[56%]" />

        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          {/* Bottle first on a phone, so the scroll lands on the product and the
              button follows it; side by side from lg up. */}
          <div className="lg:order-2">
            <Image
              src={bottle}
              alt="CAFÉTÉ 33 cl"
              sizes="(max-width: 1024px) 40vw, 16rem"
              placeholder="blur"
              className="animate-bob mx-auto h-auto w-[8.5rem] drop-shadow-[0_18px_36px_rgba(0,0,0,0.55)] sm:w-[11rem]"
            />
          </div>

          <div className="text-center lg:order-1 lg:text-left">
            <h2 className="text-h1 text-sticker text-balance">{t("closingTitle")}</h2>
            <p className="text-cream/80 mt-4 leading-relaxed text-balance">
              {t("closingBody")}
            </p>

            <p className="mt-6 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 lg:justify-start">
              {price ? (
                <span className="font-display text-gold text-3xl font-extrabold tabular-nums">
                  {t("fromPrice", { price: price.formatted })}
                </span>
              ) : null}
              {/* Shown whenever nothing is buyable yet — including when no price
                  is available at all, where the date is the only honest answer. */}
              {!price || price.comingSoon ? (
                <span className="text-cream/60 text-sm">{t("launchNote")}</span>
              ) : null}
            </p>

            <div className="mt-7">
              <Link
                href="/shop"
                className={ctaClass({
                  variant: "solid",
                  size: "lg",
                  className: "w-full px-6 sm:w-auto sm:px-8",
                })}
              >
                {t("ctaShop")}
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            </div>

            <p className="mt-5">
              <Link
                href="/produkt"
                className="text-cream/70 hover:text-cream underline decoration-1 underline-offset-4"
              >
                {t("more")}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
