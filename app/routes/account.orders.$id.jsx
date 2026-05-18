import {Link, redirect, useLoaderData} from 'react-router';
import {Money, Image} from '@shopify/hydrogen';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Order ${data?.order?.name} · sellanything`}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors} = await customerAccount.query(CUSTOMER_ORDER_QUERY, {
    variables: {
      orderId,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;
  const lineItems = order.lineItems.nodes;
  const discountApplications = order.discountApplications.nodes;
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  const firstDiscount = discountApplications[0]?.value;
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' ? firstDiscount : null;
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? firstDiscount.percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  /** @type {LoaderReturnData} */
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData();

  const placedDate = new Date(order.processedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground mb-6"
      >
        ← All orders
      </Link>

      {/* Heading */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 block">
            Order details
          </span>
          <h2 className="font-black tracking-tight uppercase text-2xl lg:text-4xl text-foreground m-0">
            Order {order.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Placed {placedDate}
            {order.confirmationNumber && (
              <>
                {' · '}Confirmation {order.confirmationNumber}
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusPill label={fulfillmentStatus} variant="fulfillment" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        {/* ---------------------------------------------------- */}
        {/* Line items                                            */}
        {/* ---------------------------------------------------- */}
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Items
          </h3>
          <ul className="space-y-4">
            {lineItems.map((lineItem, i) => (
              <OrderLineItem key={i} lineItem={lineItem} />
            ))}
          </ul>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Sidebar: summary + address                            */}
        {/* ---------------------------------------------------- */}
        <aside className="space-y-6">
          {/* Summary */}
          <div className="bg-secondary border border-border rounded-lg p-5">
            <h3 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Summary
            </h3>
            <dl className="space-y-2.5 text-sm">
              {(discountValue?.amount || discountPercentage) && (
                <Row label="Discount">
                  {discountPercentage ? (
                    <span>-{discountPercentage}% OFF</span>
                  ) : (
                    discountValue && <Money data={discountValue} />
                  )}
                </Row>
              )}
              <Row label="Subtotal">
                <Money data={order.subtotal} />
              </Row>
              <Row label="Tax">
                <Money data={order.totalTax} />
              </Row>
              <div className="pt-2.5 mt-2.5 border-t border-border">
                <Row label="Total" emphasize>
                  <Money data={order.totalPrice} />
                </Row>
              </div>
            </dl>
          </div>

          {/* Shipping address */}
          <div className="bg-background border border-border rounded-lg p-5">
            <h3 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Shipping address
            </h3>
            {order?.shippingAddress ? (
              <address className="not-italic text-sm text-foreground leading-relaxed">
                <div className="font-semibold">{order.shippingAddress.name}</div>
                {order.shippingAddress.formatted && (
                  <div className="text-muted-foreground whitespace-pre-line">
                    {order.shippingAddress.formatted}
                  </div>
                )}
                {order.shippingAddress.formattedArea && (
                  <div className="text-muted-foreground">
                    {order.shippingAddress.formattedArea}
                  </div>
                )}
              </address>
            ) : (
              <p className="text-sm text-muted-foreground">
                No shipping address defined
              </p>
            )}
          </div>

          {/* CTA */}
          {order.statusPageUrl && (
            <a
              href={order.statusPageUrl}
              target="_blank"
              rel="noreferrer"
              className="block text-center bg-foreground text-background font-bold text-sm uppercase tracking-[0.18em] py-3.5 rounded-md hover:bg-foreground/85 transition"
            >
              Track order →
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({label, children, emphasize = false}) {
  return (
    <div className="flex items-center justify-between">
      <dt
        className={
          emphasize
            ? 'font-bold text-foreground'
            : 'text-muted-foreground text-sm'
        }
      >
        {label}
      </dt>
      <dd className={emphasize ? 'font-bold text-foreground' : 'text-foreground'}>
        {children}
      </dd>
    </div>
  );
}

function StatusPill({label, variant = 'financial'}) {
  if (!label) return null;
  const normalized = String(label).toLowerCase();

  const tone =
    variant === 'fulfillment'
      ? normalized.includes('fulfilled') || normalized.includes('delivered')
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : normalized === 'n/a'
          ? 'bg-secondary text-muted-foreground border-border'
          : 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-secondary text-foreground border-border';

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${tone}`}
    >
      {label}
    </span>
  );
}

/**
 * @param {{lineItem: OrderLineItemFullFragment}}
 */
function OrderLineItem({lineItem}) {
  return (
    <li className="flex gap-4 border border-border rounded-lg p-4 bg-background">
      {lineItem?.image ? (
        <div className="w-20 h-20 flex-shrink-0 bg-secondary rounded-md overflow-hidden">
          <Image
            data={lineItem.image}
            width={160}
            height={160}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-20 h-20 flex-shrink-0 bg-secondary rounded-md" />
      )}

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">
            {lineItem.title}
          </p>
          {lineItem.variantTitle && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {lineItem.variantTitle}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Qty {lineItem.quantity} · <Money data={lineItem.price} as="span" />
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Line total
          </div>
          <div className="font-semibold text-foreground">
            <Money data={lineItem.totalDiscount} />
          </div>
        </div>
      </div>
    </li>
  );
}

/** @typedef {import('./+types/account.orders.$id').Route} Route */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('customer-accountapi.generated').OrderQuery} OrderQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
