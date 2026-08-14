import Image from "next/image";
import { useTranslations } from "next-intl";

import { ctaClass } from "@/components/brand/cta-button";
import { SloganBanner, Wordmark } from "@/components/brand/wordmark";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="bg-sunburst relative isolate overflow-hidden">
      {/* Sunburst rays radiating behind the banner. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-1/4 mx-auto aspect-square w-[140%] max-w-none opacity-25 [background:repeating-conic-gradient(from_0deg,rgba(255,255,255,0.55)_0deg_6deg,transparent_6deg_18deg)] [mask-image:radial-gradient(circle_at_50%_40%,black_25%,transparent_70%)]"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-6 lg:px-8 lg:pt-20 lg:pb-24">
        <div className="text-center lg:text-left">
          <Wordmark
            priority
            width={520}
            height={179}
            className="mx-auto w-full max-w-[300px] drop-shadow-[0_6px_20px_rgba(20,16,14,0.28)] sm:max-w-[380px] lg:mx-0 lg:max-w-[440px]"
          />

          <SloganBanner className="mx-auto mt-5 max-w-[420px] drop-shadow-[0_4px_14px_rgba(20,16,14,0.25)] sm:max-w-[520px] lg:mx-0" />

          <p className="text-cream mx-auto mt-7 max-w-xl text-lg leading-snug font-medium text-balance sm:text-xl lg:mx-0">
            {t("subtitle")}
          </p>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
            <Link href="/shop" className={ctaClass({ variant: "gold", size: "lg" })}>
              {t("ctaPrimary")}
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
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div
            aria-hidden
            className="bg-gold/25 absolute inset-0 m-auto aspect-square w-[78%] rounded-full blur-3xl"
          />
          <Image
            src="/bottle-mockup.svg"
            alt=""
            width={260}
            height={720}
            priority
            className="relative h-[46vh] max-h-[560px] w-auto drop-shadow-[0_24px_50px_rgba(20,16,14,0.38)] lg:h-[62vh]"
          />
        </div>
      </div>
    </section>
  );
}
