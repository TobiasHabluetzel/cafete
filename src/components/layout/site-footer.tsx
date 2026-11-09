import NextLink from "next/link";
import { useTranslations } from "next-intl";

import { SloganMarquee } from "@/components/brand/marquee";

import { NewsletterForm } from "@/components/layout/newsletter-form";
import { legalNav, mainNav, site } from "@/config/site";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-cream mt-auto">
      <SloganMarquee />
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
          <p className="text-cream/50 mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
            <span>{t("footer.copyright", { year: String(year) })}</span>
            {/* /admin has no locale prefix, so this is the plain Next link. No prefetch:
                nearly every visitor will never open it. */}
            <NextLink
              href="/admin"
              prefetch={false}
              rel="nofollow"
              className="text-cream/35 hover:text-cream/80 py-2 transition-colors"
            >
              Admin
            </NextLink>
          </p>
        </div>
      </div>
      <span aria-hidden className="footer-giant">
        CAFÉTÉ
      </span>
    </footer>
  );
}
