import {Suspense, useState, useRef, useEffect} from 'react';
import {Await, Link, NavLink, useAsyncValue, useLocation} from 'react-router';
import {useAnalytics, useOptimisticCart, Image, Money} from '@shopify/hydrogen';
import {ChevronDown, User, ShoppingBag, Menu, Search, X} from 'lucide-react';
import {useAside} from '~/components/Aside';
import {
  SearchFormPredictive,
  SEARCH_ENDPOINT,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

/**
 * Header — utility bar + main nav + promo bar. All Tailwind.
 */
export function Header({isLoggedIn, cart, collections = [], customer}) {
  return (
    <>
      <UtilityBar />
      {/* Header layout:
          Mobile (< md): flex with logo on the left, icons on the right.
                         Nav is hidden, search is collapsed to an icon button
                         that opens the search aside drawer.
          Desktop (≥ md): 3-col grid with logo / main nav / search+icons.
      */}
      <header className="bg-white h-[60px] flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between md:gap-6 px-4 sm:px-6 md:px-9 sticky top-0 z-50">
        <NavLink prefetch="intent" to="/" end className={brandClass}>
          <span
            aria-hidden
            className="inline-block w-4 h-4 bg-foreground rounded-sm rotate-45"
          />
          sellanything.us
        </NavLink>
        <MainNav collections={collections} />
        <div className="flex items-center gap-1 md:gap-3 md:justify-self-end">
          <HeaderSearch />
          <HeaderCtas cart={cart} customer={customer} />
        </div>
      </header>
      <PromoBar />
    </>
  );
}

/**
 * Map of parent → child collection handles. Edit this when adding new
 * collection trees in Shopify.
 *
 * Why hardcoded? The `parent_handle` metafield import didn't expose values
 * to the Storefront API (definitions weren't set up first). This mapping
 * is the practical workaround — collections fetched dynamically, but
 * grouping is defined here.
 *
 * To enable metafield-based hierarchy later: create the
 * `custom.parent_handle` metafield definition with Storefront API access
 * enabled, then replace this map with the metafield read.
 */
const NAV_TREE = {
  bandanas: ['paisley-bandanas', 'pet-bandanas'],
  headwear: ['baseball-caps', 'bucket-hats', 'safari-hats', 'ski-hats', 'beanies'],
  pet: [],
};

const EDITORIAL_HANDLES = ['new-arrivals', 'best-sellers', 'sale'];

// Collections we skip in the Shop nav (auto-created by Shopify or used elsewhere)
const NAV_EXCLUDE = new Set(['frontpage', ...EDITORIAL_HANDLES]);

function HeaderSearch() {
  const [focused, setFocused] = useState(false);

  return (
    <div className="hidden md:block relative w-72">
      <SearchFormPredictive className="block">
        {({fetchResults, goToSearch, inputRef}) => (
          <div className="flex items-center bg-secondary rounded-full h-9 px-3.5 focus-within:bg-neutral-200 transition-colors">
            <Search
              className="h-4 w-4 text-muted-foreground shrink-0"
              aria-hidden
            />
            <input
              ref={inputRef}
              name="q"
              type="search"
              placeholder="Search"
              onChange={fetchResults}
              onFocus={(e) => {
                setFocused(true);
                fetchResults(e);
              }}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  goToSearch();
                }
              }}
              className="flex-1 min-w-0 bg-transparent border-0 outline-none ml-2 text-sm placeholder:text-muted-foreground"
              autoComplete="off"
            />
          </div>
        )}
      </SearchFormPredictive>

      {focused && <HeaderSearchDropdown />}
    </div>
  );
}


