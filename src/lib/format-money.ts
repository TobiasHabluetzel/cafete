/**
 * Format a Stripe amount (minor units, e.g. rappen) for display.
 *
 * Shared between server and client: pack cards format on the server, while the
 * cart has to re-format as quantities change.
 */
export function formatMoney(minorUnits: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale === "en" ? "en-CH" : "de-CH", {
    style: "currency",
    currency,
  }).format(minorUnits / 100);
}
