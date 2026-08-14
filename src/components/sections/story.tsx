import { useTranslations } from "next-intl";

import { ctaClass } from "@/components/brand/cta-button";
import { CherryMark } from "@/components/brand/sticker";
import { Section, SectionHeader } from "@/components/layout/section";
import { Link } from "@/i18n/navigation";

export function Story({ withLink = true }: { withLink?: boolean }) {
  const t = useTranslations("story");
  const tNav = useTranslations("nav");

  return (
    <Section tone="cream" className="relative isolate overflow-hidden">
      <CherryMark className="absolute -bottom-10 -left-16 w-56 -rotate-12 opacity-25 lg:w-72" />

      <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeader
            label={t("label")}
            title={t("title")}
            labelClassName="text-sunset-ink"
          />
          <CherryMark className="mt-10 hidden w-40 rotate-6 lg:block" />
        </div>

        <div className="text-charcoal/80 space-y-5 text-lg leading-relaxed">
          <p className="reveal">{t("p1")}</p>
          <p className="reveal">{t("p2")}</p>

          {/* The payoff line, set as a pull quote. */}
          <p className="reveal border-sunset text-charcoal font-display border-l-4 pl-5 text-h3 font-extrabold">
            {t("p3")}
          </p>

          {withLink ? (
            <p className="pt-2">
              <Link
                href="/ueber-uns"
                className={ctaClass({ variant: "dark", size: "md" })}
              >
                {tNav("about")}
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
