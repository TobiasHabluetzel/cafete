"use client";

import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

/**
 * A YouTube video that loads only once someone asks for it.
 *
 * Until the button is pressed this is just our own poster image and a play
 * control — no iframe, no script, no request to Google, and so no cookies set
 * before the visitor has chosen. That keeps the embed honest against the privacy
 * policy instead of relying on a line of small print, and it keeps the page fast:
 * a YouTube iframe pulls roughly a megabyte of script before anyone watches
 * anything.
 *
 * `youtube-nocookie.com` is the privacy-enhanced host, and `autoplay=1` is safe
 * here because the click *is* the request to play.
 */
export function YouTubeEmbed({
  id,
  poster,
  title,
}: {
  id: string;
  poster?: string;
  title: string;
}) {
  const [active, setActive] = useState(false);
  const t = useTranslations("portraits");

  if (active) {
    return (
      <div className="border-ink/80 bg-charcoal relative aspect-video w-full overflow-hidden rounded-lg border-2 shadow-[6px_6px_0_rgba(0,0,0,0.45)]">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&cc_load_policy=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="border-ink/80 bg-charcoal group focus-visible:ring-gold relative block aspect-video w-full cursor-pointer overflow-hidden rounded-lg border-2 shadow-[6px_6px_0_rgba(0,0,0,0.45)] focus-visible:ring-3 focus-visible:outline-none"
    >
      {poster ? (
        // A plain img, not next/image: this is a decorative backdrop behind the
        // play control, and the same file is already served above as the portrait.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="absolute inset-0 size-full object-cover opacity-70" />
      ) : null}

      <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <span className="bg-sunset-gradient shadow-brand flex size-16 items-center justify-center rounded-full text-white transition-transform group-hover:scale-105">
          <Play className="ml-1 size-7 fill-current" aria-hidden />
        </span>
        <span className="text-cream bg-charcoal/80 rounded-full px-4 py-1.5 text-sm font-semibold">
          {t("youtubeConsent")}
        </span>
      </span>
    </button>
  );
}
