import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageHeader, Section } from "@/components/layout/section";
import { site } from "@/config/site";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata("contact");

export default async function ContactPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <>
      <PageHeader label={t("label")} title={t("title")} intro={t("intro")} />

      <Section tone="cream">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="border-charcoal/10 shadow-brand rounded-lg border bg-white p-7">
            <h2 className="label-caps text-sunset-ink">{t("emailLabel")}</h2>
            <a
              href={`mailto:${site.email}`}
              className="font-display text-charcoal hover:text-sunset-ink mt-3 inline-flex items-center gap-2 text-lg font-extrabold break-all transition-colors"
            >
              <Mail className="size-5 shrink-0" aria-hidden />
              {site.email}
            </a>
            <p className="text-charcoal/70 mt-6 text-sm">
              <span className="label-caps text-charcoal/50 block">
                {t("eventLabel")}
              </span>
              <span className="mt-2 block">{t("eventValue")}</span>
            </p>
          </div>

          <div className="border-charcoal/10 rounded-lg border bg-white/60 p-7">
            <h2 className="label-caps text-sunset-ink">{t("producerLabel")}</h2>
            <address className="text-charcoal/80 mt-3 space-y-1 not-italic">
              <p className="font-semibold">{site.name}</p>
              <p>{site.producer.street}</p>
              <p>{site.producer.city}</p>
              <p>{site.producer.country}</p>
            </address>
          </div>

          <div className="border-charcoal/10 rounded-lg border bg-white/60 p-7">
            <h2 className="label-caps text-sunset-ink">{t("bottlerLabel")}</h2>
            <address className="text-charcoal/80 mt-3 space-y-1 not-italic">
              <p className="font-semibold">{site.bottler.name}</p>
              <p>{site.bottler.street}</p>
              <p>{site.bottler.city}</p>
            </address>
          </div>
        </div>
      </Section>
    </>
  );
}
