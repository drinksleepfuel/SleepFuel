import {useCallback, useEffect, useRef} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {
  createViewDeduper,
  mapAddedToCart,
  mapCheckoutStarted,
  mapPageViewed,
  mapProductViewed,
  type CartLike,
  type OaiqContentsEvent,
  type OaiqStorefrontEvent,
} from '~/lib/openAiPixel';

declare global {
  interface Window {
    // `Shopify.customerPrivacy` is already declared by Hydrogen.
    oaiq?: ((...args: unknown[]) => void) & {q?: unknown[]};
  }
}

/** How often, and for how long, to wait for the privacy API to load. */
const CONSENT_POLL_INTERVAL_MS = 200;
const CONSENT_POLL_TIMEOUT_MS = 10_000;

/** Payload Shopify attaches to `visitorConsentCollected`. */
type VisitorConsentDetail = {
  analyticsAllowed?: boolean;
  marketingAllowed?: boolean;
};

/**
 * Whether measurement is permitted, read from Shopify's customer privacy API
 * rather than Hydrogen's `canTrack`.
 *
 * `canTrack` is React state: inside a `visitorConsentCollected` listener it
 * still holds the pre-event value, so a withdrawal looked unchanged and the
 * SDK was never told. The event's own detail is authoritative, with a live
 * read of the privacy API as the fallback.
 *
 * Both analytics *and* marketing consent are required. This pixel exists to
 * measure advertising, so marketing is the relevant legal basis; a shopper who
 * allows analytics but refuses marketing is not opted in to ad measurement.
 *
 * Returns null when consent cannot be determined, leaving the caller to fall
 * back to Hydrogen.
 */
function readTrackingConsent(detail?: VisitorConsentDetail): boolean | null {
  if (
    typeof detail?.analyticsAllowed === 'boolean' &&
    typeof detail?.marketingAllowed === 'boolean'
  ) {
    return detail.analyticsAllowed && detail.marketingAllowed;
  }

  const privacy =
    typeof window === 'undefined' ? undefined : window.Shopify?.customerPrivacy;
  if (!privacy?.analyticsProcessingAllowed || !privacy?.marketingAllowed) {
    return null;
  }
  try {
    return privacy.analyticsProcessingAllowed() && privacy.marketingAllowed();
  } catch {
    // The API throws until it has loaded; treat that as "not yet known".
    return null;
  }
}

/** Hydrogen requires custom analytics event names to start with `custom_`. */
export const CHECKOUT_STARTED_EVENT = 'custom_checkout_started';

export type CheckoutStartedPayload = {
  cart: CartLike;
  shop?: {currency?: string | null} | null;
};

/**
 * Forwards storefront activity to the ChatGPT Ads pixel.
 *
 * The SDK is loaded and initialised from the document <head> (see
 * `app/root.tsx`), which runs once per document and keeps `window`/`document`
 * out of server rendering. This component owns the two things that need React:
 * consent, and the Hydrogen analytics subscriptions.
 *
 * `order_created` is deliberately not sent from here — see the attribution
 * notes in the integration docs. Purchases are owned by the Shopify custom
 * pixel in checkout.
 */
