import {useState, useEffect, useMemo, useRef} from 'react';
import {
  Link,
  useLoaderData,
  useFetcher,
  useSearchParams,
} from 'react-router';
import {Money, CartForm} from '@shopify/hydrogen';
import {Button} from '~/components/ui/button';
import {useAside} from '~/components/Aside';

// Re-run the loader whenever URL search params change (variant clicks)
export function shouldRevalidate({currentUrl, nextUrl, defaultShouldRevalidate}) {
  if (currentUrl.search !== nextUrl.search) return true;
  return defaultShouldRevalidate;
}

export const meta = ({data, location}) => {
  const product = data?.product;
  const variant = product?.selectedVariant;

  // Compose a variant-aware title when a specific variant is selected
  const variantSuffix = variant?.title && variant.title !== 'Default Title'
    ? ` — ${variant.title}`
    : '';
  const title = `${product?.title ?? 'Product'}${variantSuffix} · sellanything.us`;
  const description = (
    product?.description?.replace(/\s+/g, ' ').slice(0, 160) ??
    'Quality essentials from sellanything.us.'
  );
  // Prefer the selected variant's image, fall back to featured image
  const image = variant?.image?.url ?? product?.featuredImage?.url;
  // Include URL search params so the canonical/og:url reflects the variant
  const pathWithQuery = `${location?.pathname ?? ''}${location?.search ?? ''}`;
  const url = `https://sellanything.us${pathWithQuery}`;
  // Use variant price if available, else product min price
  const price =
    variant?.price?.amount ?? product?.priceRange?.minVariantPrice?.amount;
  const currency =
    variant?.price?.currencyCode ??
    product?.priceRange?.minVariantPrice?.currencyCode;
  const inStock = variant?.availableForSale ?? product?.availableForSale;

  const tags = [
    {title},
    {name: 'description', content: description},

    // Canonical URL — prevents duplicate-content penalties
    {tagName: 'link', rel: 'canonical', href: url},

    // Open Graph (Facebook, LinkedIn, iMessage, Slack, Discord, etc.)
    {property: 'og:type', content: 'product'},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:url', content: url},
    {property: 'og:site_name', content: 'sellanything.us'},
    image && {property: 'og:image', content: image},
    image && {property: 'og:image:alt', content: product?.title},

    // Open Graph product extension
    price && {property: 'product:price:amount', content: price},
    currency && {property: 'product:price:currency', content: currency},
    inStock !== undefined && {
      property: 'product:availability',
      content: inStock ? 'in stock' : 'out of stock',
    },

    // Twitter
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    image && {name: 'twitter:image', content: image},
  ].filter(Boolean);

  return tags;
};

export async function loader({params, request, context}) {
  // Read URL search params (e.g., ?Color=Brown&Packaging=1+piece)
  const url = new URL(request.url);
  const urlOptions = {};
  for (const [name, value] of url.searchParams.entries()) {
    urlOptions[name] = value;
  }

  const [{product}, {products: related}] = await Promise.all([
    context.storefront.query(PRODUCT_QUERY, {
      variables: {handle: params.handle},
    }),
    context.storefront.query(RELATED_PRODUCTS_QUERY, {
      variables: {first: 4},
    }),
  ]);

  if (!product) {
    throw new Response('Not found', {status: 404});
  }

  // Resolve the selected variant from URL params + defaults
  const allVariants = product.variants?.nodes ?? [];
  const firstAvailable =
    allVariants.find((v) => v.availableForSale) ?? allVariants[0];
  const defaults = {};
  for (const o of firstAvailable?.selectedOptions ?? []) {
    defaults[o.name] = o.value;
  }
  const resolvedOptions = {};
  for (const opt of product.options ?? []) {
    resolvedOptions[opt.name] =
      urlOptions[opt.name] ?? defaults[opt.name] ?? opt.values[0];
  }
  const selectedVariant =
    allVariants.find((v) =>
      v.selectedOptions.every(
        (o) => resolvedOptions[o.name] === o.value,
      ),
    ) ?? firstAvailable ?? null;

  // Attach selectedVariant onto product so meta() and components can read it
  product.selectedVariant = selectedVariant;

  // Normalize images + options to match the shape the component expects
  const imageNodes =
    product.images?.nodes?.map((img) => img.url).filter(Boolean) ?? [];
  const fallbackImages = product.featuredImage?.url
    ? [product.featuredImage.url]
    : [];

  const productNormalized = {
    ...product,
    images: imageNodes.length > 0 ? imageNodes : fallbackImages,
    options: product.options ?? [],
    variants: product.variants?.nodes ?? [],
    materials:
      product.metafields?.find((m) => m?.key === 'materials')?.value ??
      'See product description',
    care:
      product.metafields?.find((m) => m?.key === 'care')?.value ??
      'See product description',
  };

  const relatedFiltered = related.nodes
    .filter((p) => p.handle !== params.handle)
    .slice(0, 3);

  return {product: productNormalized, related: relatedFiltered};
}

