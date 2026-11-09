import { useTranslations } from "next-intl";

import { VideoPlayer } from "@/components/sections/video-player";

/**
 * The founder's clip. Deliberately not autoplayed and not upscaled: the source is
 * only 368×368, so it stays near its native width, framed like a clip rather than
 * a blurry banner. Self-hosted rather than embedded from YouTube, so nobody loads
 * anything from a third party, and nothing of the file loads until someone presses
 * play. The poster is a still from the clip, public/cafete-clip-poster.jpg.
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
          <VideoPlayer playLabel={t("play")} />
        </div>
      </div>
    </section>
  );
}
