import { CalendarDays, Clock, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AddToCalendar } from "@/components/event/add-to-calendar";
import { RsvpForm } from "@/components/event/rsvp-form";
import { PageHeader, Section } from "@/components/layout/section";
import { JsonLd } from "@/components/seo/json-ld";
import { launchEvent, site } from "@/config/site";
import {
  createMetadata,
  generateLocaleParams,
  resolvePageLocale,
  type LocaleParams,
} from "@/lib/page";

export const generateStaticParams = generateLocaleParams;
export const generateMetadata = createMetadata({ namespace: "event", descriptionKey: "event", pathname: "/event" });

export default async function EventPage({ params }: LocaleParams) {
  const locale = await resolvePageLocale(params);
  const t = await getTranslations({ locale, namespace: "event" });

  const mapQuery = encodeURIComponent(
    `${launchEvent.venue}, ${launchEvent.street}, ${launchEvent.city}`,
  );

  const details = [
    { Icon: CalendarDays, value: t("dateLine") },
    { Icon: Clock, value: t("timeLine") },
    { Icon: MapPin, value: `${t("venue")}, ${t("address")}` },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: t("title"),
          description: t("body"),
          startDate: launchEvent.start,
          endDate: launchEvent.end,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          image: `${site.url}/og-image.jpg`,
          location: {
            "@type": "Place",
            name: launchEvent.venue,
            address: {
              "@type": "PostalAddress",
              streetAddress: launchEvent.street,
              postalCode: launchEvent.city.split(" ")[0],
              addressLocality: launchEvent.city.split(" ").slice(1).join(" "),
              addressCountry: "CH",
            },
          },
          organizer: { "@type": "Organization", name: site.name, url: site.url },
          // Entry is free, per the event copy.
          offers: {
            "@type": "Offer",
            price: 0,
            priceCurrency: "CHF",
            availability: "https://schema.org/InStock",
            url: `${site.url}/de/event`,
          },
        }}
      />

      <PageHeader label={t("label")} title={t("title")} intro={t("body")} />

      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <ul className="space-y-4">
              {details.map(({ Icon, value }) => (
                <li key={value} className="flex items-start gap-4">
                  <span className="bg-sunset-gradient inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-charcoal pt-2 text-lg font-semibold">
                    {value}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <AddToCalendar title={t("title")} description={t("body")} />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noreferrer noopener"
                className="border-charcoal/25 text-charcoal hover:bg-charcoal/5 font-display inline-flex h-11 items-center rounded-full border-2 px-6 font-extrabold transition-colors"
              >
                {t("openMap")}
              </a>
            </div>
          </div>

          <div className="bg-charcoal text-cream shadow-brand rounded-lg p-7 lg:p-9">
            <h2 className="text-h2 text-gold">{t("rsvpTitle")}</h2>
            <p className="text-cream/75 mt-2 mb-7">{t("rsvpIntro")}</p>
            <RsvpForm />
          </div>
        </div>
      </Section>
    </>
  );
}
