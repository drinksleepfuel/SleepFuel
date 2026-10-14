import {useCallback, useEffect, useRef} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {
  CONSENT_POLL_INTERVAL_MS,
  CONSENT_POLL_TIMEOUT_MS,
  readTrackingConsent,
  type VisitorConsentDetail,
} from '~/components/OpenAiAdsPixel';
import {createViewDeduper} from '~/lib/openAiPixel';
import {
  mapMetaAddToCart,
  mapMetaViewContent,
  type MetaEventParams,
  type MetaStorefrontEvent,
} from '~/lib/metaPixel';

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {queue?: unknown[]};
  }
}

/**
 * The shared deduper only suppresses OpenAI's view event names, so Meta's
 * view events borrow them as keys. AddToCart is never deduped: a shopper can
 * genuinely add the same item twice.
 */
const DEDUPE_KEY: Record<MetaStorefrontEvent, string> = {
  PageView: 'page_viewed',
  ViewContent: 'contents_viewed',
  AddToCart: 'items_added',
};

/**
 * Forwards storefront activity to the Meta pixel (dataset SleepFuel 4.5.24).
 *
 * Mirrors `OpenAiAdsPixel`: the SDK is loaded and initialised from the
 * document <head> in `app/root.tsx` with consent revoked, and this component
 * owns consent and the Hydrogen analytics subscriptions. It is only rendered
 * on the production host (see `isMetaPixelHost`).
 *
 * Purchase and InitiateCheckout are deliberately not sent from here. Checkout
 * runs on Shopify, where the Facebook & Instagram app's pixel and its
 * Conversions API already report them; sending them again would double count.
 */
export function MetaPixel() {
  const {subscribe, register, canTrack} = useAnalytics();
  const {ready} = register('Meta_Pixel');

  const subscribed = useRef(false);
  const consentSent = useRef<boolean | null>(null);
  const allowEvent = useRef(createViewDeduper()).current;

  /** Pushes consent to fbq on change only. Returns the current state. */
  const syncConsent = useCallback(
    (detail?: VisitorConsentDetail) => {
      const allowed = readTrackingConsent(detail) ?? canTrack();
      if (consentSent.current !== allowed) {
        consentSent.current = allowed;
        window.fbq?.('consent', allowed ? 'grant' : 'revoke');
      }
      return allowed;
    },
    [canTrack],
  );

  const track = useCallback(
    (
      event: Exclude<MetaStorefrontEvent, 'PageView'>,
      params: MetaEventParams | null,
    ) => {
      if (!params) return;
      // Checked at delivery time; events while denied are dropped, not queued.
      if (!syncConsent()) return;
      if (!allowEvent(DEDUPE_KEY[event], params)) return;
      window.fbq?.('track', event, params);
    },
    [syncConsent, allowEvent],
  );

  // --- consent -------------------------------------------------------------
  useEffect(() => {
    const onConsentCollected = (event: Event) => {
      syncConsent((event as CustomEvent<VisitorConsentDetail>).detail);
    };

    syncConsent();

    let elapsed = 0;
    const interval = window.setInterval(() => {
      elapsed += CONSENT_POLL_INTERVAL_MS;
      if (readTrackingConsent() !== null || elapsed >= CONSENT_POLL_TIMEOUT_MS) {
        window.clearInterval(interval);
        syncConsent();
      }
    }, CONSENT_POLL_INTERVAL_MS);

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

    // The head script only calls init, so this is the sole PageView source.
    // Keyed on the URL so two different pages in quick succession both send.
    subscribe('page_viewed', (payload: {url?: string} | undefined) => {
      if (!syncConsent()) return;
      if (!allowEvent(DEDUPE_KEY.PageView, payload?.url ?? 'PageView')) return;
      window.fbq?.('track', 'PageView');
    });

    subscribe('product_viewed', (payload) => {
      track('ViewContent', mapMetaViewContent(payload as never));
    });

    // Published by Hydrogen only after the cart mutation succeeds.
    subscribe('product_added_to_cart', (payload) => {
      track('AddToCart', mapMetaAddToCart(payload as never));
    });

    ready();
  }, [subscribe, ready, track, syncConsent, allowEvent]);

  return null;
}
