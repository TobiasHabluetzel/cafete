import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The CAFÉTÉ wordmark is a supplied graffiti-style lettering asset — always an
 * image, never a webfont. Swap `/logo-cafete.svg` for the designer's
 * `logo-cafete.png` when it lands (see public/README.md).
 */
export function Wordmark({
  className,
  width = 200,
  height = 69,
  priority = false,
}: {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-cafete.svg"
      alt="CAFÉTÉ"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto select-none", className)}
    />
  );
}

/** "Fruity · Fizzy · Focus" bubble-lettering banner. */
export function SloganBanner({ className }: { className?: string }) {
  return (
    <Image
      src="/banner-slogan.svg"
      alt="Fruity · Fizzy · Focus"
      width={900}
      height={140}
      priority
      className={cn("h-auto w-full select-none", className)}
    />
  );
}
