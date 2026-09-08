/**
 * Renders a JSON-LD block. Kept as a component so each page can declare the
 * schema that actually describes it, rather than one vague site-wide blob.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Built server-side from our own content, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
