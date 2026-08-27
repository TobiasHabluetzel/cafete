import type { StaticPathname } from "@/i18n/routing";

const DEFAULT_SITE_URL = "https://drink-cafete.ch";

/**
 * Resolve the canonical origin from the environment.
 *
 * Docker/Railway turn an unset build ARG into an *empty string* rather than
 * leaving it undefined, so `??` is not enough — an empty value must fall back
 * too, or `new URL(site.url)` throws during prerendering. A value without a
 * scheme (`drink-cafete.ch`) is also accepted and normalised.
 */
function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(candidate).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const site = {
  name: "CAFÉTÉ",
  domain: "drink-cafete.ch",
  url: resolveSiteUrl(),
  email: "info@drink-cafete.ch",
  entryPriceCHF: 24.9,
  /**
   * "Ein Produkt von" — see docs/cafete-content-pack.md §9.
   *
   * `legalName` supplied by the owner on 2026-08-27 as "Fine & Bold Taste
   * Specialties KIG". Reproduced verbatim: it goes in the Impressum, so it must
   * not be silently "corrected" — but note Swiss legal forms are AG, GmbH and
   * KlG (Kollektivgesellschaft), so "KIG" may be a capital-I/lowercase-l mix-up.
   * Confirm against the commercial register before publishing.
   */
  producer: {
    legalName: "Fine & Bold Taste Specialties KIG",
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

/**
 * Pack sizes. `stripePriceEnv` names the env var holding the Stripe Price ID,
 * resolved server-side. Amounts are deliberately absent: Stripe is the source of
 * truth for pricing.
 *
 * No single bottle — CAFÉTÉ sells in 6s, 12s and 24s only (Tobias, 2026-08-14),
 * which makes the 6-pack the "ab CHF 24.90" entry price.
 */
type PackDefinition = {
  bottles: number;
  labelKey: string;
  stripePriceEnv: string;
  badge?: "bestseller";
};

export const packSizes: readonly PackDefinition[] = [
  { bottles: 6, labelKey: "six", stripePriceEnv: "STRIPE_PRICE_PACK_6" },
  // `badge` is a marketing call, not data — kept here rather than in Stripe
  // metadata so it needs no dashboard work. Move it to metadata if it starts
  // changing often enough to want editing without a deploy.
  {
    bottles: 12,
    labelKey: "twelve",
    stripePriceEnv: "STRIPE_PRICE_PACK_12",
    badge: "bestseller",
  },
  { bottles: 24, labelKey: "twentyfour", stripePriceEnv: "STRIPE_PRICE_PACK_24" },
] as const;

export type PackSize = (typeof packSizes)[number];

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
