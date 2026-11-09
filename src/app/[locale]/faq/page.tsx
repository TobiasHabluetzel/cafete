import { getTranslations } from "next-intl/server";

import { ctaClass } from "@/components/brand/cta-button";
import { PageHeader, Section } from "@/components/layout/section";
import { Link } from "@/i18n/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { site } from "@/config/site";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata({ namespace: "faq", descriptionKey: "faq", pathname: "/faq" });

type FaqItem = { q: string; a: string };

export default async function FaqPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "faq" });

  // `t.raw` returns the array as-is; the {email} placeholder is substituted here
  // because raw values skip ICU formatting.
  const items = (t.raw("items") as FaqItem[]).map((item) => ({
    q: item.q,
    a: item.a.replace("{email}", site.email),
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />

      <PageHeader label={t("label")} title={t("title")} />

      <Section tone="cream">
        <div className="grid gap-10 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-display text-h2 font-extrabold text-balance">{t("moreTitle")}</p>
            <Link href="/kontakt" className={ctaClass({ variant: "dark", size: "md", className: "mt-5" })}>
              {t("moreCta")}
            </Link>
          </div>
        <Accordion>
          {items.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`} className="faq-item">
              <AccordionTrigger className="font-display text-left font-extrabold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-charcoal/85 pb-3 text-lg leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        </div>
      </Section>
    </>
  );
}
