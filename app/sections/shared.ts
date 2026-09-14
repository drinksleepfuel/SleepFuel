/**
 * Helpers shared by the Weaverse sections extracted out of
 * `app/routes/products.$handle.tsx`.
 */

/** What a Weaverse `image` input hands back once a merchant picks one. */
export type WeaverseImage = {url?: string; altText?: string} | string | null;

/**
 * Resolves a Weaverse `image` input down to a plain URL, falling back to the
 * bundled asset the section originally shipped with. Studio hands back an
 * object; a direct render (or a preset) may pass the imported string.
 */
export function imageUrl(value: WeaverseImage, fallback: string): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value || fallback;
  return value.url || fallback;
}

/** Same idea for the alt text that rides along with a Weaverse image. */
export function imageAlt(value: WeaverseImage, fallback: string): string {
  if (!value || typeof value === 'string') return fallback;
  return value.altText || fallback;
}
