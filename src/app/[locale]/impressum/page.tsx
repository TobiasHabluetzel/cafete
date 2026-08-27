import { getTranslations } from "next-intl/server";

import { PageHeader, PlaceholderNotice, Section } from "@/components/layout/section";
import { site } from "@/config/site";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata("legal", "imprint.title");

export default async function ImprintPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <>
      <PageHeader title={t("imprint.title")} />

      <Section tone="cream">
        <div className="max-w-3xl">
          <PlaceholderNotice title={t("placeholderTitle")}>
            {t("placeholderBody")}
          </PlaceholderNotice>

          <div className="mt-10 space-y-8">
            <section>
              <h2 className="text-h3">{t("imprint.responsibleHeading")}</h2>
              <address className="text-charcoal/80 mt-3 space-y-1 not-italic">
                <p className="font-semibold">{site.producer.legalName}</p>
                <p>{site.producer.street}</p>
                <p>{site.producer.city}</p>
                <p>{site.producer.country}</p>
              </address>
            </section>

            <section>
              <h2 className="text-h3">{t("imprint.bottlerHeading")}</h2>
              <address className="text-charcoal/80 mt-3 space-y-1 not-italic">
                <p className="font-semibold">{site.bottler.name}</p>
                <p>{site.bottler.street}</p>
                <p>{site.bottler.city}</p>
              </address>
            </section>

            <section>
              <h2 className="text-h3">{t("imprint.contactHeading")}</h2>
              <p className="mt-3">
                <a
                  href={`mailto:${site.email}`}
                  className="text-sunset-ink underline underline-offset-4"
                >
                  {site.email}
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-h3">{t("imprint.uidHeading")}</h2>
              <p className="text-charcoal/80 mt-3 leading-relaxed">
                {t("imprint.uidBody")}
              </p>
            </section>

            <section>
              <h2 className="text-h3">{t("imprint.disclaimerHeading")}</h2>
              <p className="text-charcoal/80 mt-3 leading-relaxed">
                {t("imprint.disclaimerBody")}
              </p>
            </section>
          </div>
        </div>
      </Section>
    </>
  );
}
