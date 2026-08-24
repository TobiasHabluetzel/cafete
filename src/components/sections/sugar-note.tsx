import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * "Das mit Zucker" — an expandable note on the homepage.
 *
 * Only carries the soft-drink comparison for now. The owner also supplied
 * "59 % weniger als Energydrinks" and "20 % weniger als Mate-Getränke"; both are
 * held pending sign-off, because comparative nutrition claims are meant to be
 * within the same food category and the 20 % figure is below the threshold a
 * "reduced sugar" claim requires.
 */
export function SugarNote() {
  const t = useTranslations("sugar");

  return (
    // Sits on night so it reads as part of the dark band above it, with the
    // gold sticker treatment marking it as a deliberate callout rather than a
    // stray gap between two sections.
    <div className="bg-night">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Accordion>
          <AccordionItem
            value="sugar"
            className="border-ink/85 bg-gold rounded-lg border-2 px-5 shadow-[5px_5px_0_rgba(0,0,0,0.45)]"
          >
            <AccordionTrigger className="font-display text-ink text-left text-lg font-extrabold hover:no-underline">
              {t("title")}
            </AccordionTrigger>
            <AccordionContent className="text-ink/80 pb-4 leading-relaxed">
              {t("body")}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
