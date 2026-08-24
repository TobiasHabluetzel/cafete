import Image from "next/image";
import { useTranslations } from "next-intl";

import { ctaClass } from "@/components/brand/cta-button";
import { SunburstRays, WarmGlow } from "@/components/brand/sunburst";
import { LogoSticker, SloganBanner } from "@/components/brand/wordmark";
import { HeroBadges } from "@/components/sections/hero-badges";
import { Link } from "@/i18n/navigation";

import bottle from "../../../public/bottle-photo.jpg";

export function Hero({ entryPrice }: { entryPrice: string | null }) {
  const t = useTranslations("hero");

  return (
    <section className="bg-night text-cream relative isolate overflow-hidden">
      {/*
       * The bottle shot bleeds off the right edge and dissolves leftwards. Filling
       * the section top-to-bottom means the only boundary that could show is the
       * left one, and that is what the mask removes — a radial fade would instead
       * clip the top and bottom off a bottle this tall.
       */}
      <div className="relative h-[19rem] sm:h-[24rem] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[54%]">
        <Image
          src={bottle}
          alt=""
          priority
          sizes="(max-width: 1024px) 100vw, 54vw"
          className="size-full object-cover object-center"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 0%, black 64%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 64%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden lg:block"
          style={{
            backdropFilter: "none",
            background:
              "linear-gradient(to right, var(--color-night) 0%, rgba(11,9,8,0.55) 26%, transparent 58%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-4 pb-16 sm:px-6 lg:grid lg:min-h-[40rem] lg:grid-cols-[minmax(0,46%)_1fr] lg:items-center lg:px-8 lg:pt-16 lg:pb-24">
        <div>
          {/* Tobias' explicit ask: the logo and the slogan together as the
              homepage banner. Two overlapping rotated stickers, with the burst
              radiating from behind the wordmark exactly as in the artwork. */}
          <div className="relative inline-block max-w-full">
            <SunburstRays
              size="w-[34rem] lg:w-[40rem]"
              opacity="opacity-30"
              className="-top-8"
            />
            <WarmGlow className="inset-0 m-auto size-[22rem] max-w-[85vw]" />

            <div className="relative">
              <LogoSticker
                priority
                sizes="(max-width: 1024px) 62vw, 24rem"
                className="w-[14rem] sm:w-[18rem] lg:w-[22rem]"
              />
              <div className="bg-sunset border-ink/80 -mt-6 ml-2 rotate-1 rounded-md border-2 px-4 py-2.5 shadow-[6px_6px_0_rgba(0,0,0,0.45)] sm:-mt-7 sm:px-6">
                <SloganBanner priority className="max-w-[22rem] sm:max-w-[27rem]" />
              </div>
            </div>
          </div>

          <p className="text-cream/85 relative mt-8 max-w-xl text-lg leading-snug font-medium text-balance sm:text-xl">
            {t("subtitle")}
          </p>

          <div className="relative mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link href="/shop" className={ctaClass({ variant: "gold", size: "lg" })}>
              {entryPrice ? t("ctaPrimaryWithPrice", { price: entryPrice }) : t("ctaPrimary")}
            </Link>
            <Link
              href="/event"
              className={ctaClass({
                variant: "outline",
                size: "lg",
                className: "text-cream hover:bg-cream/15",
              })}
            >
              {t("ctaSecondary")}
            </Link>
          </div>

          <HeroBadges />
        </div>
      </div>
    </section>
  );
}
