import {Link} from 'react-router';

/**
 * About page for sellanything.us
 *
 * Editorial layout adapted from the WholesaleForEveryone positioning:
 * a 25-year wholesale + custom-printing company in Hainesport, NJ.
 * Keeps the sellanything.us visual identity (Tailwind, bold tracking-tight
 * headlines, dark editorial sections).
 */
export const meta = () => [
  {title: 'About · sellanything.us'},
  {
    name: 'description',
    content:
      'Since 2000, sellanything.us has been the wholesale source for bandanas, hats, and custom-printed headwear. Family-owned, Hainesport NJ, shipping worldwide.',
  },
  {property: 'og:title', content: 'About · sellanything.us'},
  {
    property: 'og:description',
    content:
      'Twenty-five years of bandanas, hats, and custom printing. Wholesale, retail, and on-demand — one warehouse in New Jersey.',
  },
  {property: 'og:type', content: 'website'},
];

export default function About() {
  return (
    <div>
      <Hero />
      <Marquee />
      <Origin />
      <ThreePillars />
      <ByTheNumbers />
      <ProductRange />
      <CustomPrinting />
      <Quote />
      <WhyCustomersReturn />
      <Location />
      <Cta />
    </div>
  );
}

/* ============================================================ */
/* Hero                                                          */
/* ============================================================ */
function Hero() {
  return (
    <section
      className="relative bg-black overflow-hidden"
      style={{height: 'clamp(460px, 75vh, 720px)'}}
      aria-label="About hero"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=2400&q=80')",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />

      <div className="absolute inset-0 z-[2] flex flex-col justify-end items-center px-9 pb-20 text-white text-center">
        <span className="text-xs uppercase tracking-[0.4em] mb-4 text-white/80">
          Since 2000 · Hainesport, NJ
        </span>
        <h1
          className="font-black tracking-tight uppercase m-0 mb-5 max-w-[1100px]"
          style={{fontSize: 'clamp(2.5rem, 7vw, 6rem)', lineHeight: 0.98}}
        >
          25 years of bandanas,<br />hats, and the people<br />who wear them.
        </h1>
        <p className="max-w-[620px] text-[15px] opacity-95 m-0 leading-relaxed">
          Family-owned. Hainesport-headquartered. Shipping bandanas, headwear,
          and custom prints to customers across all 50 states and 40+ countries
          — one warehouse at a time.
        </p>
      </div>
    </section>
  );
}

