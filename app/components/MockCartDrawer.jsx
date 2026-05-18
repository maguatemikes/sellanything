import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {Trash2, Minus, Plus} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {useMockCart} from '~/lib/mock-cart';
import {useAside} from '~/components/Aside';

export function MockCartDrawer() {
  const {lines, totalQuantity, subtotal, updateQty, removeItem, clear} =
    useMockCart();
  const {close} = useAside();

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
            <li key={line._key} className="flex gap-3 py-4">
              <Link
                to={`/products/${line.handle}`}
                onClick={close}
                className="block flex-shrink-0"
              >
                <div className="w-20 h-20 bg-secondary overflow-hidden">
                  {line.image && (
                    <img
                      src={line.image}
                      alt={line.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <Link
                    to={`/products/${line.handle}`}
                    onClick={close}
                    className="font-medium text-sm hover:underline truncate"
                  >
                    {line.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(line._key)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {line.selectedOptions && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {Object.entries(line.selectedOptions)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div className="inline-flex items-center border border-border rounded-md">
                    <button
                      type="button"
                      onClick={() =>
                        updateQty(line._key, Math.max(0, line.quantity - 1))
                      }
                      className="h-7 w-7 inline-flex items-center justify-center hover:bg-secondary"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm select-none">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(line._key, line.quantity + 1)}
                      className="h-7 w-7 inline-flex items-center justify-center hover:bg-secondary"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="text-sm font-medium">
                    <Money
                      data={{
                        amount: (
                          line.quantity * Number(line.price.amount)
                        ).toFixed(2),
                        currencyCode: line.price.currencyCode,
                      }}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border px-4 py-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">
            <Money data={subtotal} />
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Shipping and taxes calculated at checkout.
        </p>
        <Button className="w-full h-11" size="lg">
          Checkout · <Money data={subtotal} />
        </Button>
        <div className="flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={clear}
            className="text-muted-foreground hover:underline"
          >
            Clear bag
          </button>
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
