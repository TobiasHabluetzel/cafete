"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";

export function NewsletterForm({ className }: { className?: string }) {
  const t = useTranslations("footer");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    setStatus("sending");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(response.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p role="status" className={cn("font-display text-gold text-lg font-bold", className)}>
        {t("newsletterSuccess")}
      </p>
    );
  }

  return (
    <div className={className}>
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
        <div className="flex-1">
          <Label htmlFor="newsletter-email" className="sr-only">
            {t("newsletterLabel")}
          </Label>
          <Input
            id="newsletter-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("newsletterPlaceholder")}
            className="bg-cream/10 border-cream/25 text-cream placeholder:text-cream/45 h-11 rounded-full px-4"
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-gold text-charcoal hover:bg-gold-soft focus-visible:ring-gold/60 font-display h-11 cursor-pointer rounded-full px-6 font-extrabold transition-colors focus-visible:ring-3 focus-visible:outline-none disabled:opacity-60"
        >
          {t("newsletterSubmit")}
        </button>
      </form>

      {status === "error" ? (
        <p role="alert" className="text-gold-soft mt-3 text-sm">
          {t("newsletterError", { email: site.email })}
        </p>
      ) : null}
    </div>
  );
}
