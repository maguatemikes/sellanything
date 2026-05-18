import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {CartForm, Money, useOptimisticCart} from '@shopify/hydrogen';
import {Trash2, Minus, Plus} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {useAside} from '~/components/Aside';

/**
 * Cart drawer powered by Hydrogen's real cart.
 * Reads the `cart` Promise from PageLayout, mutates via <CartForm>.
 * Checkout button links to Shopify's real checkout URL.
 */
export function HydrogenCartDrawer({cart}) {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">
          Loading cart…
        </div>
      }
    >
      <Await resolve={cart}>
        {(resolvedCart) => <CartContents cart={resolvedCart} />}
      </Await>
    </Suspense>
  );
}

function CartContents({cart: realCart}) {
  // useOptimisticCart gives us instant UI updates while mutations are in flight
  const cart = useOptimisticCart(realCart);
  const {close} = useAside();

  const lines = cart?.lines?.nodes ?? [];
  const totalQuantity = cart?.totalQuantity ?? 0;
  const subtotal = cart?.cost?.subtotalAmount;
  const checkoutUrl = cart?.checkoutUrl;

  if (totalQuantity === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <p className="text-lg font-medium mb-2">Your bag is empty</p>
          <p className="text-sm text-muted-foreground mb-6">
            Add a few essentials and we'll keep them safe.
          </p>
          <Button onClick={close} asChild>
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <ul className="divide-y divide-border">
          {lines.map((line) => (
            <CartLine key={line.id} line={line} onClose={close} />
          ))}
        </ul>
      </div>

      <div className="border-t border-border px-4 py-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">
            {subtotal && <Money data={subtotal} />}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Shipping and taxes calculated at checkout.
        </p>

        {checkoutUrl ? (
          <Button asChild className="w-full h-11" size="lg">
            <a href={checkoutUrl}>
              Checkout{' '}
              {subtotal && (
                <>
                  · <Money data={subtotal} />
                </>
              )}
            </a>
          </Button>
        ) : (
          <Button disabled className="w-full h-11" size="lg">
            Checkout unavailable
          </Button>
        )}

        <div className="flex justify-end items-center text-xs">
          <button
            type="button"
            onClick={close}
            className="text-muted-foreground hover:underline"
          >
            Continue shopping
          </button>
        </div>
      </div>
    </div>
  );
}

function CartLine({line, onClose}) {
  const {merchandise, quantity, cost} = line;
  const product = merchandise.product;
  const image = merchandise.image;
  const lineTotal = cost?.totalAmount;

  return (
    <li className="flex gap-3 py-4">
      <Link
        to={`/products/${product.handle}`}
        onClick={onClose}
        className="block flex-shrink-0"
      >
        <div className="w-20 h-20 bg-secondary overflow-hidden">
          {image && (
            <img
              src={image.url}
              alt={image.altText || product.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <Link
            to={`/products/${product.handle}`}
            onClick={onClose}
            className="font-medium text-sm hover:underline truncate"
          >
            {product.title}
          </Link>
          <CartLineRemoveButton lineId={line.id} />
        </div>

        {merchandise.selectedOptions?.length > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            {merchandise.selectedOptions
              .map((opt) => `${opt.name}: ${opt.value}`)
              .join(' · ')}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <CartLineQuantity line={line} />
          <div className="text-sm font-medium">
            {lineTotal && <Money data={lineTotal} />}
          </div>
        </div>
      </div>
    </li>
  );
}

function CartLineQuantity({line}) {
  const {id: lineId, quantity} = line;
  const prevQty = Math.max(0, quantity - 1);
  const nextQty = quantity + 1;

  return (
    <div className="inline-flex items-center border border-border rounded-md">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQty}]}>
        <button
          type="submit"
          className="h-7 w-7 inline-flex items-center justify-center hover:bg-secondary disabled:opacity-50"
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus className="h-3 w-3" />
        </button>
      </CartLineUpdateButton>
      <span className="w-8 text-center text-sm select-none">{quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQty}]}>
        <button
          type="submit"
          className="h-7 w-7 inline-flex items-center justify-center hover:bg-secondary"
          aria-label="Increase quantity"
        >
          <Plus className="h-3 w-3" />
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

function CartLineUpdateButton({children, lines}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function CartLineRemoveButton({lineId}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds: [lineId]}}
    >
      <button
        type="submit"
        className="text-muted-foreground hover:text-foreground"
        aria-label="Remove from cart"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </CartForm>
  );
}
