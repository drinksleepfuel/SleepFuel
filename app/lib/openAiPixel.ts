/**
 * Mapping helpers for the ChatGPT Ads measurement pixel.
 *
 * Everything here is pure and browser-agnostic so it can be unit tested
 * without a DOM. The component that actually talks to `oaiq` lives in
 * `app/components/OpenAiAdsPixel.tsx`.
 *
 * Event and field shapes follow https://developers.openai.com/ads/measurement-pixel
 * — only documented fields are emitted ("Use only the documented fields
 * inside contents[]").
 */

export const OPENAI_PIXEL_ID = 'MnUpwQGPBnAECXLsqNbGWK';
export const OPENAI_SDK_URL = 'https://bzrcdn.openai.com/sdk/oaiq.min.js';

/** Documented content types. The docs show only these two. */
export type OaiqContentType = 'product' | 'page';

export type OaiqContent = {
  id: string;
  name?: string;
  content_type: OaiqContentType;
  quantity?: number;
  amount?: number;
  currency?: string;
};

/** `type: 'contents'` payload shared by page/product/cart/checkout events. */
export type OaiqContentsEvent = {
  type: 'contents';
  amount?: number;
  currency?: string;
  contents: OaiqContent[];
};

/** Storefront events this integration sends. `order_created` is deliberately absent. */
export type OaiqStorefrontEvent =
  | 'page_viewed'
  | 'contents_viewed'
  | 'items_added'
  | 'checkout_started';

const DEFAULT_CURRENCY_EXPONENT = 2;

/**
 * Minor-unit exponent for a currency (USD -> 2, JPY -> 0, KWD -> 3).
 *
 * Derived from Intl rather than a hardcoded table so unusual currencies stay
 * correct. Falls back to 2 when the runtime doesn't know the code.
 */
export function currencyExponent(currency: string): number {
  if (!currency) return DEFAULT_CURRENCY_EXPONENT;
  try {
    const {maximumFractionDigits} = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).resolvedOptions();
    return typeof maximumFractionDigits === 'number'
      ? maximumFractionDigits
      : DEFAULT_CURRENCY_EXPONENT;
  } catch {
    return DEFAULT_CURRENCY_EXPONENT;
  }
}

/**
 * Converts a decimal amount to integer minor units, as the pixel requires
 * ("Use integer values for amount and quantity", 2599 = $25.99).
 *
 * Rounds rather than truncates so 25.995 doesn't silently lose a cent, and
 * returns null for values that aren't finite numbers — callers omit `amount`
 * rather than sending NaN.
 */
export function toMinorUnits(
  amount: string | number | null | undefined,
  currency: string,
): number | null {
  if (amount === null || amount === undefined || amount === '') return null;
  const value = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** currencyExponent(currency);
  return Math.round(value * factor);
}

/** Positive integer quantity, defaulting to 1. */
export function toQuantity(quantity: unknown): number {
  const value = Number(quantity);
  if (!Number.isFinite(value) || value <= 0) return 1;
  return Math.round(value);
}

/**
 * Stable content id for a Shopify variant.
 *
 * Uses the numeric id from the GID so storefront events line up with Shopify
 * customer events in checkout, which expose variant ids in that form. Any
 * value that isn't a GID is passed through unchanged.
 */
export function variantContentId(
  gid: string | null | undefined,
): string | null {
  if (!gid) return null;
  const match = /\/ProductVariant\/(\d+)/.exec(gid);
  if (match) return match[1];
  const tail = gid.split('/').pop();
  return tail || gid;
}

/**
 * Path-only page identifier.
 *
 * Query strings and hashes are dropped: they carry click ids, search terms and
 * occasionally personal data, and the docs ask for content ids, not full URLs.
 */
export function pagePath(url: string | null | undefined): string {
  if (!url) return '/';
  try {
    return new URL(url, 'https://placeholder.invalid').pathname || '/';
  } catch {
    return '/';
  }
}

/* ============================================================
   Hydrogen payload -> oaiq event mapping

   Input types are declared structurally rather than imported from Hydrogen,
   so a change in its internal analytics types can't silently alter what the
   pixel sends.
   ============================================================ */

