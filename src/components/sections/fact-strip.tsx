import { useTranslations } from "next-intl";

/**
 * The product facts as big type on a gold band, replacing the row of stickers:
 * when everything is a rotated pill, nothing stands out.
 */
export function FactStrip() {
  const t = useTranslations("facts");
  const keys = ["volume", "sugar", "swiss"] as const;

  return (
    <section className="bg-gold text-ink border-ink border-y-2">
      <dl className="divide-ink/80 mx-auto grid max-w-7xl divide-y-2 px-4 sm:px-6 lg:grid-cols-3 lg:divide-x-2 lg:divide-y-0 lg:px-8">
        {keys.map((key) => (
          <div
            key={key}
            className="flex items-baseline gap-4 py-5 lg:flex-col lg:gap-2 lg:px-8 lg:py-10 lg:first:pl-0 lg:last:pr-0"
          >
            <dd className="font-display shrink-0 text-6xl leading-none font-extrabold tracking-tight tabular-nums lg:text-8xl">
              {t(`${key}.value`)}
            </dd>
            <dt className="text-base leading-tight font-semibold text-balance lg:text-lg">
              {t(`${key}.label`)}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
