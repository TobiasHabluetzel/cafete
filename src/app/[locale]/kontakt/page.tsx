import { getTranslations } from "next-intl/server";

import { PageHeader, Section } from "@/components/layout/section";
import { CopyEmail } from "@/components/sections/copy-email";
import { site } from "@/config/site";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata({ namespace: "contact", descriptionKey: "contact", pathname: "/kontakt" });

export default async function ContactPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <>
      <PageHeader label={t("label")} title={t("title")} intro={t("intro")} />

      <Section tone="cream">
        <h2 className="label-caps text-sunset-ink">{t("emailLabel")}</h2>
        <div className="mt-4">
          <CopyEmail email={site.email} />
        </div>

        <div className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-2">
          <div className="tilt border-ink/85 rounded-lg border-2 bg-white p-7 shadow-[5px_5px_0_rgba(0,0,0,0.35)]">
            <h2 className="label-caps text-sunset-ink">{t("producerLabel")}</h2>
            <address className="text-charcoal/80 mt-3 space-y-1 not-italic">
              <p className="font-semibold">{site.producer.legalName}</p>
              <p>{site.producer.street}</p>
              <p>{site.producer.city}</p>
              <p>{site.producer.country}</p>
            </address>
          </div>

          <div className="tilt border-ink/85 rounded-lg border-2 bg-white p-7 shadow-[5px_5px_0_rgba(0,0,0,0.35)]">
            <h2 className="label-caps text-sunset-ink">{t("bottlerLabel")}</h2>
            <address className="text-charcoal/80 mt-3 space-y-1 not-italic">
              <p className="font-semibold">{site.bottler.name}</p>
              <p>{site.bottler.building}</p>
              <p>{site.bottler.street}</p>
              <p>{site.bottler.city}</p>
              <p>{site.bottler.country}</p>
            </address>
          </div>
        </div>
      </Section>
    </>
  );
}
