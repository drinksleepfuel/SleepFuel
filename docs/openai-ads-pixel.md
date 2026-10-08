# OpenAI (ChatGPT) Ads pixel

Pixel ID `MnUpwQGPBnAECXLsqNbGWK`. Storefront measurement is implemented and
verified locally. **Nothing has been deployed, and no Shopify setting has been
changed** — the checkout half of this integration is still outstanding and is
listed under "Shopify changes you still need to make".

## How it is wired

| Concern | Where |
| --- | --- |
| SDK load + `init` | `app/root.tsx` — two nonce'd tags in the shared `<head>` |
| Consent + event subscriptions | `app/components/OpenAiAdsPixel.tsx` |
| Payload mapping (pure, unit-tested) | `app/lib/openAiPixel.ts` |
| CSP allow-list | `app/entry.server.tsx` |
| Checkout hand-off | `CartDrawer.tsx`, `MobileMenu.tsx`, `CartSummary.tsx` |

The SDK is loaded from the document head rather than from React, because the
published snippet injects its own `<script>` into `<head>`; letting it do that
after hydration caused React errors #418/#423. React now owns both tags, and
the bootstrap is split so `oaiq("consent", false)` runs *before* `init` — the
SDK requires measurement to start denied.

`debug` is bound to `import.meta.env.DEV`. Verified `debug:false` in the
production bundle.

### Events sent

| Shopify/Hydrogen event | oaiq event | Root `amount` |
| --- | --- | --- |
| `page_viewed` | `page_viewed` | none (no monetary value) |
| `product_viewed` | `contents_viewed` | none |
| `product_added_to_cart` | `items_added` | unit price x units added |
| `custom_checkout_started` | `checkout_started` | cart merchandise subtotal |

Amounts are integer minor units derived from the currency's own exponent
(`Intl`), not a hardcoded x100 — JPY has 0 decimals and KWD has 3, and a fixed
multiplier would overstate a JPY cart 100-fold.

Two mapping decisions worth knowing, both of which produced wrong numbers in
the first pass and are now covered by tests:

- **Line prices come from `cost.amountPerQuantity`, not `merchandise.price`.**
  Subscribe & Save takes 15% off, so the list price disagreed with the cart's
  own subtotal ($59.98 of line items against a $50.98 subtotal). The pixel now
  reports what the shopper is actually charged, and `contents` sums to the root
  amount.
- **`items_added` reports units added, not the resulting line quantity.**
  Hydrogen hands over the line *after* the update, so adding one unit to a line
  already holding two arrived as quantity 3. It is now the delta against
  `prevLine`.

`checkout_started` is published on the real hand-off to `cart.checkoutUrl`, not
on cart open. The storefront has **three** such links (cart drawer, mobile menu,
stock cart-page summary) and they all share one hook,
`useCheckoutStartedPublisher`. The first pass instrumented only the stock
summary — which this storefront never renders — so the event silently never
fired. If a fourth checkout link is ever added, it must call that hook.

`order_created` is deliberately **not** sent from the storefront. The storefront
never observes a completed order: Shopify checkout is a separate origin, and
emitting a purchase from the thank-you route would both miss orders and risk
double-counting against the checkout pixel. Purchases must be owned by a
Shopify custom pixel (below).

### Consent

Gated on Shopify's Customer Privacy API, requiring **both analytics and
marketing** consent. This pixel measures advertising, so marketing is the
relevant basis; a shopper who allows analytics but refuses marketing is not
opted in to ad measurement. To loosen this, change `readTrackingConsent`.

Consent is read from the `visitorConsentCollected` event detail, with a live
read of `window.Shopify.customerPrivacy` as fallback — deliberately *not* from
Hydrogen's `canTrack`, which is React state and still holds the pre-event value
inside the listener. That bug meant a withdrawal looked like "no change" and the
SDK was never told.

The privacy API also loads asynchronously and fires no event when it arrives, so
a mount-time read usually lands before it can answer. Consent is therefore
polled briefly (200ms, up to 10s) and is also re-synced immediately before every
event — the SDK silently discards measurements taken while its own flag is
false, so an event racing the first sync would have been accepted locally and
dropped server-side.

Denied events are dropped, never queued for replay.

### CSP

Both `https://bzrcdn.openai.com` (SDK + config) and `https://bzr.openai.com`
(event beacon) are allowed, on `default-src` and `connect-src`. They are
different hosts — allowing only the CDN let the SDK load but blocked every
event, which is how the first pass failed.

They are on `default-src` **on purpose**: this policy declares no `script-src`
or `img-src`, so naming one would cancel the `default-src` fallback for the
whole page. That mistake previously 403'd every bundled image and blocked nine
third-party scripts. See the comment in `app/weaverse/csp.ts`.

## Verification already done (local dev, `http://localhost:3456`)

