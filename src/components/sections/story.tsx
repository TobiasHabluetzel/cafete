import Image from "next/image";
import { useTranslations } from "next-intl";

import { ctaClass } from "@/components/brand/cta-button";
import { Section, SectionHeader } from "@/components/layout/section";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import cascaraFalling from "../../../public/cascara-falling.png";
import cascaraJarHand from "../../../public/cascara-jar-hand.png";

/**
 * "Wie alles begann".
 *
 * `teaser` (homepage) is a single line plus a button through to Über uns, which
 * is what the owner asked for; `full` (Über uns) carries the whole claro-shop
 * story. Splitting the variants keeps the long version in one place instead of
 * duplicating it across two pages.
 */
export function Story({ variant = "full" }: { variant?: "teaser" | "full" }) {
  const t = useTranslations("story");
  const isTeaser = variant === "teaser";

  // Homepage: the falling handful, which mirrors "aus einer Handvoll".
  // Über uns: the jar with the hand, replacing the cherry illustration.
  const illustration = isTeaser ? cascaraFalling : cascaraJarHand;

  return (
    <Section tone="cream" className="relative isolate overflow-hidden">
      <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <Image
          src={illustration}
          alt=""
          aria-hidden
          sizes="(max-width: 1024px) 70vw, 30rem"
          className={cn(
            "mx-auto h-auto w-full max-w-xs lg:mx-0 lg:max-w-sm",
            isTeaser && "-rotate-3",
          )}
        />

        <div>
          <SectionHeader
            label={t("label")}
            title={t("title")}
            labelClassName="text-sunset-ink"
          />

          {isTeaser ? (
            <div className="mt-6">
              <p className="font-display text-charcoal text-h3 max-w-prose font-extrabold">
                {t("teaser")}
              </p>
              <p className="text-charcoal/75 mt-5 max-w-prose leading-relaxed">
                {t("founderNote")}
              </p>
              <Link
                href="/ueber-uns"
                className={ctaClass({ variant: "dark", size: "md", className: "mt-8" })}
              >
                {t("cta")}
              </Link>
            </div>
          ) : (
            <div className="text-charcoal/80 mt-6 space-y-5 text-lg leading-relaxed">
              <p className="reveal">{t("p1")}</p>
              <p className="reveal">{t("p2")}</p>
              <p className="reveal border-sunset text-charcoal font-display text-h3 border-l-4 pl-5 font-extrabold">
                {t("p3")}
              </p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
