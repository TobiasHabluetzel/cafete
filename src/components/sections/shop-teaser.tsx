import Image from "next/image";
import { useTranslations } from "next-intl";

import { ctaClass } from "@/components/brand/cta-button";
import { SunburstRays, WarmGlow } from "@/components/brand/sunburst";
import { SectionHeader } from "@/components/layout/section";
import { packSizes } from "@/config/site";
import { Link } from "@/i18n/navigation";

import bottle from "../../../public/bottle-transparent.png";
import pack6 from "../../../public/pack-6.png";
import pack12 from "../../../public/pack-12.png";
import pack24 from "../../../public/pack-24.png";

const PACK_IMAGES: Record<number, typeof pack6> = { 6: pack6, 12: pack12, 24: pack24 };

export function ShopTeaser({ entryPrice }: { entryPrice: string | null }) {
  const t = useTranslations("shopTeaser");
  const tPacks = useTranslations("packs");

  return (
    <section className="bg-night text-cream relative isolate overflow-hidden py-16 lg:py-24">
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
        <div className="relative mx-auto w-full max-w-sm">
          <SunburstRays size="w-[30rem]" opacity="opacity-25" />
          <WarmGlow className="inset-0 m-auto size-[22rem] max-w-[80vw]" />
          <Image
            src={bottle}
            alt=""
            sizes="(max-width: 1024px) 40vw, 14rem"
            className="relative mx-auto h-[27rem] w-auto -rotate-3 drop-shadow-[0_24px_30px_rgba(0,0,0,0.55)] lg:h-[34rem]"
          />
        </div>

        <div className="reveal">
          <SectionHeader
            label={t("label")}
            title={t("title")}
            intro={t("body")}
            labelClassName="text-gold"
          />

          <p className="label-caps text-cream/55 mt-10">{t("packLabel")}</p>
          <ul className="mt-4 grid grid-cols-3 gap-3">
            {packSizes.map((pack) => (
              <li key={pack.bottles}>
                <Link
                  href="/shop"
                  className="bg-cream text-charcoal focus-visible:ring-gold group block rounded-md p-2.5 transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:p-4"
                >
                  <Image
                    src={PACK_IMAGES[pack.bottles] ?? bottle}
                    alt=""
                    sizes="(max-width: 1024px) 30vw, 10rem"
                    className="aspect-square w-full object-contain transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none"
                  />
                  <span className="font-display mt-2 block text-center text-sm font-extrabold lg:text-base">
                    {tPacks(pack.labelKey)}
                  </span>
                </Link>
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
