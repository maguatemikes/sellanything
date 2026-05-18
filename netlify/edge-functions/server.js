/**
 * Netlify Edge Function — thin shim around the Hydrogen server bundle.
 *
 * Netlify Edge Functions run on Deno Deploy infrastructure. The runtime
 * exposes Web Standard APIs (fetch, Request, Response, caches, crypto),
 * which lets Hydrogen's Workers-style fetch handler run unchanged.
 *
 * Architecture:
 *   - `npm run build` writes `dist/server/index.js` (Hydrogen SSR bundle)
 *   - This file imports that bundle and re-exports its fetch handler
 *   - Static assets (in dist/client) are served by Netlify's CDN, bypassing
 *     this function (see `excludedPath` in the config below)
 *
 * This file is invisible to Oxygen — Oxygen deploys via
 * `shopify hydrogen deploy` which uses dist/server/index.js directly and
 * never touches netlify/.
 */
import handler from '../../dist/server/index.js';

/* -------------------------------------------------------------------------- */
/* caches polyfill                                                            */
/* -------------------------------------------------------------------------- */
// Hydrogen's context.js calls `caches.open('hydrogen')`. Most Edge runtimes
// expose `caches` as a Web Standard global. Deno Deploy does too — but in
// case a future runtime change drops it, fall back to an in-memory Map so
// the storefront keeps working (no persistent caching, but no crash).
if (typeof globalThis.caches === 'undefined') {
  const _store = new Map();
  globalThis.caches = {
    open: async () => ({
      match: async (req) => _store.get(req.url || String(req)) ?? undefined,
      put: async (req, res) => {
        _store.set(req.url || String(req), res.clone());
      },
      delete: async (req) => _store.delete(req.url || String(req)),
    }),
  };
}

/* -------------------------------------------------------------------------- */
/* Env var passthrough                                                        */
/* -------------------------------------------------------------------------- */
const REQUIRED = [
  'SESSION_SECRET',
  'PUBLIC_STORE_DOMAIN',
  'PUBLIC_STOREFRONT_API_TOKEN',
];

const OPTIONAL = [
  'PUBLIC_STOREFRONT_ID',
  'PUBLIC_CHECKOUT_DOMAIN',
  'PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID',
  'PUBLIC_CUSTOMER_ACCOUNT_API_URL',
  'PRIVATE_RESEND_API_KEY',
];

// Pull env from Netlify's per-request env API. (`process.env` doesn't exist
// in Deno; `Deno.env` does but Netlify's recommended API is Netlify.env.)
function getEnv() {
  const get = (k) => {
    if (typeof Netlify !== 'undefined' && Netlify.env?.get) {
      return Netlify.env.get(k);
    }
    if (typeof Deno !== 'undefined' && Deno.env?.get) {
      return Deno.env.get(k);
    }
    return undefined;
  };
  const env = {};
  for (const key of [...REQUIRED, ...OPTIONAL]) {
    env[key] = get(key);
  }
  return env;
}

/* -------------------------------------------------------------------------- */
/* Handler                                                                    */
/* -------------------------------------------------------------------------- */
/**
 * @param {Request} request
 * @param {import('@netlify/edge-functions').Context} context
 */
export default async function (request, context) {
  const env = getEnv();

  // Pre-flight: surface missing env vars as a clear diagnostic page instead
  // of letting Hydrogen throw a generic "An unexpected error occurred".
  const missing = REQUIRED.filter((k) => !env[k]);
  if (missing.length > 0) {
    return new Response(
      [
        '⚠️  Missing required environment variables on Netlify:',
        '',
        ...missing.map((k) => `  - ${k}`),
        '',
        'Fix this in:',
        '  Netlify dashboard → Site configuration → Environment variables',
        '',
        'Apply scope: Same value for all deploy contexts',
        '  (or set per-context if you want different values for production vs preview)',
        '',
        'After saving, trigger a redeploy (or push a new commit).',
        '',
        '(See .env.example in the repo for the full list + sources.)',
      ].join('\n'),
      {
        status: 500,
        headers: {'Content-Type': 'text/plain; charset=utf-8'},
      },
    );
  }

  // Hydrogen expects an ExecutionContext shape (waitUntil, passThroughOnException).
  // Netlify's `context` has its own shape; map what we can.
  const executionContext = {
    waitUntil:
      typeof context?.waitUntil === 'function'
        ? context.waitUntil.bind(context)
        : (promise) => Promise.resolve(promise),
    passThroughOnException: () => {},
  };

  try {
    return await handler.fetch(request, env, executionContext);
  } catch (error) {
    console.error('[Hydrogen handler error]', {
      message: error?.message,
      stack: error?.stack,
      url: request.url,
    });

    // While debugging deploys, surface the actual error in the response so
    // we don't need to dig through Netlify function logs.
    // PRODUCTION TODO: gate behind a context.deploy.context check once live.
    return new Response(
      [
        'Hydrogen runtime error',
        '======================',
        '',
        `URL:     ${request.url}`,
        `Message: ${error?.message || error}`,
        '',
        'Stack:',
        error?.stack || '(no stack)',
      ].join('\n'),
      {
        status: 500,
        headers: {'Content-Type': 'text/plain; charset=utf-8'},
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Routing config                                                             */
/* -------------------------------------------------------------------------- */
export const config = {
  // Match every request EXCEPT static assets handled by Netlify's CDN
  path: '/*',
  excludedPath: [
    '/assets/*',
    '/images/*',
    '/favicon.ico',
    '/favicon.svg',
    '/robots.txt',
    '/sitemap.xml',
  ],
};
