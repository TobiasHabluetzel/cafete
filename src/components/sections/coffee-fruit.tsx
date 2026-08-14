import { useTranslations } from "next-intl";

import { Section, SectionHeader } from "@/components/layout/section";

export function CoffeeFruit() {
  const t = useTranslations("coffeeFruit");

  const facts = [
    { title: t("tasteTitle"), body: t("tasteBody") },
    { title: t("traditionTitle"), body: t("traditionBody") },
    { title: t("originTitle"), body: t("originBody") },
  ];

  return (
    <Section tone="cream">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeader
            label={t("label")}
            title={t("title")}
            intro={t("intro")}
          />

          {/* Decorative coffee-cherry illustration slot — swap in the
              designer's coffee-cherry-photo.jpg here. */}
          <div
            aria-hidden
            className="bg-sunburst shadow-brand mt-10 hidden aspect-[4/3] rounded-lg lg:block"
          />
        </div>

        <dl className="space-y-8">
          {facts.map((fact) => (
            <div key={fact.title} className="border-charcoal/10 border-t pt-6">
              <dt className="font-display text-h3 text-sunset-deep font-extrabold">
                {fact.title}
              </dt>
              <dd className="text-charcoal/80 mt-3 leading-relaxed">{fact.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
