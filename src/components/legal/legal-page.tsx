import { getTranslations } from "next-intl/server";

import { PageHeader, PlaceholderNotice, Section } from "@/components/layout/section";

export type LegalSection = { heading: string; body: string };

/**
 * Renders one of the `legal.*` namespaces as a document, prefixed with a loud
 * placeholder notice. Every one of these texts must be replaced with a reviewed
 * version before launch.
 */
export async function LegalPage({
  locale,
  namespace,
}: {
  locale: string;
  namespace: "terms" | "privacy" | "returns";
}) {
  const t = await getTranslations({ locale, namespace: "legal" });
  const sections = t.raw(`${namespace}.sections`) as LegalSection[];

  return (
    <>
      <PageHeader title={t(`${namespace}.title`)} />

      <Section tone="cream">
        <div className="max-w-3xl">
          <PlaceholderNotice title={t("placeholderTitle")}>
            {t("placeholderBody")}
          </PlaceholderNotice>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-h3">{section.heading}</h2>
                <p className="text-charcoal/80 mt-3 leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
