import fs from 'fs';
import path from 'path';
import { getCategoryIcon } from '../src/utils/categoryIcons';

function runPhase2Tests() {
  console.log('--- RUNNING PHASE 2: PRODUCT CARDS, RETAILER LOGOS & DISCLOSURE REMOVAL TEST SUITE ---');
  let failures = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
    } else {
      console.error(`  [FAIL] ${desc}`);
      failures++;
    }
  }

  // Test 1: Category Icon Functionality
  console.log('Test 1: Category Icon Mapping for Men and Women');
  const shirtIcon = getCategoryIcon('Shirt');
  assert(shirtIcon !== null && typeof shirtIcon === 'object', 'Shirt category resolves an icon element');

  const pantsIcon = getCategoryIcon('Pants / Trousers');
  assert(pantsIcon !== null && typeof pantsIcon === 'object', 'Pants category resolves an icon element');

  const shoesIcon = getCategoryIcon('Sneakers');
  assert(shoesIcon !== null && typeof shoesIcon === 'object', 'Sneakers category resolves an icon element');

  const dressIcon = getCategoryIcon('Dress');
  assert(dressIcon !== null && typeof dressIcon === 'object', 'Dress category resolves an icon element');

  const watchIcon = getCategoryIcon('Watch');
  assert(watchIcon !== null && typeof watchIcon === 'object', 'Watch category resolves an icon element');

  const bagIcon = getCategoryIcon('Handbag');
  assert(bagIcon !== null && typeof bagIcon === 'object', 'Bag category resolves an icon element');

  const jewelIcon = getCategoryIcon('Jewellery');
  assert(jewelIcon !== null && typeof jewelIcon === 'object', 'Jewellery category resolves an icon element');

  const customIcon = getCategoryIcon('Custom Statement Piece');
  assert(customIcon !== null && typeof customIcon === 'object', 'Custom category resolves a fallback icon element');

  // Test 2: ProductCard component verification
  console.log('Test 2: ProductCard Component Enhancements');
  const productCardSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/outfit/ProductCard.tsx'),
    'utf-8'
  );

  assert(
    productCardSrc.includes('getCategoryIcon(product.category'),
    'ProductCard embeds category icon in category badge and missing-image placeholder'
  );
  assert(
    productCardSrc.includes('min-h-[44px]'),
    'ProductCard shopping button enforces 44px minimum touch target for mobile usability'
  );
  assert(
    productCardSrc.includes('Shop Now on ${product.retailer'),
    'ProductCard action button identifies the specific retailer clearly'
  );
  assert(
    productCardSrc.includes('rel="noopener noreferrer"'),
    'ProductCard external affiliate destination link handles security properly'
  );

  // Test 3: OutfitDetailPage Large Disclosure Box Removal
  console.log('Test 3: OutfitDetailPage Disclosure Card Removal');
  const outfitDetailSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/pages/OutfitDetailPage.tsx'),
    'utf-8'
  );

  assert(
    !outfitDetailSrc.includes('Affiliate Transparency Disclosure'),
    'Large "Affiliate Transparency Disclosure" card successfully removed from OutfitDetailPage'
  );

  // Test 4: Disclosure Page and Footer Preservation
  console.log('Test 4: Disclosure Routes & Transparency Preservation');
  const disclosurePageExists = fs.existsSync(
    path.resolve(process.cwd(), 'src/pages/AffiliateDisclosurePage.tsx')
  );
  assert(disclosurePageExists, 'Dedicated AffiliateDisclosurePage route remains intact');

  const footerSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/layout/Footer.tsx'),
    'utf-8'
  );
  assert(
    footerSrc.includes('Affiliate Notice:') && footerSrc.includes('/affiliate-disclosure'),
    'Footer preserves concise transparency disclosure and link to dedicated disclosure page'
  );

  console.log(`\n--- PHASE 2 SUMMARY: ${failures === 0 ? 'ALL TESTS PASSED' : `${failures} FAILURES`} ---`);
  if (failures > 0) {
    process.exit(1);
  }
}

runPhase2Tests();
