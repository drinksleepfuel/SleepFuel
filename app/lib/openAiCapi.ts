/**
 * Server side purchase reporting for the ChatGPT Ads pixel.
 *
 * Why this exists: on this Hydrogen storefront the shopper checks out on
 * Shopify's own checkout, which the storefront never sees, so the browser
 * pixel cannot report purchases. Instead, Shopify's `orders/create` webhook
 * calls `app/routes/webhooks.orders-create.ts`, which reports the order to
 * OpenAI's Conversions API:
 *
 *   https://developers.openai.com/ads/conversions-api
 *
 * Attribution: the pixel stores the ad click reference in the `__oppref`
 * cookie and a browser reference in `__obref`, on drinksleepfuel.com. The
 * storefront copies both onto the cart as hidden attributes (see
 * `api.ad-attribution.ts`); Shopify carries cart attributes onto the order as
 * `note_attributes`, and the webhook reads them back from there.
 *
 * Consent: the refs are only written to the cart while the shopper allows
 * analytics + marketing (same rule as the browser pixel), and a `_oaiq_consent`
 * flag records that. Without it the order is still reported, so totals stay
 * complete, but with `opt_out: true` and no personal data.
 *
 * Everything here is pure apart from hashing, so it is unit tested.
 */

import {
  OPENAI_PIXEL_ID,
  toMinorUnits,
  toQuantity,
} from '~/lib/openAiPixel';

export const CAPI_ENDPOINT = `https://bzr.openai.com/v1/events?pid=${OPENAI_PIXEL_ID}`;
export const INTEGRATION_SOURCE = 'sleepfuel_hydrogen';
export const STOREFRONT_ORIGIN = 'https://drinksleepfuel.com';

/** Hidden cart attributes (a leading underscore hides them in checkout). */
export const ATTR_OPPREF = '_oaiq_oppref';
export const ATTR_OBREF = '_oaiq_obref';
export const ATTR_CONSENT = '_oaiq_consent';
export const ATTRIBUTION_KEYS: ReadonlySet<string> = new Set([
  ATTR_OPPREF,
  ATTR_OBREF,
  ATTR_CONSENT,
]);

/** OpenAI rejects events older than 7 days. */
const MAX_EVENT_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Accepts a ref only if it looks like an opaque token. These come from the
 * browser, so anything long or with unexpected characters is dropped rather
 * than stored on the cart.
 */
export function sanitizeRef(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 512) return null;
  if (!/^[A-Za-z0-9._~:%+/=-]+$/.test(trimmed)) return null;
  return trimmed;
}

/** Value of a cookie from a `document.cookie` style string, or null. */
export function readCookie(
  cookies: string | null | undefined,
  name: string,
): string | null {
  for (const part of (cookies ?? '').split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    if (part.slice(0, index).trim() !== name) continue;
    const raw = part.slice(index + 1).trim();
    try {
      return decodeURIComponent(raw) || null;
    } catch {
      return raw || null;
    }
  }
  return null;
}

export type Attribute = {key: string; value: string};

/**
 * The cart's attributes with ours set (or removed when `refs` is null).
 * Shopify replaces the whole attribute list on update, so every attribute
 * that isn't ours is carried over unchanged.
 */
export function mergeAttributionAttributes(
  existing: Array<{key: string; value?: string | null}> | null | undefined,
  refs: {oppref: string | null; obref: string | null} | null,
): Attribute[] {
  const kept: Attribute[] = (existing ?? [])
    .filter((attr) => attr?.key && !ATTRIBUTION_KEYS.has(attr.key))
    .map((attr) => ({key: attr.key, value: attr.value ?? ''}));

  if (!refs || (!refs.oppref && !refs.obref)) return kept;

  return [
    ...kept,
    ...(refs.oppref ? [{key: ATTR_OPPREF, value: refs.oppref}] : []),
    ...(refs.obref ? [{key: ATTR_OBREF, value: refs.obref}] : []),
    {key: ATTR_CONSENT, value: '1'},
  ];
}

/* ============================================================
   Shopify order -> Conversions API event
   ============================================================ */

