// Regex-based sanitization — compatible with Cloudflare Workers (no DOM dependency)

const TAGS_RE = /<[^>]*>/g;
const SAFE_TAGS_RE =
  /<(?!\/?(?:p|br|strong|em|b|i|u|ul|ol|li|span)(?:\s[^>]*)?>)[^>]*>/gi;
const UNSAFE_ATTR_RE = /\s(?:on\w+|style|class|id)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;
const UNSAFE_HREF_RE = /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*))/gi;

/**
 * Sanitize plain text (removes ALL HTML)
 *
 * Use for: Names, titles, short descriptions
 *
 * Example:
 * Input:  "Great place! <script>alert('xss')</script>"
 * Output: "Great place! "
 */
export function sanitizePlainText(input: string | null | undefined): string {
  if (!input) return "";
  return input.replace(TAGS_RE, "").trim();
}

/**
 * Sanitize rich text (allows safe HTML formatting)
 *
 * Use for: Review content, descriptions with formatting
 *
 * Allows: <b>, <i>, <strong>, <em>, <p>, <br>, <ul>, <li>, <span>
 * Removes: <script>, onclick, style attrs, etc.
 *
 * Example:
 * Input:  "<p>Great place!</p><script>alert('xss')</script>"
 * Output: "<p>Great place!</p>"
 */
export function sanitizeRichText(input: string | null | undefined): string {
  if (!input) return "";

  return input
    .replace(SAFE_TAGS_RE, "")       // strip disallowed tags
    .replace(UNSAFE_ATTR_RE, "")     // strip dangerous attributes
    .replace(UNSAFE_HREF_RE, (match, d, s, u) => {
      const url = d ?? s ?? u ?? "";
      return /^(?:https?:|mailto:)/i.test(url) ? match : "";
    })
    .trim();
}

/**
 * Sanitize a URL
 *
 * Use for: User-submitted URLs, external links
 *
 * Example:
 * Input:  "javascript:alert('xss')"
 * Output: ""
 *
 * Input:  "https://example.com"
 * Output: "https://example.com"
 */
export function sanitizeURL(input: string | null | undefined): string {
  if (!input) return "";

  const stripped = input.replace(TAGS_RE, "").trim();

  if (!stripped.match(/^(https?:\/\/|mailto:)/i)) {
    return "";
  }

  return stripped;
}

/**
 * Sanitize an email address
 *
 * Use for: Email inputs
 *
 * Example:
 * Input:  "user@example.com<script>alert(1)</script>"
 * Output: "user@example.com"
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (!input) return "";

  const cleaned = input.replace(TAGS_RE, "").trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    return "";
  }

  return cleaned.toLowerCase();
}

/**
 * Batch sanitize an object's string fields
 *
 * Use for: Sanitizing entire form data objects
 *
 * Example:
 * ```typescript
 * const sanitized = sanitizeObject({
 *   name: "John<script>alert(1)</script>",
 *   bio: "<p>Developer</p><script>alert(1)</script>"
 * }, {
 *   name: 'plainText',
 *   bio: 'richText'
 * });
 * // Result: { name: "John", bio: "<p>Developer</p>" }
 * ```
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldTypes: Record<keyof T, "plainText" | "richText" | "url" | "email">,
): T {
  const sanitized: Record<string, any> = { ...obj };

  for (const [key, type] of Object.entries(fieldTypes)) {
    const value = obj[key];

    if (typeof value === "string") {
      switch (type) {
        case "plainText":
          sanitized[key] = sanitizePlainText(value);
          break;
        case "richText":
          sanitized[key] = sanitizeRichText(value);
          break;
        case "url":
          sanitized[key] = sanitizeURL(value);
          break;
        case "email":
          sanitized[key] = sanitizeEmail(value);
          break;
      }
    }
  }

  return sanitized as T;
}