| Check | Result |
| --- | --- |
| Bootstrap order | `consent(false)` then `init(...)`, nonce present |
| Production bundle | `debug:false` |
| Client navigation | exactly one `page_viewed`, path only (`/contact`, no query string) |
| Back-navigation | one `contents_viewed` + one `page_viewed` (was 2 — React Strict Mode double-invoke, now deduped) |
| Add to cart | `items_added`, amount 2549, quantity 1 while the cart went 3 -> 4 items |
| Checkout start | `checkout_started`, root 5098 = 2549 x 2, matching the displayed $50.98 subtotal |
| Consent withdrawal | `consent(false)` sent; a subsequent add-to-cart produced zero pixel calls |
| Consent re-grant | `consent(true)` sent; events resume |
| Repeat grant | nothing re-sent |
| Analytics granted, marketing refused | resolves to denied, no events |
| Delivery | SDK beaconed `bzr.openai.com/v1/sdk/events?...&ec=3` — events left the browser and were accepted |
| Tests / typecheck / lint / build | 31 tests pass; typecheck and lint at their pre-existing baselines; build green |

Query strings and hashes are stripped from page ids: they carry click ids,
search terms and occasionally personal data.

## Shopify changes you still need to make

**None of these have been applied.** They need Shopify admin access and change
live behaviour, so they are yours to make or to approve.

1. **Create a customer-events custom pixel** for purchases
   (Settings -> Customer events -> Add custom pixel). It must load the same SDK,
   `init` with pixel ID `MnUpwQGPBnAECXLsqNbGWK`, subscribe to `checkout_completed`,
   and send `order_created` with the order total in minor units and the line
   items as `contents`. Set its consent requirements to match the storefront
   (analytics + marketing).
2. **Resolve `checkout.drinksleepfuel.com`.** `PUBLIC_CHECKOUT_DOMAIN` points at
   it but it still has **no DNS record** (outstanding from the domain launch).
   Until that is fixed the checkout hand-off is broken for real shoppers, and
   no checkout-side measurement can work at all. This is the top blocker.
3. **Confirm attribution survives the hop** (see below) before trusting any
   purchase numbers.

## Unresolved attribution limitations

These are genuine open questions, not implementation gaps. I could not settle
them from the storefront side.

1. **Cross-subdomain click-id survival.** Storefront events fire on
   `drinksleepfuel.com`; checkout runs on `checkout.drinksleepfuel.com`. Whether
   the click id (`__oppref`) reaches checkout depends on the cookie being scoped
   to `.drinksleepfuel.com` rather than the bare host. **Ask OpenAI to confirm
   the cookie's domain scope.** If it is host-scoped, the click id must be
   forwarded explicitly — e.g. appended to `cart.checkoutUrl` at the hand-off —
   or every purchase loses its attribution.
2. **Pixel-sandbox access.** Shopify custom pixels run in a sandboxed iframe on
   a different origin, with no access to the storefront's cookies or
   `document.cookie`. **Ask OpenAI whether oaiq click-id capture works inside
   that sandbox**, and if not, how they expect the click id to be passed
   (cart attribute, order note attribute, or checkout URL parameter).
3. **Purchase ownership is unverified end-to-end.** No real order has been
   placed on this store yet, so the storefront -> checkout -> purchase chain has
   never been exercised once from start to finish.
4. **Consent in the sandbox.** The custom pixel gets Shopify's own consent
   signal, not this component's combined analytics-and-marketing rule. If you
   want identical behaviour, configure the custom pixel's required consent
   explicitly rather than assuming it inherits.

## Preview deploy and end-to-end test

Nothing here is deployed. To test on a real Oxygen URL without touching
production:

```bash
npx shopify hydrogen deploy --environment preview
```

That produces a preview URL on its own subdomain, so it exercises the real CSP,
the real SDK, and real HTTPS without changing what `drinksleepfuel.com` serves.
Pushing to `main` of the `shopify` remote deploys to **production** — do not use
that to test.

Then, in a browser with devtools open:

1. Load the product page. Confirm requests to `bzrcdn.openai.com/sdk/oaiq.min.js`
   and `bzrcdn.openai.com/pixel-config/v1/MnUpwQGPBnAECXLsqNbGWK.json`, and no
   CSP violations in the console.
2. Navigate client-side (e.g. to `/contact` and back). Confirm one `page_viewed`
   per navigation and one `contents_viewed` on the product page.
3. Add to cart. Confirm one `items_added` whose quantity is what you added.
4. Click **Continue to Checkout**. Confirm one `checkout_started` whose root
   amount equals the displayed subtotal in minor units.
5. Confirm beacons to `bzr.openai.com/v1/sdk/events` — `ec=N` is the number of
   events accepted. If events appear locally but no beacon leaves, consent or
   CSP is the cause, in that order.
6. Toggle consent (Shopify's privacy banner, or
   `window.Shopify.customerPrivacy.setTrackingConsent`). Confirm `consent(false)`
   on withdrawal, that no events fire while denied, and `consent(true)` on
   re-grant.
7. Once the custom pixel exists and DNS resolves, place one real order and
   confirm a single `order_created` with the correct total, and that it is
   attributed to the originating click.

To watch the raw calls in any environment, wrap the SDK before testing:

```js
window.__calls = [];
let inner = window.oaiq;
const wrap = (fn) => { const w = (...a) => { window.__calls.push(a); return fn?.(...a); }; if (fn) Object.assign(w, fn); return w; };
let current = wrap(inner);
Object.defineProperty(window, 'oaiq', {configurable: true, get: () => current, set: (fn) => { inner = fn; current = wrap(fn); }});
```

The accessor matters: the SDK replaces `window.oaiq` when it finishes loading,
so a plain wrapper is silently discarded.
