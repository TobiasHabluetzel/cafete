"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const active = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  function switchTo(locale: string) {
    if (locale === active) return;
    startTransition(() => {
      // `pathname` is the internal route; next-intl resolves the localized slug.
      router.replace(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { pathname, params: params as any },
        { locale: locale as (typeof locales)[number] },
      );
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-current/20 p-0.5",
        isPending && "opacity-60",
        className,
      )}
      role="group"
      aria-label={t("switchLanguage")}
    >
      {locales.map((locale) => {
        const isActive = locale === active;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchTo(locale)}
            disabled={isPending}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "cursor-pointer rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-colors",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
              isActive
                ? "bg-charcoal text-cream"
                : "text-current/70 hover:text-current",
            )}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