type ShopLike = {currency?: string | null} | null;

type MoneyLike = {amount?: string | null; currencyCode?: string | null} | null;

type CartLineLike = {
  quantity?: number | null;
  cost?: {amountPerQuantity?: MoneyLike} | null;
  merchandise?: {
    id?: string | null;
    title?: string | null;
    price?: {amount?: string | null; currencyCode?: string | null} | null;
    product?: {title?: string | null} | null;
  } | null;
} | null;

export type CartLike = {
  cost?: {
    subtotalAmount?: MoneyLike;
    totalAmount?: MoneyLike;
  } | null;
  lines?: {nodes?: CartLineLike[] | null} | null;
} | null;

/** Falls back to USD only when neither the line nor the shop states a currency. */
function resolveCurrency(
  ...candidates: Array<string | null | undefined>
): string {
  for (const candidate of candidates) {
    if (candidate) return candidate;
  }
  return 'USD';
}

/** "SleepFuel Drink Mix - 30 Night Supply", skipping an absent variant title. */
function contentName(
  productTitle?: string | null,
  variantTitle?: string | null,
): string | undefined {
  const parts = [productTitle, variantTitle].filter(
    (part): part is string => Boolean(part) && part !== 'Default Title',
  );
  return parts.length ? parts.join(' - ') : undefined;
}

function lineToContent(line: CartLineLike, shop: ShopLike): OaiqContent | null {
  const id = variantContentId(line?.merchandise?.id);
  if (!id) return null;

  // `cost.amountPerQuantity` is the unit price after selling-plan and
  // automatic discounts; `merchandise.price` is the undiscounted list price.
  // Subscribe & Save lines differ by 15%, and reporting the list price there
  // would overstate the cart against its own subtotal.
  const paid = line?.cost?.amountPerQuantity;
  const list = line?.merchandise?.price;
  const currency = resolveCurrency(
    paid?.currencyCode,
    list?.currencyCode,
    shop?.currency,
  );
  const amount =
    toMinorUnits(paid?.amount, currency) ??
    toMinorUnits(list?.amount, currency);

  return {
    id,
    content_type: 'product',
    quantity: toQuantity(line?.quantity),
    ...(contentName(line?.merchandise?.product?.title, line?.merchandise?.title)
      ? {
          name: contentName(
            line?.merchandise?.product?.title,
            line?.merchandise?.title,
          ),
        }
      : {}),
    ...(amount === null ? {} : {amount, currency}),
  };
}

/** `page_viewed` — path only, never the query string. */
export function mapPageViewed(
  url: string | null | undefined,
  title?: string | null,
): OaiqContentsEvent {
  const path = pagePath(url);
  return {
    type: 'contents',
    contents: [
      {
        id: path,
        content_type: 'page',
        ...(title ? {name: title} : {}),
      },
    ],
  };
}

/**
 * `contents_viewed` from Hydrogen's PRODUCT_VIEWED payload.
 *
 * No root-level amount: the docs list `amount`/`currency` at the root for
 * items_added / checkout_started / order_created, and a "total" for a product
 * view would be inventing a number.
 */
export function mapProductViewed(
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
): OaiqContentsEvent | null {
  const products = payload?.products ?? [];
  const currency = resolveCurrency(payload?.shop?.currency);

  const contents = products
    .map((product): OaiqContent | null => {
      const id = variantContentId(product?.variantId);
      if (!id) return null;
      const amount = toMinorUnits(product?.price, currency);
      const name = contentName(product?.title, product?.variantTitle);
      return {
        id,
        content_type: 'product',
        quantity: toQuantity(product?.quantity),
        ...(name ? {name} : {}),
        ...(amount === null ? {} : {amount, currency}),
      };
    })
    .filter((content): content is OaiqContent => content !== null);

  if (!contents.length) return null;
  return {type: 'contents', contents};
}

/**
 * `items_added` — only what this action added, not the whole cart.
 *
 * Hydrogen reports `currentLine` as the line *after* the update, so adding one
 * unit to a line that already held two arrives as quantity 3. The event is
 * meant to describe the add itself, so the quantity is the delta against
 * `prevLine`; without a previous line the whole line is new.
 */
