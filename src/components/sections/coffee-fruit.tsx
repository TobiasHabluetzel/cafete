import Image from "next/image";
import { useTranslations } from "next-intl";

import { Sticker } from "@/components/brand/sticker";

import cherryPhoto from "../../../public/coffee-cherry-photo.jpg";

/**
 * Full-bleed moody cherry photograph with the copy set over it. The photo is
 * dramatically side-lit with a dark right half, so the text column sits there
 * and a scrim guarantees contrast regardless of viewport crop.
 */
export function CoffeeFruit() {
  const t = useTranslations("coffeeFruit");
  const tBadges = useTranslations("badges");

  const facts = [
    { title: t("tasteTitle"), body: t("tasteBody") },
    { title: t("traditionTitle"), body: t("traditionBody") },
    { title: t("originTitle"), body: t("originBody") },
  ];

  return (
    <section className="bg-night text-cream relative isolate">
      <div className="relative">
        <Image
          src={cherryPhoto}
          alt=""
          sizes="100vw"
          placeholder="blur"
          className="absolute inset-0 size-full object-cover object-left"
        />
        <div aria-hidden className="photo-scrim absolute inset-0" />

        <div className="relative mx-auto max-w-7xl px-4 pt-56 pb-16 sm:px-6 sm:pt-72 lg:px-8 lg:pt-[26rem] lg:pb-24">
          <div className="reveal max-w-2xl">
            <p className="label-caps text-gold">{t("label")}</p>
            <h2 className="text-display text-sticker mt-4 text-balance">
              {t("title")}
            </h2>
            <p className="text-cream/85 mt-6 text-lg leading-relaxed text-balance">
              {t("intro")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Sticker tone="cherry" className="-rotate-2">
                {tBadges("cascara")}
              </Sticker>
              <Sticker tone="gold" className="rotate-1">
                {tBadges("noExtract")}
              </Sticker>
            </div>
          </div>
        </div>
      </div>

      <div className="border-cream/10 border-t">
        <dl className="mx-auto grid max-w-7xl gap-px px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {facts.map((fact) => (
            <div key={fact.title} className="reveal py-10 lg:pr-8">
              <dt className="font-display text-gold text-h3 font-extrabold">
                {fact.title}
              </dt>
              <dd className="text-cream/75 mt-3 leading-relaxed">{fact.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
