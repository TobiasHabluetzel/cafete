import { useTranslations } from "next-intl";

import { ctaClass } from "@/components/brand/cta-button";
import { Section, SectionHeader } from "@/components/layout/section";
import { Link } from "@/i18n/navigation";

export function Story({ withLink = true }: { withLink?: boolean }) {
  const t = useTranslations("story");
  const tNav = useTranslations("nav");

  return (
    <Section tone="white">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <SectionHeader label={t("label")} title={t("title")} />

        <div className="text-charcoal/80 space-y-5 text-lg leading-relaxed">
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p className="font-display text-charcoal text-h3 font-extrabold">{t("p3")}</p>

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
