"use client";

import { CalendarPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { ctaClass } from "@/components/brand/cta-button";
import { launchEvent, site } from "@/config/site";

/** 2026-09-19T13:00:00+02:00 → 20260919T110000Z */
function toIcsUtc(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsEscape(value: string) {
  return value.replace(/[\\;,]/g, (match) => `\\${match}`).replace(/\n/g, "\\n");
}

export function AddToCalendar({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const t = useTranslations("event");
  const location = `${launchEvent.venue}, ${launchEvent.street}, ${launchEvent.city}`;

  function download() {
    // CRLF line endings are required by RFC 5545.
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      `PRODID:-//${site.domain}//launch-event//EN`,
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:launch-2026-09-19@${site.domain}`,
      `DTSTAMP:${toIcsUtc(new Date().toISOString())}`,
      `DTSTART:${toIcsUtc(launchEvent.start)}`,
      `DTEND:${toIcsUtc(launchEvent.end)}`,
      `SUMMARY:${icsEscape(title)}`,
      `DESCRIPTION:${icsEscape(description)}`,
      `LOCATION:${icsEscape(location)}`,
      `URL:${site.url}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const url = URL.createObjectURL(
      new Blob([ics], { type: "text/calendar;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "cafete-launch-event.ics";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className={ctaClass({ variant: "gold", size: "md" })}
    >
      <CalendarPlus className="size-5" aria-hidden />
      {t("addToCalendar")}
    </button>
  );
}
