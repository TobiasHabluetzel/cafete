import "server-only";

import Stripe from "stripe";

import { packSizes, type PackSize } from "@/config/site";

/**
 * Stripe is created lazily, never at module scope. The production image is built
 * without secrets (Railway injects them at runtime, and `next build` prerenders
 * pages), so constructing a client on import would fail the build.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local (local) or the Railway service variables.",
    );
  }
  client ??= new Stripe(key, {
    // Pinned to the version this SDK ships with, so a Stripe-side default bump
    // can't change behaviour under us. Bump deliberately, alongside the SDK.
    apiVersion: "2026-07-29.dahlia",
    appInfo: { name: "CAFÉTÉ", url: "https://drink-cafete.ch" },
  });
  return client;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Resolve a pack size to its Stripe Price ID. Prices live in Stripe — the source
 * of truth for the catalogue — and only the env var *name* is in the repo.
 */
export function priceIdForPack(bottles: number): string | undefined {
  const pack = packSizes.find((p) => p.bottles === bottles);
  if (!pack) return undefined;
  const value = process.env[pack.stripePriceEnv]?.trim();
  return value ? value : undefined;
}

/** Which packs are actually purchasable right now, i.e. have a Price ID set. */
export function configuredPacks(): PackSize[] {
  return packSizes.filter((pack) => Boolean(priceIdForPack(pack.bottles)));
}

/** Countries we ship to. Comma-separated env override, CH by default. */
export function shippingCountries(): Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] {
  const raw = process.env.STRIPE_SHIPPING_COUNTRIES?.trim();
  const codes = raw ? raw.split(",").map((c) => c.trim().toUpperCase()) : ["CH"];
  return codes as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[];
}
