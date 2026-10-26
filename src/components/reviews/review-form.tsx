"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { ctaClass } from "@/components/brand/cta-button";
import { site } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "done" | "error" | "tooMany";

/**
 * The review form.
 *
 * Always available, even while the public list is still hidden for want of
 * approved reviews — otherwise the first ones could never be collected.
 *
 * Collapsed behind a button by default. An open form at the foot of the product
 * page reads as a demand; a button reads as an offer, and keeps the page about
 * the drink.
 */
export function ReviewForm() {
  const t = useTranslations("reviews");
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // When the form was opened, so the server can reject a submission that
  // arrived faster than a person could type one.
  const startedAt = useRef<number>(0);

  function openForm() {
    startedAt.current = Date.now();
    setOpen(true);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = new FormData(event.currentTarget);
    const body = String(form.get("body") ?? "").trim();
    const name = String(form.get("name") ?? "").trim();

    // Checked here as well as on the server so the reader is told what is wrong
    // before a round trip, not after one.
    if (rating < 1) return setError(t("errorRating"));
    if (name.length < 2) return setError(t("errorName"));
    if (body.length < 10) return setError(t("errorBody"));

    setError(null);
    setStatus("sending");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: String(form.get("email") ?? "").trim() || undefined,
          rating,
          body,
          locale,
          website: String(form.get("website") ?? ""),
          startedAt: startedAt.current,
        }),
      });

      if (response.status === 429) return setStatus("tooMany");
      if (!response.ok) return setStatus("error");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div
        role="status"
        className="border-ink/85 bg-cream mt-8 rounded-lg border-2 p-6 shadow-[5px_5px_0_rgba(0,0,0,0.35)]"
      >
        <p className="font-display text-charcoal text-lg font-extrabold">{t("thanksTitle")}</p>
        {/* Says "we read it first" rather than implying it is already live. */}
        <p className="text-charcoal/75 mt-2 text-sm leading-relaxed">{t("thanksBody")}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={openForm} className={ctaClass({ variant: "outline", size: "md", className: "mt-8 text-charcoal" })}>
        {t("writeCta")}
      </button>
    );
  }

  const shown = hovered || rating;

  return (
    <form
      onSubmit={onSubmit}
      className="border-ink/85 bg-cream mt-8 space-y-5 rounded-lg border-2 p-6 shadow-[5px_5px_0_rgba(0,0,0,0.35)]"
    >
      <fieldset>
        <legend className="label-caps text-charcoal/70">{t("ratingLabel")}</legend>
        <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => { setRating(n); setError(null); }}
              onMouseEnter={() => setHovered(n)}
              aria-label={t("starLabel", { n })}
              aria-pressed={rating === n}
              className="focus-visible:ring-gold cursor-pointer rounded p-0.5 focus-visible:ring-3 focus-visible:outline-none"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" className={n <= shown ? "text-gold" : "text-charcoal/20"}>
                <path
                  d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z"
                  fill="currentColor"
                  stroke="rgba(0,0,0,0.85)"
                  strokeWidth={n <= shown ? 1.4 : 0}
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label-caps text-charcoal/70">{t("nameLabel")}</span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className="border-charcoal/25 focus:border-sunset mt-1.5 w-full rounded-md border-2 bg-white px-3 py-2 outline-none"
          />
        </label>
        <label className="block">
          <span className="label-caps text-charcoal/70">{t("emailLabel")}</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="border-charcoal/25 focus:border-sunset mt-1.5 w-full rounded-md border-2 bg-white px-3 py-2 outline-none"
          />
          <span className="text-charcoal/55 mt-1 block text-xs">{t("emailHint")}</span>
        </label>
      </div>

      <label className="block">
        <span className="label-caps text-charcoal/70">{t("bodyLabel")}</span>
        <textarea
          name="body"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          className="border-charcoal/25 focus:border-sunset mt-1.5 w-full rounded-md border-2 bg-white px-3 py-2 outline-none"
        />
      </label>

      {/*
        * Honeypot. Hidden from people and from screen readers, left in the DOM
        * for a bot to fill in. Positioned off-screen rather than display:none,
        * which the better form fillers skip.
        */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error ? (
        <p role="alert" className="text-cherry-deep text-sm">{error}</p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="text-cherry-deep text-sm">
          {t("errorSend", { email: site.email })}
        </p>
      ) : null}
      {status === "tooMany" ? (
        <p role="alert" className="text-cherry-deep text-sm">{t("errorTooMany")}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className={cn(ctaClass({ size: "md" }))}
        >
          {status === "sending" ? t("sending") : t("submit")}
        </button>
        <p className="text-charcoal/55 max-w-prose text-xs leading-relaxed">
          {t.rich("privacyNote", {
            privacy: (chunks) => (
              <Link href="/datenschutz" className="text-sunset-ink underline underline-offset-2">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </form>
  );
}
