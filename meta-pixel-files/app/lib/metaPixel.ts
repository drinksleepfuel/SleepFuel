/**
 * Mapping helpers for the Meta (Facebook / Instagram) pixel.
 *
 * Pure and browser-agnostic so it can be unit tested without a DOM. The
 * component that talks to `fbq` lives in `app/components/MetaPixel.tsx`.
 *
 * Meta wants decimal currency values (`value: 25.49`), not the integer minor
 * units the OpenAI pixel uses, so amounts are converted here rather than
 * reusing that pixel's payloads. Ids and quantities share its helpers so both
 * pixels describe the same products the same way.
 *
 * Only standard event parameters are sent. The dataset is in a Meta
 * "core setup" category, which strips custom parameters and anything after
 * the domain in URLs, so sending more would only be discarded.
 */

import {toQuantity, variantContentId, type CartLike} from '~/lib/openAiPixel';

/** Dataset "SleepFuel 4.5.24" in Meta Events Manager. */
export const META_PIXEL_ID = '804561264911688';
export const META_SDK_URL = 'https://connect.facebook.net/en_US/fbevents.js';

/**
 * Hosts allowed to load the pixel: production only.
 *
 * Oxygen preview deployments (`*.myshopify.dev`), local dev and any staging
 * environment are excluded, so test clicks never reach the live dataset that
 * ads optimise against.
 */
export const META_PIXEL_HOSTS: ReadonlySet<string> = new Set([
  'drinksleepfuel.com',
  'www.drinksleepfuel.com',
]);

export function isMetaPixelHost(hostname: string | null | undefined): boolean {
  if (!hostname) return false;
  return META_PIXEL_HOSTS.has(hostname.toLowerCase());
}

export type MetaContent = {id: string; quantity: number; item_price?: number};

/** Standard parameters for ViewContent / AddToCart. */
export type MetaEventParams = {
  content_ids: string[];
  content_type: 'product';
  contents: MetaContent[];
  content_name?: string;
  value?: number;
  currency?: string;
};

export type MetaStorefrontEvent = 'PageView' | 'ViewContent' | 'AddToCart';

type ShopLike = {currency?: string | null} | null;
type CartLineLike = NonNullable<
  NonNullable<NonNullable<CartLike>['lines']>['nodes']
>[number];

/** Decimal amount, or null when the input is not a usable number. */
export function toDecimal(
  amount: string | number | null | undefined,
): number | null {
  if (amount === null || amount === undefined || amount === '') return null;
  const value = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(value)) return null;
  // Round to cents so float noise (29.990000000000002) never reaches Meta.
  return Math.round(value * 100) / 100;
}

function resolveCurrency(
  ...candidates: Array<string | null | undefined>
): string {
  for (const candidate of candidates) {
    if (candidate) return candidate;
  }
  return 'USD';
}

function contentName(
  productTitle?: string | null,
  variantTitle?: string | null,
): string | undefined {
  const parts = [productTitle, variantTitle].filter(
    (part): part is string => Boolean(part) && part !== 'Default Title',
  );
  return parts.length ? parts.join(' - ') : undefined;
}

/** `ViewContent` from Hydrogen's PRODUCT_VIEWED payload. */
export function mapMetaViewContent(
  payload: {
    products?: Array<{
      title?: string | null;
      price?: string | number | null;
      variantId?: string | null;
      variantTitle?: string | null;
      quantity?: number | null;
    }> | null;
    shop?: ShopLike;
  } | null,
): MetaEventParams | null {
  const product = (payload?.products ?? []).find((item) =>
    variantContentId(item?.variantId),
  );
  const id = variantContentId(product?.variantId);
  if (!product || !id) return null;

  const price = toDecimal(product.price);
  const name = contentName(product.title, product.variantTitle);

  return {
    content_ids: [id],
    content_type: 'product',
    contents: [
      {
        id,
        quantity: toQuantity(product.quantity),
        ...(price === null ? {} : {item_price: price}),
      },
    ],
    ...(name ? {content_name: name} : {}),
    ...(price === null
      ? {}
      : {value: price, currency: resolveCurrency(payload?.shop?.currency)}),
  };
}

/**
 * `AddToCart` — only what this action added, valued at what the shopper is
 * charged.
 *
 * Same two rules as the OpenAI pixel, for the same reasons: the unit price is
 * `cost.amountPerQuantity` (Subscribe & Save is 15% below list price), and the
 * quantity is the delta against `prevLine`, because Hydrogen reports the line
 * after the update.
 */
export function mapMetaAddToCart(
  payload: {
    prevLine?: CartLineLike;
    currentLine?: CartLineLike;
    shop?: ShopLike;
  } | null,
): MetaEventParams | null {
  const line = payload?.currentLine;
  const id = variantContentId(line?.merchandise?.id);
  if (!id) return null;

  const current = toQuantity(line?.quantity);
  const previous = payload?.prevLine
    ? toQuantity(payload.prevLine.quantity)
    : 0;
  const added = current - previous > 0 ? current - previous : 1;

  const paid = line?.cost?.amountPerQuantity;
  const list = line?.merchandise?.price;
  const unitPrice = toDecimal(paid?.amount) ?? toDecimal(list?.amount);
  const currency = resolveCurrency(
    paid?.currencyCode,
    list?.currencyCode,
    payload?.shop?.currency,
  );
  const name = contentName(
    line?.merchandise?.product?.title,
    line?.merchandise?.title,
  );
  const value = unitPrice === null ? null : toDecimal(unitPrice * added);

  return {
    content_ids: [id],
    content_type: 'product',
    contents: [
      {
        id,
        quantity: added,
        ...(unitPrice === null ? {} : {item_price: unitPrice}),
      },
    ],
    ...(name ? {content_name: name} : {}),
    ...(value === null ? {} : {value, currency}),
  };
}
