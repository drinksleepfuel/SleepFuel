import {PACK_ORDER, VARIANTS, type PackKey} from '~/lib/sleepfuelProduct';

export type VariantInfo = {
  /** Whether Shopify will currently sell this variant. */
  available: boolean;
  /** One-time price in dollars, as Shopify has it. */
  price: number;
};

export type VariantInfoMap = Record<PackKey, VariantInfo>;

/**
 * Prices bundled in the repo, treated as sellable. Used whenever the live
 * lookup can't answer.
 */
export const FALLBACK_VARIANT_INFO: VariantInfoMap = PACK_ORDER.reduce(
  (acc, key) => ({
    ...acc,
    [key]: {available: true, price: VARIANTS[key].basePrice},
  }),
  {} as VariantInfoMap,
);

const VARIANT_DATA_QUERY = `#graphql
  query VariantData($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        availableForSale
        price {
          amount
        }
      }
    }
  }
` as const;

type StorefrontLike = {
  query: <T>(
    query: string,
    options?: {variables?: Record<string, unknown>},
  ) => Promise<T>;
};

/**
 * Reads live price and stock for the three packs straight from Shopify, so the
 * storefront can't advertise a price the checkout won't honour.
 *
 * Fails **open**, per field: anything the query doesn't answer falls back to
 * the bundled constant and `available: true`. A transient Storefront API blip
 * must never make a stocked store look sold out, and Shopify remains the
 * authority on both price and stock at checkout.
 */
export async function fetchVariantData(
  storefront: StorefrontLike,
): Promise<VariantInfoMap> {
  try {
    const ids = PACK_ORDER.map((key) => VARIANTS[key].merchandiseId);
    const {nodes} = await storefront.query<{
      nodes: Array<{
        id: string;
        availableForSale: boolean;
        price: {amount: string};
      } | null>;
    }>(VARIANT_DATA_QUERY, {variables: {ids}});

    const byId = new Map(
      (nodes ?? [])
        .filter((node) => Boolean(node?.id))
        .map((node) => [node!.id, node!]),
    );

    return PACK_ORDER.reduce((acc, key) => {
      const node = byId.get(VARIANTS[key].merchandiseId);
      const parsed = Number(node?.price?.amount);
      return {
        ...acc,
        [key]: {
          available: node?.availableForSale ?? true,
          price:
            Number.isFinite(parsed) && parsed > 0
              ? parsed
              : VARIANTS[key].basePrice,
        },
      };
    }, {} as VariantInfoMap);
  } catch {
    return FALLBACK_VARIANT_INFO;
  }
}
