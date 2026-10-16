import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => [
  {title: 'Policies | SleepFuel'},
];

export async function loader({context}: Route.LoaderArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
      <p className="text-sm font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
        Legal
      </p>
      <h1
        className="mt-2 text-[44px] font-normal leading-[1.05] tracking-tight sm:text-5xl"
        style={{fontFamily: 'var(--font-display)'}}
      >
        Policies
      </h1>
      <ul className="mt-10 divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)]">
        {policies.map((policy) => (
          <li key={policy.id}>
            <Link
              to={`/policies/${policy.handle}`}
              prefetch="intent"
              className="flex items-center justify-between py-5 text-lg text-[color:var(--color-ink)] hover:text-[color:var(--color-blue)]"
            >
              {policy.title}
              <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/pages/legal-notice"
            prefetch="intent"
            className="flex items-center justify-between py-5 text-lg text-[color:var(--color-ink)] hover:text-[color:var(--color-blue)]"
          >
            Legal Notice
            <span aria-hidden="true">→</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
