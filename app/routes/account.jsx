import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

/**
 * Account layout — sidebar nav + outlet for child routes.
 *
 * Renders for /account/* once a Customer Account API session exists.
 * Unauthenticated visitors are bounced to /account/login by the
 * account.$.jsx catch-all + customerAccount.handleAuthStatus() calls
 * in each child loader.
 */
export function shouldRevalidate() {
  return true;
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();

  const heading = customer?.firstName
    ? `Welcome back, ${customer.firstName}`
    : 'Welcome to your account';

  return (
    <section className="bg-background">
      {/* ------------------------------------------------------ */}
      {/* Header band                                            */}
      {/* ------------------------------------------------------ */}
      <div className="border-b border-border bg-secondary">
        <div className="max-w-[1600px] mx-auto px-9 py-12 lg:py-16">
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3 block">
            Account
          </span>
          <h1
            className="font-black tracking-tight uppercase m-0 text-foreground"
            style={{fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1}}
          >
            {heading}
          </h1>
        </div>
      </div>

      {/* ------------------------------------------------------ */}
      {/* Body: sidebar nav + outlet                             */}
      {/* ------------------------------------------------------ */}
      <div className="max-w-[1600px] mx-auto px-9 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-14">
        <AccountMenu />
        <main className="min-w-0">
          <Outlet context={{customer}} />
        </main>
      </div>
    </section>
  );
}

function AccountMenu() {
  const linkClass = ({isActive}) =>
    [
      'block px-5 py-3.5 text-sm uppercase tracking-[0.15em] font-semibold transition border-l-2',
      isActive
        ? 'border-foreground text-foreground bg-background'
        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-background/60',
    ].join(' ');

  return (
    <aside>
      <nav
        role="navigation"
        aria-label="Account"
        className="bg-secondary border border-border rounded-lg overflow-hidden sticky top-24"
      >
        <NavLink to="/account/orders" className={linkClass} prefetch="intent">
          Orders
        </NavLink>
        <NavLink to="/account/profile" className={linkClass} prefetch="intent">
          Profile
        </NavLink>
        <NavLink
          to="/account/addresses"
          className={linkClass}
          prefetch="intent"
        >
          Addresses
        </NavLink>
        <div className="border-t border-border">
          <Form method="POST" action="/account/logout">
            <button
              type="submit"
              className="block w-full text-left px-5 py-3.5 text-sm uppercase tracking-[0.15em] font-semibold text-muted-foreground hover:text-destructive hover:bg-background/60 transition"
            >
              Sign out
            </button>
          </Form>
        </div>
      </nav>
    </aside>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
