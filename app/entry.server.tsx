import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';
import {getWeaverseCsp, mergeCsp} from '~/weaverse/csp';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  // Okendo reviews widget assets + API. Hosts per Okendo's Hydrogen demo.
  const okendoCsp = {
    defaultSrc: [
      'https://api.okendo.io',
      'https://cdn-static.okendo.io',
      'https://surveys.okendo.io',
      'https://d3hw6dc1ow8pp2.cloudfront.net',
      'https://d3g5hqndtiniji.cloudfront.net',
      'https://dov7r31oq5dkj.cloudfront.net',
    ],
    styleSrc: [
      'https://cdn-static.okendo.io',
      'https://surveys.okendo.io',
      'https://d3hw6dc1ow8pp2.cloudfront.net',
    ],
    connectSrc: [
      'https://api.okendo.io',
      'https://cdn-static.okendo.io',
      'https://surveys.okendo.io',
      'https://api.raygun.com',
    ],
  };

  // `mergeCsp` concatenates per-directive source lists, so the Weaverse Studio
  // hosts are added *alongside* Okendo's rather than replacing them.
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    ...mergeCsp(okendoCsp, getWeaverseCsp(request, context)),
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
