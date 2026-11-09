import { useTranslations } from "next-intl";

/**
 * The sugar comparison as bars. Each full bar is the other drink, and the gold
 * part is how much of that sugar CAFÉTÉ has. The percentages are the same ones the
 * site already states; "über 50 %" is drawn at 50.
 */
export function SugarBars() {
  const t = useTranslations("sugarBars");
  const rows = [
    { key: "soft", less: 50 },
    { key: "energy", less: 59 },
    { key: "mate", less: 20 },
  ] as const;

  return (
    <section className="bg-night text-cream py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="label-caps text-gold">{t("label")}</p>
        <h2 className="text-h1 lg:text-display mt-3 max-w-3xl text-balance">{t("title")}</h2>
        <ul className="mt-10 space-y-7 lg:mt-14">
          {rows.map((row) => (
            <li key={row.key} className="reveal">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span className="font-display text-xl font-extrabold lg:text-2xl">{t(`${row.key}.name`)}</span>
                <span className="text-gold font-semibold">{t(`${row.key}.value`)}</span>
              </div>
              <div className="bg-cream/15 mt-2 h-5 overflow-hidden rounded-full lg:h-7">
                <div
                  className="sugar-bar bg-gold h-full rounded-full"
                  style={{ width: `${100 - row.less}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
