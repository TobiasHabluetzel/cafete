import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";
import { site } from "@/config/site";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";

import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(site.url),
    title: {
      default: t("title"),
      template: `%s — ${site.name}`,
    },
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: site.name,
      locale: locale === "de" ? "de_CH" : "en_GB",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html lang={locale} className={`${fontVariables} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col antialiased">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="bg-charcoal text-cream sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:rounded-full focus:px-4 focus:py-2"
          >
            {t("skipToContent")}
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
