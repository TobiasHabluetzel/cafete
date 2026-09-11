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
    "/monatsportraets": { de: "/monatsportraets", en: "/monthly-portraits" },
    // The portrait's own URL must survive the move into the archive, so the slug
    // is the permanent address — nothing about it encodes "current".
    "/monatsportraets/[slug]": {
      de: "/monatsportraets/[slug]",
      en: "/monthly-portraits/[slug]",
    },
    // The QR-code landing page for flyers and stickers. Reached through the short
    // `/qr` shortcut handled in `proxy.ts`, not from the navigation.
    "/entdecken": { de: "/entdecken", en: "/discover" },
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
