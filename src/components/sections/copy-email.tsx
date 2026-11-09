"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { burstBubbles } from "@/lib/bubbles";

/** The address as the page's main act, with a button that copies it. */
export function CopyEmail({ email }: { email: string }) {
  const t = useTranslations("contact");
  const [copied, setCopied] = useState(false);

  async function copy(event: React.MouseEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // No clipboard access: the address is on screen and the link still works.
      return;
    }
    burstBubbles(box.left + box.width / 2, box.top + box.height / 2);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div>
      <a
        href={`mailto:${email}`}
        className="font-display hover:text-sunset-ink block text-[clamp(1.6rem,7.6vw,6rem)] leading-none font-extrabold break-words transition-colors"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="bg-charcoal text-cream hover:bg-charcoal-soft focus-visible:ring-sunset mt-6 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
      </button>
    </div>
  );
}
