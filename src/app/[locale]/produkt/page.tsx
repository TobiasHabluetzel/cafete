import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { ctaClass } from "@/components/brand/cta-button";
import { PageHeader, Section } from "@/components/layout/section";
import { CoffeeFruit } from "@/components/sections/coffee-fruit";
import { Link } from "@/i18n/navigation";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata("nav", "product");

type NutritionRow = { nutrient: string; value: string };

export default async function ProductPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "product" });
  const tProject = await getTranslations({ locale, namespace: "project" });
  const tShop = await getTranslations({ locale, namespace: "shopTeaser" });

  const nutrition = t.raw("nutrition") as NutritionRow[];

  const specs = [
    { label: t("volumeLabel"), value: t("volumeValue") },
    { label: t("extractLabel"), value: t("extractValue") },
    { label: t("storageLabel"), value: t("storageValue") },
    { label: t("taglineLabel"), value: t("taglineValue") },
  ];

  return (
    <>
      <PageHeader label={t("label")} title={t("title")} intro={t("subtitle")} />

      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1fr] lg:gap-16">
          <div className="relative flex justify-center lg:justify-start">
            <div
              aria-hidden
              className="bg-sunset/20 absolute inset-0 m-auto aspect-square w-[70%] rounded-full blur-3xl"
            />
            <Image
              src="/bottle-mockup.svg"
              alt=""
              width={260}
              height={720}
              priority
              className="relative h-[420px] w-auto drop-shadow-[0_18px_40px_rgba(20,16,14,0.22)]"
            />
          </div>

          <div>
            <h2 className="text-h2">{tProject("title")}</h2>
            <p className="text-charcoal/80 mt-4 text-lg leading-relaxed">
              {tProject("body")}
            </p>

            <dl className="mt-10 space-y-4">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="border-charcoal/10 grid gap-1 border-t pt-4 sm:grid-cols-[10rem_1fr] sm:gap-4"
                >
                  <dt className="label-caps text-charcoal/55 pt-1">{spec.label}</dt>
                  <dd className="text-charcoal/85">{spec.value}</dd>
                </div>
              ))}
            </dl>

            <Link href="/shop" className={ctaClass({ size: "lg", className: "mt-10" })}>
              {tShop("cta")}
            </Link>
          </div>
        </div>
      </Section>

      <CoffeeFruit />

      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-h2">{t("ingredientsTitle")}</h2>
            <p className="text-charcoal/80 mt-4 leading-relaxed">
              {t("ingredientsValue")}
            </p>
          </div>

          <div>
            <h2 className="text-h2">{t("nutritionTitle")}</h2>
            <table className="mt-4 w-full text-left text-sm">
              <caption className="sr-only">{t("nutritionTitle")}</caption>
              <thead>
                <tr className="border-charcoal/15 border-b">
                  <th scope="col" className="label-caps text-charcoal/55 py-2">
                    {t("nutritionHeadNutrient")}
                  </th>
                  <th scope="col" className="label-caps text-charcoal/55 py-2 text-right">
                    {t("nutritionHeadValue")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {nutrition.map((row) => (
                  <tr key={row.nutrient} className="border-charcoal/10 border-b">
                    <th scope="row" className="text-charcoal/85 py-2.5 font-normal">
                      {row.nutrient}
                    </th>
                    <td className="text-charcoal py-2.5 text-right font-semibold tabular-nums">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </>
  );
}
