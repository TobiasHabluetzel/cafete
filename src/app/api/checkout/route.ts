import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { resolveRequestOrigin } from "@/lib/request-origin";
import {
  getStripe,
  isStripeConfigured,
  priceIdForPack,
  shippingCountries,
} from "@/lib/stripe";

type IncomingItem = { bottles?: unknown; quantity?: unknown };

const MAX_QUANTITY_PER_LINE = 20;

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "stripe-not-configured" }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { items, locale: rawLocale } = (payload ?? {}) as {
    items?: unknown;
    locale?: unknown;
  };

  const locale =
    typeof rawLocale === "string" &&
    (routing.locales as readonly string[]).includes(rawLocale)
      ? (rawLocale as (typeof routing.locales)[number])
      : routing.defaultLocale;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "empty-cart" }, { status: 422 });
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const raw of items as IncomingItem[]) {
    const bottles = Number(raw?.bottles);
    const quantity = Number(raw?.quantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      return NextResponse.json({ error: "invalid-quantity" }, { status: 422 });
    }

    // Never trust a price from the client — resolve it server-side from the
    // pack size. The browser only ever tells us *which* pack and how many.
    const price = priceIdForPack(bottles);
    if (!price) {
      return NextResponse.json(
        { error: "unknown-pack", bottles: raw?.bottles },
        { status: 422 },
      );
    }

    lineItems.push({ price, quantity, adjustable_quantity: { enabled: true, maximum: MAX_QUANTITY_PER_LINE } });
  }

  // Build locale-correct return URLs from the slug map, so /en lands on /en/order.
  // The origin must come from the forwarded headers, not request.url: behind
  // Railway's proxy the latter is the container's own 0.0.0.0:8080 bind address,
  // which sent the post-payment redirect to a dead host.
  const origin = resolveRequestOrigin(request);
  const successPath = getPathname({
    locale,
    href: { pathname: "/bestellung/[id]", params: { id: "SESSION_ID" } },
  });
  const cancelPath = getPathname({ locale, href: "/warenkorb" });

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      /*
       * Payment methods and currency are both left unset on purpose.
       *
       * Hardcoding `payment_method_types: ["card", "twint"]` makes session
       * creation fail outright until TWINT is activated on the account — the shop
       * would be dead rather than card-only. Omitting it means Stripe uses the
       * account's Dashboard payment-method settings and filters by eligibility,
       * so cards work today and TWINT appears by itself once enabled.
       *
       * Currency comes from the Price. Passing it here as well only creates the
       * chance of a mismatch error. Prices must be CHF regardless — TWINT is
       * CHF-only.
       */
      locale: locale === "de" ? "de" : "en",
      shipping_address_collection: { allowed_countries: shippingCountries() },
      billing_address_collection: "auto",
      phone_number_collection: { enabled: false },
      // Stripe Tax is opt-in: below the CHF 100k threshold CAFÉTÉ may not charge
      // VAT at all, so enabling it by default would be wrong.
      automatic_tax: { enabled: process.env.STRIPE_TAX_ENABLED === "true" },
      ...(process.env.STRIPE_SHIPPING_RATE
        ? { shipping_options: [{ shipping_rate: process.env.STRIPE_SHIPPING_RATE }] }
        : {}),
      success_url: `${origin}${successPath.replace("SESSION_ID", "{CHECKOUT_SESSION_ID}")}`,
      cancel_url: `${origin}${cancelPath}`,
      metadata: { locale },
    });

    if (!session.url) {
      return NextResponse.json({ error: "no-session-url" }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[checkout] session create failed:", message);
    return NextResponse.json({ error: "stripe-error", message }, { status: 502 });
  }
}
