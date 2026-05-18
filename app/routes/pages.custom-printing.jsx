import {useState, useRef, useEffect, useMemo} from 'react';
import {Link, useFetcher} from 'react-router';

/**
 * Custom Printing — quote-request flow.
 *
 * NOT a cart-based flow. The customer:
 *   1. Picks a product type, quantity range, color, and uploads their design
 *   2. Sees a live preview of the design on a mockup of the product
 *   3. Fills contact details and submits
 *   4. Server (POST /api/quote-request) saves the request + emails the team
 *   5. Confirmation state shows the reference number
 *
 * Why a quote form instead of an Add-to-Cart? Custom-print pricing varies
 * by art complexity, quantity tier, rush vs standard timeline, and shipping
 * destination — none of which Shopify's cart can express. Quote requests
 * also bypass cart race conditions, rate limits, and cookie sync issues
 * that bit us before.
 */

export const meta = () => [
  {title: 'Custom Printing · sellanything.us'},
  {
    name: 'description',
    content:
      'Custom-printed bandanas, hats, and beanies. Single units to 50,000-piece festival runs. Reactive-dye printing, 3-day turnaround, quote in 24 hours.',
  },
  {property: 'og:title', content: 'Custom Printing · sellanything.us'},
  {
    property: 'og:description',
    content:
      'Get a quote in 24 hours. Bandanas, hats, beanies. Single units to bulk.',
  },
];

/* ============================================================ */
/* Static data                                                  */
/* ============================================================ */

const PRODUCTS = [
  {
    id: 'bandana',
    label: 'Bandanas',
    sub: '100% combed cotton · 160 gsm · double-stitched',
    // Mockup background — uses our local images where available
    mockup: '/images/featured-paisley.jpg',
    mockupPosition: 'center 25%',
    pricingNote: '$0.55 – $5.50 / unit',
    hasSize: true,
  },
  {
    id: 'baseball-cap',
    label: 'Baseball Caps',
    sub: 'Unstructured · cotton twill · embroidery-ready',
    mockup: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
    mockupPosition: 'center',
    pricingNote: '$8.50 – $14.00 / unit',
    hasSize: false,
  },
  {
    id: 'bucket-hat',
    label: 'Bucket Hats',
    sub: 'Cotton canvas · brim print + crown embroidery',
    mockup: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80',
    mockupPosition: 'center',
    pricingNote: '$9.00 – $15.00 / unit',
    hasSize: false,
  },
  {
    id: 'beanie',
    label: 'Beanies',
    sub: 'Ribbed cotton · cuffed · screen-print or patch',
    mockup: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=80',
    mockupPosition: 'center',
    pricingNote: '$6.50 – $11.00 / unit',
    hasSize: false,
  },
];

// Bandana sizes — only shown when the bandana product is selected
const BANDANA_SIZES = [
  {id: '14x14', label: '14" × 14"', sub: 'Classic / kerchief size'},
  {id: '18x18', label: '18" × 18"', sub: 'Compact, stylish'},
  {id: '22x22', label: '22" × 22"', sub: 'Most popular · best imprint area'},
  {id: '27x27', label: '27" × 27"', sub: 'Oversized · wrap or scarf'},
];

// Print methods — major decision point with different pricing/MOQs
const PRINT_METHODS = [
  {
    id: 'screen',
    label: 'Screen Print',
    sub: 'Bold colors, large imprint area, vibrant on dyed cotton',
    bullets: [
      '1–6 spot colors',
      'Up to 18" × 18" imprint area',
      'MOQ: 12 pieces (some products 60)',
      'Best for: logos, simple graphics, large runs',
    ],
    moq: 12,
  },
  {
    id: 'digital',
    label: 'Digital Print',
    sub: 'Photo-real, unlimited colors, prints on white cotton',
    bullets: [
      'Unlimited colors + gradients',
      'Photo-realistic detail',
      'No minimum — order a single piece',
      'Best for: complex artwork, photos, fine detail',
    ],
    moq: 1,
  },
];

