"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";

/**
 * The clip with a chosen still and our own play button instead of the browser's
 * player chrome and whatever frame the file happens to open on. The native
 * controls take over once it is playing, so seeking and fullscreen still work.
 */
export function VideoPlayer({ playLabel }: { playLabel: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function start() {
    setStarted(true);
    void video.current?.play();
  }

  return (
    <div className="border-ink/80 bg-charcoal relative aspect-square w-full max-w-[26rem] overflow-hidden rounded-lg border-2 shadow-[6px_6px_0_rgba(0,0,0,0.45)]">
      <video
        ref={video}
        controls={started}
        preload="none"
        playsInline
        poster="/cafete-clip-poster.jpg"
        className="size-full object-cover"
      >
        <source src="/cafete-clip.mp4" type="video/mp4" />
      </video>

      {started ? null : (
        <button
          type="button"
          onClick={start}
          aria-label={playLabel}
          className="group focus-visible:ring-gold absolute inset-0 flex cursor-pointer items-center justify-center bg-black/10 transition-colors hover:bg-black/25 focus-visible:ring-4 focus-visible:outline-none focus-visible:ring-inset"
        >
          <span className="bg-gold text-charcoal flex size-20 items-center justify-center rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-95 motion-reduce:transition-none">
            <Play className="ml-1 size-8 fill-current" aria-hidden />
          </span>
        </button>
      )}
    </div>
  );
}
