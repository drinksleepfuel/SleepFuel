# Meta (Facebook / Instagram) pixel

Dataset **SleepFuel 4.5.24**, pixel ID `804561264911688`, in the New_SF1
business portfolio. Built on the same pattern as the OpenAI Ads pixel
(`docs/openai-ads-pixel.md`); read that first for the reasoning behind the
head bootstrap, consent handling and CSP rules.

## Who sends what

| Event | Sent by |
| --- | --- |
| PageView, ViewContent, AddToCart | This storefront (`<MetaPixel/>`) |
| InitiateCheckout, Purchase, checkout steps | Shopify checkout, via the Facebook & Instagram app (pixel + Conversions API, data sharing set to Maximum) |

InitiateCheckout and Purchase are deliberately **not** sent from the storefront.
The app already reports them from checkout, and sending them here too would
double count conversions that ads optimise against.

## How it is wired

| Concern | Where |
| --- | --- |
| Queue stub, `consent revoke`, `init`, SDK tag | `app/root.tsx` (`META_PIXEL_BOOTSTRAP`) |
| Consent + Hydrogen event subscriptions | `app/components/MetaPixel.tsx` |
| Payload mapping (pure, unit tested) | `app/lib/metaPixel.ts`, `app/lib/metaPixel.test.ts` |
| CSP allow list | `app/entry.server.tsx` (`metaPixelCsp`) |

- **Production only.** The pixel renders only when the request host is
  `drinksleepfuel.com` or `www.drinksleepfuel.com` (`META_PIXEL_HOSTS`). Oxygen
  previews, any staging environment and local dev never load it, so test
  traffic never reaches the live dataset. Add a host there if the domain
  changes.
- **Consent** reuses `readTrackingConsent` from the OpenAI pixel: analytics and
  marketing consent are both required. The pixel starts revoked and is granted
  once Shopify's customer privacy API allows it.
- **PageView** comes only from Hydrogen's `page_viewed`; the head script calls
  `init` without tracking, so there is never a double PageView.
- **Values** are decimals (Meta's format), using the price actually charged
  (`cost.amountPerQuantity`, so Subscribe & Save is 15% off list) and only the
  units added in this action.
- **content_ids** are numeric Shopify variant ids. Before running catalog or
  dynamic retargeting ads, confirm in Commerce Manager that catalog item ids
  use the same format, or the events will not match catalog products.
- The dataset is in a Meta "core setup" category, so only standard
  parameters are sent; custom parameters and URL paths would be stripped.

## Verifying after deploy

1. Open drinksleepfuel.com with the **Meta Pixel Helper** Chrome extension.
2. Load a product page: one PageView and one ViewContent.
3. Add to cart: one AddToCart with the right value.
4. In Events Manager > SleepFuel 4.5.24 > Overview, drinksleepfuel.com should
   appear under Websites within about 30 minutes.

Verified locally: unit tests, typecheck (at its existing baseline), lint and a
production build; the head renders `consent revoke` then `init` with the
nonce; the CSP allows Meta with no violations; the pixel is absent on
non-production hosts; consent switches to `grant` when Shopify's privacy API
allows tracking. Hydrogen's analytics events could not be exercised end to end
locally because the sandbox cannot reach the Storefront API, so confirm the
events on the live site with the steps above.
