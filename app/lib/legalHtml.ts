/**
 * Tidies policy and page HTML written in Shopify's rich text editor, so it
 * can be styled as a document rather than a wall of paragraphs.
 *
 * Text pasted into Shopify's policy editor usually arrives as one paragraph
 * per line, with section headings as a paragraph that is entirely bold, and
 * often repeats the page title as its first line. This turns that into real
 * structure:
 *
 *  - paragraphs joined with <br> become separate paragraphs
 *  - a paragraph that is only bold text becomes an <h2>
 *  - a first heading or paragraph that just repeats the title is dropped
 *
 * String based on purpose: it runs on the server for every request, the input
 * is Shopify's own sanitised editor output, and it only rewraps existing
 * markup without introducing any new content.
 */

const BOLD_ONLY_PARAGRAPH =
  /<p\b[^>]*>\s*<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>\s*(?:<br\s*\/?>\s*)*<\/p>/gi;

const LINE_BREAKS = /(?:\s*<br\s*\/?>\s*)+/gi;

function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Splits `<p>a<br>b</p>` into `<p>a</p><p>b</p>`. */
function splitBreaks(html: string): string {
  return html.replace(
    /<p\b([^>]*)>([\s\S]*?)<\/p>/gi,
    (whole, attrs: string, inner: string) => {
      if (!/<br\s*\/?>/i.test(inner)) return whole;
      return inner
        .split(LINE_BREAKS)
        .map((part) => part.trim())
        .filter((part) => textOf(part).length > 0)
        .map((part) => `<p${attrs}>${part}</p>`)
        .join('');
    },
  );
}

/** Bold only paragraphs become section headings. */
function promoteHeadings(html: string): string {
  return html.replace(BOLD_ONLY_PARAGRAPH, (whole, _tag, inner: string) => {
    const text = textOf(inner);
    // Long bold paragraphs are emphasis, not headings.
    if (!text || text.length > 80) return whole;
    return `<h2>${inner.trim()}</h2>`;
  });
}

/** Drops a leading block whose text is just the page title. */
function dropRepeatedTitle(html: string, title: string): string {
  const match = /^\s*<(h[1-6]|p)\b[^>]*>([\s\S]*?)<\/\1>/i.exec(html);
  if (!match) return html;
  if (textOf(match[2]).toLowerCase() !== textOf(title).toLowerCase()) {
    return html;
  }
  return html.slice(match[0].length);
}

export function formatLegalHtml(html: string, title = ''): string {
  if (!html) return '';
  let out = splitBreaks(html);
  out = promoteHeadings(out);
  if (title) out = dropRepeatedTitle(out, title);
  return out.trim();
}
