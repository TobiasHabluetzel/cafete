import { getTranslations } from "next-intl/server";

import { Section, SectionHeader } from "@/components/layout/section";
import { ReviewForm } from "@/components/reviews/review-form";
import { Stars } from "@/components/reviews/stars";
import {
  getReviewSummary,
  listApprovedReviews,
  MIN_PUBLIC_REVIEWS,
} from "@/lib/reviews";

/**
 * Reviews on the product page.
 *
 * Two things are gated separately on purpose:
 *
 * - the **list and the average** appear only once `MIN_PUBLIC_REVIEWS` are
 *   approved, because "1 Bewertung · 5,0" reads worse than saying nothing;
 * - the **form** is always there, or the first few could never be collected.
 */
export async function ReviewsSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "reviews" });

  const summary = await getReviewSummary();
  const published = summary.count >= MIN_PUBLIC_REVIEWS;
  const items = published ? await listApprovedReviews() : [];

  const dateFormat = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "de-CH", {
    year: "numeric",
    month: "long",
  });

  return (
    <Section tone="white">
      <SectionHeader
        label={t("label")}
        title={t("title")}
        intro={published ? undefined : t("introEmpty")}
      />

      {published ? (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="font-display text-charcoal text-4xl font-extrabold tabular-nums">
              {summary.average?.toLocaleString(locale === "en" ? "en-GB" : "de-CH", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </span>
            <Stars
              rating={summary.average ?? 0}
              size="lg"
              label={t("starsOutOf", { rating: summary.average ?? 0 })}
            />
            <span className="text-charcoal/60">
              {t("count", { count: summary.count })}
            </span>
          </div>

          <ul className="mt-10 grid gap-6 lg:grid-cols-2">
            {items.map((review) => (
              <li
                key={review.id}
                className="border-ink/85 flex flex-col rounded-lg border-2 bg-white p-6 shadow-[5px_5px_0_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <Stars
                    rating={review.rating}
                    size="sm"
                    label={t("starsOutOf", { rating: review.rating })}
                  />
                  <span className="text-charcoal/50 text-xs">
                    {dateFormat.format(review.createdAt)}
                  </span>
                </div>

                <p className="font-display text-charcoal mt-3 font-extrabold">
                  {review.authorName}
                </p>
                <p className="text-charcoal/80 mt-2 leading-relaxed whitespace-pre-line">
                  {review.body}
                </p>

                {/* CAFÉTÉ's own reply, clearly marked as the brand speaking
                    rather than another customer. */}
                {review.reply ? (
                  <div className="border-sunset bg-cream/60 mt-4 rounded-md border-l-4 p-4">
                    <p className="label-caps text-sunset-ink">{t("replyLabel")}</p>
                    <p className="text-charcoal/80 mt-1.5 text-sm leading-relaxed whitespace-pre-line">
                      {review.reply.body}
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <ReviewForm />
    </Section>
  );
}