export function mapAddedToCart(
  payload: {
    prevLine?: CartLineLike;
    currentLine?: CartLineLike;
    shop?: ShopLike;
  } | null,
): OaiqContentsEvent | null {
  const content = lineToContent(
    payload?.currentLine ?? null,
    payload?.shop ?? null,
  );
  if (!content) return null;

  const addedQuantity = addedLineQuantity(
    payload?.currentLine,
    payload?.prevLine,
  );
  const currency = content.currency ?? resolveCurrency(payload?.shop?.currency);
  const lineAmount =
    content.amount === undefined ? null : content.amount * addedQuantity;

  return {
    type: 'contents',
    ...(lineAmount === null ? {} : {amount: lineAmount, currency}),
    contents: [{...content, quantity: addedQuantity}],
  };
}

/**
 * Units added by this update. Falls back to the current quantity when there is
 * no previous line, and never reports zero or negative — a quantity the pixel
 * cannot interpret is worse than rounding a surprising delta up to one.
 */
function addedLineQuantity(
  currentLine: CartLineLike | undefined,
  prevLine: CartLineLike | undefined,
): number {
  const current = toQuantity(currentLine?.quantity);
  if (!prevLine) return current;
  const delta = current - toQuantity(prevLine.quantity);
  return delta > 0 ? delta : 1;
}

/**
 * `checkout_started` — the whole cart, with the merchandise subtotal as the
 * root amount.
 *
 * Subtotal rather than `totalAmount`: once shipping and tax are known the
 * total includes them, which would no longer agree with the sum of `contents`.
 */
export function mapCheckoutStarted(
  cart: CartLike,
  shop: ShopLike = null,
): OaiqContentsEvent | null {
  const lines = cart?.lines?.nodes ?? [];
  const contents = lines
    .map((line) => lineToContent(line, shop))
    .filter((content): content is OaiqContent => content !== null);

  if (!contents.length) return null;

  const money = cart?.cost?.subtotalAmount ?? cart?.cost?.totalAmount;
  const currency = resolveCurrency(money?.currencyCode, shop?.currency);
  const amount = toMinorUnits(money?.amount, currency);

  return {
    type: 'contents',
    ...(amount === null ? {} : {amount, currency}),
    contents,
  };
}

/* ============================================================
   Duplicate suppression
   ============================================================ */

/**
 * View events that are idempotent for a given navigation. Repeats of these
 * within a short window are noise, not shopper behaviour.
 *
 * `items_added` and `checkout_started` are deliberately excluded: a shopper
 * can genuinely add the same item or restart checkout twice, and silently
 * swallowing the second would under-report real activity.
 */
const DEDUPED_EVENTS: ReadonlySet<string> = new Set([
  'page_viewed',
  'contents_viewed',
]);

export const DEFAULT_DEDUPE_WINDOW_MS = 1000;

/**
 * Suppresses repeat view events with identical payloads inside a time window.
 *
 * React Strict Mode double-invokes mount effects in development, so
 * `Analytics.ProductView` publishes `product_viewed` twice per navigation.
 * Overlapping navigation and component handlers can do the same in
 * production. Keyed on event name plus payload so two genuinely different
 * product views in quick succession both still send.
 */
export function createViewDeduper(windowMs: number = DEFAULT_DEDUPE_WINDOW_MS) {
  const seen = new Map<string, number>();

  return function allow(
    event: string,
    data: unknown,
    now: number = Date.now(),
  ): boolean {
    if (!DEDUPED_EVENTS.has(event)) return true;

    const key = `${event}|${JSON.stringify(data)}`;
    const previous = seen.get(key);
    if (previous !== undefined && now - previous < windowMs) return false;

    seen.set(key, now);
    // Keep the map from growing without bound on a long session.
    if (seen.size > 50) {
      for (const [storedKey, at] of seen) {
        if (now - at >= windowMs) seen.delete(storedKey);
      }
    }
    return true;
  };
}
