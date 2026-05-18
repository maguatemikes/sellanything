import {Link, useLoaderData} from 'react-router';
import {Money} from '@shopify/hydrogen';

export const meta = () => [
  {title: 'Shop · sellanything.us'},
  {
    name: 'description',
    content: 'Bandanas, caps, beanies, and bucket hats — the full headwear edit.',
  },
];

// products() uses ProductSortKeys: TITLE, CREATED_AT, UPDATED_AT, BEST_SELLING, PRICE, RELEVANCE, etc.
const PRODUCTS_SORT = {
  newest: {sortKey: 'CREATED_AT', reverse: true},
  'best-selling': {sortKey: 'BEST_SELLING', reverse: false},
  'price-asc': {sortKey: 'PRICE', reverse: false},
  'price-desc': {sortKey: 'PRICE', reverse: true},
};

// search() uses SearchSortKeys: RELEVANCE, PRICE
const SEARCH_SORT = {
  newest: {sortKey: 'RELEVANCE', reverse: false},
  'best-selling': {sortKey: 'RELEVANCE', reverse: false},
  'price-asc': {sortKey: 'PRICE', reverse: false},
  'price-desc': {sortKey: 'PRICE', reverse: true},
};

export async function loader({request, context}) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const sort = url.searchParams.get('sort');
  const onSale = url.searchParams.get('on');

  const filters = [];
  if (type) filters.push({productType: type});
  if (onSale) filters.push({tag: 'sale'});

  let products;
  try {
    if (filters.length > 0) {
      const sortConfig = SEARCH_SORT[sort] || {sortKey: 'RELEVANCE', reverse: false};
      const result = await context.storefront.query(SHOP_FILTERED_QUERY, {
        variables: {first: 24, filters, ...sortConfig},
      });
      products = result.search?.nodes ?? [];
    } else {
      const sortConfig = PRODUCTS_SORT[sort] || {sortKey: 'BEST_SELLING', reverse: false};
      const result = await context.storefront.query(SHOP_QUERY, {
        variables: {first: 24, ...sortConfig},
      });
      products = result.products?.nodes ?? [];
    }
  } catch (e) {
    console.error('Shop query failed:', e);
    products = [];
  }

  return {products, filters: {type, sort, onSale}};
}

const PRODUCT_TILE_FRAGMENT = `#graphql
  fragment ProductTile on Product {
    id
    title
    handle
    vendor
    productType
    priceRange {
      minVariantPrice { amount currencyCode }
    }
    featuredImage { id url altText width height }
  }
`;

const SHOP_QUERY = `#graphql
  ${PRODUCT_TILE_FRAGMENT}
  query Shop($country: CountryCode, $language: LanguageCode, $first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean)
    @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse) {
      nodes { ...ProductTile }
    }
  }
`;

const SHOP_FILTERED_QUERY = `#graphql
  ${PRODUCT_TILE_FRAGMENT}
  query ShopFiltered($country: CountryCode, $language: LanguageCode, $first: Int!, $filters: [ProductFilter!], $sortKey: SearchSortKeys, $reverse: Boolean)
    @inContext(country: $country, language: $language) {
    search(query: "*", types: PRODUCT, productFilters: $filters, first: $first, sortKey: $sortKey, reverse: $reverse) {
      nodes { ... on Product { ...ProductTile } }
    }
  }
`;

export default function Shop() {
  const {products, filters} = useLoaderData();
  return (
    <div className="max-w-[1600px] mx-auto px-9 py-10">
      <header className="mb-8">
        <nav className="text-xs text-muted-foreground mb-3" aria-label="Breadcrumb">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Shop</span>
          {filters.type && (
            <>
              <span className="mx-2">/</span>
              <span className="text-foreground">{filters.type}</span>
            </>
          )}
        </nav>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold">
              {filters.type ? filters.type : 'All Products'}
              {filters.onSale ? ' · Sale' : ''}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <SortBar current={filters.sort} />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-12 md:col-span-3">
          <FilterPanel current={filters} />
        </aside>

        <section className="col-span-12 md:col-span-9">
          {products.length === 0 ? (
            <p className="text-muted-foreground">No products match those filters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {products.map((p) => (
                <ProductTile key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterPanel({current}) {
  const types = [
    'Bandanas',
    'Pet',
    'Baseball Caps',
    'Bucket Hats',
    'Safari Hats',
  ];
  return (
    <div className="space-y-6 sticky top-32">
      <section>
        <h3 className="text-xs uppercase tracking-widest mb-3 text-muted-foreground">
          Category
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              to="/shop"
              className={!current.type ? 'font-semibold' : 'hover:underline'}
            >
              All
            </Link>
          </li>
          {types.map((t) => (
            <li key={t}>
              <Link
                to={`/shop?type=${t}`}
                className={
                  current.type === t ? 'font-semibold' : 'hover:underline'
                }
              >
                {t}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xs uppercase tracking-widest mb-3 text-muted-foreground">
          Offers
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              to="/shop?on=sale"
              className={
                current.onSale === 'sale' ? 'font-semibold' : 'hover:underline'
              }
            >
              On Sale
            </Link>
          </li>
          <li>
            <Link
              to="/shop?on=clearance"
              className={
                current.onSale === 'clearance'
                  ? 'font-semibold'
                  : 'hover:underline'
              }
            >
              Clearance
            </Link>
          </li>
        </ul>
      </section>

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

function SortBar({current}) {
  const options = [
    {value: '', label: 'Featured'},
    {value: 'newest', label: 'Newest'},
    {value: 'best-selling', label: 'Best Selling'},
    {value: 'price-asc', label: 'Price · Low to High'},
    {value: 'price-desc', label: 'Price · High to Low'},
  ];
  return (
    <form method="get" className="flex items-center gap-2 text-sm">
      <label htmlFor="sort" className="text-muted-foreground">
        Sort by:
      </label>
      <select
        id="sort"
        name="sort"
        defaultValue={current || ''}
        onChange={(e) => e.currentTarget.form.submit()}
        className="border border-border rounded-md px-3 py-1.5 bg-background"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}

function ProductTile({product}) {
  const image = product.featuredImage;
  return (
    <Link to={`/products/${product.handle}`} className="group block">
      <div className="aspect-square bg-secondary overflow-hidden mb-3">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || product.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
        {product.productType}
      </div>
      <div className="text-base font-medium">{product.title}</div>
      <div className="text-sm mt-1">
        <Money data={product.priceRange.minVariantPrice} />
      </div>
    </Link>
  );
}
