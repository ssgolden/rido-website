/**
 * Serialise JSON-LD for a <script type="application/ld+json"> block.
 * `<` is escaped so a string containing "</script>" can never close the tag.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