function HeaderSearchDropdown() {
  return (
    <div className="absolute top-full right-0 mt-2 w-[420px] bg-background border border-border rounded-md shadow-xl max-h-[70vh] overflow-y-auto z-50">
      <SearchResultsPredictive>
        {({items, total, term, state, closeSearch}) => {
          if (state === 'loading' && term.current) {
            return (
              <div className="p-6 text-sm text-muted-foreground text-center">
                Searching for "{term.current}"…
              </div>
            );
          }

          if (!term.current) {
            return (
              <div className="p-6 text-sm text-muted-foreground text-center">
                Start typing to search the catalog.
              </div>
            );
          }

          if (!total) {
            return (
              <div className="p-6 text-sm text-muted-foreground text-center">
                No results for "{term.current}".
              </div>
            );
          }

          const {products, collections, queries} = items;

          return (
            <div className="p-3">
              {queries?.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                    Suggestions
                  </div>
                  <ul>
                    {queries.slice(0, 4).map((q) => (
                      <li key={q.text}>
                        <Link
                          onClick={closeSearch}
                          to={`${SEARCH_ENDPOINT}?q=${q.text}`}
                          className="block px-3 py-2 text-sm rounded-md hover:bg-secondary"
                        >
                          {q.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {products?.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                    Products
                  </div>
                  <ul className="space-y-0.5">
                    {products.slice(0, 5).map((product) => {
                      const variant = product.selectedOrFirstAvailableVariant;
                      const image = product.featuredImage || variant?.image;
                      return (
                        <li key={product.id}>
                          <Link
                            onClick={closeSearch}
                            to={`/products/${product.handle}`}
                            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary"
                          >
                            <div className="w-11 h-11 shrink-0 bg-secondary rounded overflow-hidden">
                              {image && (
                                <img
                                  src={image.url}
                                  alt={image.altText || product.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {product.title}
                              </div>
                              {product.vendor && (
                                <div className="text-[11px] text-muted-foreground truncate">
                                  {product.vendor}
                                </div>
                              )}
                            </div>
                            {variant?.price && (
                              <div className="text-sm font-medium shrink-0">
                                <Money data={variant.price} />
                              </div>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {collections?.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                    Collections
                  </div>
                  <ul>
                    {collections.slice(0, 3).map((c) => (
                      <li key={c.id}>
                        <Link
                          onClick={closeSearch}
                          to={`/collections/${c.handle}`}
                          className="block px-3 py-2 text-sm rounded-md hover:bg-secondary"
                        >
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                onClick={closeSearch}
                to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                className="block mt-2 px-3 py-2 text-sm text-center font-medium border-t border-border hover:bg-secondary"
              >
                View all results for "{term.current}" →
              </Link>
            </div>
          );
        }}
      </SearchResultsPredictive>
    </div>
  );
}

const brandClass =
  'text-lg sm:text-xl md:text-[22px] font-extrabold tracking-tight lowercase md:justify-self-start inline-flex items-center gap-2 text-foreground hover:opacity-70 whitespace-nowrap';

function UtilityBar() {
  return (
    <div className="hidden md:flex bg-secondary h-9 items-center justify-end px-9 text-[11px] gap-3">
      <a href="#" className="hover:opacity-60">Find a Store</a>
      <span className="text-neutral-300">|</span>
      <a href="#" className="hover:opacity-60">Help</a>
      <span className="text-neutral-300">|</span>
      <a href="/account" className="hover:opacity-60">Join Us</a>
      <span className="text-neutral-300">|</span>
      <a href="/account" className="hover:opacity-60">Sign In</a>
    </div>
  );
}

function PromoBar() {
  return (
    <div className="text-center py-3 px-9 bg-white border-b border-border text-[13px]">
      New Members Enjoy 15% Off On The Shop App. Use code:{' '}
      <strong>APP15</strong>{' '}
      <a href="#" className="font-semibold underline ml-1.5">
        Download The App
      </a>
    </div>
  );
}

const navLink =
  'text-base font-medium text-foreground py-2 cursor-pointer hover:text-muted-foreground whitespace-nowrap';

function MainNav({collections}) {
  return (
    <nav
      className="hidden md:flex items-center gap-8 justify-center"
      role="navigation"
    >
      <NavLink to="/" end className={navLink}>
        Home
      </NavLink>

      <ShopDropdown collections={collections} />
      <SaleDropdown collections={collections} />

      <NavLink to="/blogs/journal" className={navLink}>
        Blog
      </NavLink>
      <NavLink to="/pages/about" className={navLink}>
        About
      </NavLink>
      <NavLink
        to="/pages/custom-printing"
        className={`${navLink} font-semibold`}
      >
        Custom Printing
      </NavLink>
    </nav>
  );
}

/* ============================================================ */
/* Hover Mega Menu                                              */
/* ============================================================ */

/**
 * Generic hover-open mega menu shell.
 * - Opens on mouseenter of trigger OR panel (so moving cursor across the gap
 *   doesn't close it)
 * - Closes on mouseleave with a short delay
 * - Closes on route change
 */
function MegaMenu({label, children}) {
  const [open, setOpen] = useState(false);
  // Top offset of the panel, equals the header's bottom edge. Starts at
  // utility-bar (36px) + header (60px) = 96, drops to 60 once the utility
  // bar has scrolled out of view.
  const [topOffset, setTopOffset] = useState(96);
  const closeTimer = useRef(null);
  const location = useLocation();

  // Close whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  // Track scroll so the panel hugs the (sticky) header bottom edge
  useEffect(() => {
    const UTILITY_BAR_HEIGHT = 36;
    const HEADER_HEIGHT = 60;
    const update = () => {
      const visibleUtility = Math.max(0, UTILITY_BAR_HEIGHT - window.scrollY);
      setTopOffset(visibleUtility + HEADER_HEIGHT);
    };
    update();
    window.addEventListener('scroll', update, {passive: true});
    return () => window.removeEventListener('scroll', update);
  }, []);

  function scheduleClose() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }
  function cancelClose() {
    clearTimeout(closeTimer.current);
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={`${navLink} inline-flex items-center gap-1 outline-none`}
        aria-expanded={open}
        aria-haspopup="true"
        onFocus={() => setOpen(true)}
        onBlur={scheduleClose}
      >
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="fixed left-0 right-0 bg-white border-t border-border shadow-lg z-40"
          style={{top: topOffset}}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="max-w-[1600px] mx-auto px-9 py-10">{children}</div>
        </div>
      )}
    </div>
  );
}

function MegaColumn({title, to, children}) {
  return (
    <div className="min-w-[160px]">
      <div className="mb-4">
        {to ? (
          <NavLink
            to={to}
            className="text-[15px] font-semibold text-foreground hover:text-muted-foreground"
          >
            {title}
          </NavLink>
        ) : (
          <span className="text-[15px] font-semibold text-foreground">
            {title}
          </span>
        )}
      </div>
      <ul className="space-y-3 text-sm">{children}</ul>
    </div>
  );
}

function MegaLink({to, children}) {
  return (
    <li>
      <NavLink
        to={to}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {children}
      </NavLink>
    </li>
  );
}

/**
 * Shop mega menu — Nike-style columns.
 * Featured | <Parent A> | <Parent B> | <Parent C> | More (only if present)
 */
function ShopDropdown({collections = []}) {
  const byHandle = Object.fromEntries(collections.map((c) => [c.handle, c]));
  const knownChildHandles = new Set(Object.values(NAV_TREE).flat());

  function getChildren(parentHandle) {
    return (NAV_TREE[parentHandle] ?? [])
      .map((h) => byHandle[h])
      .filter(Boolean);
  }

  const parents = Object.keys(NAV_TREE)
    .map((handle) => byHandle[handle])
    .filter(Boolean);

  const otherCollections = collections.filter(
    (c) =>
      !NAV_TREE[c.handle] &&
      !knownChildHandles.has(c.handle) &&
      !NAV_EXCLUDE.has(c.handle),
  );

  const editorialAvailable = EDITORIAL_HANDLES.map((h) => byHandle[h]).filter(
    Boolean,
  );

  return (
    <MegaMenu label="Shop">
      <div className="flex flex-wrap gap-x-12 gap-y-6 justify-center">
        <MegaColumn title="Featured">
          <MegaLink to="/shop">All Products</MegaLink>
          {editorialAvailable.map((c) => (
            <MegaLink key={c.handle} to={`/collections/${c.handle}`}>
              {c.title}
            </MegaLink>
          ))}
          <MegaLink to="/pages/custom-printing">Custom Printing</MegaLink>
          <MegaLink to="/pages/gift-cards">Gift Cards</MegaLink>
        </MegaColumn>

        {parents.map((parent) => {
          const children = getChildren(parent.handle);
          return (
            <MegaColumn
              key={parent.handle}
              title={parent.title}
              to={`/collections/${parent.handle}`}
            >
              {children.map((child) => (
                <MegaLink
                  key={child.handle}
                  to={`/collections/${child.handle}`}
                >
                  {child.title}
                </MegaLink>
              ))}
              <MegaLink to={`/collections/${parent.handle}`}>
                <span className="underline underline-offset-2">
                  View all {parent.title}
                </span>
              </MegaLink>
            </MegaColumn>
          );
        })}

        {otherCollections.length > 0 && (
          <MegaColumn title="More">
            {otherCollections.map((c) => (
              <MegaLink key={c.handle} to={`/collections/${c.handle}`}>
                {c.title}
              </MegaLink>
            ))}
          </MegaColumn>
        )}
      </div>
    </MegaMenu>
  );
}

/**
 * Sale mega menu — single editorial column.
 */
function SaleDropdown({collections = []}) {
  const byHandle = Object.fromEntries(collections.map((c) => [c.handle, c]));
  const editorialAvailable = EDITORIAL_HANDLES.map((h) => byHandle[h]).filter(
    Boolean,
  );

  return (
    <MegaMenu label="Sale">
      <div className="flex gap-x-12 gap-y-6 justify-center flex-wrap">
        <MegaColumn title="Featured">
          {editorialAvailable.length > 0 ? (
            editorialAvailable.map((c) => (
              <MegaLink key={c.handle} to={`/collections/${c.handle}`}>
                {c.title}
              </MegaLink>
            ))
          ) : (
            <MegaLink to="/shop?on=sale">All Sale</MegaLink>
          )}
        </MegaColumn>
        <MegaColumn title="Shop">
          <MegaLink to="/shop">All Products</MegaLink>
          <MegaLink to="/shop?sort=newest">New Arrivals</MegaLink>
          <MegaLink to="/shop?sort=best-selling">Best Sellers</MegaLink>
        </MegaColumn>
      </div>
    </MegaMenu>
  );
}

// Icon button base styles. Plain hover background swap, no scale on press.
const iconBtn =
  'w-10 h-10 rounded-full bg-transparent border-0 inline-flex items-center justify-center hover:bg-secondary transition-colors';

function HeaderCtas({cart, customer}) {
  return (
    <div className="flex items-center gap-1 md:justify-self-end">
      <AccountLink customer={customer} />
      <CartToggle cart={cart} />
      {/* Mobile-only menu toggle.
          Search lives INSIDE this drawer (see HeaderMenu below) — keeping
          the mobile header at 3 icons instead of 4. */}
      <MobileMenuToggle />
    </div>
  );
}

/**
 * Account icon — swaps to an initial-letter avatar when the visitor is
 * logged in. The customer prop is a streaming Promise from the root loader
 * (resolves to {firstName} or null). Suspense fallback is the generic
 * User icon so we never block first paint waiting on Customer Account API.
 */
function AccountLink({customer}) {
  return (
    <Suspense fallback={<AccountIconFallback />}>
      <Await resolve={customer} errorElement={<AccountIconFallback />}>
        {(resolved) => <AccountAvatarOrIcon customer={resolved} />}
      </Await>
    </Suspense>
  );
}

function AccountIconFallback() {
  return (
    <NavLink to="/account" className={iconBtn} aria-label="Account">
      <User className="h-5 w-5" />
    </NavLink>
  );
}

function AccountAvatarOrIcon({customer}) {
  const initial = customer?.firstName?.[0] || customer?.lastName?.[0];

  if (!initial) {
    // Not logged in (or no name yet) → generic icon.
    return <AccountIconFallback />;
  }

  const fullName = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <NavLink
      to="/account"
      className={`${iconBtn} relative`}
      aria-label={fullName ? `Account: ${fullName}` : 'Account'}
      title={fullName || 'Account'}
    >
      <span
        aria-hidden
        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-foreground text-background text-xs font-bold uppercase tracking-tight leading-none"
      >
        {initial}
      </span>
    </NavLink>
  );
}

function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBadgeFromAwait />
      </Await>
    </Suspense>
  );
}

function CartBadgeFromAwait() {
  const realCart = useAsyncValue();
  const cart = useOptimisticCart(realCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  // `pulse` fires when the count goes up (item added) — reward feedback.
  // `tap`   fires when the user clicks the bag to open the drawer —
  //          a subtle acknowledgement before the drawer slides in.
  const [pulse, setPulse] = useState(false);
  const [tap, setTap] = useState(false);
  const prevCountRef = useRef(count);

  useEffect(() => {
    if (count > prevCountRef.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 450);
      return () => clearTimeout(t);
    }
    prevCountRef.current = count;
  }, [count]);

  function handleClick(e) {
    e.preventDefault();
    // Trigger the tap animation, then open the drawer.
    setTap(true);
    setTimeout(() => setTap(false), 300);
    open('cart');
    publish('cart_viewed', {
      cart,
      prevCart,
      shop,
      url: typeof window !== 'undefined' ? window.location.href : '',
    });
  }

  return (
    <button
      type="button"
      className={`${iconBtn} relative`}
      aria-label={`Bag (${count})`}
      onClick={handleClick}
    >
      {/* Bag icon — subtle dip-and-rebound on click, bigger wiggle on add. */}
      <ShoppingBag
        className={`h-5 w-5 transition-transform duration-300 ease-out ${
          pulse
            ? 'scale-110 -rotate-6'
            : tap
            ? 'scale-90'
            : 'scale-100 rotate-0'
        }`}
      />
      {count > 0 && (
        <span
          className={`absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white ${
            pulse ? 'animate-cart-pop' : ''
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function MobileMenuToggle() {
  const {open, close, type} = useAside();
  const isOpen = type === 'mobile';

  return (
    <button
      type="button"
      className={`${iconBtn} md:hidden`}
      onClick={() => (isOpen ? close() : open('mobile'))}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      {/* Two icons stacked, cross-fade + rotate between them.
          When closed: Menu (≡) visible, X hidden + rotated.
          When open:   X visible, Menu hidden + rotated.
          The slight rotation gives the morph a tactile feel. */}
      <span className="relative h-5 w-5 inline-block">
        <Menu
          className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${
            isOpen ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'
          }`}
        />
        <X
          className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${
            isOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'
          }`}
        />
      </span>
    </button>
  );
}

/**
 * Mobile menu drawer contents — opened by the hamburger button on mobile.
 * Contains a search bar at the top and the full navigation tree below.
 */
export function HeaderMenu() {
  const {close} = useAside();

  function handleNavClick() {
    close();
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <div className="flex items-center bg-secondary rounded-full h-11 px-4 focus-within:bg-neutral-200 transition-colors">
              <Search
                className="h-4 w-4 text-muted-foreground shrink-0"
                aria-hidden
              />
              <input
                ref={inputRef}
                name="q"
                type="search"
                placeholder="Search bandanas, hats, beanies…"
                onChange={fetchResults}
                onFocus={fetchResults}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    goToSearch();
                    close();
                  }
                }}
                className="flex-1 min-w-0 bg-transparent border-0 outline-none ml-2 text-sm placeholder:text-muted-foreground"
                autoComplete="off"
              />
            </div>
          )}
        </SearchFormPredictive>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col p-2 text-base">
        <MobileNavLink to="/" onNav={handleNavClick}>
          Home
        </MobileNavLink>
        <MobileNavLink to="/shop" onNav={handleNavClick}>
          Shop All
        </MobileNavLink>
        <MobileNavLink to="/collections/bandanas" onNav={handleNavClick}>
          Bandanas
        </MobileNavLink>
        <MobileNavLink to="/collections/headwear" onNav={handleNavClick}>
          Headwear
        </MobileNavLink>
        <MobileNavLink to="/collections/pet" onNav={handleNavClick}>
          Pet Collection
        </MobileNavLink>
        <MobileNavLink to="/shop?on=sale" onNav={handleNavClick}>
          Sale
        </MobileNavLink>
      </nav>

      {/* Secondary nav */}
      <nav className="flex flex-col border-t border-border mt-2 pt-2 pb-2 px-2">
        <MobileNavLink to="/blogs/journal" onNav={handleNavClick} muted>
          Journal
        </MobileNavLink>
        <MobileNavLink to="/pages/about" onNav={handleNavClick} muted>
          About
        </MobileNavLink>
        <MobileNavLink
          to="/pages/custom-printing"
          onNav={handleNavClick}
          muted
        >
          Custom Printing
        </MobileNavLink>
      </nav>

      {/* Footer */}
      <div className="border-t border-border mt-auto p-4 text-xs text-muted-foreground space-y-2">
        <a
          href="tel:8003551131"
          className="block hover:text-foreground"
          onClick={handleNavClick}
        >
          📞 800-355-1131
        </a>
        <a
          href="mailto:info@sellanything.us"
          className="block hover:text-foreground"
          onClick={handleNavClick}
        >
          ✉️ info@sellanything.us
        </a>
        <p className="pt-2">Hainesport, NJ · Since 2000</p>
      </div>
    </div>
  );
}

function MobileNavLink({to, children, onNav, muted}) {
  return (
    <NavLink
      to={to}
      onClick={onNav}
      className={({isActive}) =>
        `px-3 py-3 rounded-md transition-colors ${
          muted ? 'text-sm' : 'text-base font-medium'
        } ${
          isActive
            ? 'bg-secondary text-foreground'
            : 'text-foreground hover:bg-secondary/60'
        }`
      }
    >
      {children}
    </NavLink>
  );
}
