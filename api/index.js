/**
 * Vercel Edge Function — thin shim around the Hydrogen server bundle.
 *
 * Hydrogen's server.js exports a Workers-style `{fetch}` handler. Vercel's
 * Edge Runtime is also V8 isolates (same model as Workers / Oxygen), so the
 * bundle runs as-is. We just re-export the fetch handler in Vercel's
 * expected signature.
 *
 * This file is invisible to Oxygen — Oxygen deploys via
 * `shopify hydrogen deploy` which uses `dist/server/index.js` directly and
 * never touches /api/.
 *
 * Build order:
 *   1. `npm run build`        (Hydrogen, writes dist/server/index.js + dist/client/*)
 *   2. Vercel bundles this    (imports the SSR build above)
 *   3. Vercel serves dist/client as static + routes /(.*) here
 */
import handler from '../dist/server/index.js';

export const config = {
  runtime: 'edge',
  // Optional: pin regions close to your shoppers for lower latency
  // regions: ['iad1', 'sfo1', 'hnd1'],
};

/** @param {Request} request */
export default async function handleRequest(request) {
  // Vercel injects env vars into process.env on Edge, not into a separate
  // `env` argument like Workers/Oxygen. Pass them through so the Hydrogen
  // bundle sees the same shape it would on Oxygen.
  const env = {
    SESSION_SECRET: process.env.SESSION_SECRET,
    PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN,
    PUBLIC_STOREFRONT_API_TOKEN: process.env.PUBLIC_STOREFRONT_API_TOKEN,
    PUBLIC_STOREFRONT_ID: process.env.PUBLIC_STOREFRONT_ID,
    PUBLIC_CHECKOUT_DOMAIN: process.env.PUBLIC_CHECKOUT_DOMAIN,
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID:
      process.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
    PUBLIC_CUSTOMER_ACCOUNT_API_URL:
      process.env.PUBLIC_CUSTOMER_ACCOUNT_API_URL,
    PRIVATE_RESEND_API_KEY: process.env.PRIVATE_RESEND_API_KEY,
  };

  // Edge Runtime gives us a no-op executionContext shim
  const executionContext = {
    waitUntil: (promise) => Promise.resolve(promise),
    passThroughOnException: () => {},
  };

  return handler.fetch(request, env, executionContext);
}
