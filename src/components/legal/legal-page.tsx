import { getTranslations } from "next-intl/server";

import { PageHeader, Section } from "@/components/layout/section";
import { site } from "@/config/site";

/**
 * One block inside a legal section.
 *
 * `address` exists because three of the four documents set the company out as a
 * postal block mid-section, which is a different thing semantically from a
 * paragraph and belongs in an `<address>`. `note` is for the source citation
 * under the withdrawal-rights clause.
 */
export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "address"; lines: string[] }
  | { type: "note"; text: string };

export type LegalSection = { heading: string; blocks: LegalBlock[] };

export type LegalNamespace = "imprint" | "terms" | "privacy" | "returns";

/**
 * Renders one of the `legal.*` namespaces as a document.
 *
 * The texts are the owner's own, supplied on 2026-09-16, and are held verbatim in
 * `messages/{de,en}.json` rather than assembled from `src/config/site.ts`. That
 * duplicates the company address across four documents on purpose: these are
 * dated, versioned artefacts ("Stand: September 2026"), so if the address ever
 * changes they need a deliberate edit and a new date, not a silent interpolation
 * from config. `site.producer` still backs the structured uses — JSON-LD, the
 * contact page, the footer — and must be kept in step by hand.
 */
export async function LegalPage({
  locale,
  namespace,
}: {
  locale: string;
  namespace: LegalNamespace;
}) {
  const t = await getTranslations({ locale, namespace: "legal" });
  const sections = t.raw(`${namespace}.sections`) as LegalSection[];

  // Optional trailing blocks: a signature address and a "Stand:" date line.
  const signature = t.has(`${namespace}.signature`)
    ? (t.raw(`${namespace}.signature`) as string[])
    : null;
  const updated = t.has(`${namespace}.updated`) ? t(`${namespace}.updated`) : null;

  return (
    <>
      <PageHeader title={t(`${namespace}.title`)} />

      <Section tone="cream">
        <div className="max-w-3xl">
          {/*
            * The German text is the binding one, and the English pages carry a
            * translation for readability only. Saying so removes any question of
            * someone relying on a wording we did not have reviewed.
            */}
          {locale !== "de" ? (
            <p className="border-sunset-ink/30 text-charcoal/70 border-l-4 pl-4 text-sm leading-relaxed">
              {t("germanBinding")}
            </p>
          ) : null}

          <div className={locale !== "de" ? "mt-10 space-y-8" : "space-y-8"}>
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-h3">{section.heading}</h2>
                <div className="mt-3 space-y-3">
                  {section.blocks.map((block, index) => (
                    <LegalBlockView key={index} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {signature ? (
            <address className="text-charcoal/80 mt-10 space-y-1 not-italic">
              {signature.map((line, index) => (
                <p key={line} className={index === 0 ? "font-semibold" : undefined}>
                  {line}
                </p>
              ))}
            </address>
          ) : null}

          {updated ? (
            <p className="text-charcoal/55 mt-10 text-sm">{updated}</p>
          ) : null}
        </div>
      </Section>
    </>
  );
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.type === "address") {
    return (
      <address className="text-charcoal/80 space-y-1 not-italic">
        {block.lines.map((line, index) => (
          <p key={line} className={index === 0 ? "font-semibold" : undefined}>
            <Linkified text={line} />
          </p>
        ))}
      </address>
    );
  }

  if (block.type === "note") {
    return <p className="text-charcoal/55 text-sm leading-relaxed">{block.text}</p>;
  }

  return (
    <p className="text-charcoal/80 leading-relaxed">
      <Linkified text={block.text} />
    </p>
  );
}

/**
 * Turns the shop's own email address into a `mailto:` link wherever it appears in
 * the text. Three of the documents tell the reader to write to us, and on a phone
 * a plain string is something you have to copy out by hand.
 *
 * Deliberately only matches `site.email` rather than parsing addresses generally:
 * the aim is one known, wanted link, not a text processor loose on legal copy.
 */
function Linkified({ text }: { text: string }) {
  const parts = text.split(site.email);
  if (parts.length === 1) return <>{text}</>;

  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 ? (
            <a
              href={`mailto:${site.email}`}
              className="text-sunset-ink underline underline-offset-4"
            >
              {site.email}
            </a>
          ) : null}
        </span>
      ))}
    </>
  );
}
