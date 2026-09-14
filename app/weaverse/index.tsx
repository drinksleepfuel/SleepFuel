import {
  WeaverseHydrogenRoot,
  type WeaverseLoaderData,
} from '@weaverse/hydrogen';
import {components} from './components';

/**
 * Minimal error surface for a section that throws while rendering. Matches the
 * markup of the root `ErrorBoundary` so it inherits the same `.route-error`
 * styling instead of introducing a second error look.
 */
function GenericError({error}: {error?: unknown}) {
  const message = error instanceof Error ? error.message : null;

  return (
    <div className="route-error">
      <h1>Oops</h1>
      {message && (
        <fieldset>
          <pre>{message}</pre>
        </fieldset>
      )}
    </div>
  );
}

export function WeaverseContent() {
  return (
    <WeaverseHydrogenRoot components={components} errorComponent={GenericError} />
  );
}

/**
 * Routes call this after `weaverse.loadPage()` so a handle with no published
 * Weaverse page 404s instead of rendering an empty shell. The design-mode
 * escape hatch keeps brand-new pages editable in Studio before first publish.
 */
export function validateWeaverseData(weaverseData: WeaverseLoaderData) {
  if (
    !weaverseData?.page?.id ||
    (weaverseData?.page?.id?.includes('fallback') &&
      !weaverseData?.configs?.requestInfo?.queries?.isDesignMode)
  ) {
    throw new Response(null, {status: 404});
  }
}
