import { getTranslations } from "next-intl/server";

import { PageHeader, Section, SectionHeader } from "@/components/layout/section";
import { Story } from "@/components/sections/story";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata("nav", "about");

export default async function AboutPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tVision = await getTranslations({ locale, namespace: "vision" });
  const tFounders = await getTranslations({ locale, namespace: "founders" });

  const founders = ["kareem", "hannes"] as const;

  return (
    <>
      <PageHeader
        label={tFounders("label")}
        title={tNav("about")}
        intro={tVision("body")}
      />

      <Story withLink={false} />

      <Section tone="cream">
        <SectionHeader
          label={tFounders("label")}
          title={tFounders("title")}
          align="center"
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {founders.map((founder) => (
            <article
              key={founder}
              className="border-charcoal/10 shadow-brand rounded-lg border bg-white p-7"
            >
              {/* Swap in founder-kareem.jpg / founder-hannes.jpg here. */}
              <div
                aria-hidden
                className="bg-sunburst mb-6 aspect-[4/3] w-full rounded-md"
              />
              <h3 className="text-h3">{tFounders(`${founder}.name`)}</h3>
              <p className="label-caps text-sunset-deep mt-2">
                {tFounders(`${founder}.role`)}
              </p>
              <p className="text-charcoal/80 mt-4 leading-relaxed">
                {tFounders(`${founder}.bio`)}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="charcoal">
        <SectionHeader
          label={tVision("label")}
          title={tVision("title")}
          intro={tVision("body")}
          align="center"
          labelClassName="text-gold"
        />
      </Section>
    </>
  );
}