const QUANTITY_TIERS = [
  {id: '1-11', label: '1 – 11', sub: 'Digital print only (screen MOQ = 12)'},
  {id: '12-49', label: '12 – 49', sub: 'Sample / one-off pricing'},
  {id: '50-99', label: '50 – 99', sub: 'Small-batch'},
  {id: '100-499', label: '100 – 499', sub: 'Standard wholesale'},
  {id: '500-999', label: '500 – 999', sub: 'Volume tier 1'},
  {id: '1000-4999', label: '1,000 – 4,999', sub: 'Volume tier 2'},
  {id: '5000+', label: '5,000+', sub: 'Festival / corporate'},
];

const COLORS = [
  {id: 'black', label: 'Black', hex: '#111'},
  {id: 'white', label: 'White', hex: '#fff'},
  {id: 'natural', label: 'Natural', hex: '#d6c8a5'},
  {id: 'red', label: 'Red', hex: '#c1272d'},
  {id: 'burgundy', label: 'Burgundy', hex: '#5e2129'},
  {id: 'navy', label: 'Navy', hex: '#1a2c4e'},
  {id: 'olive', label: 'Olive', hex: '#605c3c'},
  {id: 'hot-pink', label: 'Hot Pink', hex: '#e91e63'},
];

const PLACEMENTS = [
  {id: 'center', label: 'Center'},
  {id: 'top-left', label: 'Top Left'},
  {id: 'top-right', label: 'Top Right'},
  {id: 'bottom-left', label: 'Bottom Left'},
  {id: 'bottom-right', label: 'Bottom Right'},
  {id: 'corner-discreet', label: 'Corner (Discreet)'},
];

/* ============================================================ */
/* Page                                                          */
/* ============================================================ */

