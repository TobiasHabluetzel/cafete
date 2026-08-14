import { useTranslations } from "next-intl";

import { ctaClass } from "@/components/brand/cta-button";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="font-display text-sunset text-7xl font-extrabold">404</p>
      <h1 className="text-h1 text-charcoal mt-4">{t("title")}</h1>
      <p className="text-charcoal/70 mt-4 max-w-prose">{t("body")}</p>
      <Link href="/" className={ctaClass({ size: "md", className: "mt-8" })}>
        {t("cta")}
      </Link>
    </section>
  );
}
