import type {HydrogenComponent} from '@weaverse/hydrogen';

/**
 * Every section that should be available in the Weaverse Studio picker.
 *
 * Sections MUST be registered with a namespace import (`import * as X`) so
 * Weaverse can read both the default export and the named `schema`/`loader`
 * exports off the module.
 *
 * Populated during Phase B, as sections are extracted out of
 * `app/routes/products.$handle.tsx`.
 */
export const components: HydrogenComponent[] = [];
