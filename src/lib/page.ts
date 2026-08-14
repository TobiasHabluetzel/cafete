import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";

export type LocaleParams = { params: Promise<{ locale: string }> };

/** Every page under `[locale]` is prerendered for both locales. */
export function generateLocaleParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Await the params and opt the page into static rendering. Must be called before
 * any `useTranslations` in the tree, otherwise next-intl falls back to dynamic.
 */
export async function resolvePageLocale(params: LocaleParams["params"]) {
  const { locale } = await params;
  setRequestLocale(locale);
  return locale;
}

/** `export const generateMetadata = createMetadata("product")` */
export function createMetadata(namespace: string, key = "title") {
  return async function generateMetadata({
    params,
  }: LocaleParams): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace });
    return { title: t(key) };
  };
}
