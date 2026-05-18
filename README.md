# sellanything

A custom **Shopify Hydrogen** storefront for `sellanything.us` — bandanas, hats, beanies, and custom printing. Built on React Router 7 + Vite + MiniOxygen, styled with Tailwind v4 + shadcn/ui.

## Stack

- **Framework**: [Shopify Hydrogen](https://hydrogen.shopify.dev) 2026.4.2
- **Runtime**: React Router 7 + Vite + MiniOxygen (Cloudflare Workers compatible)
- **UI**: Tailwind CSS v4 + shadcn/ui + Radix primitives
- **Animations**: `tw-animate-css` (drawer slide-ins, cart pop, hamburger morph)
- **Data**: Shopify Storefront API via Headless sales channel
- **Cart / Checkout**: Real Shopify cart (`CartForm`, `useOptimisticCart`) → Shopify-hosted checkout

## What's in the box

### Routes

| Path | What it does |
|---|---|
| `/` | Editorial home page — hero slider, marquee, featured, trending, built-for-speed carousel, shop-by-category, spotlight |
| `/shop` | Filterable catalog with sort + category sidebar |
| `/products/$handle` | Full PDP with variant picker, URL-based variant state, gallery, related products, JSON-LD schema |
| `/collections/$handle` | Streaming collection page with sticky sidebar (Suspense + tag-search fallback) |
| `/pages/custom-printing` | Quote form with live design preview, screen vs digital, bandana sizes, color picker, FAQ, pricing table, file requirements |
| `/pages/about` | Editorial About page — hero, origin, pillars, process, pull quote, team, location, CTA |
| `/blogs` | Journal index |
| `/blogs/journal` | Mock blog with 6 articles + Shopify fallback |
| `/blogs/journal/$slug` | Article page with prose typography + reading time + JSON-LD |
| `/api/quote-request` | Server endpoint that receives quote submissions, logs to console, optional Resend email forward |

### Key components

- `app/components/Header.jsx` — sticky nav, hover-trigger mega menu, mobile drawer with search, hamburger ↔ X morph animation, cart pop on add
- `app/components/HydrogenCartDrawer.jsx` — real cart drawer with optimistic UI
- `app/components/Footer.jsx` — 5-column footer (About / Partner / Contact / Blog / Location) + payment icons strip
- `app/components/Aside.jsx` — drawer system on shadcn Sheet (mobile-full-width, sm-up 420px)
- `app/components/PaginatedResourceSection.jsx` — styled pagination buttons

### Mock content

- `app/lib/mockBlog.js` — 6 realistic mock articles for `/blogs/journal/*` until real Shopify blog content is published. Overridden automatically when Shopify has matching posts.

## Local development

```bash
npm install
npm run dev
# → http://localhost:3000
```

### Environment

Copy `.env.example` to `.env` and fill in real values:

```bash
PUBLIC_STORE_DOMAIN="your-store.myshopify.com"
PUBLIC_STOREFRONT_API_TOKEN="..."      # from Headless channel
PUBLIC_STOREFRONT_ID="..."
PUBLIC_CHECKOUT_DOMAIN="checkout.shopify.com"
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID="..."
PUBLIC_CUSTOMER_ACCOUNT_API_URL="..."
SESSION_SECRET="..."                    # openssl rand -hex 32
```

Optional for quote-request email forwarding (uses [Resend](https://resend.com), 3k emails/mo free):

```bash
PRIVATE_RESEND_API_KEY="re_..."
```

## Test orders (Bogus Gateway)

1. Shopify Admin → Settings → Payments → activate **"(For Testing) Bogus Gateway"**
2. Add product to bag → Checkout
3. Use card number `1`, exp `12/30`, CVV `123`
4. Order appears in Admin → Orders

## Deployment

### Oxygen (Shopify) — recommended if on a paid plan
```bash
npx shopify hydrogen link
npx shopify hydrogen env push
npx shopify hydrogen deploy
```
Requires Hydrogen sales channel (Shopify plan ≥ $29/mo).

### Cloudflare Workers — free alternative
Hydrogen builds to a Workers-compatible bundle via `@shopify/mini-oxygen`. Add a `wrangler.toml` and run `wrangler deploy`.

### Other platforms
Hydrogen 2026.x is built on React Router 7 + Vite + MiniOxygen, so the
build output (`dist/server/index.js` + `dist/client/`) can be wrapped for
deployment to Netlify, Vercel, or any Workers-runtime host. Each platform
needs its own thin adapter that re-exports the `dist/server/index.js`
`fetch` handler. See the official Hydrogen deployment docs for
platform-specific guides.

## Project conventions

- **Tailwind utilities only** — no custom CSS classes except for animations and theme tokens
- **`max-w-[1600px]`** container at `px-9` on most pages
- **Editorial typography**: `font-black tracking-tight uppercase` with `clamp()` font sizes
- **Eyebrows**: `text-[11px] uppercase tracking-[0.3em] text-muted-foreground`
- **shadcn theme tokens** defined in `app/styles/app.css`

## License

Private — all rights reserved.
