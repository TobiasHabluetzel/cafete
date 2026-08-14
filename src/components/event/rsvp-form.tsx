"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { ctaClass } from "@/components/brand/cta-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { site } from "@/config/site";

type Status = "idle" | "sending" | "sent" | "error";

export function RsvpForm() {
  const t = useTranslations("event");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("sending");

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          guests: data.get("guests"),
          message: data.get("message"),
        }),
      });
      setStatus(response.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  const fieldClass =
    "bg-white/10 border-cream/25 text-cream placeholder:text-cream/45 rounded-md";

  if (status === "sent") {
    return (
      <p
        role="status"
        className="border-gold/40 bg-gold/15 text-cream font-display rounded-lg border p-6 text-lg font-bold"
      >
        {t("rsvpSuccess")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="rsvp-name" className="text-cream/80 text-sm">
            {t("rsvpName")}
          </Label>
          <Input
            id="rsvp-name"
            name="name"
            required
            minLength={2}
            autoComplete="name"
            className={`mt-1.5 h-11 ${fieldClass}`}
          />
        </div>
        <div>
          <Label htmlFor="rsvp-email" className="text-cream/80 text-sm">
            {t("rsvpEmail")}
          </Label>
          <Input
            id="rsvp-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`mt-1.5 h-11 ${fieldClass}`}
          />
        </div>
      </div>

      <div className="sm:max-w-[10rem]">
        <Label htmlFor="rsvp-guests" className="text-cream/80 text-sm">
          {t("rsvpGuests")}
        </Label>
        <Input
          id="rsvp-guests"
          name="guests"
          type="number"
          min={1}
          max={20}
          defaultValue={1}
          required
          className={`mt-1.5 h-11 ${fieldClass}`}
        />
      </div>

      <div>
        <Label htmlFor="rsvp-message" className="text-cream/80 text-sm">
          {t("rsvpMessage")}
        </Label>
        <Textarea
          id="rsvp-message"
          name="message"
          rows={3}
          maxLength={2000}
          className={`mt-1.5 ${fieldClass}`}
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className={ctaClass({ variant: "gold", size: "md" })}
      >
        {status === "sending" ? t("rsvpSending") : t("rsvpSubmit")}
      </button>

      {status === "error" ? (
        <p role="alert" className="text-gold-soft text-sm">
          {t("rsvpError", { email: site.email })}
        </p>
      ) : null}
    </form>
  );
}
