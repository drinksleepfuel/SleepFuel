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
  // `mergeCsp` concatenates per-directive source lists, so any future
  // third-party hosts can be added alongside Weaverse's rather than
  // replacing them.
  // OpenAI Ads pixel. Two different hosts, which is easy to miss: the SDK is
  // served from bzrcdn.openai.com, but it posts events to bzr.openai.com
  // (/v1/sdk/events). Allowing only the CDN loads the pixel and silently
  // blocks every event.
  //
  // Added to directives that already exist — naming a new one (e.g.
  // scriptSrc) would cancel the default-src fallback everything else relies
  // on.
  // Exactly the sources the provider documents, nothing wider:
  //   script-src  bzrcdn.openai.com   (SDK)
  //   connect-src bzr.openai.com      (events via fetch/sendBeacon)
  //   connect-src bzrcdn.openai.com   (pixel config)
  //   img-src     bzr.openai.com      (image-request fallback)
  //
  // Script and image sources go on defaultSrc rather than new scriptSrc /
  // imgSrc directives: this policy has neither, so everything falls back to
  // default-src, and naming one would cancel that fallback for the whole
  // page. The inline bootstrap uses the existing nonce — no unsafe-inline.
  const openAiAdsCsp = {
    defaultSrc: ['https://bzrcdn.openai.com', 'https://bzr.openai.com'],
    connectSrc: ['https://bzrcdn.openai.com', 'https://bzr.openai.com'],
  };

  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    ...mergeCsp(openAiAdsCsp, getWeaverseCsp(request, context)),
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
