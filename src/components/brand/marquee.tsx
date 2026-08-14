import Image from "next/image";

import { cn } from "@/lib/utils";

import slogan from "../../../public/banner-slogan.png";

/**
 * Endless orange slogan band — the label wraps "FRUITY · FIZZY · FOCUS" around
 * the bottle, so scrolling it across the page is the same idea. Two identical
 * copies sit side by side and the track translates -50%, which loops seamlessly.
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
      <div className="animate-marquee flex w-max items-center">
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
    </div>
  );
}
