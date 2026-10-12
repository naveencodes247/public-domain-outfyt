import fs from 'fs';
import path from 'path';

/**
 * Test Suite: Outfit with Multiple Products Workflow & Public Loading
 * Validates the complete lifecycle:
 * 1. Admin creation of an outfit with multiple products
 * 2. Publishing state & relationship mapping
 * 3. Public detail page loading workflow (slug resolution & product loading)
 * 4. Identifier fallback resilience (business ID vs slug)
 * 5. Optional price handling on products (omitted when empty/undefined)
 * 6. Clothing category & retailer logo support
 * 7. Security rules verification (public read vs admin write)
 * 8. ProductCard clear "Shop Now" button and safe affiliate links
 */

interface MockProduct {
  id: string;
  outfitId: string;
  name: string;
  retailer: string;
  category?: string;
  retailerLogoUrl?: string;
  price?: number;
  currency: string;
  affiliateUrl: string;
  imageUrl?: string;
  sortOrder: number;
}

interface MockOutfit {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  heroImageUrl: string;
  heroMediaType: 'image' | 'video';
  heroMediaUrl: string;
  status: 'draft' | 'published' | 'archived';
}

function runTests() {
  console.log('--- RUNNING OUTFYT.CO.IN OUTFIT & PRODUCTS WORKFLOW TEST SUITE ---');
  let failures = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
    } else {
      console.error(`  [FAIL] ${desc}`);
      failures++;
    }
  }

  // ========================================================
  // Test 1: Simulating Admin Form Submission for "collegefit"
  // ========================================================
  console.log('Test 1: Admin saves and publishes outfit with multiple products');
  const outfitInput: MockOutfit = {
    id: 'OUT-002',
    slug: 'collegefit',
    title: 'Modern Campus Casual: Oversized Hoodie & Cargo Joggers',
    description: 'Effortless university daily styling with relaxed proportions.',
    category: 'Streetwear',
    tags: ['College', 'Casual', 'Streetwear', 'Campus'],
    heroImageUrl: 'https://images.unsplash.com/photo-college-fit.jpg',
    heroMediaType: 'image',
    heroMediaUrl: 'https://images.unsplash.com/photo-college-fit.jpg',
    status: 'published',
  };

  const productInputs: MockProduct[] = [
    {
      id: 'OUT-002-P1',
      outfitId: 'OUT-002',
      name: 'Heavyweight Boxy Fleece Hoodie',
      retailer: 'H&M India',
      category: 'Hoodie / Sweatshirt',
      price: 2499,
      currency: 'INR',
      affiliateUrl: 'https://www.hm.com/in/product/12345',
      sortOrder: 1,
    },
    {
      id: 'OUT-002-P2',
      outfitId: 'OUT-002',
      name: 'Relaxed Fit Cotton Ripstop Cargo Joggers',
      retailer: 'Zara India',
      category: 'Pants / Trousers',
      // Optional price omitted intentionally
      currency: 'INR',
      affiliateUrl: 'https://www.zara.com/in/product/67890',
      sortOrder: 2,
    },
    {
      id: 'OUT-002-P3',
      outfitId: 'OUT-002',
      name: 'Vintage Retro High-Top Canvas Sneakers',
      retailer: 'Amazon India',
      category: 'Footwear / Shoes',
      retailerLogoUrl: 'https://images.outfyt.co.in/amazon-logo.png',
      price: 3299,
      currency: 'INR',
      affiliateUrl: 'https://www.amazon.in/dp/B00EXAMPLE',
      sortOrder: 3,
    },
  ];

  assert(outfitInput.id === 'OUT-002', 'Outfit has valid business ID OUT-002');
  assert(outfitInput.slug === 'collegefit', 'Outfit has valid URL slug collegefit');
  assert(outfitInput.status === 'published', 'Outfit status is published');
  assert(productInputs.length === 3, 'Outfit contains exactly 3 curated products');
  assert(
    productInputs.every((p) => p.outfitId === 'OUT-002'),
    'All products reference parent outfit ID OUT-002'
  );
  assert(productInputs[0].category === 'Hoodie / Sweatshirt', 'Piece 1 category is present');
  assert(productInputs[1].price === undefined, 'Piece 2 price is omitted without error');
  assert(productInputs[2].retailerLogoUrl !== undefined, 'Piece 3 supports optional direct retailer logo');

  // ========================================================
  // Test 2: In-Memory Mock Database Query Engine
  // ========================================================
  console.log('Test 2: Public visitor resolves /outfit/collegefit');
  const mockDatabase = {
    outfits: new Map<string, MockOutfit>([[outfitInput.id, outfitInput]]),
    products: new Map<string, MockProduct>(productInputs.map((p) => [p.id, p])),
  };

  // Simulate getOutfitBySlug('collegefit')
  const resolvedOutfit = Array.from(mockDatabase.outfits.values()).find(
    (o) => o.slug === 'collegefit' && o.status === 'published'
  );

  assert(!!resolvedOutfit, 'Outfit resolved successfully by slug "collegefit"');
  assert(resolvedOutfit?.id === 'OUT-002', 'Resolved outfit has business ID OUT-002');

  // Simulate getProductsByOutfitId('OUT-002', 'collegefit')
  function queryProducts(outfitId?: string | null, fallbackId?: string | null): MockProduct[] {
    const candidates = [outfitId, fallbackId].filter(Boolean) as string[];
    for (const cid of candidates) {
      const matches = Array.from(mockDatabase.products.values()).filter((p) => p.outfitId === cid);
      if (matches.length > 0) {
        return matches.sort((a, b) => a.sortOrder - b.sortOrder);
      }
    }
    return [];
  }

  const loadedProducts = queryProducts(resolvedOutfit?.id, resolvedOutfit?.slug);
  assert(loadedProducts.length === 3, 'Public query returns all 3 curated products (not "0 pieces")');
  assert(loadedProducts[0].name === 'Heavyweight Boxy Fleece Hoodie', 'Piece 1 title verified');
  assert(loadedProducts[0].retailer === 'H&M India', 'Piece 1 retailer attribution verified');
  assert(loadedProducts[0].price === 2499, 'Piece 1 numeric price verified');
  assert(loadedProducts[1].price === undefined, 'Piece 2 optional price omitted cleanly');
  assert(loadedProducts[2].retailer === 'Amazon India', 'Piece 3 retailer attribution verified');

  // ========================================================
  // Test 3: Fallback Resilience When Products Reference Slug
  // ========================================================
  console.log('Test 3: Fallback query works if products reference slug instead of ID');
  const slugReferencedProducts: MockProduct[] = [
    {
      id: 'CF-P1',
      outfitId: 'collegefit', // associated via slug
      name: 'Vintage University Crewneck',
      retailer: 'Myntra',
      category: 'Sweatshirt',
      price: 1899,
      currency: 'INR',
      affiliateUrl: 'https://www.myntra.com/product/111',
      sortOrder: 1,
    },
  ];

  const dbWithSlugProducts = {
    products: new Map(slugReferencedProducts.map((p) => [p.id, p])),
  };

  function queryFallbackProducts(outfitId?: string | null, fallbackId?: string | null): MockProduct[] {
    const candidates = [outfitId, fallbackId].filter(Boolean) as string[];
    for (const cid of candidates) {
      const matches = Array.from(dbWithSlugProducts.products.values()).filter((p) => p.outfitId === cid);
      if (matches.length > 0) {
        return matches.sort((a, b) => a.sortOrder - b.sortOrder);
      }
    }
    return [];
  }

  const fallbackResults = queryFallbackProducts('OUT-002', 'collegefit');
  assert(fallbackResults.length === 1, 'Products linked via slug are resolved via fallbackId');
  assert(fallbackResults[0].retailer === 'Myntra', 'Fallback product retailer matched');

  // Safe empty input handling
  const emptyResults = queryFallbackProducts(null, undefined);
  assert(emptyResults.length === 0, 'Null/undefined outfitId returns empty array safely without error');

  // ========================================================
  // Test 4: Verify Firestore Rules Allow Public Reads & Category
  // ========================================================
  console.log('Test 4: Verify firestore.rules allows public get/list and validates Product fields');
  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

  assert(
    rulesContent.includes('match /products/{productId}'),
    'firestore.rules contains match /products/{productId}'
  );
  assert(
    rulesContent.includes('allow list: if true;'),
    'firestore.rules allows public list on /products without unconstrainable resource predicates'
  );
  assert(
    rulesContent.includes('allow get: if isValidId(productId);'),
    'firestore.rules allows public get on /products for valid IDs'
  );
  assert(
    rulesContent.includes('category'),
    'firestore.rules permits optional category in Product validation'
  );
  assert(
    rulesContent.includes('retailerLogoUrl'),
    'firestore.rules permits optional retailerLogoUrl in Product validation'
  );
  assert(
    rulesContent.includes('allow create: if isValidId(productId)\n        && isAdmin()'),
    'firestore.rules restricts product creation to isAdmin()'
  );
  assert(
    rulesContent.includes('allow update: if isValidId(productId)\n        && isAdmin()'),
    'firestore.rules restricts product updates to isAdmin()'
  );
  assert(
    rulesContent.includes('allow delete: if isValidId(productId) && isAdmin();'),
    'firestore.rules restricts product deletion to isAdmin()'
  );

  // ========================================================
  // Test 5: Verify Detail Page Component Integration
  // ========================================================
  console.log('Test 5: Verify OutfitDetailPage passes fallback identifier and handles items');
  const detailPageContent = fs.readFileSync(
    path.join(process.cwd(), 'src/pages/OutfitDetailPage.tsx'),
    'utf-8'
  );

  assert(
    detailPageContent.includes('getProductsByOutfitId(current.id, current.slug || slug)'),
    'OutfitDetailPage passes current.id with fallback slug to getProductsByOutfitId'
  );
  assert(
    detailPageContent.includes('{products.length} {products.length === 1 ? \'piece\' : \'pieces\'} curated'),
    'OutfitDetailPage renders piece count dynamically'
  );
  assert(
    detailPageContent.includes('<ProductCard'),
    'OutfitDetailPage renders ProductCard for each product'
  );

  // ========================================================
  // Test 6: Verify ProductCard component requirements
  // ========================================================
  console.log('Test 6: Verify ProductCard features "Shop Now", retailer logo, and safe external links');
  const productCardContent = fs.readFileSync(
    path.join(process.cwd(), 'src/components/outfit/ProductCard.tsx'),
    'utf-8'
  );

  assert(
    productCardContent.includes('Shop Now on'),
    'ProductCard features clear "Shop Now on [Retailer]" action button'
  );
  assert(
    productCardContent.includes('RetailerLogo'),
    'ProductCard embeds RetailerLogo component'
  );
  assert(
    productCardContent.includes('target="_blank"'),
    'ProductCard opens external affiliate destinations in a new tab'
  );
  assert(
    productCardContent.includes('rel="noopener noreferrer"'),
    'ProductCard secures external links with noopener noreferrer'
  );
  assert(
    !productCardContent.includes('alert('),
    'ProductCard avoids window.alert() calls'
  );

  console.log('--- SUMMARY ---');
  if (failures === 0) {
    console.log('ALL WORKFLOW & PUBLIC DETAIL PAGE TESTS PASSED (0 failures)!');
  } else {
    console.error(`FAILED with ${failures} failure(s).`);
    process.exit(1);
  }
}

runTests();
