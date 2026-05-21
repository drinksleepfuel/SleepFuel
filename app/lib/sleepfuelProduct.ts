/**
 * Placeholder product data for SleepFuel Drink Mix.
 *
 * Replace `merchandiseId` and `sellingPlanId` with real Storefront API GIDs
 * once the product + Shopify Subscriptions selling plan are created in
 * the Shopify admin. Until then, the UI renders against these values so
 * the design can be reviewed without a backend dependency.
 */

export const SUBSCRIBE_DISCOUNT = 0.2; // 20% off when subscribed

export type PackKey = 'pack10' | 'pack30';
export type PurchaseMode = 'subscribe' | 'onetime';

export type Variant = {
  key: PackKey;
  label: string; // "10 Pack" / "30 Pack"
  servings: number;
  basePrice: number; // one-time price, in dollars
  /** Replace with real Storefront API variant GID */
  merchandiseId: string;
};

export const VARIANTS: Record<PackKey, Variant> = {
  pack10: {
    key: 'pack10',
    label: '10 Pack',
    servings: 10,
    basePrice: 29.95,
    merchandiseId: 'gid://shopify/ProductVariant/PLACEHOLDER_10PACK',
  },
  pack30: {
    key: 'pack30',
    label: '30 Pack',
    servings: 30,
    basePrice: 79.95,
    merchandiseId: 'gid://shopify/ProductVariant/PLACEHOLDER_30PACK',
  },
};

/**
 * Selling plan IDs from Shopify Subscriptions. Replace once selling plans
 * are created. One per variant.
 */
export const SELLING_PLAN_IDS: Record<PackKey, string> = {
  pack10: 'gid://shopify/SellingPlan/PLACEHOLDER_10PACK_MONTHLY',
  pack30: 'gid://shopify/SellingPlan/PLACEHOLDER_30PACK_MONTHLY',
};

export function priceFor(key: PackKey, mode: PurchaseMode) {
  const base = VARIANTS[key].basePrice;
  const final = mode === 'subscribe' ? base * (1 - SUBSCRIBE_DISCOUNT) : base;
  return {base, final};
}

export function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

export const PRODUCT = {
  handle: 'sleepfuel-drink-mix',
  title: 'SleepFuel Drink Mix',
  tagline: 'Mixed berry sleep supplement, powered by Magnesium, L-theanine and Melatonin.',
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
