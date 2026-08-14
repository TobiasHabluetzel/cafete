import type { StaticPathname } from "@/i18n/routing";

export const site = {
  name: "CAFÉTÉ",
  domain: "drink-cafete.ch",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://drink-cafete.ch",
  email: "info@drink-cafete.ch",
  entryPriceCHF: 24.9,
  /** "Ein Produkt von" — see docs/cafete-content-pack.md §9. */
  producer: {
    street: "Neugasse 33",
    city: "8005 Zürich",
    country: "Schweiz",
  },
  /** "Abgefüllt von". */
  bottler: {
    name: "Creative Food and Beverage Company AG",
    street: "Alte Brauerei Villa, Gurtenbrauerei 14",
    city: "CH-3084 Wabern",
  },
} as const;

export const launchEvent = {
  /** Sat 19 Sept 2026, 13:00–17:00, Europe/Zurich. */
  start: "2026-09-19T13:00:00+02:00",
  end: "2026-09-19T17:00:00+02:00",
  venue: "Restaurant Osso",
  street: "Zollstrasse 121",
  city: "8005 Zürich",
} as const;

type NavItem = { href: StaticPathname; labelKey: string };

export const mainNav: NavItem[] = [
  { href: "/produkt", labelKey: "product" },
  { href: "/shop", labelKey: "shop" },
  { href: "/ueber-uns", labelKey: "about" },
  { href: "/event", labelKey: "event" },
  { href: "/faq", labelKey: "faq" },
  { href: "/kontakt", labelKey: "contact" },
];

export const legalNav: NavItem[] = [
  { href: "/impressum", labelKey: "imprint" },
  { href: "/agb", labelKey: "terms" },
  { href: "/datenschutz", labelKey: "privacy" },
  { href: "/widerruf", labelKey: "returns" },
];
