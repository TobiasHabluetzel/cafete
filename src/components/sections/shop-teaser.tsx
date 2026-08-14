import Image from "next/image";
import { useTranslations } from "next-intl";

import { ctaClass } from "@/components/brand/cta-button";
import { Section, SectionHeader } from "@/components/layout/section";
import { packSizes } from "@/config/site";
import { Link } from "@/i18n/navigation";

export function ShopTeaser() {
  const t = useTranslations("shopTeaser");
  const tPacks = useTranslations("packs");

  return (
    <Section tone="cream">
      <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
        <div className="relative flex justify-center">
          <div
            aria-hidden
            className="bg-sunset/20 absolute inset-0 m-auto aspect-square w-[70%] rounded-full blur-3xl"
          />
          <Image
            src="/bottle-mockup.svg"
            alt=""
            width={260}
            height={720}
            className="relative h-[380px] w-auto drop-shadow-[0_18px_40px_rgba(20,16,14,0.22)]"
          />
        </div>

        <div>
          <SectionHeader label={t("label")} title={t("title")} intro={t("body")} />

          <p className="label-caps text-charcoal/60 mt-10">{t("packLabel")}</p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {packSizes.map((pack) => (
              <li key={pack.bottles}>
                <span className="border-charcoal/15 bg-white/70 text-charcoal font-display inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold">
                  {tPacks(pack.labelKey)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/shop" className={ctaClass({ size: "lg" })}>
              {t("cta")}
            </Link>
            <span className="font-display text-charcoal/70 text-lg font-bold">
              {t("fromPrice")}
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}
