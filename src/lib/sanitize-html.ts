import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "strong",
  "em",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "br",
  "hr",
  "figure",
  "figcaption",
  "img",
];

/** Allow-list HTML sanitizer for article body (server-side). */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html || "", {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
    exclusiveFilter(frame) {
      if (frame.tag === "img") {
        const src = frame.attribs.src || "";
        return !src.startsWith("/uploads/");
      }
      return false;
    },
  });
}