/** The parts of Shopify's order webhook payload this uses. */
export type ShopifyOrder = {
  id?: number | string | null;
  created_at?: string | null;
  currency?: string | null;
  subtotal_price?: string | null;
  current_subtotal_price?: string | null;
  test?: boolean | null;
  email?: string | null;
  phone?: string | null;
  browser_ip?: string | null;
  client_details?: {user_agent?: string | null} | null;
  note_attributes?: Array<{name?: string | null; value?: string | null}> | null;
  customer?: {
    id?: number | string | null;
    email?: string | null;
    phone?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  billing_address?: ShopifyAddress | null;
  shipping_address?: ShopifyAddress | null;
  line_items?: Array<{
    variant_id?: number | string | null;
    product_id?: number | string | null;
    title?: string | null;
    variant_title?: string | null;
    quantity?: number | null;
    price?: string | null;
    total_discount?: string | null;
  }> | null;
};

type ShopifyAddress = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  city?: string | null;
  province?: string | null;
  zip?: string | null;
  country_code?: string | null;
};

export type CapiContent = {
  id: string;
  name?: string;
  content_type: 'product';
  quantity: number;
  amount?: number;
  currency?: string;
};

export type CapiUser = {
  obref?: string;
  emails_sha256?: string[];
  phone_numbers_sha256?: string[];
  first_names_sha256?: string[];
  last_names_sha256?: string[];
  external_ids_sha256?: string[];
  regions?: string[];
  cities?: string[];
  postal_codes?: string[];
  countries?: string[];
  ip_address?: string;
  user_agent?: string;
};

export type CapiEvent = {
  id: string;
  type: 'order_created';
  timestamp_ms: number;
  oppref?: string;
  source_url: string;
  action_source: 'web';
  user?: CapiUser;
  opt_out: boolean;
  data: {
    type: 'contents';
    amount?: number;
    currency: string;
    contents: CapiContent[];
  };
};

export type Sha256 = (input: string) => Promise<string>;

function noteAttribute(order: ShopifyOrder, key: string): string | null {
  const found = order.note_attributes?.find((attr) => attr?.name === key);
  return found?.value ? String(found.value) : null;
}

function contentName(title?: string | null, variant?: string | null) {
  const parts = [title, variant].filter(
    (part): part is string => Boolean(part) && part !== 'Default Title',
  );
  return parts.length ? parts.join(' - ') : undefined;
}

/* --- normalisation before hashing, per OpenAI's identifier rules --- */

export function normalizeEmail(email: string | null | undefined): string | null {
  const value = email?.trim().toLowerCase();
  return value && value.includes('@') ? value : null;
}

/** Digits only, keeping the country code; US 10 digit numbers get a 1. */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '').replace(/^0+/, '');
  if (digits.length === 10) digits = `1${digits}`;
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

export function normalizeName(name: string | null | undefined): string | null {
  const value = name?.trim().toLowerCase();
  return value || null;
}

async function hashed(
  sha256: Sha256,
  values: Array<string | null>,
): Promise<string[] | undefined> {
  const unique = [...new Set(values.filter((v): v is string => Boolean(v)))];
  if (!unique.length) return undefined;
  return Promise.all(unique.map((value) => sha256(value)));
}

function one(value: string | null | undefined): string[] | undefined {
  const trimmed = value?.trim();
  return trimmed ? [trimmed] : undefined;
}

/**
 * Builds the `order_created` event for a Shopify order, or null when the
 * order can't or shouldn't be reported (no id, no line items, too old).
 */
