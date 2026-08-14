import Image from "next/image";
import { useTranslations } from "next-intl";

import { ctaClass } from "@/components/brand/cta-button";
import { Sticker } from "@/components/brand/sticker";
import { photoFadeStyle, SunburstRays, WarmGlow } from "@/components/brand/sunburst";
import { SectionHeader } from "@/components/layout/section";
import { packSizes } from "@/config/site";
import { Link } from "@/i18n/navigation";

import bottle from "../../../public/bottle-photo.jpg";

export function ShopTeaser({ entryPrice }: { entryPrice: string | null }) {
  const t = useTranslations("shopTeaser");
  const tPacks = useTranslations("packs");
  const tBadges = useTranslations("badges");

  return (
    <section className="bg-night text-cream relative isolate overflow-hidden py-16 lg:py-24">
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
        <div className="relative mx-auto w-full max-w-sm">
          <SunburstRays size="w-[30rem]" opacity="opacity-25" />
          <WarmGlow className="inset-0 m-auto size-[22rem] max-w-[80vw]" />
          <Image
            src={bottle}
            alt=""
            sizes="(max-width: 1024px) 80vw, 34vw"
            placeholder="blur"
            className="relative h-auto w-full"
            style={photoFadeStyle}
          />
        </div>

        <div className="reveal">
          <SectionHeader
            label={t("label")}
            title={t("title")}
            intro={t("body")}
            labelClassName="text-gold"
          />

          <div className="mt-8 flex flex-wrap gap-3">
            <Sticker tone="gold" className="-rotate-1">
              {tBadges("sparkling")}
            </Sticker>
            <Sticker tone="cherry" className="rotate-1">
              {tBadges("energizing")}
            </Sticker>
          </div>

          <p className="label-caps text-cream/55 mt-10">{t("packLabel")}</p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {packSizes.map((pack) => (
              <li key={pack.bottles}>
                <span className="border-cream/25 bg-cream/5 text-cream font-display inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold">
                  {tPacks(pack.labelKey)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/shop" className={ctaClass({ variant: "gold", size: "lg" })}>
              {t("cta")}
            </Link>
            {entryPrice ? (
              <span className="font-display text-gold text-lg font-bold">
                {t("fromPrice", { price: entryPrice })}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