/* ============================================================ */
/* Marquee strip                                                */
/* ============================================================ */
function Marquee() {
  const items = [
    {label: 'Founded', text: '2000 · NJ'},
    {label: 'Products', text: '500+ SKUs'},
    {label: 'Custom Printing', text: '20+ years'},
    {label: 'Shipped to', text: '40+ countries'},
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
/* Origin story (2-col)                                         */
/* ============================================================ */
function Origin() {
  return (
    <section className="max-w-[1600px] mx-auto px-9 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-32">
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Our Story
          </div>
          <h2
            className="font-black tracking-tight uppercase m-0 mb-0"
            style={{fontSize: 'clamp(2rem, 4vw, 3.75rem)', lineHeight: 1.02}}
          >
            One catalog.<br />Two and a half decades.
          </h2>
        </div>

        <div className="lg:col-span-7 space-y-6 text-[16px] leading-relaxed">
          <p>
            We started in 2000 with a small Hainesport warehouse and one
            mission: <strong>get bandanas — good ones, in real quantities —
            into the hands of the people who actually use them</strong>. Bike
            clubs. Bands on tour. Schools running fundraisers. Mom-and-pop
            shops who couldn't get past minimum orders elsewhere.
          </p>
          <p>
            Twenty-five years later, the warehouse is bigger. The catalog has
            grown from a single product to over 500 SKUs spanning bandanas,
            doo rags, baseball caps, bucket hats, safari hats, beanies, ski
            hats, and accessories. The mission hasn't moved an inch.
          </p>
          <p>
            We're still a family business. We're still in the same town. We
            still pick up the phone when you call — <a
              href="tel:8003551131"
              className="underline underline-offset-2 hover:opacity-70"
            >800-355-1131</a>, and yes that's a real person.
          </p>
          <p>
            What changed: we added custom printing, sometime around 2003, and
            it's now its own division. Over the past 20 years we've printed
            single bandanas for proposals, 50,000-unit runs for music
            festivals, and pretty much everything in between. There isn't a
            print configuration we haven't seen.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* What we do (3 pillars)                                       */
/* ============================================================ */
function ThreePillars() {
  const pillars = [
    {
      n: '01',
      title: 'Wholesale',
      copy: 'Bulk pricing on every product, no minimum red tape. Order 12 bandanas or 12,000 — same warehouse, same shipping speed, deeper discount the bigger you go.',
      cta: {label: 'See wholesale pricing →', to: '/shop'},
    },
    {
      n: '02',
      title: 'Retail',
      copy: 'Just need a few? The same bandanas, hats, and beanies the wholesalers buy are available individually. Same quality, same warehouse, free shipping over $50.',
      cta: {label: 'Shop the catalog →', to: '/shop'},
    },
    {
      n: '03',
      title: 'Custom Printing',
      copy: 'Twenty years of doing it the right way. Reactive dyes, not pigment prints. Print-through fabric, not surface ink. Single units to 50k-unit runs.',
      cta: {
        label: 'Get a custom quote →',
        to: '/pages/custom-printing',
      },
    },
  ];
  return (
    <section className="bg-secondary py-20">
      <div className="max-w-[1600px] mx-auto px-9">
        <header className="mb-12 max-w-[700px]">
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            What we do
          </div>
          <h2
            className="font-black tracking-tight uppercase m-0"
            style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05}}
          >
            Three businesses,<br />one warehouse.
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {pillars.map((p) => (
            <div key={p.n} className="border-t-2 border-foreground pt-6">
              <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
                {p.n}
              </div>
              <h3 className="text-2xl font-semibold mb-3">{p.title}</h3>
              <p className="text-[15px] leading-relaxed mb-6">{p.copy}</p>
              <Link
                to={p.cta.to}
                className="text-sm font-medium underline underline-offset-4 hover:opacity-70"
              >
                {p.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* By the numbers                                                */
/* ============================================================ */
function ByTheNumbers() {
  const stats = [
    {number: '2000', label: 'Year Founded', sub: 'Hainesport, NJ'},
    {number: '500+', label: 'Active SKUs', sub: 'Bandanas to beanies'},
    {number: '40+', label: 'Countries Shipped', sub: 'And every US state'},
    {number: '2M+', label: 'Orders Fulfilled', sub: 'And counting'},
  ];
  return (
    <section className="bg-foreground text-background py-20">
      <div className="max-w-[1600px] mx-auto px-9">
        <header className="mb-12 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-background/60 mb-3">
            By the numbers
          </div>
          <h2
            className="font-black tracking-tight uppercase m-0"
            style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05}}
          >
            Twenty-five years.<br />Receipts on receipts.
          </h2>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div
                className="font-black tracking-tight mb-2"
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                  lineHeight: 1,
                }}
              >
                {s.number}
              </div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-background/70 mb-1">
                {s.label}
              </div>
              <div className="text-[13px] text-background/60">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* Product range                                                 */
/* ============================================================ */
function ProductRange() {
  const categories = [
    {
      title: 'Bandanas',
      copy: 'Paisley, solid, pet, custom. Standard 22" × 22" or oversized 27" × 27". 100% combed cotton, 160 gsm, double-stitched.',
      img: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Headwear',
      copy: 'Baseball caps, bucket hats, safari hats, ski hats, beanies. Structured and unstructured. Embroidery-ready.',
      img: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Pet Collection',
      copy: 'Bandanas sized for cats, small dogs, and big dogs. Same cotton, same dyes, designed for the rolls and the mud.',
      img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80',
    },
  ];
  return (
    <section className="max-w-[1600px] mx-auto px-9 py-20">
      <header className="mb-12 max-w-[640px]">
        <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
          What's in the catalog
        </div>
        <h2
          className="font-black tracking-tight uppercase m-0"
          style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05}}
        >
          500+ products.<br />Three core categories.
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div key={c.title}>
            <div
              className="aspect-[4/5] mb-4 bg-cover bg-center"
              style={{backgroundImage: `url('${c.img}')`}}
              role="img"
              aria-label={c.title}
            />
            <h3 className="text-xl font-semibold mb-2">{c.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed m-0">
              {c.copy}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ */
/* Custom Printing showcase                                     */
/* ============================================================ */
function CustomPrinting() {
  return (
    <section className="bg-secondary py-20">
      <div className="max-w-[1600px] mx-auto px-9 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div
          className="lg:col-span-7 aspect-[4/3] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=1600&q=80')",
          }}
          role="img"
          aria-label="Custom-printed bandanas on a workbench"
        />
        <div className="lg:col-span-5">
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            A side hustle that grew up
          </div>
          <h2
            className="font-black tracking-tight uppercase m-0 mb-5"
            style={{fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', lineHeight: 1.05}}
          >
            Custom printing<br />since 2003.
          </h2>
          <p className="text-[16px] leading-relaxed mb-6">
            We started custom printing as a favor for a local band. Twenty
            years and millions of impressions later, it's its own division
            with its own subdomain. The same warehouse handles it; the same
            family runs it.
          </p>
          <ul className="space-y-2 text-sm mb-6">
            <li>· Single-unit prototypes</li>
            <li>· 50,000-unit festival runs</li>
            <li>· Reactive dye, not pigment</li>
            <li>· 3-day turnaround on most jobs</li>
          </ul>
          <Link
            to="/pages/custom-printing"
            className="inline-block bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-80 transition"
          >
            Request a quote →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* Pull quote                                                   */
/* ============================================================ */
function Quote() {
  return (
    <section
      className="relative py-32 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=2400&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-black/65" aria-hidden />
      <div className="relative z-[2] max-w-[1000px] mx-auto px-9 text-center text-white">
        <span className="text-[11px] uppercase tracking-[0.3em] text-white/70 block mb-6">
          The standard
        </span>
        <blockquote
          className="font-black tracking-tight m-0"
          style={{fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', lineHeight: 1.15}}
        >
          “Sell anything you'd be proud to put<br />your own name on.”
        </blockquote>
        <cite className="mt-6 inline-block not-italic text-sm uppercase tracking-[0.3em] text-white/70">
          — Sign over the warehouse door, 2000
        </cite>
      </div>
    </section>
  );
}

/* ============================================================ */
/* Why customers return                                         */
/* ============================================================ */
function WhyCustomersReturn() {
  const reasons = [
    {
      title: 'Real people answer',
      copy: 'Call 800-355-1131 between 9 and 5 Eastern. You get a person — not a chatbot, not a phone tree. We answer email within one business day, every business day.',
    },
    {
      title: 'No minimums in either direction',
      copy: 'Order one bandana for yourself or 50,000 for a festival. We don\'t care which side of the spectrum you\'re on — same warehouse handles both.',
    },
    {
      title: '30-day no-questions returns',
      copy: 'If something doesn\'t fit, doesn\'t feel right, or doesn\'t match what you expected — send it back. We don\'t ask why. We refund and move on.',
    },
    {
      title: 'We stand behind the print',
      copy: 'Custom job didn\'t turn out right? We reprint. We pay shipping. We don\'t blame the art file. Twenty years of doing this — we know what good looks like.',
    },
  ];
  return (
    <section className="max-w-[1600px] mx-auto px-9 py-20">
      <header className="mb-12 max-w-[640px]">
        <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Why people come back
        </div>
        <h2
          className="font-black tracking-tight uppercase m-0"
          style={{fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05}}
        >
          The boring stuff,<br />done right.
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {reasons.map((r) => (
          <div key={r.title} className="border-t-2 border-foreground pt-6">
            <h3 className="text-xl font-semibold mb-3">{r.title}</h3>
            <p className="text-[15px] leading-relaxed text-muted-foreground m-0">
              {r.copy}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ */
/* Location                                                     */
/* ============================================================ */
function Location() {
  return (
    <section className="bg-secondary py-20">
      <div className="max-w-[1600px] mx-auto px-9 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Visit us
          </div>
          <h2
            className="font-black tracking-tight uppercase m-0 mb-6"
            style={{fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05}}
          >
            2402 Sylon Blvd<br />Hainesport, NJ 08036
          </h2>
          <dl className="space-y-4 text-[15px]">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
                Hours
              </dt>
              <dd className="m-0">Monday – Friday · 9am – 5pm Eastern</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
                Phone
              </dt>
              <dd className="m-0">
                <a
                  href="tel:8003551131"
                  className="hover:opacity-70 underline underline-offset-2"
                >
                  800-355-1131
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
                Email
              </dt>
              <dd className="m-0">
                <a
                  href="mailto:info@sellanything.us"
                  className="hover:opacity-70 underline underline-offset-2"
                >
                  info@sellanything.us
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
                Mailing address
              </dt>
              <dd className="m-0">PO Box 275, Hainesport, NJ 08036</dd>
            </div>
          </dl>
        </div>
        <div
          className="aspect-[4/3] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1600&q=80')",
          }}
          role="img"
          aria-label="A wide warehouse with shelves of folded bandanas"
        />
      </div>
    </section>
  );
}

/* ============================================================ */
/* Bottom CTA                                                   */
/* ============================================================ */
function Cta() {
  return (
    <section className="bg-foreground text-background py-24 text-center">
      <div className="max-w-[800px] mx-auto px-9">
        <h2
          className="font-black tracking-tight uppercase m-0 mb-6"
          style={{fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1.05}}
        >
          Shop. Print.<br />Or just say hi.
        </h2>
        <p className="text-base opacity-80 mb-10">
          Twenty-five years and we still get excited when someone places their
          first order. Pick where you want to start.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/shop"
            className="inline-block bg-background text-foreground px-6 py-3 rounded-full text-sm font-medium hover:opacity-80 transition"
          >
            Shop the catalog
          </Link>
          <Link
            to="/pages/custom-printing"
            className="inline-block border border-background/40 text-background px-6 py-3 rounded-full text-sm font-medium hover:bg-background/10 transition"
          >
            Get a custom quote
          </Link>
          <Link
            to="/blogs/journal"
            className="inline-block text-background/80 hover:text-background underline underline-offset-4 text-sm font-medium px-2 py-3"
          >
            Read the Journal
          </Link>
        </div>
      </div>
    </section>
  );
}
