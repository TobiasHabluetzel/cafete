import { ctaClass } from "@/components/brand/cta-button";
import { Stars } from "@/components/reviews/stars";
import { isAdminConfigured } from "@/lib/admin-auth";
import { currentAdmin } from "@/lib/admin-session";
import { listAllReviews, MIN_PUBLIC_REVIEWS } from "@/lib/reviews";

import {
  approveReview,
  rejectReview,
  replyToReview,
  requestMagicLink,
  signOut,
  unpublishReview,
} from "./actions";

/** Never cached: a moderation queue showing stale rows is worse than slow. */
export const dynamic = "force-dynamic";

const STATUS_STYLE = {
  pending: "bg-gold/30 text-charcoal",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-charcoal/10 text-charcoal/60",
} as const;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;
  const admin = await currentAdmin();

  if (!admin) {
    return (
      <main className="mx-auto max-w-md px-5 py-20">
        <h1 className="font-display text-charcoal text-2xl font-extrabold">CAFÉTÉ Admin</h1>

        {!isAdminConfigured() ? (
          <p role="alert" className="border-cherry-deep/30 bg-gold/20 mt-6 rounded-lg border-l-4 p-4 text-sm leading-relaxed">
            Nicht konfiguriert. <code>ADMIN_SECRET</code> (mindestens 32 Zeichen) und{" "}
            <code>ADMIN_EMAILS</code> müssen gesetzt sein.
          </p>
        ) : params.sent ? (
          <p role="status" className="border-charcoal/20 bg-white mt-6 rounded-lg border-l-4 p-4 text-sm leading-relaxed">
            Wenn die Adresse berechtigt ist, liegt der Anmeldelink im Postfach.
            Er ist 15 Minuten gültig.
          </p>
        ) : (
          <>
            {params.error ? (
              <p role="alert" className="text-cherry-deep mt-6 text-sm">
                {params.error === "link"
                  ? "Dieser Link ist abgelaufen oder ungültig. Fordere einen neuen an."
                  : "Die Anmeldung ist nicht konfiguriert."}
              </p>
            ) : null}

            <form action={requestMagicLink} className="mt-6 space-y-4">
              <label className="block">
                <span className="label-caps text-charcoal/70">E-Mail</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="border-charcoal/25 focus:border-sunset mt-1.5 w-full rounded-md border-2 bg-white px-3 py-2 outline-none"
                />
              </label>
              <button type="submit" className={ctaClass({ size: "md" })}>
                Anmeldelink senden
              </button>
            </form>
          </>
        )}
      </main>
    );
  }

  const reviews = await listAllReviews();
  const pending = reviews.filter((r) => r.status === "pending");
  const decided = reviews.filter((r) => r.status !== "pending");
  const approvedCount = reviews.filter((r) => r.status === "approved").length;

  const when = new Intl.DateTimeFormat("de-CH", { dateStyle: "medium", timeStyle: "short" });

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-charcoal text-2xl font-extrabold">Bewertungen</h1>
          <p className="text-charcoal/60 mt-1 text-sm">
            Angemeldet als {admin}
            {" · "}
            {approvedCount} von {MIN_PUBLIC_REVIEWS} nötig, damit der Abschnitt öffentlich wird
          </p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-charcoal/60 hover:text-charcoal text-sm underline underline-offset-4">
            Abmelden
          </button>
        </form>
      </header>

      {approvedCount < MIN_PUBLIC_REVIEWS ? (
        <p className="border-charcoal/20 bg-white mt-6 rounded-lg border-l-4 p-4 text-sm leading-relaxed">
          Der Bewertungsbereich auf der Produktseite ist noch verborgen. Er erscheint,
          sobald {MIN_PUBLIC_REVIEWS} Bewertungen freigegeben sind — das Formular ist
          aber schon jetzt sichtbar.
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="font-display text-charcoal text-lg font-extrabold">
          Wartet auf Freigabe ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-charcoal/55 mt-2 text-sm">Nichts offen.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {pending.map((review) => (
              <ReviewCard key={review.id} review={review} when={when} />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-charcoal text-lg font-extrabold">
          Bearbeitet ({decided.length})
        </h2>
        <ul className="mt-4 space-y-4">
          {decided.map((review) => (
            <ReviewCard key={review.id} review={review} when={when} />
          ))}
        </ul>
      </section>
    </main>
  );
}

function ReviewCard({
  review,
  when,
}: {
  review: Awaited<ReturnType<typeof listAllReviews>>[number];
  when: Intl.DateTimeFormat;
}) {
  return (
    <li className="border-charcoal/15 rounded-lg border-2 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Stars rating={review.rating} size="sm" label={`${review.rating} von 5 Sternen`} />
          <span className="font-display text-charcoal font-extrabold">{review.authorName}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[review.status]}`}>
            {review.status}
          </span>
        </div>
        <span className="text-charcoal/50 text-xs">
          {when.format(review.createdAt)} · {review.locale}
        </span>
      </div>

      <p className="text-charcoal/85 mt-3 leading-relaxed whitespace-pre-line">{review.body}</p>

      {/* Shown to the moderator only — it is never published. */}
      {review.authorEmail ? (
        <p className="text-charcoal/50 mt-2 text-xs">
          Kontakt (nicht öffentlich): {review.authorEmail}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {review.status !== "approved" ? (
          <form action={approveReview}>
            <input type="hidden" name="id" value={review.id} />
            <button type="submit" className={ctaClass({ size: "md", className: "h-9 px-4 text-sm" })}>
              Freigeben
            </button>
          </form>
        ) : (
          <form action={unpublishReview}>
            <input type="hidden" name="id" value={review.id} />
            <button type="submit" className={ctaClass({ variant: "outline", size: "md", className: "text-charcoal h-9 px-4 text-sm" })}>
              Zurückziehen
            </button>
          </form>
        )}

        {review.status !== "rejected" ? (
          <form action={rejectReview}>
            <input type="hidden" name="id" value={review.id} />
            <button type="submit" className={ctaClass({ variant: "outline", size: "md", className: "text-charcoal h-9 px-4 text-sm" })}>
              Ablehnen
            </button>
          </form>
        ) : null}
      </div>

      <form action={replyToReview} className="mt-4">
        <input type="hidden" name="id" value={review.id} />
        <label className="block">
          <span className="label-caps text-charcoal/70">Antwort von CAFÉTÉ</span>
          <textarea
            name="reply"
            rows={2}
            defaultValue={review.replyBody ?? ""}
            placeholder="Leer lassen, um die Antwort zu entfernen"
            className="border-charcoal/25 focus:border-sunset mt-1.5 w-full rounded-md border-2 bg-white px-3 py-2 text-sm outline-none"
          />
        </label>
        <button type="submit" className="text-sunset-ink mt-2 text-sm font-semibold underline underline-offset-4">
          Antwort speichern
        </button>
      </form>
    </li>
  );
}