export function OpenAiAdsPixel() {
  const {subscribe, register, canTrack} = useAnalytics();
  const {ready} = register('OpenAI_Ads_Pixel');

  // Guards against double-subscribing under React Strict Mode, remounts and
  // client-side route changes.
  const subscribed = useRef(false);
  // Last consent value actually handed to the SDK, so we only call on change.
  const consentSent = useRef<boolean | null>(null);
  // Suppresses repeat view events (Strict Mode double-invoke, overlapping
  // handlers). Created once so its memory survives re-renders.
  const allowEvent = useRef(createViewDeduper()).current;

  /**
   * Pushes the current consent state to the SDK, but only on change.
   *
   * Shared by the consent effect and `measure`, because the SDK silently
   * discards measurements taken while its own consent flag is false: the head
   * script starts it denied, so an event that fires before the first successful
   * sync would be accepted here and dropped there.
   */
  const syncConsent = useCallback(
    (detail?: VisitorConsentDetail) => {
      const allowed = readTrackingConsent(detail) ?? canTrack();
      if (consentSent.current !== allowed) {
        consentSent.current = allowed;
        window.oaiq?.('consent', allowed);
      }
      return allowed;
    },
    [canTrack],
  );

  const measure = useCallback(
    (event: OaiqStorefrontEvent, data: OaiqContentsEvent | null) => {
      if (!data) return;
      // Re-checked at delivery time, not subscription time: events that arrive
      // while measurement is denied are dropped, never queued for replay.
      if (!syncConsent()) return;
      if (!allowEvent(event, data)) return;
      window.oaiq?.('measure', event, data);
    },
    [syncConsent, allowEvent],
  );

  // --- consent -------------------------------------------------------------
  // The head script sets consent to false before init, so measurement starts
  // denied and only opens once Shopify's customer privacy API resolves.
  useEffect(() => {
    const onConsentCollected = (event: Event) => {
      syncConsent((event as CustomEvent<VisitorConsentDetail>).detail);
    };

    syncConsent();

    // The privacy API loads asynchronously and fires no event when it arrives,
    // so a mount-time read often lands before it can answer. Poll briefly for
    // the first real answer; without this the SDK keeps the denied default
    // until the shopper happens to change a consent setting.
    let elapsed = 0;
    const interval = window.setInterval(() => {
      elapsed += CONSENT_POLL_INTERVAL_MS;
      if (readTrackingConsent() !== null || elapsed >= CONSENT_POLL_TIMEOUT_MS) {
        window.clearInterval(interval);
        syncConsent();
      }
    }, CONSENT_POLL_INTERVAL_MS);

    // Shopify's customer privacy API dispatches this when the shopper grants
    // or withdraws consent, including withdrawal after an earlier grant.
    document.addEventListener('visitorConsentCollected', onConsentCollected);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener(
        'visitorConsentCollected',
        onConsentCollected,
      );
    };
  }, [syncConsent]);

  // --- storefront events ---------------------------------------------------
  useEffect(() => {
    if (subscribed.current) return;
    subscribed.current = true;

    subscribe('page_viewed', (payload: {url?: string} | undefined) => {
      measure('page_viewed', mapPageViewed(payload?.url, document.title));
    });

    subscribe('product_viewed', (payload) => {
      measure('contents_viewed', mapProductViewed(payload as never));
    });

    // Published by Hydrogen only after the cart mutation succeeds, so this is
    // never sent for a failed add.
    subscribe('product_added_to_cart', (payload) => {
      measure('items_added', mapAddedToCart(payload as never));
    });

    subscribe(CHECKOUT_STARTED_EVENT, (payload) => {
      const {cart, shop} = (payload ?? {}) as CheckoutStartedPayload;
      measure('checkout_started', mapCheckoutStarted(cart, shop ?? null));
    });

    // Tells the analytics provider this subscriber is attached, so events
    // buffered during startup are flushed rather than lost.
    ready();
  }, [subscribe, ready, measure]);

  return null;
}

/**
 * Publishes `checkout_started` as the shopper leaves for Shopify checkout.
 *
 * Every client-side hand-off to `cart.checkoutUrl` must call this — the
 * storefront has three (the cart drawer, the mobile menu, and the stock cart
 * page summary), and a link that skips it loses the event entirely. Returns an
 * `onClick` handler so the call site stays a plain anchor: the event is
 * published synchronously during the click, before the browser unloads.
 */
export function useCheckoutStartedPublisher(cart: CartLike) {
  const {publish, shop} = useAnalytics();
  return useCallback(() => {
    publish(CHECKOUT_STARTED_EVENT, {cart, shop} satisfies CheckoutStartedPayload);
  }, [publish, cart, shop]);
}