export async function buildOrderCreatedEvent(
  order: ShopifyOrder,
  sha256: Sha256,
  nowMs: number = Date.now(),
): Promise<CapiEvent | null> {
  if (order?.id === null || order?.id === undefined || order.id === '') {
    return null;
  }

  const createdMs = order.created_at ? Date.parse(order.created_at) : NaN;
  const timestampMs = Number.isFinite(createdMs) ? createdMs : nowMs;
  if (nowMs - timestampMs > MAX_EVENT_AGE_MS) return null;

  const currency = order.currency || 'USD';

  const contents: CapiContent[] = (order.line_items ?? [])
    .map((line): CapiContent | null => {
      const rawId = line?.variant_id ?? line?.product_id;
      if (rawId === null || rawId === undefined || rawId === '') return null;
      const quantity = toQuantity(line?.quantity);
      // Per unit price actually charged: list price less this line's
      // discounts, so Subscribe & Save lines report the 15% off price.
      const lineTotal =
        Number(line?.price ?? NaN) * quantity -
        Number(line?.total_discount ?? 0);
      const unit = toMinorUnits(
        Number.isFinite(lineTotal) ? lineTotal / quantity : null,
        currency,
      );
      const name = contentName(line?.title, line?.variant_title);
      return {
        id: String(rawId),
        content_type: 'product',
        quantity,
        ...(name ? {name} : {}),
        ...(unit === null ? {} : {amount: unit, currency}),
      };
    })
    .filter((content): content is CapiContent => content !== null);

  if (!contents.length) return null;

  // Merchandise subtotal after discounts, before shipping and tax, matching
  // the storefront's checkout_started value.
  const amount = toMinorUnits(
    order.current_subtotal_price ?? order.subtotal_price,
    currency,
  );

  const consented = noteAttribute(order, ATTR_CONSENT) === '1';
  const oppref = consented
    ? sanitizeRef(noteAttribute(order, ATTR_OPPREF))
    : null;
  const obref = consented ? sanitizeRef(noteAttribute(order, ATTR_OBREF)) : null;

  let user: CapiUser | undefined;
  if (consented) {
    const address = order.billing_address ?? order.shipping_address ?? null;
    const candidate: CapiUser = {
      ...(obref ? {obref} : {}),
      emails_sha256: await hashed(sha256, [
        normalizeEmail(order.email),
        normalizeEmail(order.customer?.email),
      ]),
      phone_numbers_sha256: await hashed(sha256, [
        normalizePhone(order.phone),
        normalizePhone(order.customer?.phone),
        normalizePhone(address?.phone),
      ]),
      first_names_sha256: await hashed(sha256, [
        normalizeName(order.customer?.first_name ?? address?.first_name),
      ]),
      last_names_sha256: await hashed(sha256, [
        normalizeName(order.customer?.last_name ?? address?.last_name),
      ]),
      external_ids_sha256: await hashed(sha256, [
        order.customer?.id ? String(order.customer.id) : null,
      ]),
      regions: one(address?.province),
      cities: one(address?.city),
      postal_codes: one(address?.zip),
      countries: one(address?.country_code),
      ...(order.browser_ip ? {ip_address: order.browser_ip} : {}),
      ...(order.client_details?.user_agent
        ? {user_agent: order.client_details.user_agent}
        : {}),
    };
    // Drop empty fields so OpenAI never receives blank identifier arrays.
    user = Object.fromEntries(
      Object.entries(candidate).filter(([, value]) => value !== undefined),
    ) as CapiUser;
  }

  return {
    id: `order_${order.id}`,
    type: 'order_created',
    timestamp_ms: timestampMs,
    ...(oppref ? {oppref} : {}),
    source_url: `${STOREFRONT_ORIGIN}/checkout`,
    action_source: 'web',
    ...(user && Object.keys(user).length ? {user} : {}),
    opt_out: !consented,
    data: {
      type: 'contents',
      ...(amount === null ? {} : {amount}),
      currency,
      contents,
    },
  };
}

/** Request body for the Conversions API. Test orders are validated only. */
export function capiRequestBody(event: CapiEvent, validateOnly: boolean) {
  return {
    validate_only: validateOnly,
    integration_source: INTEGRATION_SOURCE,
    events: [event],
  };
}

/** SHA-256 hex digest using Web Crypto (available in Oxygen workers). */
export const webSha256: Sha256 = async (input) => {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Verifies Shopify's `X-Shopify-Hmac-Sha256` header: base64 HMAC-SHA256 of
 * the raw request body, keyed with the webhook signing secret.
 */
export async function verifyShopifyHmac(
  rawBody: string,
  hmacHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!hmacHeader || !secret) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody)),
  );
  const expected = btoa(String.fromCharCode(...signature));
  // Constant time comparison.
  if (expected.length !== hmacHeader.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ hmacHeader.charCodeAt(i);
  }
  return diff === 0;
}