const PRODUCT_QUERY = `#graphql
  query Product(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      vendor
      productType
      description
      availableForSale
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      featuredImage { id url altText width height }
      images(first: 250) {
        nodes { id url altText width height }
      }
      options {
        name
        values
      }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          selectedOptions { name value }
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          image { id url altText width height }
        }
      }
      metafields(identifiers: [
        {namespace: "custom", key: "materials"},
        {namespace: "custom", key: "care"}
      ]) {
        key
        value
      }
    }
  }
`;

const RELATED_PRODUCTS_QUERY = `#graphql
  query RelatedProducts($first: Int!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        priceRange { minVariantPrice { amount currencyCode } }
        featuredImage { url altText }
      }
    }
  }
`;

export default function ProductDetail() {
  const {product, related} = useLoaderData();
  const [variantImageUrl, setVariantImageUrl] = useState(null);

  return (
    <div className="max-w-[1400px] mx-auto px-9 py-8">
      <ProductJsonLd product={product} />
      <Breadcrumb product={product} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-start">
        <Gallery
          images={product.images}
          title={product.title}
          variantImageUrl={variantImageUrl}
        />
        <ProductPanel
          product={product}
          onVariantChange={(v) => setVariantImageUrl(v?.image?.url ?? null)}
        />
      </div>
      <Description product={product} />
      <Related items={related} />
    </div>
  );
}

/**
 * Schema.org Product structured data — fuels Google rich snippets
 * (price, availability, ratings if present, image in search results).
 */
function ProductJsonLd({product}) {
  const price = product?.priceRange?.minVariantPrice;
  const offers = (product?.variants ?? []).map((v) => ({
    '@type': 'Offer',
    price: v.price?.amount,
    priceCurrency: v.price?.currencyCode,
    availability: v.availableForSale
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    sku: v.id,
    itemCondition: 'https://schema.org/NewCondition',
  }));

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images ?? (product.featuredImage?.url ? [product.featuredImage.url] : []),
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'sellanything.us',
    },
    sku: product.id,
    category: product.productType || undefined,
    offers:
      offers.length > 0
        ? offers
        : price
        ? [
            {
              '@type': 'Offer',
              price: price.amount,
              priceCurrency: price.currencyCode,
              availability: product.availableForSale
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition',
            },
          ]
        : undefined,
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  );
}

function Breadcrumb({product}) {
  return (
    <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
      <Link to="/" className="hover:underline">Home</Link>
      <span className="mx-2">/</span>
      <Link to="/shop" className="hover:underline">Shop</Link>
      <span className="mx-2">/</span>
      <Link
        to={`/shop?type=${product.productType}`}
        className="hover:underline"
      >
        {product.productType}
      </Link>
      <span className="mx-2">/</span>
      <span className="text-foreground">{product.title}</span>
    </nav>
  );
}

