import {PACK_ORDER, VARIANTS, type PackKey} from '~/lib/sleepfuelProduct';

export type AvailabilityMap = Record<PackKey, boolean>;

/** Every pack treated as sellable. Used as the fail-open default. */
export const ALL_AVAILABLE: AvailabilityMap = PACK_ORDER.reduce(
  (acc, key) => ({...acc, [key]: true}),
  {} as AvailabilityMap,
);

const VARIANT_AVAILABILITY_QUERY = `#graphql
  query VariantAvailability($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        availableForSale
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
 * Looks up whether each pack can currently be sold.
 *
 * Fails **open**: if the query errors, every pack is reported available. A
 * transient Storefront API blip should never make a stocked store advertise
 * itself as sold out — Shopify still enforces stock at checkout, so the worst
 * case is the behaviour we had before this existed.
 */
export async function fetchAvailability(
  storefront: StorefrontLike,
): Promise<AvailabilityMap> {
  try {
    const ids = PACK_ORDER.map((key) => VARIANTS[key].merchandiseId);
    const {nodes} = await storefront.query<{
      nodes: Array<{id: string; availableForSale: boolean} | null>;
    }>(VARIANT_AVAILABILITY_QUERY, {variables: {ids}});

    const byId = new Map(
      (nodes ?? [])
        .filter((node): node is {id: string; availableForSale: boolean} =>
          Boolean(node?.id),
        )
        .map((node) => [node.id, node.availableForSale]),
    );

    return PACK_ORDER.reduce((acc, key) => {
      const known = byId.get(VARIANTS[key].merchandiseId);
      return {...acc, [key]: known ?? true};
    }, {} as AvailabilityMap);
  } catch {
    return ALL_AVAILABLE;
  }
}
