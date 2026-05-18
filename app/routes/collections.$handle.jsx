import {Suspense} from 'react';
import {Await, Link, redirect, useLoaderData, useRouteLoaderData} from 'react-router';
import {getPaginationVariables, Analytics, Image, Money} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {useVariantUrl} from '~/lib/variants';

/**
 * NAV_TREE maps parent collection handles → child collection handles.
 * Mirrors the Header so the sidebar shows the same hierarchy.
 */
const NAV_TREE = {
  bandanas: ['paisley-bandanas', 'pet-bandanas'],
  headwear: ['baseball-caps', 'bucket-hats', 'safari-hats', 'ski-hats', 'beanies'],
  pet: ['pet-bandanas'],
};

// Reverse lookup: child handle → parent handle
const PARENT_BY_CHILD = Object.entries(NAV_TREE).reduce((acc, [parent, children]) => {
  for (const c of children) acc[c] = parent;
  return acc;
}, {});

const EDITORIAL = ['new-arrivals', 'best-sellers', 'sale'];

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const title = data?.collection?.title ?? '';
  const description =
    data?.collection?.description ||
    `Shop ${title} at sellanything.us — bandanas, hats, beanies, and more.`;
  return [
    {title: `${title} · sellanything.us`},
    {name: 'description', content: description},
    {property: 'og:title', content: `${title} · sellanything.us`},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Critical: collection meta — needed for the page shell + sidebar
  const criticalData = await loadCriticalData(args);

  // Deferred: products — streamed via <Suspense>/<Await>
  const deferredData = loadDeferredData(args, criticalData.collection);

  return {...criticalData, ...deferredData};
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) throw redirect('/collections');

  const {collection} = await storefront.query(COLLECTION_META_QUERY, {
    variables: {handle},
    cache: storefront.CacheShort(),
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection};
}

