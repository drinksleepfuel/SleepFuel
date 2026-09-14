/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    /** Weaverse Studio project id. Required for `context.weaverse` to resolve. */
    WEAVERSE_PROJECT_ID: string;
    /** Optional: Weaverse MCP account tools / Admin API proxy. */
    WEAVERSE_API_KEY: string;
    /** Optional: overrides the Studio host, mainly for local Weaverse dev. */
    WEAVERSE_HOST: string;
  }
}

export {};
