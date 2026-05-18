import {useEffect, useRef, useState} from 'react';
import {Link, useLoaderData, useRouteLoaderData} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {ChevronLeft, ChevronRight} from 'lucide-react';

/**
 * Athletic / lifestyle home page — fully Tailwind.
 */

export const meta = () => [
  {title: 'sellanything.us · Move with us'},
  {
    name: 'description',
    content:
      'Athletic gear, lifestyle drops, and seasonal essentials — sellanything.us, a Hydrogen storefront.',
  },
];

export async function loader({context}) {
  const {products} = await context.storefront.query(HOME_PRODUCTS_QUERY, {
    cache: context.storefront.CacheLong(),
  });
  return {products: products.nodes};
}

const HOME_PRODUCTS_QUERY = `#graphql
  query HomeProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 12, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        vendor
        productType
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          id
          url
          altText
          width
          height
        }
      }
    }
  }
`;

export default function Home() {
  const {products} = useLoaderData();
  const rootData = useRouteLoaderData('root');
  const collections = rootData?.collections ?? [];
  return (
    <>
      <Hero />
      <Marquee />
      <Featured />
      <Trending />
      <BuiltForSpeed products={products} />
      <ShopByCategory collections={collections} />
      <Spotlight />
    </>
  );
}

/* ============================================================ */
/* Hero slider                                                   */
/* ============================================================ */
function Hero() {
  const slides = [
    {
      eyebrow: 'Spring · Summer',
      title: 'Spring Drop Pack',
      copy: 'Step into the season — lightweight builds, bold silhouettes, and the icons you keep coming back to.',
      cta: {label: 'Shop the Collection', to: '/shop'},
      image:
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2400&q=80',
    },
    {
      eyebrow: 'Headwear Edit',
      title: 'Heads Up.',
      copy: 'Caps, beanies, bucket hats — small batch, materials that age well.',
      cta: {label: 'Shop Headwear', to: '/shop?type=Headwear'},
      image:
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=2400&q=80',
    },
    {
      eyebrow: 'New Drop',
      title: 'Bandanas, Reissued',
      copy: 'Heritage paisley. Four colorways. 100% combed cotton, double-stitched, breaks in beautifully.',
      cta: {label: 'Shop Bandanas', to: '/products/paisley-bandana'},
      image:
        'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=2400&q=80',
    },
    {
      eyebrow: 'Custom · Made For You',
      title: 'Print Your Own.',
      copy: 'Drop a logo, a slogan, or your last good idea onto any of our blanks. Three-day turnaround.',
      cta: {label: 'Get Started', to: '/pages/custom-printing'},
      image:
        'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=2400&q=80',
    },
  ];

  const [active, setActive] = useState(0);
  const total = slides.length;

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % total), 5500);
    return () => clearInterval(id);
  }, [total]);

  return (
    <section
      className="relative bg-black overflow-hidden"
      style={{height: 'clamp(420px, 75vh, 720px)'}}
      aria-label="Hero"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.title}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-transparent after:to-black/40"
          style={{
            backgroundImage: `url('${slide.image}')`,
            opacity: i === active ? 1 : 0,
          }}
          aria-hidden={i !== active}
        />
      ))}

      <div
        className="absolute inset-0 z-[2] flex flex-col justify-end items-center px-9 pb-16 text-white text-center"
        key={active}
      >
        <span className="text-xs uppercase tracking-[0.3em] mb-3 text-white/85">
          {slides[active].eyebrow}
        </span>
        <h1
          className="font-black tracking-tight uppercase m-0 mb-3"
          style={{fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', lineHeight: 1.05}}
        >
          {slides[active].title}
        </h1>
        <p className="max-w-[540px] text-[15px] mb-6 opacity-95">
          {slides[active].copy}
        </p>
        <Link
          to={slides[active].cta.to}
          className="inline-block bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          {slides[active].cta.label}
        </Link>
      </div>

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-[3] flex gap-2" role="tablist">
        {slides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-2 p-0 rounded-full border-0 cursor-pointer transition-all duration-200 ${
              i === active
                ? 'w-[22px] bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/* ============================================================ */
/* Marquee value-props                                           */
/* ============================================================ */
function Marquee() {
  const items = [
    {label: 'Considered', text: 'Made in small batches'},
    {label: 'Natural', text: '100% combed cotton'},
    {label: 'Shipped', text: 'Free over $50, worldwide'},
    {label: 'Returns', text: '30 days, no questions'},
  ];
  return (
    <div className="border-y border-border py-8 bg-secondary">
      <div className="max-w-[1600px] mx-auto px-9 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {items.map((item) => (
          <div key={item.label}>
            <span className="block text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
              {item.label}
            </span>
            <p className="m-0 text-sm">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================ */
/* Featured (2-col)                                              */
/* ============================================================ */
function Featured() {
  const cards = [
    {
      eyebrow: 'The Bandana Edit',
      title: 'Paisley, Reissued',
      ctas: [{label: 'Shop Bandanas', href: '/shop?type=Bandanas'}],
      bg: '/images/featured-paisley.jpg',
      // Bias upward so the model's face stays visible above the title/CTA
      bgPosition: 'center 30%',
    },
    {
      eyebrow: 'Headwear',
      title: 'Top It Off.',
      ctas: [
        {label: 'Shop Caps', href: '/shop?type=Baseball+Caps'},
        {label: 'Shop Hats', href: '/shop?type=Bucket+Hats'},
      ],
      bg: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1400&q=80',
      bgPosition: 'center',
    },
  ];
  return (
    <section className="pt-12 px-9">
      <h2 className="text-xl font-medium mb-6">Featured</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="relative aspect-square overflow-hidden bg-neutral-300"
          >
            <div
              className="absolute inset-0 bg-cover"
              style={{
                backgroundImage: `url('${c.bg}')`,
                backgroundPosition: c.bgPosition,
              }}
            />
            {/* Bottom gradient overlay so the white CTAs stay readable
                regardless of what's in that part of the photo */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
              aria-hidden
            />
            <div className="absolute bottom-8 left-8 z-[2] text-white max-w-[80%]">
              <div className="text-[13px] mb-1">{c.eyebrow}</div>
              <h3
                className="font-medium m-0 mb-4"
                style={{fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)'}}
              >
                {c.title}
              </h3>
              <div className="flex gap-2 flex-wrap">
                {c.ctas.map((cta) => (
                  <Link
                    key={cta.label}
                    to={cta.href}
                    className="bg-white text-black px-4 py-2 rounded-full text-[13px] font-medium hover:bg-neutral-200 transition-colors"
                  >
                    {cta.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ */
/* Trending (3-col)                                              */
/* ============================================================ */
function Trending() {
  const cards = [
    {
      eyebrow: 'Summer Capsule',
      title: 'Safari Season',
      href: '/shop?type=Safari+Hats',
      bg: '/images/safari-hats.jpg',
    },
    {
      eyebrow: 'For The Dog',
      title: 'Pet Bandana Drop',
      href: '/shop?type=Pet',
      bg: '/images/pet-bandana.jpg',
    },
    {
      eyebrow: 'Heritage',
      title: 'Cotton, Done Right',
      href: '/shop?type=Baseball+Caps',
      bg: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=80',
    },
  ];
  const trackRef = useRef(null);

  function scrollBy(dir) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('[data-trending-card]');
    const step = card ? card.offsetWidth + 12 : 320;
    track.scrollBy({left: dir * step, behavior: 'smooth'});
  }

  return (
    <section className="pt-12 px-9">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium m-0">Trending</h2>
        <div className="flex gap-2 items-center">
          <CarouselArrow direction="prev" onClick={() => scrollBy(-1)} />
          <CarouselArrow direction="next" onClick={() => scrollBy(1)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3" ref={trackRef}>
        {cards.map((c) => (
          <div
            key={c.title}
            data-trending-card
            className="relative aspect-[4/5] overflow-hidden bg-neutral-300"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{backgroundImage: `url('${c.bg}')`}}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/45" />
            <div className="absolute bottom-6 left-6 z-[2] text-white">
              <div className="text-xs mb-1">{c.eyebrow}</div>
              <h3 className="text-[22px] font-medium m-0 mb-3">{c.title}</h3>
              <Link
                to={c.href || '/shop'}
                className="inline-block bg-white text-black px-4 py-2 rounded-full text-[13px] font-medium hover:bg-neutral-200 transition-colors"
              >
                Shop
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ */
/* Built for Speed — horizontal product carousel                */
/* ============================================================ */
function BuiltForSpeed({products}) {
  const trackRef = useRef(null);
  if (!products?.length) return null;

  function scrollBy(dir) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('[data-product-card]');
    const step = card ? card.offsetWidth + 12 : 280;
    track.scrollBy({left: dir * step, behavior: 'smooth'});
  }

  return (
    <section className="pt-12 px-9">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium m-0">Built for Speed, Made For You</h2>
        <div className="flex gap-2 items-center">
          <Link to="/shop" className="mr-4 text-[15px] underline underline-offset-4">
            Shop
          </Link>
          <CarouselArrow direction="prev" onClick={() => scrollBy(-1)} />
          <CarouselArrow direction="next" onClick={() => scrollBy(1)} />
        </div>
      </div>
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pl-0 pr-9 pb-4 -mr-9 [&::-webkit-scrollbar]:hidden"
        style={{scrollbarWidth: 'none'}}
      >
        {products.slice(0, 8).map((product) => (
          <Link
            key={product.id}
            data-product-card
            to={`/products/${product.handle}`}
            className="snap-start min-w-0 shrink-0 grow-0"
            style={{flexBasis: 'calc((100% - 2 * 12px) / 3)'}}
          >
            <div className="bg-secondary aspect-square mb-3 overflow-hidden">
              {product.featuredImage && (
                <img
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText || product.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <h4 className="text-[15px] font-medium m-0">{product.title}</h4>
            <div className="text-sm text-muted-foreground mt-0.5 mb-2">
              {product.productType || product.vendor}
            </div>
            <div className="text-[15px] font-medium">
              {product.priceRange?.minVariantPrice && (
                <Money data={product.priceRange.minVariantPrice} />
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CarouselArrow({direction, onClick}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={direction === 'prev' ? 'Previous' : 'Next'}
      onClick={onClick}
      className="w-12 h-12 rounded-full bg-secondary border-0 inline-flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

/* ============================================================ */
/* Shop by Sport (3-col)                                         */
/* ============================================================ */
/**
 * Shop by Category — pulls real Shopify collections.
 * Filters to the "parent" collections only (Bandanas, Headwear, Pet) so we
 * show the high-level grid. Falls back to first 3 collections if none of
 * the expected parents exist yet.
 */
function ShopByCategory({collections = []}) {
  // Use Bandanas / Headwear / Pet as primary tiles when they exist
  const preferredHandles = ['bandanas', 'headwear', 'pet'];
  const byHandle = Object.fromEntries(collections.map((c) => [c.handle, c]));
  const preferred = preferredHandles.map((h) => byHandle[h]).filter(Boolean);

  // Skip auto-generated collections and editorial ones when falling back
  const exclude = new Set([
    'frontpage',
    'new-arrivals',
    'best-sellers',
    'sale',
  ]);
  const fallback = collections.filter((c) => !exclude.has(c.handle)).slice(0, 3);

  const tiles = preferred.length > 0 ? preferred : fallback;
  if (tiles.length === 0) return null;

  // Editorial fallback images for collections without a Shopify image
  const fallbackImages = [
    'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
  ];

  return (
    <section className="pt-12 px-9">
      <h2 className="text-xl font-medium mb-6">Shop by Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tiles.map((collection, i) => {
          const bg = collection.image?.url ?? fallbackImages[i % fallbackImages.length];
          return (
            <Link
              key={collection.handle}
              to={`/collections/${collection.handle}`}
              className="block group"
            >
              <div
                className="aspect-[4/5] mb-3 bg-cover bg-center"
                style={{backgroundImage: `url('${bg}')`}}
              />
              <div className="text-lg font-medium">{collection.title}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================ */
/* Spotlight                                                     */
/* ============================================================ */
function Spotlight() {
  const tiles = [
    {label: 'New Arrivals', emoji: '✨', href: '/shop?sort=newest'},
    {label: 'Paisley Bandanas', emoji: '🎀', href: '/shop?type=Bandanas'},
    {label: 'Pet Bandanas', emoji: '🐕', href: '/shop?type=Pet'},
    {label: 'Baseball Caps', emoji: '🧢', href: '/shop?type=Baseball+Caps'},
    {label: 'Bucket Hats', emoji: '👒', href: '/shop?type=Bucket+Hats'},
    {label: 'Safari Hats', emoji: '🎩', href: '/shop?type=Safari+Hats'},
    {label: 'Gift Cards', emoji: '🎁', href: '/pages/gift-cards'},
    {label: 'Custom Printing', emoji: '🖨️', href: '/pages/custom-printing'},
    {label: 'Best Sellers', emoji: '⭐', href: '/shop?sort=best-selling'},
    {label: 'Sale', emoji: '🏷️', href: '/shop?on=sale'},
  ];
  return (
    <section className="py-24 px-9 text-center">
      <h2
        className="font-black tracking-tight uppercase mb-3 m-0"
        style={{fontSize: 'clamp(3rem, 8vw, 5.5rem)', lineHeight: 1.05}}
      >
        Spotlight
      </h2>
      <p className="text-sm text-muted-foreground mb-12 m-0">
        Heritage construction, considered materials, and a little personality
        for the top of your head.
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-4 gap-y-6 max-w-[900px] mx-auto">
        {tiles.map((t) => (
          <Link
            key={t.label}
            to={t.href || '/shop'}
            className="flex flex-col items-center gap-2 text-xs text-center hover:opacity-80 transition-opacity"
          >
            <div className="w-24 h-24 bg-secondary rounded-xl overflow-hidden flex items-center justify-center text-[28px]">
              {t.emoji}
            </div>
            <span>{t.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
