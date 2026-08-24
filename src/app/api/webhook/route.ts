import { NextResponse } from "next/server";
import Stripe from "stripe";

import { site } from "@/config/site";
import { sendMail, sendNotification } from "@/lib/email";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

/**
 * Stripe webhook. Signature verification needs the *raw* body, so this handler
 * reads `request.text()` and must never parse JSON first.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !secret) {
    return NextResponse.json({ error: "stripe-not-configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing-signature" }, { status: 400 });
  }

  const raw = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, signature, secret);
  } catch (error) {
    // A bad signature is the one case where returning 400 is correct — Stripe
    // should not retry something it cannot sign.
    const message = error instanceof Error ? error.message : String(error);
    console.error("[webhook] signature verification failed:", message);
    return NextResponse.json({ error: "invalid-signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCompletedCheckout(event.data.object, stripe);
    }
  } catch (error) {
    // Return 500 so Stripe retries — the payment succeeded, only our follow-up
    // failed, and swallowing it would silently lose the order confirmation.
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[webhook] handling ${event.type} failed:`, message);
    return NextResponse.json({ error: "handler-failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCompletedCheckout(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
) {
  /*
   * The webhook payload's line_items are not expanded, so fetch them.
   *
   * Stripe's "Send test webhook" button in the dashboard posts a synthetic event
   * whose session does not exist, so this lookup 404s. That is worth tolerating:
   * it lets the endpoint and its signing secret be verified from the dashboard
   * without putting a real order through. Any other failure still throws, so
   * Stripe retries and a genuine confirmation is never lost.
   */
  let lineItems: Stripe.ApiList<Stripe.LineItem>;
  try {
    lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      error.code === "resource_missing"
    ) {
      console.warn(
        `[webhook] session ${session.id} does not exist — treating as a dashboard test event`,
      );
      return;
    }
    throw error;
  }

  const currency = (session.currency ?? "chf").toUpperCase();
  const money = (amount: number | null | undefined) =>
    `${currency} ${((amount ?? 0) / 100).toFixed(2)}`;

  const lines = lineItems.data.map(
    (item) => `  ${item.quantity} × ${item.description ?? "—"}  ${money(item.amount_total)}`,
  );

  const address = session.customer_details?.address;
  const shipTo = [
    session.customer_details?.name,
    address?.line1,
    address?.line2,
    [address?.postal_code, address?.city].filter(Boolean).join(" "),
    address?.country,
  ]
    .filter(Boolean)
    .join("\n");

  const isGerman = session.metadata?.locale !== "en";
  const summary = [
    ...lines,
    "",
    isGerman ? `Total: ${money(session.amount_total)}` : `Total: ${money(session.amount_total)}`,
    "",
    isGerman ? "Lieferadresse:" : "Delivery address:",
    shipTo || "—",
  ].join("\n");

  const email = session.customer_details?.email;

  // Customer confirmation. Plain text on purpose — a templated HTML mail is a
  // Phase 3 concern and this is the launch-critical part.
  if (email) {
    const result = await sendMail({
      to: email,
      subject: isGerman
        ? "Deine CAFÉTÉ Bestellung — vielen Dank!"
        : "Your CAFÉTÉ order — thank you!",
      text: (isGerman
        ? [
            `Hallo${session.customer_details?.name ? ` ${session.customer_details.name}` : ""},`,
            "",
            "vielen Dank für deine Bestellung bei CAFÉTÉ. Hier die Übersicht:",
            "",
            summary,
            "",
            "Wir melden uns, sobald das Paket unterwegs ist.",
            "",
            `Fragen? Antworte einfach auf diese Mail oder schreib an ${site.email}.`,
            "",
            "Fruity. Fizzy. Focus.",
            "CAFÉTÉ",
          ]
        : [
            `Hi${session.customer_details?.name ? ` ${session.customer_details.name}` : ""},`,
            "",
            "thanks for your CAFÉTÉ order. Here's the summary:",
            "",
            summary,
            "",
            "We'll be in touch as soon as your parcel is on its way.",
            "",
            `Questions? Just reply to this email or write to ${site.email}.`,
            "",
            "Fruity. Fizzy. Focus.",
            "CAFÉTÉ",
          ]
      ).join("\n"),
    });

    if (!result.ok) {
      // Not configured is expected before RESEND_API_KEY is set; a send failure
      // is not, and should bubble up so Stripe retries.
      if (result.reason === "send-failed") {
        throw new Error(`confirmation email failed: ${result.detail ?? "unknown"}`);
      }
      console.warn("[webhook] confirmation email skipped: Resend not configured");
    }
  }

  // Internal copy so there is a record even if the customer mail bounces.
  await sendNotification({
    subject: `CAFÉTÉ — neue Bestellung ${money(session.amount_total)}`,
    text: [
      `Session:  ${session.id}`,
      `E-Mail:   ${email ?? "—"}`,
      `Bezahlt:  ${session.payment_status}`,
      "",
      summary,
    ].join("\n"),
    ...(email ? { replyTo: email } : {}),
  });
}
