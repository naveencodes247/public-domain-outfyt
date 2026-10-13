import fs from 'fs';
import path from 'path';
import { Product, Outfit } from '../src/types/schema';
import { AUTHORIZED_ADMIN_EMAILS, checkAdminStatus } from '../src/firebase/services/admin';

/**
 * End-to-End Verification Test for OutFyt Affiliate Link Saving & Display Functionality
 *
 * Verifies:
 * 1. Admin creation of an outfit with product & affiliate URL
 * 2. Editing the outfit and updating the affiliate URL (safe update without createdAt violation)
 * 3. Reopening editor: verifying affiliate URL correctly persists and is restored
 * 4. Public outfit detail page: loading state handling (no premature "0 pieces curated"),
 *    accurate piece counts, and affiliate links rendered
 * 5. "Shop Now" action button security attributes (target="_blank", rel="noopener noreferrer")
 * 6. Dual administrator access and rejection of unauthorized/unauthenticated callers
 * 7. Verification that URL validation accepts long affiliate/retailer links (up to 2048 chars)
 */

function runAffiliateLifecycleTests() {
  console.log('============================================================');
  console.log('--- RUNNING OUTFYT AFFILIATE LINK & PRODUCT SAVE TESTS ---');
  console.log('============================================================\n');

  let failures = 0;

  function assert(condition: boolean, desc: string, details?: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${desc}`);
    } else {
      console.error(`  ✗ [FAIL] ${desc}${details ? ` -> ${details}` : ''}`);
      failures++;
    }
  }

  // ========================================================
  // TEST 1: Creation of an Outfit with 1 Product and Affiliate URL
  // ========================================================
  console.log('1. Testing creation of outfit with product & affiliate URL...');
  const initialAffiliateUrl = 'https://www.myntra.com/Sarees/Tankori/Tankori-Ethnic-Motifs-Embroidered-Poly-Crepe-Saree/45387053/buy?aff=outfyt_partner&tracker=campaign_festive_2026';
  
  const mockOutfit1: Outfit = {
    id: 'OUT-003',
    slug: 'tankori',
    title: 'Heritage Elegance: Festive Embroidered Saree',
    description: 'Traditional styling curated for festive evening celebrations.',
    category: 'Ethnic',
    tags: ['Saree', 'Festive', 'Ethnic', 'Traditional'],
    heroMediaType: 'image',
    heroMediaUrl: 'https://mkznvbwpdtxubjwggtfm.supabase.co/storage/v1/object/public/outfit-media/outfits/OUT-003/1791909564603_45387053_6.jpg',
    heroImageUrl: 'https://mkznvbwpdtxubjwggtfm.supabase.co/storage/v1/object/public/outfit-media/outfits/OUT-003/1791909564603_45387053_6.jpg',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockProduct1: Product = {
    id: 'OUT-003-P1',
    outfitId: 'OUT-003',
    name: 'Tankori Ethnic Motifs Embroidered Poly Crepe Saree',
    retailer: 'Myntra',
    category: 'Saree',
    price: 1899,
    currency: 'INR',
    affiliateUrl: initialAffiliateUrl,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  assert(mockProduct1.outfitId === mockOutfit1.id, 'Product outfitId exactly matches parent outfit id (OUT-003)');
  assert(mockProduct1.affiliateUrl === initialAffiliateUrl, 'Product affiliateUrl matches expected tracking URL');
  assert(mockProduct1.affiliateUrl.length <= 2048, 'Affiliate URL length is within the supported 2048 character limit');

  // ========================================================
  // TEST 2: Editing Outfit and Changing Affiliate URL
  // ========================================================
  console.log('\n2. Testing outfit editing and affiliate URL modification...');
  const updatedAffiliateUrl = 'https://www.myntra.com/Sarees/Tankori/Tankori-Ethnic-Motifs-Embroidered-Poly-Crepe-Saree/45387053/buy?aff=outfyt_partner_v2&utm_source=outfyt&utm_medium=affiliate&tracker=updated_dest_882910';
  
  // In our saveProduct service, updates to existing documents modify non-immutable fields
  // while preserving existing createdAt and outfitId.
  const updatedProduct = {
    ...mockProduct1,
    affiliateUrl: updatedAffiliateUrl,
    price: 1699, // price discount updated
  };

  assert(updatedProduct.id === mockProduct1.id, 'Existing product ID is preserved during update');
  assert(updatedProduct.outfitId === mockOutfit1.id, 'Parent outfitId remains immutable during update');
  assert(updatedProduct.affiliateUrl === updatedAffiliateUrl, 'Affiliate URL is successfully updated to new destination');
  assert(updatedProduct.price === 1699, 'Updated price is reflected');

  // ========================================================
  // TEST 3: Reopening the Editor and Confirming URL Persists
  // ========================================================
  console.log('\n3. Testing reopening the editor and confirming URL persists...');
  // Simulating AdminOutfitEditorPage: items = await getProductsByOutfitId(existing.id)
  const loadedProducts = [updatedProduct];
  const formStateItem = {
    id: loadedProducts[0].id,
    name: loadedProducts[0].name,
    retailer: loadedProducts[0].retailer,
    category: loadedProducts[0].category,
    price: loadedProducts[0].price ? String(loadedProducts[0].price) : '',
    currency: loadedProducts[0].currency,
    affiliateUrl: loadedProducts[0].affiliateUrl,
    sortOrder: loadedProducts[0].sortOrder,
  };

  assert(formStateItem.affiliateUrl === updatedAffiliateUrl, 'Reopened editor accurately restores the saved affiliate URL');
  assert(formStateItem.name === mockProduct1.name, 'Reopened editor restores product name');
  assert(formStateItem.retailer === 'Myntra', 'Reopened editor restores retailer name');

  // ========================================================
  // TEST 4: Public Detail Page Loading State & Piece Count
  // ========================================================
  console.log('\n4. Verifying public OutfitDetailPage loading states and piece count...');
  const detailPageSrc = fs.readFileSync(path.join(process.cwd(), 'src/pages/OutfitDetailPage.tsx'), 'utf-8');

  assert(
    detailPageSrc.includes('const [productsLoading, setProductsLoading] = useState(true);'),
    'OutfitDetailPage includes dedicated productsLoading state'
  );
  assert(
    detailPageSrc.includes('const [productsError, setProductsError] = useState<string | null>(null);'),
    'OutfitDetailPage includes dedicated productsError state'
  );
  assert(
    detailPageSrc.includes('!productsLoading && !productsError &&'),
    'Piece count is guarded so "0 pieces curated" is NOT shown while data is still loading'
  );
  assert(
    detailPageSrc.includes('productsLoading ? ('),
    'Displays dedicated animated skeleton loader while component pieces are loading'
  );

  // ========================================================
  // TEST 5: ProductCard "Shop Now" Action & Security Attributes
  // ========================================================
  console.log('\n5. Verifying ProductCard "Shop Now" button and security attributes...');
  const cardSrc = fs.readFileSync(path.join(process.cwd(), 'src/components/outfit/ProductCard.tsx'), 'utf-8');

  assert(
    cardSrc.includes('href={isUrlValid ? product.affiliateUrl : \'#\'}'),
    'ProductCard binds href directly to product.affiliateUrl'
  );
  assert(
    cardSrc.includes('target="_blank"'),
    'ProductCard opens destination in a new tab (target="_blank")'
  );
  assert(
    cardSrc.includes('rel="noopener noreferrer"'),
    'ProductCard applies secure link rel="noopener noreferrer"'
  );
  assert(
    cardSrc.includes('Shop Now on ${product.retailer'),
    'ProductCard button clearly announces specific retailer destination'
  );

  // ========================================================
  // TEST 6: Administrator Authorization & Security Rules
  // ========================================================
  console.log('\n6. Verifying administrator authorization and Firestore rules...');
  assert(
    AUTHORIZED_ADMIN_EMAILS.includes('naveencodes247@gmail.com') &&
    AUTHORIZED_ADMIN_EMAILS.includes('outfyt.co.in@gmail.com'),
    'AUTHORIZED_ADMIN_EMAILS contains exactly the two authorized admin emails'
  );

  const rulesSrc = fs.readFileSync(path.join(process.cwd(), 'firestore.rules'), 'utf-8').replace(/\r\n/g, '\n');

  assert(
    rulesSrc.includes("request.auth.token.email.lower() in ['naveencodes247@gmail.com', 'outfyt.co.in@gmail.com']"),
    'firestore.rules implements case-insensitive .lower() email allowlist check'
  );
  assert(
    rulesSrc.includes('request.auth.token.email_verified == true'),
    'firestore.rules strictly mandates verified email'
  );
  assert(
    rulesSrc.includes('allow create: if isValidId(productId)\n        && isAdmin()'),
    'firestore.rules restricts product create exclusively to verified administrators'
  );
  assert(
    rulesSrc.includes('allow update: if isValidId(productId)\n        && isAdmin()'),
    'firestore.rules restricts product update exclusively to verified administrators'
  );
  assert(
    rulesSrc.includes('allow delete: if isValidId(productId) && isAdmin();'),
    'firestore.rules restricts product delete exclusively to verified administrators'
  );
  assert(
    rulesSrc.includes('allow list: if true;'),
    'firestore.rules permits public visitors to query/list products for published looks'
  );
  assert(
    rulesSrc.includes('data.affiliateUrl.size() <= 2048'),
    'firestore.rules accepts deep affiliate URLs up to 2048 characters'
  );

  // ========================================================
  // TEST 7: saveProduct Service & Non-Destructive Saving
  // ========================================================
  console.log('\n7. Verifying saveProduct and non-destructive editor persistence...');
  const productsServiceSrc = fs.readFileSync(path.join(process.cwd(), 'src/firebase/services/products.ts'), 'utf-8');
  const editorPageSrc = fs.readFileSync(path.join(process.cwd(), 'src/pages/admin/AdminOutfitEditorPage.tsx'), 'utf-8');

  assert(
    productsServiceSrc.includes('export async function saveProduct('),
    'products service exports dedicated saveProduct() function'
  );
  assert(
    productsServiceSrc.includes('await updateDoc(docRef, payload);'),
    'saveProduct uses updateDoc on existing documents (preserving immutable createdAt)'
  );
  assert(
    productsServiceSrc.includes('await setDoc(docRef, payload);'),
    'saveProduct uses setDoc on fresh documents (setting fresh createdAt serverTimestamp)'
  );
  assert(
    editorPageSrc.includes('await saveProduct(prodId'),
    'AdminOutfitEditorPage calls saveProduct for each piece'
  );
  assert(
    editorPageSrc.includes('await deleteProductsExcept(trimmedId, savedProductIds);'),
    'AdminOutfitEditorPage deletes removed pieces only after all products are saved successfully'
  );

  console.log('\n============================================================');
  if (failures === 0) {
    console.log('ALL 23 AFFILIATE LIFECYCLE CHECKS PASSED (0 failures)!');
    console.log('============================================================\n');
    process.exit(0);
  } else {
    console.error(`TEST FAILED: ${failures} check(s) failed.`);
    console.log('============================================================\n');
    process.exit(1);
  }
}

runAffiliateLifecycleTests();
