import { CalendarDays, Clock, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { ctaClass } from "@/components/brand/cta-button";
import { CherryMark } from "@/components/brand/sticker";
import { AddToCalendar } from "@/components/event/add-to-calendar";
import { launchEvent } from "@/config/site";
import { Link } from "@/i18n/navigation";

/**
 * Homepage launch-event band. The full page at /event adds the RSVP form.
 */
export function EventBand() {
  const t = useTranslations("event");
  const tNav = useTranslations("nav");

  const mapQuery = encodeURIComponent(
    `${launchEvent.venue}, ${launchEvent.street}, ${launchEvent.city}`,
  );

  return (
    <section className="bg-sunset text-charcoal relative isolate overflow-hidden">
      <CherryMark className="absolute -bottom-14 right-[4%] w-64 rotate-[18deg] opacity-25 lg:w-80" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:px-8 lg:py-20">
        <div className="reveal">
          <p className="label-caps text-cherry-ink">{t("label")}</p>
          <h2 className="text-display text-sticker mt-4">{t("title")}</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed">{t("body")}</p>
        </div>

        <div className="reveal border-ink/85 bg-charcoal text-cream rounded-lg border-2 p-6 shadow-[6px_6px_0_rgba(0,0,0,0.45)]">
          <ul className="space-y-3 text-base">
            <li className="flex items-center gap-3">
              <CalendarDays className="text-gold size-5 shrink-0" aria-hidden />
              <span className="font-semibold">{t("dateLine")}</span>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="text-gold size-5 shrink-0" aria-hidden />
              <span>{t("timeLine")}</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="text-gold mt-0.5 size-5 shrink-0" aria-hidden />
              <span>
                <span className="font-semibold">{t("venue")}</span>
                <br />
                {t("address")}
              </span>
            </li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCalendar title={t("title")} description={t("body")} />
            <Link
              href="/event"
              className={ctaClass({
                variant: "outline",
                size: "md",
                className: "text-cream hover:bg-cream/15",
              })}
            >
              {tNav("event")}
            </Link>
          </div>

          <p className="mt-4">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noreferrer noopener"
              className="text-cream/75 hover:text-gold text-sm underline underline-offset-4"
            >
              {t("openMap")}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
