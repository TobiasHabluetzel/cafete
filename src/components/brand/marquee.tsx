import Image from "next/image";

import { cn } from "@/lib/utils";

import slogan from "../../../public/banner-slogan.png";

/**
 * Endless orange slogan band — the label wraps "FRUITY · FIZZY · FOCUS" around
 * the bottle, so scrolling it across the page is the same idea. Two identical
 * copies sit side by side and the track translates -50%, which loops seamlessly.
 *
 * A full-width scrolling band is exactly the kind of motion that causes
 * vestibular discomfort, so it stops for `prefers-reduced-motion` — which iOS
 * sets whenever Reduce Motion is on, and that is common. But a *frozen* marquee
 * reads as a bug: the slogan sits chopped off at both edges. So reduced motion
 * gets its own tidy state, one centred slogan, rather than a stalled scroll.
 */
export function SloganMarquee({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-sunset border-ink/80 relative overflow-hidden border-y-2 py-3",
        className,
      )}
      aria-hidden
    >
      <div className="animate-marquee flex w-max items-center motion-reduce:hidden">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {[0, 1, 2].map((repeat) => (
              <Image
                key={repeat}
                src={slogan}
                alt=""
                className="mr-10 h-6 w-auto sm:h-8 lg:h-9"
                // Decorative and repeated — never the LCP element.
                loading="lazy"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Static state: a single slogan, centred and whole. */}
      <div className="hidden justify-center px-4 motion-reduce:flex">
        <Image
          src={slogan}
          alt=""
          className="h-6 w-auto max-w-full sm:h-8 lg:h-9"
          loading="lazy"
        />
      </div>
    </div>
  );
}
