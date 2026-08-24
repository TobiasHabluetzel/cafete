import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Sticker } from "@/components/brand/sticker";
import { PageHeader, Section, SectionHeader } from "@/components/layout/section";
import { Story } from "@/components/sections/story";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

import hannesPhoto from "../../../../public/founder-hannes.jpg";
import kareemPhoto from "../../../../public/founder-kareem.jpg";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata("nav", "about");

export default async function AboutPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tVision = await getTranslations({ locale, namespace: "vision" });
  const tFounders = await getTranslations({ locale, namespace: "founders" });

  const founders = [
    { key: "kareem", photo: kareemPhoto },
    { key: "hannes", photo: hannesPhoto },
  ] as const;

  return (
    <>
      {/* The vision paragraph belongs to its own section further down; having it
          here as well printed the same text twice on one page. */}
      <PageHeader label={tFounders("label")} title={tNav("about")} />

      <Story variant="full" />

      <Section tone="cream">
        <SectionHeader
          label={tFounders("label")}
          title={tFounders("title")}
          align="center"
        />

        <div className="mt-14 space-y-14 lg:space-y-20">
          {founders.map((founder, index) => {
            const flipped = index % 2 === 1;
            return (
              <article
                key={founder.key}
                className={
                  "reveal grid items-start gap-8 lg:gap-14 " +
                  // The column templates have to swap along with the order,
                  // otherwise the flipped photo lands in the `1fr` column and
                  // stretches to fill it.
                  (flipped
                    ? "lg:grid-cols-[1fr_minmax(0,20rem)]"
                    : "lg:grid-cols-[minmax(0,20rem)_1fr]")
                }
              >
                <Image
                  src={founder.photo}
                  alt={tFounders(`${founder.key}.name`)}
                  sizes="(max-width: 1024px) 90vw, 20rem"
                  placeholder="blur"
                  className={
                    // Same keyline and hard offset as the stickers, so the
                    // portraits sit inside the design language rather than
                    // beside it.
                    "border-ink/80 mx-auto w-full max-w-sm rounded-lg border-2 shadow-[7px_7px_0_rgba(0,0,0,0.35)] lg:mx-0 lg:max-w-none" +
                    (flipped ? " lg:order-2" : "")
                  }
                />

                {/* Text stays left-aligned in both rows — ragged-left body copy
                    is markedly harder to read. Only the photo side alternates. */}
                <div className={flipped ? "lg:order-1" : ""}>
                  <h3 className="text-h1">{tFounders(`${founder.key}.name`)}</h3>
                  <p className="mt-4">
                    <Sticker tone="gold" className="-rotate-1">
                      {tFounders(`${founder.key}.role`)}
                    </Sticker>
                  </p>
                  <p className="text-charcoal/80 mt-6 max-w-prose leading-relaxed lg:text-lg">
                    {tFounders(`${founder.key}.bio`)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      {/* Orange, not charcoal: the footer directly below is charcoal, so a dark
          Vision block merged into it instead of reading as its own section. */}
      <Section tone="sunset">
        <SectionHeader
          label={tVision("label")}
          title={tVision("title")}
          intro={tVision("body")}
          align="center"
          labelClassName="text-cherry-ink"
        />
      </Section>
    </>
  );
}
