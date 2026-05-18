import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Orders · sellanything'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const {customer, filters} = useLoaderData();
  const {orders} = customer;

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 block">
          Your purchases
        </span>
        <h2 className="font-black tracking-tight uppercase text-2xl lg:text-3xl text-foreground m-0">
          Orders
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Track shipments, view receipts, and reorder past purchases.
        </p>
      </div>

      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

/**
 * @param {{
 *   orders: CustomerOrdersFragment['orders'];
 *   filters: OrderFilterParams;
 * }}
 */
function OrdersTable({orders, filters}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div aria-live="polite" className="mt-8">
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

/**
 * @param {{hasFilters?: boolean}}
 */
function EmptyOrders({hasFilters = false}) {
  return (
    <div className="border border-dashed border-border rounded-lg p-12 text-center bg-secondary/50">
      {hasFilters ? (
        <>
          <p className="text-foreground font-medium mb-4">
            No orders found matching your search.
          </p>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground hover:underline"
          >
            Clear filters →
          </Link>
        </>
      ) : (
        <>
          <p className="text-foreground font-medium mb-2">
            You haven&apos;t placed any orders yet.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            When you do, they&apos;ll show up here.
          </p>
          <Link
            to="/collections"
            className="inline-flex items-center justify-center bg-foreground text-background font-bold text-sm uppercase tracking-[0.18em] px-6 py-3 rounded-md hover:bg-foreground/85 transition"
          >
            Start shopping
          </Link>
        </>
      )}
    </div>
  );
}

/**
 * @param {{
 *   currentFilters: OrderFilterParams;
 * }}
 */
function OrderSearchForm({currentFilters}) {
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      aria-label="Search orders"
      className="bg-secondary border border-border rounded-lg p-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
        <input
          type="search"
          name={ORDER_FILTER_FIELDS.NAME}
          placeholder="Order # (e.g. 1042)"
          aria-label="Order number"
          defaultValue={currentFilters.name || ''}
          className="h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30 focus:border-foreground transition"
        />
        <input
          type="search"
          name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
          placeholder="Confirmation #"
          aria-label="Confirmation number"
          defaultValue={currentFilters.confirmationNumber || ''}
          className="h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30 focus:border-foreground transition"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSearching}
            className="h-11 bg-foreground text-background font-semibold text-xs uppercase tracking-[0.18em] px-5 rounded-md hover:bg-foreground/85 transition disabled:opacity-60"
          >
            {isSearching ? 'Searching…' : 'Search'}
          </button>
          {hasFilters && (
            <button
              type="button"
              disabled={isSearching}
              onClick={() => {
                setSearchParams(new URLSearchParams());
                formRef.current?.reset();
              }}
              className="h-11 border border-border text-foreground font-semibold text-xs uppercase tracking-[0.18em] px-5 rounded-md hover:bg-background transition disabled:opacity-60"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

/**
 * @param {{order: OrderItemFragment}}
 */
function OrderItem({order}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const date = new Date(order.processedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="border border-border bg-background rounded-lg p-5 lg:p-6 mb-3 hover:border-foreground/40 transition">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: order info */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/account/orders/${btoa(order.id)}`}
            className="inline-flex items-baseline gap-3 group"
          >
            <span className="font-black tracking-tight uppercase text-lg text-foreground group-hover:underline">
              #{order.number}
            </span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </Link>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {order.confirmationNumber && (
              <span>Conf: {order.confirmationNumber}</span>
            )}
            <StatusPill label={order.financialStatus} />
            {fulfillmentStatus && (
              <StatusPill label={fulfillmentStatus} variant="fulfillment" />
            )}
          </div>
        </div>

        {/* Right: total + CTA */}
        <div className="flex items-center justify-between sm:justify-end gap-6">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-0.5">
              Total
            </div>
            <div className="font-bold text-foreground">
              <Money data={order.totalPrice} />
            </div>
          </div>
          <Link
            to={`/account/orders/${btoa(order.id)}`}
            className="text-sm font-semibold uppercase tracking-wider text-foreground hover:underline whitespace-nowrap"
          >
            View →
          </Link>
        </div>
      </div>
    </article>
  );
}

function StatusPill({label, variant = 'financial'}) {
  if (!label) return null;
  const normalized = String(label).toLowerCase();

  const tone =
    variant === 'fulfillment'
      ? normalized.includes('fulfilled') || normalized.includes('delivered')
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : 'bg-amber-50 text-amber-800 border-amber-200'
      : normalized === 'paid'
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : normalized === 'pending'
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-secondary text-foreground border-border';

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${tone}`}
    >
      {label}
    </span>
  );
}

/**
 * @typedef {{
 *   customer: CustomerOrdersFragment;
 *   filters: OrderFilterParams;
 * }} OrdersLoaderData
 */

/** @typedef {import('./+types/account.orders._index').Route} Route */
/** @typedef {import('~/lib/orderFilters').OrderFilterParams} OrderFilterParams */
/** @typedef {import('customer-accountapi.generated').CustomerOrdersFragment} CustomerOrdersFragment */
/** @typedef {import('customer-accountapi.generated').OrderItemFragment} OrderItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
