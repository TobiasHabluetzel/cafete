"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { Sticker, stickerClass } from "@/components/brand/sticker";
import { cn } from "@/lib/utils";

/**
 * The hero fact stickers, with the sugar one acting as a disclosure: clicking it
 * reveals the full comparison underneath.
 *
 * The row and the panel live in one component because the panel has to sit below
 * the whole flex row, not inside a single item.
 */
export function HeroBadges() {
  const t = useTranslations("badges");
  const tSugar = useTranslations("sugar");
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="relative mt-8">
      <ul className="flex flex-wrap items-center gap-3">
        <li>
          <Sticker tone="cherry" className="-rotate-2">
            {t("volume")}
          </Sticker>
        </li>
        <li>
          {/* A real button, so it is keyboard reachable and announces its state. */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
            className={stickerClass({
              tone: "gold",
              className:
                "focus-visible:ring-gold/70 rotate-1 cursor-pointer focus-visible:ring-3 focus-visible:outline-none",
            })}
          >
            {t("lessSugar")}
            <ChevronDown
              aria-hidden
              className={cn("size-4 transition-transform", open && "rotate-180")}
            />
          </button>
        </li>
        <li>
          <Sticker tone="cream" className="-rotate-1">
            {t("swissMade")}
          </Sticker>
        </li>
      </ul>

      <div
        id={panelId}
        hidden={!open}
        className="border-gold/40 bg-charcoal/80 text-cream mt-4 max-w-xl rounded-lg border p-4 text-sm leading-relaxed backdrop-blur-sm"
      >
        {tSugar("body")}
      </div>
    </div>
  );
}
