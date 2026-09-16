import type {HydrogenRouterContextProvider} from '@shopify/hydrogen';

type CspDirectives = Record<string, string[] | string | boolean>;

/**
 * The CSP directives Weaverse Studio needs in order to render the storefront
 * inside its editor iframe.
 *
 * This returns *only* the Weaverse additions. Callers are expected to merge it
 * with any directives the storefront declares of its own (see `mergeCsp` in
 * `app/entry.server.tsx`) — returning a complete policy here would silently
 * clobber those hosts.
 */
export function getWeaverseCsp(
  request: Request,
  context: HydrogenRouterContextProvider,
): CspDirectives {
  const url = new URL(request.url);
  // Studio passes `weaverseHost` when it frames us; its presence is what marks
  // the request as design mode.
  const weaverseHost =
    url.searchParams.get('weaverseHost') || context.env.WEAVERSE_HOST;
  const isDesignMode = Boolean(url.searchParams.get('weaverseHost'));

  const weaverseHosts = ['*.weaverse.io', '*.shopify.com', '*.myshopify.com'];
  if (weaverseHost) {
    weaverseHosts.push(weaverseHost);
  }

  // Only widen directives the storefront already declares in
  // `app/entry.server.tsx` (defaultSrc / styleSrc / connectSrc).
  //
  // Naming a directive that did not previously exist is what breaks this
  // storefront: everything currently relies on falling back to `default-src`,
  // which carries the storefront's own hosts. Declaring `scriptSrc` or
  // `imgSrc` here — even with `'self'` — cancels that fallback and silently
  // blocks bundled assets. Weaverse's own hosts resolve fine through
  // `default-src`, so it does not need its own script/img directives.
  const directives: CspDirectives = {
    defaultSrc: [
      "'self'",
      'data:',
      'blob:',
      'cdn.jsdelivr.net',
      ...weaverseHosts,
    ],
    connectSrc: ["'self'", '*.shopifysvc.com', ...weaverseHosts],
    styleSrc: ["'self'", "'unsafe-inline'", ...weaverseHosts],
  };

  // Only let the Studio frame us while actually editing; the published
  // storefront keeps Hydrogen's restrictive default.
  if (isDesignMode) {
    directives.frameAncestors = ['*'];
  }

  return directives;
}

/**
 * Concatenates CSP directive sources key-by-key so no source list is lost when
 * two policies define the same directive. Non-array values (booleans, single
 * strings) are treated as overrides, which is what `frameAncestors: ['*']`
 * relies on.
 */
export function mergeCsp(...policies: CspDirectives[]): CspDirectives {
  const merged: CspDirectives = {};

  for (const policy of policies) {
    for (const [directive, value] of Object.entries(policy)) {
      const existing = merged[directive];
      if (Array.isArray(existing) && Array.isArray(value)) {
        merged[directive] = [...new Set([...existing, ...value])];
      } else {
        merged[directive] = value;
      }
    }
  }

  return merged;
}
