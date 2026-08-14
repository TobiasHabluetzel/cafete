import { useTranslations } from "next-intl";

import { NewsletterForm } from "@/components/layout/newsletter-form";
import { legalNav, mainNav, site } from "@/config/site";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-cream mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-md">
            <h2 className="label-caps text-gold">{t("footer.newsletterHeading")}</h2>
            <p className="text-cream/75 mt-3 text-sm leading-relaxed">
              {t("footer.newsletterText")}
            </p>
            <NewsletterForm className="mt-5" />
          </div>

          <nav aria-labelledby="footer-nav-heading">
            <h2 id="footer-nav-heading" className="label-caps text-gold">
              {t("footer.brandHeading")}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream/75 hover:text-gold transition-colors"
                  >
                    {t(`nav.${item.labelKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="label-caps text-gold">{t("footer.legalHeading")}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream/75 hover:text-gold transition-colors"
                  >
                    {t(`footer.${item.labelKey}`)}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="label-caps text-gold mt-8">{t("footer.contactHeading")}</h2>
            <address className="text-cream/75 mt-4 space-y-1 text-sm not-italic">
              <p>{site.producer.street}</p>
              <p>{site.producer.city}</p>
              <p>
                <a
                  href={`mailto:${site.email}`}
                  className="hover:text-gold underline underline-offset-4 transition-colors"
                >
                  {site.email}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-cream/15 mt-14 border-t pt-8">
          <p className="font-display text-gold-soft text-base font-bold">
            {t("footer.tagline")}
          </p>
          <p className="text-cream/50 mt-3 text-xs">
            {t("footer.copyright", { year: String(year) })}
          </p>
        </div>
      </div>
    </footer>
  );
}
