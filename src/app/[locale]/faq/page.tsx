import { getTranslations } from "next-intl/server";

import { PageHeader, Section } from "@/components/layout/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { site } from "@/config/site";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata("faq");

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
      <PageHeader label={t("label")} title={t("title")} />

      <Section tone="cream">
        <Accordion className="mx-auto max-w-3xl">
          {items.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`}>
              <AccordionTrigger className="font-display text-left text-lg font-extrabold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-charcoal/80 leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
    </>
  );
}
