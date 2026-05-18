import {Link} from 'react-router';

/**
 * Account login landing.
 *
 * Two states:
 *  1. No `?go=1` query param → render a styled landing card with
 *     "Sign in" + "Create account" buttons.
 *  2. `?go=1` present → hand off to Shopify's hosted Customer Account
 *     API OAuth login page (`context.customerAccount.login()`).
 *
 * Why the indirection: Shopify's hosted page is the only legal place
 * to render the actual email/password form for Customer Account API.
 * We just give it a branded launchpad first so the user doesn't bounce
 * straight off the site.
 */
export const meta = () => [
  {title: 'Sign in · sellanything'},
  {
    name: 'description',
    content:
      'Sign in or create an account to track orders, save addresses, and check out faster with Shop Pay.',
  },
];

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);

  // Only hit Shopify's OAuth flow when the user clicked through from
  // our landing CTA. Otherwise render the landing page.
  if (url.searchParams.get('go')) {
    const acrValues = url.searchParams.get('acr_values') || undefined;
    const loginHint = url.searchParams.get('login_hint') || undefined;
    const loginHintMode = url.searchParams.get('login_hint_mode') || undefined;
    const locale = url.searchParams.get('locale') || undefined;

    return context.customerAccount.login({
      countryCode: context.storefront.i18n.country,
      acrValues,
      loginHint,
      loginHintMode,
      locale,
    });
  }

  return null;
}

export default function LoginLanding() {
  return (
    <section className="bg-background">
      <div className="max-w-[1600px] mx-auto px-9 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* ------------------------------------------------------ */}
        {/* Editorial copy                                         */}
        {/* ------------------------------------------------------ */}
        <div>
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4 block">
            Your account
          </span>
          <h1
            className="font-black tracking-tight uppercase m-0 mb-6 text-foreground"
            style={{fontSize: 'clamp(2.25rem, 6vw, 4.5rem)', lineHeight: 0.95}}
          >
            Sign in.
            <br />
            Track orders.
            <br />
            Get yours faster.
          </h1>
          <p className="text-[15px] text-muted-foreground max-w-[460px] leading-relaxed mb-10">
            One account works across sellanything.us and Shop Pay. Faster
            checkout, saved addresses, and your full order history — secured by
            Shopify.
          </p>

          <ul className="space-y-3 text-sm text-foreground/90">
            <li className="flex items-start gap-3">
              <Check />
              <span>One-tap checkout with Shop Pay</span>
            </li>
            <li className="flex items-start gap-3">
              <Check />
              <span>Passkey + 2FA support built in</span>
            </li>
            <li className="flex items-start gap-3">
              <Check />
              <span>Order history, tracking, and reorders</span>
            </li>
            <li className="flex items-start gap-3">
              <Check />
              <span>Saved shipping addresses</span>
            </li>
          </ul>
        </div>

        {/* ------------------------------------------------------ */}
        {/* CTA card — kicks off OAuth handoff to Shopify          */}
        {/* ------------------------------------------------------ */}
        <div className="bg-secondary border border-border rounded-2xl p-8 lg:p-12 shadow-sm">
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 block">
            Continue with Shop
          </span>
          <h2 className="font-black tracking-tight uppercase text-2xl lg:text-3xl mb-3 text-foreground">
            Welcome back
          </h2>
          <p className="text-[14px] text-muted-foreground mb-8 leading-relaxed">
            Sign in or create an account — both happen on Shopify&apos;s secure
            login page. You&apos;ll come right back here when you&apos;re done.
          </p>

          <div className="space-y-3">
            <Link
              to="/account/login?go=1"
              prefetch="intent"
              className="block w-full text-center bg-foreground text-background font-bold text-sm uppercase tracking-[0.18em] py-4 rounded-md hover:bg-foreground/85 transition active:scale-[0.99]"
            >
              Sign in
            </Link>
            <Link
              to="/account/login?go=1"
              prefetch="intent"
              className="block w-full text-center border-2 border-foreground text-foreground font-bold text-sm uppercase tracking-[0.18em] py-3.5 rounded-md hover:bg-foreground hover:text-background transition active:scale-[0.99]"
            >
              Create account
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              By continuing, you agree to sellanything.us{' '}
              <Link
                to="/policies/terms-of-service"
                className="underline hover:text-foreground"
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                to="/policies/privacy-policy"
                className="underline hover:text-foreground"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Bottom trust strip */}
      <div className="border-t border-border bg-secondary">
        <div className="max-w-[1600px] mx-auto px-9 py-6 flex flex-wrap items-center justify-center gap-6 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>Secured by Shopify</span>
          <span aria-hidden>·</span>
          <span>SSL Encrypted</span>
          <span aria-hidden>·</span>
          <span>Shop Pay Verified</span>
          <span aria-hidden>·</span>
          <span>GDPR Compliant</span>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg
      className="w-5 h-5 mt-0.5 text-foreground shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** @typedef {import('./+types/account_.login').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
