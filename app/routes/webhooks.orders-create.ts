import type {Route} from './+types/webhooks.orders-create';
import {
  CAPI_ENDPOINT,
  buildOrderCreatedEvent,
  capiRequestBody,
  verifyShopifyHmac,
  webSha256,
  type ShopifyOrder,
} from '~/lib/openAiCapi';

/**
 * Shopify `orders/create` webhook -> ChatGPT Ads Conversions API.
 *
 * Set up in Shopify admin: Settings > Notifications > Webhooks > Create
 * webhook, event "Order creation", format JSON, URL
 * https://drinksleepfuel.com/webhooks/orders-create. The signing secret shown
 * on that page goes in the Oxygen env var SHOPIFY_WEBHOOK_SECRET, and the
 * Conversions API key from OpenAI Ads Manager in OPENAI_ADS_CAPI_KEY.
 *
 * Shopify retries non-2xx responses, and OpenAI deduplicates on the event id
 * (`order_<id>`), so a retry never double counts. Test orders are sent with
 * `validate_only`, so they check the integration without adding conversions.
 * See `app/lib/openAiCapi.ts` and docs/openai-ads-pixel.md.
 */
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {status: 405});
  }

  const {env} = context;
  const rawBody = await request.text();

  const verified = await verifyShopifyHmac(
    rawBody,
    request.headers.get('X-Shopify-Hmac-Sha256'),
    env.SHOPIFY_WEBHOOK_SECRET ?? '',
  );
  if (!verified) {
    return new Response('Unauthorized', {status: 401});
  }

  if (!env.OPENAI_ADS_CAPI_KEY) {
    // Acknowledge so Shopify doesn't retry forever while the key is unset.
    console.error('OPENAI_ADS_CAPI_KEY is not set; order not reported');
    return new Response(null, {status: 204});
  }

  let order: ShopifyOrder;
  try {
    order = JSON.parse(rawBody) as ShopifyOrder;
  } catch {
    return new Response('Bad request', {status: 400});
  }

  const event = await buildOrderCreatedEvent(order, webSha256);
  if (!event) {
    return new Response(null, {status: 204});
  }

  const response = await fetch(CAPI_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_ADS_CAPI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(capiRequestBody(event, Boolean(order.test))),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error(
      `OpenAI Conversions API rejected ${event.id}: ${response.status} ${detail.slice(0, 500)}`,
    );
    // 4xx means the event itself is bad and a retry won't help; 5xx is
    // worth Shopify retrying.
    return new Response(null, {status: response.status >= 500 ? 502 : 204});
  }

  return new Response(null, {status: 204});
}

export async function loader() {
  return new Response('Not found', {status: 404});
}
