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
        "border-ink/25 inline-flex items-center rounded-full border p-0.5",
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
              "focus-visible:ring-ink focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
              // Charcoal pill on the orange bar: the fill reads at 7:1 against
              // the bar and the cream label at 16:1 inside it.
              isActive
                ? "bg-charcoal text-cream"
                : "text-charcoal/70 hover:text-ink",
            )}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
