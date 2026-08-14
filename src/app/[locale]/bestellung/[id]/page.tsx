import { getTranslations } from "next-intl/server";

import { ctaClass } from "@/components/brand/cta-button";
import { Sticker } from "@/components/brand/sticker";
import { PageHeader, Section } from "@/components/layout/section";
import { ClearCartOnMount } from "@/components/shop/clear-cart-on-mount";
import { site } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { createMetadata, resolvePageLocale } from "@/lib/page";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const generateMetadata = createMetadata("order");

// Depends on a live Stripe lookup, so never prerendered or cached.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function OrderPage({ params }: Props) {
  const { locale, id } = await params;
  await resolvePageLocale(Promise.resolve({ locale }));

  const t = await getTranslations({ locale, namespace: "order" });

  const session = await loadSession(id);

  if (!session) {
    return (
      <>
        <PageHeader title={t("title")} />
        <Section tone="cream">
          <p className="text-charcoal/80 max-w-prose text-lg leading-relaxed">
            {t("notFound", { email: site.email })}
          </p>
          <Link href="/shop" className={ctaClass({ size: "lg", className: "mt-8" })}>
            {t("continue")}
          </Link>
        </Section>
      </>
    );
  }

  const paid = session.paymentStatus === "paid";
  const money = (amount: number | null) =>
    amount === null ? "—" : `${session.currency} ${(amount / 100).toFixed(2)}`;

  return (
    <>
      {/* The order exists, so the basket has served its purpose. */}
      {paid ? <ClearCartOnMount /> : null}

      <PageHeader title={t("title")} intro={paid ? t("intro") : t("pending")}>
        <div className="mt-7">
          <Sticker tone="gold" className="-rotate-1">
            {t("reference")}: {session.reference}
          </Sticker>
        </div>
      </PageHeader>

      <Section tone="cream">
        <div className="max-w-2xl">
          <p className="text-charcoal/80">
            {session.email
              ? t("emailNote", { email: session.email })
              : t("emailNoteFallback")}
          </p>

          <h2 className="text-h2 mt-10">{t("summaryTitle")}</h2>
          <ul className="border-charcoal/15 divide-charcoal/10 mt-4 divide-y border-y">
            {session.lines.map((line, index) => (
              <li key={index} className="flex items-baseline justify-between gap-4 py-3">
                <span>
                  <span className="font-semibold tabular-nums">{line.quantity} × </span>
                  {line.description}
                </span>
                <span className="font-semibold tabular-nums whitespace-nowrap">
                  {money(line.amount)}
                </span>
              </li>
            ))}
          </ul>

          <p className="font-display mt-5 flex items-baseline justify-between text-xl font-extrabold">
            <span>{t("total")}</span>
            <span className="tabular-nums">{money(session.total)}</span>
          </p>

          {session.shipTo.length > 0 ? (
            <>
              <h2 className="text-h3 mt-10">{t("shipTo")}</h2>
              <address className="text-charcoal/80 mt-3 space-y-1 not-italic">
                {session.shipTo.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </address>
            </>
          ) : null}

          <Link href="/" className={ctaClass({ size: "lg", className: "mt-10" })}>
            {t("continue")}
          </Link>
        </div>
      </Section>
    </>
  );
}

async function loadSession(id: string) {
  // Stripe Checkout Session IDs look like cs_test_… / cs_live_… — reject
  // anything else rather than making a doomed API call for arbitrary input.
  if (!isStripeConfigured() || !/^cs_[A-Za-z0-9_]+$/.test(id)) return null;

  try {
    const session = await getStripe().checkout.sessions.retrieve(id, {
      expand: ["line_items"],
    });

    const address = session.customer_details?.address;
    return {
      reference: session.id.slice(-8).toUpperCase(),
      paymentStatus: session.payment_status,
      currency: (session.currency ?? "chf").toUpperCase(),
      total: session.amount_total,
      email: session.customer_details?.email ?? null,
      lines: (session.line_items?.data ?? []).map((item) => ({
        description: item.description ?? "—",
        quantity: item.quantity ?? 1,
        amount: item.amount_total,
      })),
      shipTo: [
        session.customer_details?.name,
        address?.line1,
        address?.line2,
        [address?.postal_code, address?.city].filter(Boolean).join(" ").trim(),
        address?.country,
      ].filter((value): value is string => Boolean(value && value.length > 0)),
    };
  } catch (error) {
    console.error("[order] could not retrieve session:", error);
    return null;
  }
}
