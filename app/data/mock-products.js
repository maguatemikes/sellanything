/**
 * Centralized mock catalog — pure fashion headwear & bandanas.
 * Shape mirrors Shopify Storefront API, so swapping to real GraphQL later
 * means swapping the loader, not the component code.
 *
 * Categories: Paisley Bandana · Pet Bandana · Baseball Cap · Bucket Hat · Safari Hat
 */

export const MOCK_PRODUCTS = [
  {
    id: 'p-paisley-bandana',
    title: 'Paisley Bandana',
    handle: 'paisley-bandana',
    productType: 'Bandanas',
    vendor: 'sellanything.us',
    description:
      'A heritage paisley bandana cut from 100% combed cotton. Soft hand, double-stitched edges, breaks in beautifully. Wear it around your neck, your wrist, your head — there are no wrong answers.',
    materials: '100% combed cotton · double-stitched edges',
    care: 'Machine wash cold · tumble dry low',
    priceRange: {minVariantPrice: {amount: '18.00', currencyCode: 'USD'}},
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=900&q=80',
      altText: 'Model wearing paisley bandana',
    },
    images: [
      'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1200&q=80',
    ],
    options: [
      {name: 'Color', values: ['Black', 'Navy', 'Burgundy', 'Ecru']},
    ],
    tags: ['bandanas', 'new'],
  },
  {
    id: 'p-pet-bandana',
    title: 'Pet Bandana',
    handle: 'pet-bandana',
    productType: 'Pet',
    vendor: 'sellanything.us',
    description:
      'A bandana sized for your best friend. Soft-washed cotton with a hidden tie closure so it stays put on the wiggliest dog. Three sizes from puppy to big dog.',
    materials: '100% washed cotton',
    care: 'Hand wash cold · air dry',
    priceRange: {minVariantPrice: {amount: '12.00', currencyCode: 'USD'}},
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80',
      altText: 'Dog wearing a pet bandana',
    },
    images: [
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=1200&q=80',
    ],
    options: [
      {name: 'Color', values: ['Red Plaid', 'Navy', 'Sage', 'Mustard']},
      {name: 'Size', values: ['S', 'M', 'L']},
    ],
    tags: ['pet', 'new'],
  },
  {
    id: 'p-baseball-cap',
    title: 'Six-Panel Baseball Cap',
    handle: 'six-panel-baseball-cap',
    productType: 'Baseball Caps',
    vendor: 'sellanything.us',
    description:
      'A classic six-panel baseball cap with a structured crown, curved brim, and brass slide closure. Cut from washed cotton twill for an immediately broken-in feel — no awkward stiff phase.',
    materials: 'Washed cotton twill · brass closure',
    care: 'Spot clean · do not machine wash',
    priceRange: {minVariantPrice: {amount: '32.00', currencyCode: 'USD'}},
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=80',
      altText: 'Six-panel baseball cap',
    },
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517941823-815bea90d291?auto=format&fit=crop&w=1200&q=80',
    ],
    options: [
      {name: 'Color', values: ['Stone', 'Black', 'Olive', 'Cream']},
    ],
    tags: ['caps', 'best-seller'],
  },
  {
    id: 'p-bucket-hat',
    title: 'Classic Bucket Hat',
    handle: 'classic-bucket-hat',
    productType: 'Bucket Hats',
    vendor: 'sellanything.us',
    description:
      'A laid-back bucket hat in heavyweight cotton canvas with a slightly downward brim — equal parts beach, festival, and Sunday errand.',
    materials: 'Heavyweight cotton canvas',
    care: 'Machine wash cold · reshape and air dry',
    priceRange: {minVariantPrice: {amount: '28.00', currencyCode: 'USD'}},
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=900&q=80',
      altText: 'Classic cotton bucket hat',
    },
    images: [
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1622260614153-03223fb2c4b4?auto=format&fit=crop&w=1200&q=80',
    ],
    options: [
      {name: 'Color', values: ['Khaki', 'Black', 'White', 'Olive']},
    ],
    tags: ['hats', 'summer'],
  },
  {
    id: 'p-safari-hat',
    title: 'Wide-Brim Safari Hat',
    handle: 'wide-brim-safari-hat',
    productType: 'Safari Hats',
    vendor: 'sellanything.us',
    description:
      'A wide-brim safari hat in waxed canvas with a leather chin cord. Built for long walks under bright sun — generous brim for shade, lightweight crown that breathes.',
    materials: 'Waxed cotton canvas · leather chin cord',
    care: 'Spot clean · re-wax annually',
    priceRange: {minVariantPrice: {amount: '42.00', currencyCode: 'USD'}},
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80',
      altText: 'Wide-brim safari hat',
    },
    images: [
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=1200&q=80',
    ],
    options: [
      {name: 'Color', values: ['Khaki', 'Olive', 'Sand']},
    ],
    tags: ['hats', 'outdoor'],
  },
];

export function getMockProducts() {
  return MOCK_PRODUCTS;
}

export function findMockProduct(handle) {
  return MOCK_PRODUCTS.find((p) => p.handle === handle) ?? null;
}

export function relatedMockProducts(handle, limit = 3) {
  return MOCK_PRODUCTS.filter((p) => p.handle !== handle).slice(0, limit);
}
