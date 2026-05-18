/**
 * Mock blog content for sellanything.us
 *
 * Used as a fallback in the /blogs routes when Shopify has no real blogs
 * or articles published. As soon as you publish in Shopify Admin →
 * Online Store → Blog posts, the real content takes over and the mock data
 * is bypassed automatically.
 *
 * To replace with real content:
 *   1. In Shopify Admin → Online Store → Blogs → Create blog (handle: journal)
 *   2. Add posts to that blog
 *   3. The mock fallback turns off automatically
 */

export const MOCK_BLOG_HANDLE = 'journal';
export const MOCK_BLOG_TITLE = 'Journal';

export const MOCK_BLOGS = [
  {
    title: MOCK_BLOG_TITLE,
    handle: MOCK_BLOG_HANDLE,
    seo: {
      title: 'Journal · sellanything.us',
      description:
        'Field notes, fabric stories, and the people who keep our pieces in rotation.',
    },
  },
];

export const MOCK_ARTICLES = [
  {
    id: 'mock-article-1',
    handle: 'heritage-paisley-quiet-comeback',
    title: 'Heritage Paisley: A Quiet Comeback',
    publishedAt: '2026-05-08T10:00:00Z',
    author: {name: 'Maya Chen'},
    image: {
      url: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1600&q=80',
      altText: 'Stack of folded paisley bandanas',
      width: 1600,
      height: 1067,
    },
    seo: {
      description:
        'How a 200-year-old pattern keeps finding its way back into the rotation — and why we kept the originals intact.',
    },
    contentHtml: `
      <p>You've seen it before — probably tied around someone's wrist at a market, draped on a vintage Harley, or knotted at the collar of a thrifted denim shirt. Paisley is one of those patterns that refuses to stay out of fashion for very long.</p>

      <p>The motif itself dates to 17th-century Persia, where it was woven into shawls as a symbol of life and fertility. It traveled west through the Kashmir trade routes and landed, in the early 1800s, in a small Scottish mill town called <em>Paisley</em>. The name stuck.</p>

      <h2>Why we kept the originals</h2>

      <p>When we set out to make our own line, we sat down with bandana collectors who'd been at it for decades. They told us something we already suspected: <strong>most modern bandanas are too thin, too small, and too clean.</strong> The patterns get simplified, the cotton gets cheaper, and the bandanas start feeling like cheap promotional swag.</p>

      <p>So we didn't redesign the pattern. We sourced 100% combed cotton from the same mills that supplied riders in the 70s, kept the 22"×22" "saddle size" as standard, and brought back the heavy double-stitched edge that prevents fraying after the first wash.</p>

      <blockquote>The bandana isn't a fashion item. It's a tool. It has to live up to the work you put it through.</blockquote>

      <h2>How to break one in</h2>

      <ol>
        <li>Wash cold, once, with no detergent. Just water.</li>
        <li>Hang dry. The cotton will tighten and the dye will set.</li>
        <li>Use it. Tie it. Wipe stuff with it.</li>
        <li>Wash again — this time with detergent, with the rest of your laundry. After a few cycles it will feel like it's been yours for years.</li>
      </ol>

      <p>That's it. Don't iron it. Don't fold it neatly. The wrinkles are the point.</p>
    `,
    blog: {handle: MOCK_BLOG_HANDLE},
  },
  {
    id: 'mock-article-2',
    handle: 'summer-heads-five-hats',
    title: 'Summer Heads: Five Hats To Beat July',
    publishedAt: '2026-04-22T12:00:00Z',
    author: {name: 'Devin Park'},
    image: {
      url: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1600&q=80',
      altText: 'Assortment of summer hats laid out flat',
      width: 1600,
      height: 1067,
    },
    seo: {
      description:
        'Five hats from our headwear edit picked for the worst of July — including the one we cannot get back in stock.',
    },
    contentHtml: `
      <p>We're three weeks out from peak humidity. If you don't have a hat strategy by now, this is your reminder. Here are five from our headwear edit that earn their place in a heat wave.</p>

      <h2>1. The Safari Hat</h2>
      <p>Wide brim, vented crown, 100% cotton canvas. The piece nobody admits they want until they spend a day at a festival without one. Ours has a chin cord because the wind always shows up.</p>

      <h2>2. The Bucket Hat</h2>
      <p>Lighter than a baseball cap, shadier than a beanie, and the easiest to crumple into a bag. We carry it in three colorways but the natural khaki is the one everyone reorders.</p>

      <h2>3. The Baseball Cap (Unstructured)</h2>
      <p>Structured caps trap heat. Unstructured ones don't. Same silhouette, half the sweat. Our crown is washed cotton with a strap-back so it actually fits.</p>

      <h2>4. The Beanie (Yes, In July)</h2>
      <p>Hear us out. A thin ribbed cotton beanie is the move for cool evenings at the beach. Light enough to wear, warm enough to matter when the sun drops.</p>

      <h2>5. The Ski Hat With Visor</h2>
      <p>The wildcard. Folded up it's a beanie, brim out it's a cap. It looks weird in photos and is unbeatable in practice. We sold out twice last winter.</p>

      <p>The rule of summer headwear: pick two and rotate. One for the sun, one for after dark.</p>
    `,
    blog: {handle: MOCK_BLOG_HANDLE},
  },
  {
    id: 'mock-article-3',
    handle: 'how-to-tie-a-bandana',
    title: 'How To Tie a Bandana, Seven Ways',
    publishedAt: '2026-03-30T09:30:00Z',
    author: {name: 'Sasha Rivera'},
    image: {
      url: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1600&q=80',
      altText: 'Person tying a paisley bandana around their head',
      width: 1600,
      height: 1067,
    },
    seo: {
      description:
        'Seven ways to wear a bandana — head wrap, neck scarf, wrist tie, bag accent, dog collar, hair tie, and the one we invented.',
    },
    contentHtml: `
      <p>A bandana is one of those rare objects that pays you back every time you learn a new way to use it. Here are seven tested over the years.</p>

      <h2>1. Head Wrap (Pirate Knot)</h2>
      <p>Fold diagonally, lay across the forehead, knot at the back of the skull. Tuck the front edge under itself for a cleaner line. Works for any hair length, breaks up direct sun, and absorbs sweat better than any technical headband we've tried.</p>

      <h2>2. Neck Scarf (French Knot)</h2>
      <p>Fold into a long rectangle. Cross behind the neck, bring ends to the front, knot once. Slide the knot under the collar of a tee or denim shirt for a vintage <em>casquette</em> vibe.</p>

      <h2>3. Wrist Tie</h2>
      <p>Roll diagonally into a thin rope. Wrap around the wrist twice. Tie a single knot. The lazy way to add color to an outfit with zero commitment.</p>

      <h2>4. Bag Accent</h2>
      <p>Loop through the strap of a tote, backpack, or camera bag. Tie in a square knot. Surprisingly hard to ignore — strangers will compliment you.</p>

      <h2>5. Dog Collar (or Cat, if You're Brave)</h2>
      <p>Triangle fold, lay flat, knot or use a clip at the back. Our pet bandanas are sized for medium dogs, but a regular bandana works for most. (Cats, your mileage may vary.)</p>

      <h2>6. Hair Tie</h2>
      <p>Roll thin, wrap around the base of a ponytail or low bun, tuck the ends. Replaces a hair elastic and looks intentional instead of accidental.</p>

      <h2>7. The "Coffee Cup Cozy"</h2>
      <p>Our addition. Wrap a folded bandana around a hot coffee cup, tie loosely. Insulates better than the cardboard sleeve and you don't waste paper. We tried it as a joke; we now keep one in the car door.</p>

      <p>Most days we use ours for two or three of these at once. That's the whole point.</p>
    `,
    blog: {handle: MOCK_BLOG_HANDLE},
  },
  {
    id: 'mock-article-4',
    handle: 'color-theory-streetwear',
    title: 'The Color Theory of Streetwear',
    publishedAt: '2026-03-12T14:15:00Z',
    author: {name: 'Maya Chen'},
    image: {
      url: 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=1600&q=80',
      altText: 'Color palette swatches arranged on a workbench',
      width: 1600,
      height: 1067,
    },
    seo: {
      description:
        'Why the same shade of olive reads differently in 1995, 2008, and now — and how we pick the four colors we ship every season.',
    },
    contentHtml: `
      <p>Color in streetwear is never about a single hue. It's about how a hue sits next to the era it lived in. Olive in 1995 reads military surplus. Olive in 2008 reads American Apparel. Olive in 2025 reads luxury minimalism. Same dye, different decade.</p>

      <p>When we sit down to pick the four colorways we'll release each season, we don't start with what looks good. We start with what feels <em>now</em>.</p>

      <h2>The four-color rule</h2>

      <p>Every drop has four colors. Always. Here's how we space them:</p>

      <ul>
        <li><strong>One anchor.</strong> Black, white, or natural khaki. The one that sells through regardless of trends.</li>
        <li><strong>One archive.</strong> A shade pulled from an old reference — a 70s ad, a vintage workwear catalog, a film still. Builds the heritage feel.</li>
        <li><strong>One pop.</strong> The unexpected one. Hot pink. Lime green. The color you didn't know you wanted.</li>
        <li><strong>One bridge.</strong> A neutralized version of the pop — dusty pink, sage green — that sits between the safe and the loud. Often outsells all three others.</li>
      </ul>

      <h2>What we got wrong</h2>

      <p>Our first season we put two pops in the same drop. They cannibalized each other. The hot pink ate the lime green, the lime green ate the hot pink, and the anchor (a deep navy) sat unsold. We learned: only one loud color per release. The rest of the lineup is there to make the loud one possible.</p>

      <h2>The four for this season</h2>

      <p>Anchor: <strong>Natural Khaki</strong>. Archive: <strong>Burgundy</strong>. Pop: <strong>Hot Pink</strong>. Bridge: <strong>Dusty Mauve</strong>. We'll see how it goes.</p>
    `,
    blog: {handle: MOCK_BLOG_HANDLE},
  },
  {
    id: 'mock-article-5',
    handle: 'behind-the-stitch-cotton',
    title: 'Behind the Stitch: Our 100% Cotton',
    publishedAt: '2026-02-26T11:00:00Z',
    author: {name: 'Devin Park'},
    image: {
      url: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1600&q=80',
      altText: 'Close-up of woven cotton fabric texture',
      width: 1600,
      height: 1067,
    },
    seo: {
      description:
        'Where our cotton comes from, why "100%" doesn\'t mean what you think, and what we won\'t put our name on.',
    },
    contentHtml: `
      <p>"100% cotton" is the marketing line everyone uses. We use it too. It doesn't mean much on its own — there's a wide range of what 100% cotton can be, and most of the stuff sold as bandanas, hats, and tees is at the bottom of that range.</p>

      <p>Here's what to actually look for.</p>

      <h2>Ring spun vs open-end</h2>
      <p>Most cheap cotton is "open-end" — the fastest, cheapest way to spin yarn. It produces a rougher, weaker thread that pills after a few washes. Ring-spun cotton is twisted differently — slower, more expensive, softer, lasts longer. Our pieces are ring-spun.</p>

      <h2>Combed vs carded</h2>
      <p>Combed cotton has the short fibers removed before spinning, leaving only the long, smooth fibers. Carded cotton skips that step. Combed is what you want. Carded is what you get at gas stations.</p>

      <h2>GSM (grams per square meter)</h2>
      <p>The honest measure of fabric weight. A flimsy promotional bandana is 100 gsm. A festival-grade bandana is 140-160 gsm. Ours sit at 160. You can feel the difference in your hand before you even open it.</p>

      <h2>What we won't ship</h2>

      <ul>
        <li>Anything under 140 gsm</li>
        <li>Anything carded</li>
        <li>Anything from mills that won't disclose their sourcing</li>
        <li>Anything that bleeds dye on the second wash</li>
      </ul>

      <p>That eliminates a lot of suppliers. It also means our cost per unit is higher than the competition. But the bandana you get is the one you'd want to keep ten years from now.</p>
    `,
    blog: {handle: MOCK_BLOG_HANDLE},
  },
  {
    id: 'mock-article-6',
    handle: 'pet-bandanas-yes-really',
    title: 'Pet Bandanas: Yes, Really',
    publishedAt: '2026-02-10T13:45:00Z',
    author: {name: 'Sasha Rivera'},
    image: {
      url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1600&q=80',
      altText: 'Golden retriever wearing a paisley pet bandana',
      width: 1600,
      height: 1067,
    },
    seo: {
      description:
        'We thought pet bandanas were a joke until our dog wore one and the comments started rolling in. Here is what we learned.',
    },
    contentHtml: `
      <p>We almost didn't make pet bandanas. The team was split. Half of us thought it would dilute the brand; half of us thought it would be the thing people remember us for. We held a vote, lost the vote, made them anyway.</p>

      <p>It turns out: people love them. The pet bandana line is our second-best-selling category. Here's what we learned.</p>

      <h2>Sizing matters more than you'd think</h2>
      <p>A bandana that's too big falls off. Too small and it strangles. We use three sizes — XS for cats and tiny dogs, S for medium dogs, M for big dogs (think golden retrievers). Each ties with a slip-knot you can adjust.</p>

      <h2>The fabric is the same as our human bandanas</h2>
      <p>Ring-spun, combed, 160 gsm. We didn't downgrade for pets. Dogs roll in things, drag their bandana through mud, get hosed off. The bandana needs to take it.</p>

      <h2>What surprised us</h2>
      <ul>
        <li>People buy matching sets — one for them, one for the dog. Our checkout shows it happens about 30% of the time.</li>
        <li>The "pet" colorways outsell the human ones. Apparently dogs look better in hot pink than we do.</li>
        <li>Cats wear them. Reluctantly. But they do.</li>
      </ul>

      <p>If you're on the fence, get one. Even if it stays in the drawer, the dog photo you take during their first walk wearing it is worth the $4.</p>
    `,
    blog: {handle: MOCK_BLOG_HANDLE},
  },
];

/**
 * Find a mock blog by handle (returns null if none match).
 */
export function findMockBlog(handle) {
  return MOCK_BLOGS.find((b) => b.handle === handle) ?? null;
}

/**
 * Find a mock article by blog handle + article handle.
 */
export function findMockArticle(blogHandle, articleHandle) {
  if (blogHandle !== MOCK_BLOG_HANDLE) return null;
  return MOCK_ARTICLES.find((a) => a.handle === articleHandle) ?? null;
}

/**
 * Build a mock "blog" object shaped like Shopify's response — title + handle
 * + seo + articles connection. Use as a drop-in fallback.
 */
export function buildMockBlogWithArticles() {
  return {
    title: MOCK_BLOG_TITLE,
    handle: MOCK_BLOG_HANDLE,
    seo: MOCK_BLOGS[0].seo,
    articles: {
      nodes: MOCK_ARTICLES,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    },
  };
}
