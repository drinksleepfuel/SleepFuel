import {forwardRef} from 'react';
import {OkendoReviews} from '@okendo/shopify-hydrogen';
import {
  createSchema,
  type ComponentLoaderArgs,
  type HydrogenComponentProps,
} from '@weaverse/hydrogen';
import {PRODUCT} from '~/lib/sleepfuelProduct';

type ReviewSnippet = {value: string} | null;

const REVIEWS_SNIPPET_QUERY = `#graphql
  query OkendoReviewsSnippet($handle: String!) {
    product(handle: $handle) {
      okendoReviewsSnippet: metafield(namespace: "okendo", key: "ReviewsWidgetSnippet") {
        value
      }
    }
  }
` as const;

/**
 * Fetches the pre-rendered Okendo widget markup when the section is rendered
 * by Weaverse. When the product route renders it directly, the route's own
 * loader supplies the snippet instead.
 */
export const loader = async ({weaverse}: ComponentLoaderArgs) => {
  try {
    const {product} = await weaverse.storefront.query<{
      product?: {okendoReviewsSnippet: ReviewSnippet};
    }>(REVIEWS_SNIPPET_QUERY, {variables: {handle: PRODUCT.handle}});
    return {snippet: product?.okendoReviewsSnippet ?? null};
  } catch {
    return {snippet: null};
  }
};

type OkendoReviewsSectionProps = Partial<HydrogenComponentProps> & {
  snippet?: ReviewSnippet;
  loaderData?: {snippet: ReviewSnippet};
};

/** Full Okendo review list. Anchored at `#reviews` for in-page links. */
const OkendoReviewsSection = forwardRef<HTMLElement, OkendoReviewsSectionProps>(
  function OkendoReviewsSection({snippet, loaderData, children, ...rest}, ref) {
    const resolved = snippet ?? loaderData?.snippet ?? null;

    return (
      <section
        ref={ref}
        {...rest}
        id="reviews"
        className="mx-auto w-full max-w-5xl px-5 pt-12 pb-16 sm:px-6 lg:px-8 lg:pt-16 lg:pb-20"
      >
        <OkendoReviews
          productId={PRODUCT.id}
          okendoReviewsSnippet={resolved}
        />
        {children}
      </section>
    );
  },
);

export default OkendoReviewsSection;

export const schema = createSchema({
  type: 'okendo-reviews',
  title: 'Okendo reviews',
  settings: [],
  presets: {},
});
