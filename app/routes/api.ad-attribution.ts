import type {Route} from './+types/api.ad-attribution';
import {mergeAttributionAttributes, sanitizeRef} from '~/lib/openAiCapi';

/**
 * Copies the ChatGPT Ads pixel's click and browser references onto the cart
 * as hidden attributes, so the order webhook can attribute the purchase.
 *
 * Called by `<OpenAiAdsPixel/>` with navigator.sendBeacon after an add to
 * cart and at checkout. Body: `{"oppref": "...", "obref": "..."}` to set, or
 * `{"clear": true}` when the shopper withdraws consent. Only our own keys are
 * written; every other cart attribute is kept as is.
 */
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {status: 405});
  }

  let body: {oppref?: unknown; obref?: unknown; clear?: unknown};
  try {
    body = JSON.parse(await request.text()) as typeof body;
  } catch {
    return new Response('Bad request', {status: 400});
  }

  const {cart} = context;
  const current = await cart.get();
  if (!current?.id) {
    // Nothing to attach to yet; the next add to cart will try again.
    return new Response(null, {status: 204});
  }

  const refs =
    body.clear === true
      ? null
      : {oppref: sanitizeRef(body.oppref), obref: sanitizeRef(body.obref)};
  if (refs && !refs.oppref && !refs.obref) {
    return new Response(null, {status: 204});
  }

  const attributes = mergeAttributionAttributes(current.attributes, refs);
  const result = await cart.updateAttributes(attributes);

  const headers = result?.cart?.id
    ? cart.setCartId(result.cart.id)
    : new Headers();
  return new Response(null, {status: 204, headers});
}

export async function loader() {
  return new Response('Not found', {status: 404});
}
