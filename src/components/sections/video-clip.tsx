import { useTranslations } from "next-intl";

/**
 * The founders' clip, embedded between the slogan marquee and the coffee-fruit
 * section — the slot the owner marked.
 *
 * Deliberately not autoplayed and not upscaled:
 *
 * - The source is 368×368 and 2:22 long. Stretching a 368px video across a wide
 *   section would look soft, so it is capped near its native width and framed,
 *   which reads as an intentional clip rather than a blurry banner.
 * - At 11 MB and 142 seconds it is far too heavy to autoplay, and Railway serves
 *   it without a CDN. `preload="metadata"` means visitors who never press play
 *   fetch only a few kilobytes.
 * - Self-hosted rather than embedded from YouTube: no third-party tracking, which
 *   keeps the cookie-free claim in the privacy policy honest.
 */
export function VideoClip() {
  const t = useTranslations("video");

  return (
    <section className="bg-night text-cream py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <p className="label-caps text-gold">{t("label")}</p>
          <h2 className="text-h2 mt-3">{t("title")}</h2>
        </div>

        <div className="mt-8 flex justify-center">
          <video
            controls
            preload="metadata"
            playsInline
            className="border-ink/80 bg-charcoal w-full max-w-[26rem] rounded-lg border-2 shadow-[6px_6px_0_rgba(0,0,0,0.45)]"
          >
            <source src="/cafete-clip.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
