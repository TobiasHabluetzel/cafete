import { defineRouting } from "next-intl/routing";

export const locales = ["de", "en"] as const;
export const defaultLocale = "de" as const;

export type Locale = (typeof locales)[number];

/**
 * Internal pathnames use the German slug (they mirror the folder names under
 * `src/app/[locale]`); the map below gives each locale its own public URL.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/produkt": { de: "/produkt", en: "/product" },
    "/shop": { de: "/shop", en: "/shop" },
    "/warenkorb": { de: "/warenkorb", en: "/cart" },
    "/event": { de: "/event", en: "/event" },
    "/ueber-uns": { de: "/ueber-uns", en: "/about" },
    "/kontakt": { de: "/kontakt", en: "/contact" },
    "/faq": { de: "/faq", en: "/faq" },
    "/bestellung/[id]": { de: "/bestellung/[id]", en: "/order/[id]" },
    "/impressum": { de: "/impressum", en: "/imprint" },
    "/agb": { de: "/agb", en: "/terms" },
    "/datenschutz": { de: "/datenschutz", en: "/privacy" },
    "/widerruf": { de: "/widerruf", en: "/returns" },
  },
});

export type Pathname = keyof typeof routing.pathnames;

/** Pathnames without dynamic segments — safe to use in nav lists. */
export type StaticPathname = Exclude<Pathname, `${string}[${string}`>;
