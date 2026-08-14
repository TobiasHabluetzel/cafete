"use client";

import { Menu, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { LogoSticker } from "@/components/brand/wordmark";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mainNav } from "@/config/site";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    /*
     * Solid sunset bar, deliberately with no transparency or backdrop blur: the
     * logo asset carries its own #FF751F background, so an exact colour match
     * makes its tile invisible. Any alpha would blend the bar with the dark
     * content scrolling underneath and the tile would show as a lighter patch.
     *
     * Text on orange is charcoal/ink — cream is only 2.3:1 here, and black on
     * orange is what the artwork itself does.
     */
    <header className="bg-sunset text-charcoal border-ink/25 sticky top-0 z-50 border-b-2">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link
          href="/"
          className="focus-visible:ring-ink flex shrink-0 items-center rounded-sm focus-visible:ring-2 focus-visible:outline-none"
          aria-label="CAFÉTÉ"
        >
          <LogoSticker
            priority
            rotate={false}
            framed={false}
            sizes="8rem"
            // Aspect is 570:451, so these keep the mark clear of the 64/80px
            // bar edges without relying on the asset's own margin alone.
            className="w-[4.5rem] lg:w-[5.75rem]"
          />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label={t("menu")}>
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-semibold tracking-wide uppercase transition-colors",
                  "focus-visible:ring-ink focus-visible:ring-2 focus-visible:outline-none",
                  isActive
                    ? "text-ink underline decoration-2 underline-offset-4"
                    : "text-charcoal/75 hover:text-ink",
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <LocaleSwitcher />

          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={t("cart")}
            nativeButton={false}
            render={<Link href="/warenkorb" />}
            className="text-charcoal hover:bg-ink/10 hover:text-ink"
          >
            <ShoppingBag />
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  aria-label={t("openMenu")}
                  className="text-charcoal hover:bg-ink/10 hover:text-ink lg:hidden"
                >
                  <Menu />
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="bg-sunset text-charcoal border-ink/25 w-[86vw] border-l-2 sm:max-w-sm"
            >
              <SheetHeader>
                <SheetTitle className="label-caps text-cherry-deep">
                  {t("menu")}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pb-8" aria-label={t("menu")}>
                {mainNav.map((item) => (
                  <SheetClose
                    key={item.href}
                    render={
                      <Link
                        href={item.href}
                        className={cn(
                          "font-display border-ink/20 border-b py-4 text-2xl font-extrabold",
                          pathname === item.href
                            ? "text-ink underline decoration-2 underline-offset-4"
                            : "text-charcoal hover:text-ink",
                        )}
                      >
                        {t(item.labelKey)}
                      </Link>
                    }
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