function loadDeferredData({context, params, request}, collection) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const {handle} = params;

  // Returned as a promise — React Router defers it, we stream with <Await>
  const productsPromise = storefront
    .query(COLLECTION_PRODUCTS_QUERY, {
      variables: {handle, ...paginationVariables},
    })
    .then(async (result) => {
      const fromCollection = result?.collection?.products;
      const nodes = fromCollection?.nodes ?? [];

      // Fallback: if the smart collection rule didn't match anything,
      // try searching by tag (the title of the collection) so the UI
      // is resilient to admin-side rule drift.
      if (nodes.length === 0 && collection?.title) {
        try {
          const tagQuery = `tag:'${collection.title.replace(/'/g, "\\'")}'`;
          const searchResult = await storefront.query(
            COLLECTION_FALLBACK_SEARCH_QUERY,
            {variables: {query: tagQuery, first: 24}},
          );
          const searchNodes = searchResult?.search?.nodes ?? [];
          if (searchNodes.length > 0) {
            return {
              nodes: searchNodes,
              pageInfo: {hasNextPage: false, hasPreviousPage: false},
              fallback: true,
            };
          }
        } catch (e) {
          console.error('Collection fallback search failed:', e?.message);
        }
      }

      return {
        nodes,
        pageInfo: fromCollection?.pageInfo ?? {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    })
    .catch((e) => {
      console.error('Collection products query failed:', e?.message);
      return {nodes: [], pageInfo: {hasNextPage: false, hasPreviousPage: false}};
    });

  return {products: productsPromise};
}

/* ============================================================ */
/* Component                                                    */
/* ============================================================ */
export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection, products} = useLoaderData();
  const rootData = useRouteLoaderData('root');
  const allCollections = rootData?.collections ?? [];

  return (
    <div className="max-w-[1600px] mx-auto px-9 py-10">
      <Breadcrumb collection={collection} allCollections={allCollections} />

      <header className="mb-8">
        <h1
          className="font-black tracking-tight uppercase m-0 mb-3"
          style={{fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.05}}
        >
          {collection.title}
        </h1>
        {collection.description && (
          <p className="max-w-[640px] text-sm text-muted-foreground m-0">
            {collection.description}
          </p>
        )}
      </header>

      <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-12 md:col-span-3">
          <CollectionSidebar
            current={collection.handle}
            collections={allCollections}
          />
        </aside>

        <section className="col-span-12 md:col-span-9">
          <Suspense fallback={<ProductGridSkeleton />}>
            <Await
              resolve={products}
              errorElement={
                <p className="text-muted-foreground">Couldn’t load products.</p>
              }
            >
              {(productsData) => (
                <ProductGrid
                  nodes={productsData?.nodes ?? []}
                  fallback={productsData?.fallback}
                />
              )}
            </Await>
          </Suspense>
        </section>
      </div>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

/* ============================================================ */
/* Sidebar                                                       */
/* ============================================================ */
function CollectionSidebar({current, collections}) {
  const byHandle = Object.fromEntries(collections.map((c) => [c.handle, c]));
  const parents = Object.keys(NAV_TREE).filter((h) => byHandle[h]);

  // Uniform link style — matches /shop filter panel
  const linkClass = (active) =>
    active ? 'font-semibold' : 'hover:underline';

  return (
    <div className="space-y-6 sticky top-32">
      <section>
        <h3 className="text-xs uppercase tracking-widest mb-3 text-muted-foreground">
          Category
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            <Link to="/shop" className={linkClass(false)}>
              All Products
            </Link>
          </li>
          {parents.map((parentHandle) => {
            const parent = byHandle[parentHandle];
            const children = (NAV_TREE[parentHandle] || []).filter(
              (h) => byHandle[h],
            );
            return (
              <li key={parent.handle}>
                <Link
                  to={`/collections/${parent.handle}`}
                  className={linkClass(current === parent.handle)}
                >
                  {parent.title}
                </Link>
                {children.length > 0 && (
                  <ul className="ml-4 mt-2 space-y-2">
                    {children.map((childHandle) => {
                      const child = byHandle[childHandle];
                      return (
                        <li key={child.handle}>
                          <Link
                            to={`/collections/${child.handle}`}
                            className={linkClass(current === child.handle)}
                          >
                            {child.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {EDITORIAL.some((h) => byHandle[h]) && (
        <section>
          <h3 className="text-xs uppercase tracking-widest mb-3 text-muted-foreground">
            Editorial
          </h3>
          <ul className="space-y-2 text-sm">
            {EDITORIAL.filter((h) => byHandle[h]).map((h) => (
              <li key={h}>
                <Link
                  to={`/collections/${h}`}
                  className={linkClass(current === h)}
                >
                  {byHandle[h].title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="text-xs uppercase tracking-widest mb-3 text-muted-foreground">
          Price
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="text-muted-foreground">Under $25</li>
          <li className="text-muted-foreground">$25 – $50</li>
          <li className="text-muted-foreground">Over $50</li>
        </ul>
      </section>
    </div>
  );
}

function Breadcrumb({collection, allCollections}) {
  const byHandle = Object.fromEntries(allCollections.map((c) => [c.handle, c]));
  const parentHandle = PARENT_BY_CHILD[collection.handle];
  const parent = parentHandle ? byHandle[parentHandle] : null;
  return (
    <nav
      className="text-xs text-muted-foreground mb-6"
      aria-label="Breadcrumb"
    >
      <Link to="/" className="hover:underline">
        Home
      </Link>
      <span className="mx-2">/</span>
      <Link to="/collections" className="hover:underline">
        Collections
      </Link>
      {parent && (
        <>
          <span className="mx-2">/</span>
          <Link
            to={`/collections/${parent.handle}`}
            className="hover:underline"
          >
            {parent.title}
          </Link>
        </>
      )}
      <span className="mx-2">/</span>
      <span className="text-foreground">{collection.title}</span>
    </nav>
  );
}

/* ============================================================ */
/* Grid + skeleton                                              */
/* ============================================================ */
function ProductGrid({nodes, fallback}) {
  if (nodes.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-lg p-10 text-center">
        <p className="text-muted-foreground mb-1">
          No products in this collection yet.
        </p>
        <p className="text-xs text-muted-foreground/80">
          Check that the collection’s product-type / tag rule matches a product
          in Shopify Admin.
        </p>
      </div>
    );
  }
  return (
    <>
      {fallback && (
        <p className="text-xs text-muted-foreground mb-4 italic">
          Showing tag-matched products (smart-collection rule didn’t match).
        </p>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-8">
        {nodes.map((p, i) => (
          <CollectionProductCard
            key={p.id}
            product={p}
            loading={i < 8 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
    </>
  );
}

function CollectionProductCard({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  return (
    <Link to={variantUrl} className="group block" prefetch="intent">
      <div className="bg-secondary aspect-square mb-3 overflow-hidden">
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <h4 className="text-[15px] font-medium m-0">{product.title}</h4>
      <div className="text-sm text-muted-foreground mt-0.5 mb-1">
        {product.productType || product.vendor}
      </div>
      <div className="text-[15px] font-medium">
        {product.priceRange?.minVariantPrice && (
          <Money data={product.priceRange.minVariantPrice} />
        )}
      </div>
    </Link>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-8">
      {Array.from({length: 6}).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-secondary aspect-square mb-3" />
          <div className="h-4 w-3/4 bg-secondary mb-2 rounded" />
          <div className="h-3 w-1/3 bg-secondary mb-1 rounded" />
          <div className="h-4 w-1/4 bg-secondary rounded" />
        </div>
      ))}
    </div>
  );
}

/* ============================================================ */
/* GraphQL                                                       */
/* ============================================================ */
const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    vendor
    productType
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice { ...MoneyProductItem }
      maxVariantPrice { ...MoneyProductItem }
    }
  }
`;

const COLLECTION_META_QUERY = `#graphql
  query CollectionMeta(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { url altText width height }
    }
  }
`;

const COLLECTION_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query CollectionProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes { ...ProductItem }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

// Tag-based fallback when smart-collection rules don't match.
// search() with tag:'CollectionTitle' picks up products tagged correctly
// even if their productType doesn't exactly match the smart rule.
const COLLECTION_FALLBACK_SEARCH_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query CollectionFallbackSearch(
    $query: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    search(query: $query, types: PRODUCT, first: $first) {
      nodes {
        ... on Product { ...ProductItem }
      }
    }
  }
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
