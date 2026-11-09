import { useTranslations } from "next-intl";

import { CountUp } from "@/components/brand/count-up";

/** The three numbers from the founding story, in the same gold band as the homepage facts. */
export function AboutStats() {
  const t = useTranslations("aboutStats");
  const items = [
    { to: 20, label: t("years") },
    { to: 3, label: t("journey") },
    { to: 1, label: t("handful") },
  ];

  return (
    <section className="bg-gold text-ink border-ink border-y-2">
      <dl className="divide-ink/80 mx-auto grid max-w-7xl divide-y-2 px-4 sm:px-6 lg:grid-cols-3 lg:divide-x-2 lg:divide-y-0 lg:px-8">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-5 py-5 lg:flex-col lg:items-start lg:gap-2 lg:px-8 lg:py-10 lg:first:pl-0 lg:last:pr-0"
          >
            <dd className="font-display w-20 shrink-0 text-6xl leading-none font-extrabold tabular-nums lg:w-auto lg:text-8xl">
              <CountUp to={item.to} />
            </dd>
            <dt className="text-base leading-tight font-semibold text-balance lg:text-lg">{item.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
