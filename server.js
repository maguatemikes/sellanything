import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '~/lib/context';

/**
 * Export a fetch handler in module format.
 */
export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} executionContext
   * @return {Promise<Response>}
   */
  async fetch(request, env, executionContext) {
    try {
      const hydrogenContext = await createHydrogenRouterContext(
        request,
        env,
        executionContext,
      );

      /**
       * Create a Hydrogen request handler that internally
       * delegates to React Router for routing and rendering.
       */
      const handleRequest = createRequestHandler({
        build: serverBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => hydrogenContext,
      });

      const response = await handleRequest(request);

      if (hydrogenContext.session.isPending) {
        response.headers.set(
          'Set-Cookie',
          await hydrogenContext.session.commit(),
        );
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        return storefrontRedirect({
          request,
          response,
          storefront: hydrogenContext.storefront,
        });
      }

      return response;
    } catch (error) {
      // Log to function logs (Vercel Edge / Oxygen / Workers all surface this)
      console.error('[server.js fetch error]', error);

      // While debugging deployments, surface the actual error in the response
      // body so we don't need to dig through function logs. Once the storefront
      // is live with real shoppers, swap this back to a generic 500 page.
      //
      // PRODUCTION TODO: gate the verbose response behind a VERCEL_ENV /
      // NODE_ENV check or `?debug=1` query param.
      const message = error?.message || String(error);
      const stack = error?.stack || '(no stack)';
      const url = new URL(request.url);
      const debug =
        url.searchParams.has('debug') ||
        env?.VERCEL_ENV !== 'production' ||
        env?.NODE_ENV !== 'production';

      if (!debug) {
        return new Response('An unexpected error occurred', {status: 500});
      }

      return new Response(
        [
          'Hydrogen server error',
          '=====================',
          '',
          `URL:     ${request.url}`,
          `Message: ${message}`,
          '',
          'Stack:',
          stack,
        ].join('\n'),
        {
          status: 500,
          headers: {'Content-Type': 'text/plain; charset=utf-8'},
        },
      );
    }
  },
};
