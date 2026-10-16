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
    /**
     * ChatGPT Ads Conversions API key (starts with sk-svc-), from OpenAI Ads
     * Manager. Used by app/routes/webhooks.orders-create.ts.
     */
    OPENAI_ADS_CAPI_KEY: string;
    /** Signing secret for Shopify's orders/create webhook. */
    SHOPIFY_WEBHOOK_SECRET: string;
  }
}

export {};
