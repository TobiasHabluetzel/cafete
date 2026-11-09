"use client";

import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

/**
 * One silent, full-width loop of the product being poured. Hands and bottles
 * only, so the page sells the drink rather than one particular day.
 *
 * The file is fetched only when the section comes near, and it pauses off screen.
 * Visitors who prefer reduced motion or save data get the poster and can start it
 * themselves. The button is there for everyone, as moving video needs a way to stop.
 */
export function MoodReel() {
  const t = useTranslations("reel");
  const video = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      connection?.saveData
    ) {
      userPaused.current = true;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) {
          // A browser may refuse autoplay. The poster and the button still work.
          element.play().catch(() => undefined);
        } else if (!entry.isIntersecting) {
          element.pause();
        }
      },
      { rootMargin: "120px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const element = video.current;
    if (!element) return;
    if (element.paused) {
      userPaused.current = false;
      element.play().catch(() => undefined);
    } else {
      userPaused.current = true;
      element.pause();
    }
  }

  return (
    <section className="bg-night text-cream relative isolate aspect-[4/5] overflow-hidden sm:aspect-[16/10] lg:aspect-auto lg:h-[78svh]">
      <video
        ref={video}
        aria-hidden
        muted
        loop
        playsInline
        preload="none"
        poster="/cafete-reel-poster.jpg"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 -z-10 size-full object-cover"
      >
        <source src="/cafete-reel.mp4" type="video/mp4" />
      </video>

      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
      />

      <div className="mx-auto flex h-full max-w-7xl items-end justify-between gap-4 px-4 pb-6 sm:px-6 lg:px-8 lg:pb-10">
        <h2 className="text-h1 lg:text-display text-balance">{t("title")}</h2>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? t("pause") : t("play")}
          className="focus-visible:ring-gold flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:outline-none"
        >
          {playing ? (
            <Pause className="size-5 fill-current" aria-hidden />
          ) : (
            <Play className="ml-0.5 size-5 fill-current" aria-hidden />
          )}
        </button>
      </div>
    </section>
  );
}
