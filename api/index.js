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
 */
import handler from '../dist/server/index.js';

export const config = {
  runtime: 'edge',
  // regions: ['iad1', 'sfo1', 'hnd1'],
};

// Env vars the Hydrogen build expects. If any are missing, throw a clear
// diagnostic before handing off to the handler — otherwise the user sees
// "An unexpected error occurred" with no actionable info.
const REQUIRED_ENV_VARS = [
  'SESSION_SECRET',
  'PUBLIC_STORE_DOMAIN',
  'PUBLIC_STOREFRONT_API_TOKEN',
];

const OPTIONAL_ENV_VARS = [
  'PUBLIC_STOREFRONT_ID',
  'PUBLIC_CHECKOUT_DOMAIN',
  'PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID',
  'PUBLIC_CUSTOMER_ACCOUNT_API_URL',
  'PRIVATE_RESEND_API_KEY',
];

/** @param {Request} request */
export default async function handleRequest(request) {
  // Pull env from process.env (Vercel Edge injects them there).
  const env = {};
  for (const key of [...REQUIRED_ENV_VARS, ...OPTIONAL_ENV_VARS]) {
    env[key] = process.env[key];
  }

  // Diagnose missing required vars BEFORE we get a vague Hydrogen error.
  const missing = REQUIRED_ENV_VARS.filter((k) => !env[k]);
  if (missing.length > 0) {
    return new Response(
      [
        '⚠️  Missing required environment variables on Vercel:',
        '',
        ...missing.map((k) => `  - ${k}`),
        '',
        'Fix this in:',
        '  Vercel dashboard → Project → Settings → Environment Variables',
        '',
        'Apply to: Production, Preview, AND Development checkboxes.',
        'Then redeploy.',
        '',
        '(See .env.example in the repo for the full list + sources.)',
      ].join('\n'),
      {
        status: 500,
        headers: {'Content-Type': 'text/plain; charset=utf-8'},
      },
    );
  }

  const executionContext = {
    waitUntil: (promise) => Promise.resolve(promise),
    passThroughOnException: () => {},
  };

  try {
    return await handler.fetch(request, env, executionContext);
  } catch (error) {
    // Log the real error to Vercel function logs so it's debuggable.
    console.error('[Hydrogen handler error]', {
      message: error?.message,
      stack: error?.stack,
      url: request.url,
    });

    // Surface the actual error message + stack in the HTTP response so
    // it's visible without diving into Vercel function logs. Once the
    // store is live with real customers, swap this back to a generic
    // 500 page (see PRODUCTION TODO below).
    //
    // PRODUCTION TODO: re-gate behind VERCEL_ENV !== 'production' OR
    // require a `?debug=1` query param before showing stack traces.
    const url = new URL(request.url);
    const debug =
      url.searchParams.has('debug') ||
      process.env.VERCEL_ENV !== 'production';

    if (!debug) {
      return new Response('An unexpected error occurred', {status: 500});
    }

    return new Response(
      [
        'Hydrogen runtime error',
        '======================',
        '',
        `URL:     ${request.url}`,
        `Vercel:  ${process.env.VERCEL_ENV || 'unknown'}`,
        '',
        `Message: ${error?.message || error}`,
        '',
        'Stack:',
        error?.stack || '(no stack)',
        '',
        '---',
        'This page is unstyled because the SSR pipeline failed. Check',
        '/api/index function logs in the Vercel dashboard for more context.',
      ].join('\n'),
      {
        status: 500,
        headers: {'Content-Type': 'text/plain; charset=utf-8'},
      },
    );
  }
}
