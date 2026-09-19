import type { PortraitVideo } from "@/content/portraits";

/**
 * The native player used for both the short cut and the full interview.
 *
 * Self-hosted MP4 on purpose: it keeps the browser's own controls, adds no
 * third-party embed, and so needs nothing said about it in the privacy policy.
 * The cost is that there is no adaptive bitrate — one file, one quality — which
 * is why the short cut leads and the hour-long version is opt-in.
 *
 * `poster` is the portrait photograph, so an unplayed video shows a face rather
 * than a black rectangle.
 */
export function PortraitPlayer({
  video,
  poster,
  locale,
  preload,
  className,
}: {
  video: PortraitVideo;
  poster?: string;
  locale: string;
  /** "none" for the hour-long cut, so it costs nothing until someone asks. */
  preload: "none" | "metadata";
  className?: string;
}) {
  return (
    <div className={className}>
      <video
        controls
        preload={preload}
        playsInline
        poster={poster}
        className="border-ink/80 bg-charcoal w-full rounded-lg border-2 shadow-[6px_6px_0_rgba(0,0,0,0.45)]"
      >
        <source src={video.src} type="video/mp4" />
        {video.captions?.map((caption) => (
          <track
            key={caption.srclang}
            kind="captions"
            src={caption.src}
            srcLang={caption.srclang}
            label={caption.label}
            // Captions on by default in the reader's own language. For a portrait
            // about accessibility that is the right default, not an opt-in.
            default={caption.srclang === locale}
          />
        ))}
      </video>
    </div>
  );
}

/** True when a video carries at least one caption track. */
export function hasCaptions(video?: PortraitVideo) {
  return Boolean(video?.captions?.length);
}
