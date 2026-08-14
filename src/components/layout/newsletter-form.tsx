"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * TODO(phase-1): POST to /api/newsletter (Resend audience or a list you own).
 * Phase 0 renders the real markup so the layout is final; submitting only
 * acknowledges for now.
 */
export function NewsletterForm({ className }: { className?: string }) {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      className={cn("flex flex-col gap-3 sm:flex-row", className)}
      onSubmit={(event) => {
        event.preventDefault();
        setDone(true);
      }}
    >
      <div className="flex-1">
        <Label htmlFor="newsletter-email" className="sr-only">
          {t("newsletterLabel")}
        </Label>
        <Input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          placeholder={t("newsletterPlaceholder")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="bg-cream/10 border-cream/25 text-cream placeholder:text-cream/45 h-11 rounded-full px-4"
        />
      </div>
      <button
        type="submit"
        className="bg-gold text-charcoal hover:bg-gold-soft focus-visible:ring-gold/60 font-display h-11 cursor-pointer rounded-full px-6 font-extrabold transition-colors focus-visible:ring-3 focus-visible:outline-none"
      >
        {t("newsletterSubmit")}
      </button>
      <p aria-live="polite" className="sr-only">
        {done ? tCommon("comingSoon") : ""}
      </p>
    </form>
  );
}
