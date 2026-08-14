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
    // Dark header: every page now opens on a dark hero, so this reads as one
    // surface instead of a pale bar stuck on top.
    <header className="bg-night/85 text-cream border-cream/10 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="CAFÉTÉ">
          <LogoSticker
            priority
            rotate={false}
            sizes="7rem"
            className="w-[4.5rem] rounded-sm shadow-none ring-1 lg:w-[5.25rem]"
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
                  "focus-visible:ring-gold focus-visible:ring-2 focus-visible:outline-none",
                  isActive ? "text-gold" : "text-cream/75 hover:text-gold",
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
            className="text-cream hover:bg-cream/10 hover:text-gold"
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
                  className="text-cream hover:bg-cream/10 hover:text-gold lg:hidden"
                >
                  <Menu />
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="bg-night text-cream border-cream/10 w-[86vw] sm:max-w-sm"
            >
              <SheetHeader>
                <SheetTitle className="label-caps text-gold">{t("menu")}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pb-8" aria-label={t("menu")}>
                {mainNav.map((item) => (
                  <SheetClose
                    key={item.href}
                    render={
                      <Link
                        href={item.href}
                        className={cn(
                          "font-display border-cream/10 border-b py-4 text-2xl font-extrabold",
                          pathname === item.href
                            ? "text-gold"
                            : "text-cream hover:text-gold",
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
