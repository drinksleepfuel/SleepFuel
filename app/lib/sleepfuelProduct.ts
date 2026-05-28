/**
 * SleepFuel product data — linked to the live Shopify products.
 *
 * Each "tier" is a separate Shopify product (a quantity/night-supply variant).
 * `merchandiseId` holds the real Storefront API ProductVariant GID, so
 * one-time add-to-cart works end-to-end.
 *
 * Subscribe & Save: no Shopify Subscriptions selling plans exist yet, so
 * `SELLING_PLAN_IDS` are blank and subscribe mode currently adds a one-time
 * line (see `sellingPlanFor`). Once you create a monthly selling plan for each
 * product in the Shopify admin, paste its SellingPlan GID here and the 20%
 * subscribe discount becomes real at checkout — no other code changes needed.
 */

export const SUBSCRIBE_DISCOUNT = 0.2; // 20% off when subscribed

/** Order subtotal (USD) required to unlock free shipping. */
export const FREE_SHIPPING_THRESHOLD = 49;

export type PackKey = 'pack10' | 'pack20' | 'pack30';
export type PurchaseMode = 'subscribe' | 'onetime';

export type Variant = {
  key: PackKey;
  label: string; // "10 Night Supply"
  servings: number; // nights
  basePrice: number; // one-time price, in dollars
  /** Real Storefront API ProductVariant GID */
  merchandiseId: string;
};

export const VARIANTS: Record<PackKey, Variant> = {
  pack10: {
    key: 'pack10',
    label: '10 Night Supply',
    servings: 10,
    basePrice: 29.99,
    merchandiseId: 'gid://shopify/ProductVariant/44790724296790',
  },
  pack20: {
    key: 'pack20',
    label: '20 Night Supply',
    servings: 20,
    basePrice: 55.99,
    merchandiseId: 'gid://shopify/ProductVariant/44790725345366',
  },
  pack30: {
    key: 'pack30',
    label: '30 Night Supply',
    servings: 30,
    basePrice: 85.99,
    merchandiseId: 'gid://shopify/ProductVariant/44790725443670',
  },
};

/** Order of the tiers as shown in the selector. */
export const PACK_ORDER: PackKey[] = ['pack10', 'pack20', 'pack30'];

/** Tier to highlight with a "Best value" badge (lowest cost per night). */
export const BEST_VALUE_KEY: PackKey = 'pack20';

/**
 * Shopify Subscriptions selling plan GIDs — one per product. Empty until the
 * selling plans are created in the Shopify admin. Fill in like:
 *   pack10: 'gid://shopify/SellingPlan/123456789',
 */
export const SELLING_PLAN_IDS: Record<PackKey, string> = {
  pack10: '',
  pack20: '',
  pack30: '',
};

/** Returns the selling plan GID for a tier, or undefined if not configured. */
export function sellingPlanFor(key: PackKey): string | undefined {
  const id = SELLING_PLAN_IDS[key];
  return id.startsWith('gid://shopify/SellingPlan/') ? id : undefined;
}

/**
 * Reverse lookup from a variant's merchandise GID to its monthly selling plan,
 * used by the cart drawer's "switch to Subscribe & Save" upsell. Only includes
 * tiers that actually have a configured selling plan.
 */
export const MERCHANDISE_TO_SELLING_PLAN: Record<string, string> =
  Object.fromEntries(
    PACK_ORDER.map((k) => [VARIANTS[k].merchandiseId, sellingPlanFor(k)] as const)
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  );

export function priceFor(key: PackKey, mode: PurchaseMode) {
  const base = VARIANTS[key].basePrice;
  const final = mode === 'subscribe' ? base * (1 - SUBSCRIBE_DISCOUNT) : base;
  return {base, final};
}

export function pricePerNight(key: PackKey, mode: PurchaseMode) {
  return priceFor(key, mode).final / VARIANTS[key].servings;
}

export function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

export const PRODUCT = {
  handle: 'sleepfuel-drink-mix',
  title: 'SleepFuel Drink Mix',
  tagline:
    'Mixed berry sleep supplement, powered by Magnesium, L-theanine and Melatonin.',
  longDescription:
    'A doctor-formulated nightly drink mix that quiets a busy mind, eases you into deep sleep, and helps you wake up clear-headed. Mixed berry flavor, no sugar crash, no morning grogginess.',
  ingredients: [
    {
      name: 'Magnesium Glycinate',
      dose: '300mg',
      benefit: 'Relaxes muscles and the nervous system',
    },
    {
      name: 'L-Theanine',
      dose: '200mg',
      benefit: 'Calms an overactive mind without sedation',
    },
    {
      name: 'Melatonin',
      dose: '0.5mg',
      benefit: 'A low, body-clock-respectful dose to signal sleep',
    },
    {
      name: 'Glycine',
      dose: '3g',
      benefit: 'Drops core body temperature for deeper sleep',
    },
    {
      name: 'Vitamin B6',
      dose: '1.5mg',
      benefit: 'Cofactor for melatonin and serotonin production',
    },
  ],
  benefits: [
    {
      title: 'Fall asleep faster',
      copy: 'Calm the nighttime mental chatter in 30 minutes or less.',
    },
    {
      title: 'Stay asleep longer',
      copy: 'Spend more time in deep, restorative sleep cycles.',
    },
    {
      title: 'Wake up clear',
      copy: 'No grogginess, no melatonin hangover.',
    },
  ],
} as const;
