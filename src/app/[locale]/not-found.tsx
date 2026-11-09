import { useTranslations } from "next-intl";

import { ctaClass } from "@/components/brand/cta-button";
import { BubbleGame } from "@/components/sections/bubble-game";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <section className="page-head flex min-h-[80svh] flex-col items-center justify-center px-4 py-20 text-center">
      <p aria-hidden className="page-title text-[clamp(7rem,34vw,24rem)]">404</p>
      <h1 className="text-h1 mt-2 text-balance">{t("title")}</h1>
      <p className="mt-4 max-w-prose text-lg font-medium">{t("body")}</p>
      <BubbleGame />
      <Link href="/" className={ctaClass({ variant: "dark", size: "lg", className: "mt-6" })}>
        {t("cta")}
      </Link>
    </section>
  );
}
