import Image from "next/image";

import { cn } from "@/lib/utils";

import logo from "../../../public/logo-cafete.png";
import slogan from "../../../public/banner-slogan.png";

/**
 * The CAFÉTÉ logo, used exactly as the designer delivered it — orange
 * background included. That orange is structural: it forms the ring between the
 * red circle and the red flames, and it is one continuous region with the outer
 * background, so keying it out punches a hole through the artwork. Presenting it
 * as a sticker is both faithful and on-brand.
 */
export function LogoSticker({
  className,
  priority = false,
  rotate = true,
  sizes,
}: {
  className?: string;
  priority?: boolean;
  rotate?: boolean;
  sizes?: string;
}) {
  return (
    <span
      className={cn(
        "ring-ink/80 inline-block overflow-hidden rounded-md ring-2",
        "shadow-[6px_6px_0_rgba(0,0,0,0.45)]",
        rotate && "-rotate-2",
        className,
      )}
    >
      <Image
        src={logo}
        alt="CAFÉTÉ"
        priority={priority}
        sizes={sizes}
        className="block h-full w-full object-cover"
      />
    </span>
  );
}

/**
 * "Fruity · Fizzy · Focus" in the brand's bubble lettering. Black ink on
 * transparent, so it needs a light or orange surface behind it.
 */
export function SloganBanner({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={slogan}
      alt="Fruity · Fizzy · Focus"
      priority={priority}
      className={cn("h-auto w-full select-none", className)}
    />
  );
}
