export const removeBrackets = (input: string) => {
  return input.replace(/^[{[(<](.*)[}\])>]$/s, "$1");
};

// Telegram's HTML mode only allows a fixed set of tags; anything else (e.g.
// <br>, <p>, <ul>) makes sendMessage fail with "can't parse entities".
// Convert block/line-break tags to newlines and drop the rest.
const TELEGRAM_ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "ins",
  "s",
  "strike",
  "del",
  "a",
  "code",
  "pre",
  "blockquote",
]);

export const sanitizeTelegramHtml = (html: string): string =>
  html
    // line breaks / paragraph ends become newlines
    .replace(/<\s*br\s*\/?\s*>/gi, "")
    .replace(/<\s*\/\s*(p|div|li)\s*>/gi, "\n")
    // strip any remaining tag that isn't on Telegram's allowlist
    .replace(/<\/?\s*([a-zA-Z0-9]+)([^>]*)>/g, (match, tagName) =>
      TELEGRAM_ALLOWED_TAGS.has(tagName.toLowerCase()) ? match : "",
    )
    .trim();