export default function CustomPrinting() {
  // Form state
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [sizeId, setSizeId] = useState('22x22'); // bandana-only
  const [methodId, setMethodId] = useState('screen');
  const [quantityId, setQuantityId] = useState('100-499');
  const [colorId, setColorId] = useState('black');
  const [placementId, setPlacementId] = useState('center');
  const [scale, setScale] = useState(40); // % of product surface
  const [designDataUrl, setDesignDataUrl] = useState(null);
  const [designFileName, setDesignFileName] = useState(null);

  // Submitter
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== 'idle';
  const submitData = fetcher.data;
  const success = !!submitData?.ok;

  const activeProduct = useMemo(
    () => PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0],
    [productId],
  );

  /* ----- design upload handler ----- */
  function handleDesignUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDesignFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setDesignDataUrl(ev.target?.result);
    reader.readAsDataURL(file);
  }

  function clearDesign() {
    setDesignDataUrl(null);
    setDesignFileName(null);
  }

  /* ----- submit handler ----- */
  function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    // Attach the visual config that's in component state
    fd.append('product', activeProduct.label);
    if (activeProduct.hasSize) fd.append('size', sizeId);
    fd.append('method', methodId);
    fd.append('quantity', quantityId);
    fd.append('color', colorId);
    fd.append('placement', placementId);
    fd.append('scale', String(scale));
    if (designDataUrl) {
      fd.append('hasDesign', 'true');
      fd.append('designFileName', designFileName ?? '');
    }
    fetcher.submit(fd, {
      method: 'POST',
      action: '/api/quote-request',
    });
  }

  /* ============================================================ */
  /* Success state                                                */
  /* ============================================================ */
  if (success) {
    return (
      <ConfirmationView
        referenceId={submitData.referenceId}
        productLabel={submitData.summary?.product}
        quantityLabel={submitData.summary?.quantity}
      />
    );
  }

  /* ============================================================ */
  /* Main form                                                    */
  /* ============================================================ */
  return (
    <div>
      <Hero />

      <form
        onSubmit={handleSubmit}
        className="max-w-[1600px] mx-auto px-9 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10"
      >
        {/* LEFT — Editor preview (sticky) */}
        <div className="lg:col-span-7 lg:sticky lg:top-32 self-start">
          <Editor
            product={activeProduct}
            colorHex={
              COLORS.find((c) => c.id === colorId)?.hex || '#111'
            }
            designUrl={designDataUrl}
            placement={placementId}
            scale={scale}
            onClearDesign={clearDesign}
          />

          {/* Placement + scale controls */}
          {designDataUrl && (
            <div className="mt-4 p-4 border border-border rounded-md bg-secondary/50 space-y-4">
              <div>
                <label
                  htmlFor="scale"
                  className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
                >
                  Design size · {scale}%
                </label>
                <input
                  id="scale"
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Placement
                </div>
                <div className="flex gap-2 flex-wrap">
                  {PLACEMENTS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlacementId(p.id)}
                      className={`px-3 py-1.5 text-xs rounded-md border transition ${
                        placementId === p.id
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-background text-foreground border-border hover:border-foreground'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Form fields */}
        <div className="lg:col-span-5 space-y-8">
          {/* Step 1: Product */}
          <FormStep n="01" title="What are you printing on?">
            <div className="grid grid-cols-2 gap-2">
              {PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProductId(p.id)}
                  className={`text-left p-3 border rounded-md transition ${
                    productId === p.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  <div className="font-medium text-sm">{p.label}</div>
                  <div
                    className={`text-[11px] mt-1 ${
                      productId === p.id
                        ? 'text-background/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {p.pricingNote}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {activeProduct.sub}
            </p>
          </FormStep>

          {/* Step 1.5: Bandana size — only when bandana is the product */}
          {activeProduct.hasSize && (
            <FormStep n="02" title="Pick a size">
              <div className="grid grid-cols-2 gap-2">
                {BANDANA_SIZES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSizeId(s.id)}
                    className={`text-left p-3 border rounded-md transition ${
                      sizeId === s.id
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    <div className="font-medium text-sm">{s.label}</div>
                    <div
                      className={`text-[11px] mt-1 ${
                        sizeId === s.id
                          ? 'text-background/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {s.sub}
                    </div>
                  </button>
                ))}
              </div>
            </FormStep>
          )}

          {/* Step 2: Print method */}
          <FormStep
            n={activeProduct.hasSize ? '03' : '02'}
            title="Screen print or digital?"
          >
            <div className="grid grid-cols-1 gap-2">
              {PRINT_METHODS.map((m) => {
                const active = methodId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethodId(m.id)}
                    className={`text-left p-4 border rounded-md transition ${
                      active
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{m.label}</span>
                      {active && (
                        <span aria-hidden className="text-lg">✓</span>
                      )}
                    </div>
                    <div
                      className={`text-[11px] mb-2 ${
                        active
                          ? 'text-background/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {m.sub}
                    </div>
                    <ul
                      className={`text-[11px] space-y-0.5 ${
                        active ? 'text-background/80' : 'text-muted-foreground'
                      }`}
                    >
                      {m.bullets.map((b) => (
                        <li key={b}>· {b}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Not sure? Pick the one closest to your art and we'll confirm in
              the quote.
            </p>
          </FormStep>

          {/* Step 3: Quantity */}
          <FormStep
            n={activeProduct.hasSize ? '04' : '03'}
            title="How many do you need?"
          >
            <div className="grid grid-cols-1 gap-1.5">
              {QUANTITY_TIERS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuantityId(q.id)}
                  className={`flex items-center justify-between p-3 border rounded-md text-left transition ${
                    quantityId === q.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm">{q.label}</div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        quantityId === q.id
                          ? 'text-background/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {q.sub}
                    </div>
                  </div>
                  {quantityId === q.id && (
                    <span aria-hidden className="text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>
          </FormStep>

          {/* Step 4: Color */}
          <FormStep
            n={activeProduct.hasSize ? '05' : '04'}
            title="Pick a base color"
          >
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorId(c.id)}
                  className={`p-2 border rounded-md text-center transition ${
                    colorId === c.id
                      ? 'border-foreground'
                      : 'border-border hover:border-foreground'
                  }`}
                >
                  <div
                    className="w-full aspect-square rounded mb-1.5"
                    style={{
                      backgroundColor: c.hex,
                      boxShadow:
                        c.id === 'white'
                          ? 'inset 0 0 0 1px var(--border, #e5e5e5)'
                          : 'none',
                    }}
                  />
                  <div className="text-[10px] uppercase tracking-wider">
                    {c.label}
                  </div>
                </button>
              ))}
            </div>
          </FormStep>

          {/* Step 5: Design upload */}
          <FormStep
            n={activeProduct.hasSize ? '06' : '05'}
            title="Upload your design (optional)"
          >
            {designDataUrl ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                  <div className="w-12 h-12 bg-secondary rounded overflow-hidden flex-shrink-0">
                    <img
                      src={designDataUrl}
                      alt="Uploaded design preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {designFileName || 'Your design'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Uploaded · preview shown on the left
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearDesign}
                    className="text-xs underline underline-offset-2 hover:opacity-70"
                  >
                    Remove
                  </button>
                </div>
                <label className="inline-block text-xs underline underline-offset-2 cursor-pointer hover:opacity-70">
                  Replace design
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp,application/pdf,.ai,.eps"
                    onChange={handleDesignUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:border-foreground transition">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp,application/pdf,.ai,.eps"
                  onChange={handleDesignUpload}
                  className="hidden"
                />
                <div className="text-sm font-medium mb-1">
                  Drop your file or click to upload
                </div>
                <div className="text-xs text-muted-foreground">
                  PNG, JPG, SVG, PDF, AI, EPS · up to 20 MB
                </div>
              </label>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              No file yet? Skip this — we'll talk about the art when we reply.
            </p>
          </FormStep>

          {/* Step 6: Notes */}
          <FormStep
            n={activeProduct.hasSize ? '07' : '06'}
            title="Anything else we should know?"
          >
            <textarea
              name="notes"
              rows={3}
              placeholder="E.g. 4-color print, need by July 15, festival merch, etc."
              className="w-full p-3 border border-border rounded-md text-sm bg-background"
            />
          </FormStep>

          {/* Step 7: Contact */}
          <FormStep
            n={activeProduct.hasSize ? '08' : '07'}
            title="How do we reach you?"
          >
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="name"
                required
                placeholder="Full name *"
                className="p-3 border border-border rounded-md text-sm bg-background"
              />
              <input
                type="text"
                name="company"
                placeholder="Company (optional)"
                className="p-3 border border-border rounded-md text-sm bg-background"
              />
              <input
                type="email"
                name="email"
                required
                placeholder="Email *"
                className="p-3 border border-border rounded-md text-sm bg-background col-span-2"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone (optional)"
                className="p-3 border border-border rounded-md text-sm bg-background"
              />
              <input
                type="date"
                name="neededBy"
                className="p-3 border border-border rounded-md text-sm bg-background"
                aria-label="Need by date"
              />
            </div>
          </FormStep>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-foreground text-background rounded-full font-medium hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending your request…' : 'Get my quote →'}
            </button>
            {submitData?.error && (
              <p className="text-xs text-red-600 mt-2">
                Couldn't send: {submitData.error}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-3 text-center">
              We reply within 24 hours during business days. No spam, no
              follow-up sequences. Just a quote.
            </p>
          </div>
        </div>
      </form>

      <PricingTable />
      <FreeProofCallout />
      <FAQ />
      <FileRequirements />
      <TrustStrip />
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
      style={{height: 'clamp(360px, 55vh, 520px)'}}
      aria-label="Custom printing hero"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=2400&q=80')",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />
      <div className="absolute inset-0 z-[2] flex flex-col justify-end items-center px-9 pb-14 text-white text-center">
        <span className="text-xs uppercase tracking-[0.3em] mb-3 text-white/80">
          Custom Printing · since 2003
        </span>
        <h1
          className="font-black tracking-tight uppercase m-0 mb-3 max-w-[1000px]"
          style={{fontSize: 'clamp(2.25rem, 6vw, 4.5rem)', lineHeight: 1.02}}
        >
          Your design,<br />on our cotton.
        </h1>
        <p className="max-w-[560px] text-[15px] opacity-95 m-0">
          Single units to 50,000-piece festival runs. Reactive-dye printing,
          3-day standard turnaround, quote in 24 hours.
        </p>
      </div>
    </section>
  );
}

/* ============================================================ */
/* Editor preview                                                */
/* ============================================================ */
function Editor({product, colorHex, designUrl, placement, scale, onClearDesign}) {
  // Map placement to inset position (CSS object)
  const placementStyle = useMemo(() => {
    const base = {position: 'absolute'};
    switch (placement) {
      case 'top-left':
        return {...base, top: '15%', left: '15%'};
      case 'top-right':
        return {...base, top: '15%', right: '15%'};
      case 'bottom-left':
        return {...base, bottom: '15%', left: '15%'};
      case 'bottom-right':
        return {...base, bottom: '15%', right: '15%'};
      case 'corner-discreet':
        return {...base, bottom: '8%', right: '8%'};
      default:
        // center
        return {
          ...base,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  }, [placement]);

  return (
    <div className="space-y-3">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
        Preview
      </div>
      <div
        className="relative aspect-square overflow-hidden rounded-md"
        style={{backgroundColor: colorHex}}
      >
        {/* Product mockup image with reduced opacity to show base color */}
        <div
          className="absolute inset-0 bg-cover mix-blend-multiply"
          style={{
            backgroundImage: `url('${product.mockup}')`,
            backgroundPosition: product.mockupPosition,
            opacity: 0.85,
          }}
          aria-hidden
        />

        {/* Color overlay tint for non-white colors */}
        {colorHex !== '#fff' && colorHex !== '#d6c8a5' && (
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-overlay"
            style={{backgroundColor: colorHex, opacity: 0.3}}
          />
        )}

        {/* Design overlay */}
        {designUrl && (
          <img
            src={designUrl}
            alt="Your design positioned on the product"
            style={{
              ...placementStyle,
              width: `${scale}%`,
              height: 'auto',
              maxWidth: '80%',
              maxHeight: '80%',
              objectFit: 'contain',
              filter:
                colorHex === '#111' || colorHex === '#1a2c4e' || colorHex === '#5e2129'
                  ? 'drop-shadow(0 0 1px rgba(255,255,255,0.3))'
                  : 'none',
            }}
          />
        )}

        {/* Empty state */}
        {!designUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition">
            <div className="text-center text-white/90 text-sm font-medium drop-shadow-md">
              Your design will appear here
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="text-muted-foreground">
          <span className="font-semibold text-foreground">{product.label}</span>
          {' · '}
          <span>{product.pricingNote}</span>
        </div>
        {designUrl && (
          <button
            type="button"
            onClick={onClearDesign}
            className="text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Clear design
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================ */
/* Form step wrapper                                            */
/* ============================================================ */
function FormStep({n, title, children}) {
  return (
    <div className="border-t-2 border-foreground pt-5">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {n}
        </span>
        <h2 className="text-lg font-semibold m-0">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ============================================================ */
/* Pricing table — illustrative bulk tiers                      */
/* ============================================================ */
function PricingTable() {
  // Approximate pricing for bandanas (most common product).
  // Actual quote will land in 24h based on art complexity + final qty.
  const rows = [
    {qty: '12 – 49', screen: '$3.50 – $5.50', digital: '$4.00 – $5.50'},
    {qty: '50 – 99', screen: '$2.75 – $3.50', digital: '$3.00 – $4.00'},
    {qty: '100 – 499', screen: '$1.85 – $2.75', digital: '$2.25 – $3.00'},
    {qty: '500 – 999', screen: '$1.35 – $1.85', digital: '$1.65 – $2.25'},
    {qty: '1,000 – 4,999', screen: '$0.95 – $1.35', digital: '$1.25 – $1.65'},
    {qty: '5,000+', screen: '$0.55 – $0.95', digital: 'Quote required'},
  ];
  return (
    <section className="bg-secondary py-20">
      <div className="max-w-[1100px] mx-auto px-9">
        <header className="mb-10 max-w-[640px]">
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Bulk pricing
          </div>
          <h2
            className="font-black tracking-tight uppercase m-0 mb-3"
            style={{fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.05}}
          >
            More you order,<br />less per piece.
          </h2>
          <p className="text-sm text-muted-foreground">
            Approximate range for 22"×22" custom-printed bandanas. Your quote
            includes art prep, screens (if applicable), and shipping by
            weight. No setup fees on orders over 100.
          </p>
        </header>

        <div className="overflow-x-auto border border-border rounded-md bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-foreground text-background">
                <th className="text-left p-4 font-semibold">Quantity</th>
                <th className="text-left p-4 font-semibold">Screen Print</th>
                <th className="text-left p-4 font-semibold">Digital Print</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.qty}
                  className={i < rows.length - 1 ? 'border-b border-border' : ''}
                >
                  <td className="p-4 font-medium">{r.qty}</td>
                  <td className="p-4 text-muted-foreground">{r.screen}</td>
                  <td className="p-4 text-muted-foreground">{r.digital}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-3 italic">
          Prices shown are per unit for one-color screen prints / one-side
          digital prints. Multi-color or full-coverage prints adjust the
          range. Submit a quote for exact pricing in 24 hours.
        </p>
      </div>
    </section>
  );
}

/* ============================================================ */
/* Free digital proof — trust callout                            */
/* ============================================================ */
function FreeProofCallout() {
  return (
    <section className="bg-foreground text-background py-20">
      <div className="max-w-[1100px] mx-auto px-9 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
        <div className="md:col-span-2">
          <div className="text-[11px] uppercase tracking-[0.3em] text-background/60 mb-3">
            What you get before we print
          </div>
          <h2
            className="font-black tracking-tight uppercase m-0 mb-4"
            style={{fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.05}}
          >
            Free digital proof.<br />Approve before we run it.
          </h2>
          <p className="text-base opacity-85 mb-2">
            Every custom job gets a digital mockup before production starts.
            See your design on the actual product, in the actual color,
            sized exactly how it'll print. Sign off — or send feedback —
            before a single bandana goes through the press.
          </p>
          <p className="text-base opacity-85 m-0">
            We don't charge for proofs. We don't bill for revisions. The
            quote price is the price.
          </p>
        </div>
        <div className="md:col-span-1">
          <div
            className="aspect-square bg-cover bg-center rounded-md"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1604644401890-0bd678c83788?auto=format&fit=crop&w=800&q=80')",
            }}
            role="img"
            aria-label="A digital proof showing a custom bandana design"
          />
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* FAQ                                                          */
/* ============================================================ */
function FAQ() {
  const faqs = [
    {
      q: `What's your minimum order?`,
      a: `For digital print: 1 piece. For screen print: 12 pieces (some larger products go up to 60). Order as many or as few as you need — pricing simply gets better the more you order.`,
    },
    {
      q: 'How long does it take?',
      a: 'Standard turnaround is 3 business days from when you approve the digital proof. Rush options (24–48hr) are available with a small upcharge. Festival deadlines? Tell us in your quote.',
    },
    {
      q: 'What file formats do you accept?',
      a: 'Vector files (AI, EPS, SVG, PDF) are ideal — they scale to any size without losing quality. We also take high-resolution PNG, JPG, or PSD (300 dpi minimum at print size). If you only have a low-res file, we can usually recreate it for a flat $25 art-prep fee.',
    },
    {
      q: `Can I get a sample first?`,
      a: `Yes. We can produce a single digital-printed sample for $25–35 (price refunded if you place an order over 100). Screen-printed samples aren't economical for one-offs since the screen burn is the bulk of the cost.`,
    },
    {
      q: `What's the difference between screen and digital printing?`,
      a: `Screen print uses pre-dyed cotton + ink pushed through a stencil. Best for bold, simple designs in 1–6 colors, very vibrant, lasts forever. Digital print uses inkjet directly onto white cotton — unlimited colors, gradients, photos all possible, but slightly softer finish. Both last well; the choice is mostly about your art.`,
    },
    {
      q: 'Do you ship internationally?',
      a: 'Yes — we ship to 40+ countries. Customs and duties vary by destination; we\'ll quote shipping with the price quote. Most international orders land in 7–14 business days.',
    },
    {
      q: `What if the print comes out wrong?`,
      a: `We reprint. No questions, no charge, no debate. If the finished product doesn't match the proof you approved, that's on us and we fix it.`,
    },
    {
      q: 'Can you handle festival / corporate / fundraising orders?',
      a: 'Yes — those are most of what we do. Tell us your event date, quantity, and design in the quote form and we\'ll handle the rest. Bulk discounts apply automatically above 500 units.',
    },
  ];
  return (
    <section className="max-w-[1100px] mx-auto px-9 py-20">
      <header className="mb-10 max-w-[640px]">
        <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Common questions
        </div>
        <h2
          className="font-black tracking-tight uppercase m-0"
          style={{fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.05}}
        >
          The stuff people<br />always ask.
        </h2>
      </header>

      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details
            key={i}
            className="group border border-border rounded-md bg-background overflow-hidden"
          >
            <summary className="cursor-pointer list-none p-5 flex items-center justify-between gap-4 hover:bg-secondary/50 transition">
              <span className="font-semibold text-base">{f.q}</span>
              <span
                aria-hidden
                className="text-2xl text-muted-foreground group-open:rotate-45 transition-transform"
              >
                +
              </span>
            </summary>
            <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
              {f.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ */
/* File requirements                                            */
/* ============================================================ */
function FileRequirements() {
  const requirements = [
    {
      title: 'Vector (preferred)',
      formats: 'AI · EPS · SVG · PDF',
      note: 'Scales to any size. Best for logos and graphics.',
    },
    {
      title: 'High-res raster',
      formats: 'PNG · JPG · PSD · TIFF',
      note: 'Minimum 300 DPI at final print size.',
    },
    {
      title: 'Colors',
      formats: 'Pantone (PMS) or CMYK',
      note: 'For exact color matching. Otherwise we color-match by eye.',
    },
    {
      title: 'Max file size',
      formats: '50 MB',
      note: 'Larger files? Send a WeTransfer / Dropbox link in the notes.',
    },
  ];
  return (
    <section className="bg-secondary py-20">
      <div className="max-w-[1100px] mx-auto px-9">
        <header className="mb-10 max-w-[640px]">
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            For your designer
          </div>
          <h2
            className="font-black tracking-tight uppercase m-0"
            style={{fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.05}}
          >
            File requirements.
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {requirements.map((r) => (
            <div
              key={r.title}
              className="border-t-2 border-foreground pt-4 bg-background p-5"
            >
              <h3 className="text-sm font-semibold mb-2">{r.title}</h3>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-mono">
                {r.formats}
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed m-0">
                {r.note}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-6 italic">
          Don&apos;t have any of these? Just submit the quote with your rough
          idea — we have an in-house designer who can recreate or refine
          almost anything for a $25 art-prep fee (waived on orders over 250
          units).
        </p>
      </div>
    </section>
  );
}

/* ============================================================ */
/* Trust strip                                                   */
/* ============================================================ */
function TrustStrip() {
  const items = [
    {
      title: '20+ years',
      sub: 'Custom printing since 2003',
    },
    {
      title: 'Reactive dye',
      sub: 'Print-through, not surface ink',
    },
    {
      title: '3-day standard',
      sub: 'Rush options available',
    },
    {
      title: 'We reprint',
      sub: 'If a print fails, we redo it. Free.',
    },
  ];
  return (
    <section className="border-t border-border bg-secondary py-16">
      <div className="max-w-[1600px] mx-auto px-9">
        <header className="mb-10 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Why people come back
          </div>
          <h2
            className="font-black tracking-tight uppercase m-0"
            style={{fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', lineHeight: 1.05}}
          >
            The print is the easy part.<br />
            The promise is the hard part.
          </h2>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {items.map((i) => (
            <div key={i.title} className="border-t-2 border-foreground pt-5">
              <div className="text-2xl font-bold mb-1">{i.title}</div>
              <div className="text-[13px] text-muted-foreground">{i.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* Confirmation view (success state)                            */
/* ============================================================ */
function ConfirmationView({referenceId, productLabel, quantityLabel}) {
  return (
    <div className="max-w-[800px] mx-auto px-9 py-24 text-center">
      <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
        Quote requested
      </div>
      <h1
        className="font-black tracking-tight uppercase m-0 mb-6"
        style={{fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.05}}
      >
        We've got your<br />request.
      </h1>
      <p className="text-base text-muted-foreground mb-8 max-w-[520px] mx-auto">
        A real person will look at your request and reply within 24 hours
        during business days. No bots, no follow-up sequences — just a price
        and a timeline.
      </p>

      <div className="inline-block border border-border rounded-md p-6 text-left mb-12">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
          Reference number
        </div>
        <div className="font-mono text-lg font-semibold mb-4">{referenceId}</div>
        {productLabel && (
          <div className="text-sm text-muted-foreground">
            {productLabel}
            {quantityLabel && ` · ${quantityLabel} units`}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link
          to="/shop"
          className="inline-block bg-foreground text-background px-6 py-3 rounded-full text-sm font-medium hover:opacity-80 transition"
        >
          Browse the catalog
        </Link>
        <Link
          to="/blogs/journal"
          className="inline-block border border-border px-6 py-3 rounded-full text-sm font-medium hover:bg-secondary transition"
        >
          Read the Journal
        </Link>
      </div>
    </div>
  );
}