function Gallery({images, title, variantImageUrl}) {
  // Memoize the cleaned image list so this array reference is stable across renders.
  // Without this, the variant-sync useEffect re-fires every render and resets the
  // active thumbnail right after the user clicks it.
  const safeImages = useMemo(
    () => (images || []).filter(Boolean),
    [images],
  );
  const hasImages = safeImages.length > 0;
  const [active, setActive] = useState(0);

  // When the user picks a new variant, jump to that variant's image.
  // Only depends on variantImageUrl now — clicking a thumbnail won't trigger this.
  useEffect(() => {
    if (!variantImageUrl) return;
    const idx = safeImages.indexOf(variantImageUrl);
    if (idx >= 0) setActive(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantImageUrl]);

  return (
    <div className="lg:col-span-7">
      {/* Main image drives the layout height via aspect-square. The thumb
          column is absolutely-positioned so its 100 thumbs don't stretch the
          row — it just scrolls inside the main image's height. */}
      <div className="relative">
        <div className="aspect-square overflow-hidden bg-secondary ml-[92px]">
          {hasImages ? (
            <img
              src={safeImages[active]}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <div
          className="absolute left-0 top-0 bottom-0 w-20 flex flex-col gap-2 overflow-y-auto [&::-webkit-scrollbar]:hidden"
          style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        >
          {safeImages.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`w-20 h-20 shrink-0 overflow-hidden border-2 transition ${
                i === active
                  ? 'border-black'
                  : 'border-transparent hover:border-border'
              } bg-secondary`}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={url}
                alt={`${title} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductPanel({product, onVariantChange}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected options live in the URL so /products/x?Color=Brown is a shareable variant link
  const selected = useMemo(() => {
    // First: any option present in URL params
    const fromUrl = {};
    for (const opt of product.options) {
      const v = searchParams.get(opt.name);
      if (v && opt.values.includes(v)) fromUrl[opt.name] = v;
    }
    // Fill in missing options from the first available variant (or first value)
    const firstAvailable =
      product.variants?.find((v) => v.availableForSale) ??
      product.variants?.[0];
    const fallback = {};
    if (firstAvailable?.selectedOptions?.length) {
      for (const o of firstAvailable.selectedOptions) fallback[o.name] = o.value;
    }
    const result = {};
    for (const opt of product.options) {
      result[opt.name] =
        fromUrl[opt.name] ?? fallback[opt.name] ?? opt.values[0];
    }
    return result;
  }, [product.options, product.variants, searchParams]);

  function setSelected(next) {
    const params = new URLSearchParams(searchParams);
    for (const [name, value] of Object.entries(next)) {
      params.set(name, value);
    }
    setSearchParams(params, {replace: true, preventScrollReset: true});
  }
  const [qty, setQty] = useState(1);
  const {open} = useAside();

  // Match selected options to a variant
  const currentVariant =
    product.variants?.find((variant) =>
      variant.selectedOptions.every(
        (o) => selected[o.name] === o.value,
      ),
    ) ?? null;

  // Notify gallery when the variant changes (for image swap)
  useEffect(() => {
    onVariantChange?.(currentVariant);
  }, [currentVariant, onVariantChange]);

  const displayPrice =
    currentVariant?.price ?? product.priceRange.minVariantPrice;
  const inStock = currentVariant?.availableForSale ?? true;

  // Watch the add-to-cart fetcher: when it completes, open the cart drawer
  const fetcherKey = `add-${product.id}`;
  const fetcher = useFetcher({key: fetcherKey});
  const lastDataRef = useRef(null);
  useEffect(() => {
    if (
      fetcher.state === 'idle' &&
      fetcher.data &&
      fetcher.data !== lastDataRef.current &&
      fetcher.data?.cart?.id
    ) {
      lastDataRef.current = fetcher.data;
      open('cart');
    }
  }, [fetcher.state, fetcher.data, open]);

  return (
    <aside className="lg:col-span-5 lg:pl-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {product.vendor}
      </div>
      <h1 className="text-3xl font-semibold leading-tight">{product.title}</h1>
      <div className="mt-3 text-xl flex items-baseline gap-3">
        <Money data={displayPrice} />
        {currentVariant?.compareAtPrice &&
          Number(currentVariant.compareAtPrice.amount) >
            Number(displayPrice.amount) && (
            <span className="text-sm text-muted-foreground line-through">
              <Money data={currentVariant.compareAtPrice} />
            </span>
          )}
        {!inStock && (
          <span className="text-sm font-medium text-destructive">
            Sold out
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Free shipping over $50 · 30-day returns
      </p>

      <div className="mt-8 space-y-6">
        {product.options.map((opt) => (
          <div key={opt.name}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{opt.name}</span>
              <span className="text-muted-foreground">
                {selected[opt.name]}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {opt.values.map((v) => {
                const isOn = selected[opt.name] === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      setSelected({...selected, [opt.name]: v})
                    }
                    className={`px-4 h-10 border rounded-md text-sm transition ${
                      isOn
                        ? 'border-black bg-black text-white'
                        : 'border-border hover:border-black'
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <div className="text-sm font-medium mb-2">Quantity</div>
          <div className="inline-flex items-center border border-border rounded-md">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="h-10 w-10 hover:bg-secondary"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center select-none">{qty}</span>
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="h-10 w-10 hover:bg-secondary"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <CartForm
            route="/cart"
            fetcherKey={fetcherKey}
            action={CartForm.ACTIONS.LinesAdd}
            inputs={{
              lines: currentVariant
                ? [{merchandiseId: currentVariant.id, quantity: qty}]
                : [],
            }}
          >
            <Button
              type="submit"
              size="lg"
              className="h-12 text-base w-full"
              disabled={
                !inStock ||
                !currentVariant ||
                fetcher.state !== 'idle'
              }
            >
              {!inStock
                ? 'Sold out'
                : fetcher.state === 'submitting'
                ? 'Adding…'
                : fetcher.state === 'loading'
                ? 'Added ✓'
                : 'Add to bag'}
            </Button>
          </CartForm>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 text-base"
          >
            ♡ Save for later
          </Button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
        <div>
          <div className="font-medium text-foreground mb-1">Shipping</div>
          Free over $50, otherwise $5 flat.
        </div>
        <div>
          <div className="font-medium text-foreground mb-1">Returns</div>
          30 days, no questions asked.
        </div>
      </div>
    </aside>
  );
}

function Description({product}) {
  return (
    <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-border pt-10">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-3">
          Description
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      </div>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-3">
          Materials
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {product.materials}
        </p>
      </div>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-3">
          Care
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {product.care}
        </p>
      </div>
    </section>
  );
}

function Related({items}) {
  if (!items.length) return null;
  return (
    <section className="mt-16">
      <h2 className="text-xl font-semibold mb-6">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {items.map((p) => (
          <Link key={p.id} to={`/products/${p.handle}`} className="group block">
            <div className="aspect-square bg-secondary overflow-hidden mb-3">
              {p.featuredImage?.url && (
                <img
                  src={p.featuredImage.url}
                  alt={p.featuredImage.altText || p.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <div className="text-sm font-medium">{p.title}</div>
            <div className="text-sm mt-1">
              {p.priceRange?.minVariantPrice && (
                <Money data={p.priceRange.minVariantPrice} />
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ErrorBoundary() {
  return (
    <div className="max-w-2xl mx-auto px-9 py-20">
      <h1 className="text-2xl font-semibold mb-2">Product not found</h1>
      <p className="text-muted-foreground mb-6">
        We couldn't find that product. Try one of the others.
      </p>
      <Link to="/shop" className="underline">
        Back to shop →
      </Link>
    </div>
  );
}
