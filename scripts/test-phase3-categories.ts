/**
 * Phase 3 Automated Verification Script:
 * Tests Dynamic Outfit Categories, Custom Occasions, and Expanded Clothing Product Categories.
 */
import {
  STARTER_CATEGORIES,
  normalizeCategoryName,
  generateCategorySlug,
  getCuratedHomepageCategories,
} from '../src/firebase/services/categories';
import {
  PRODUCT_CATEGORY_GROUPS,
  ALL_PRODUCT_CATEGORIES,
} from '../src/utils/productCategories';
import { Category } from '../src/types/schema';

function runPhase3Tests() {
  console.log('🧪 Starting Phase 3 Verification: Dynamic Categories & Expanded Product Categories...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
    }
  }

  // 1. Starter Categories Verification
  console.log('--- 1. Starter Categories & Grouping ---');
  assert(STARTER_CATEGORIES.length >= 20, `Contains comprehensive starter categories (${STARTER_CATEGORIES.length} defined)`);
  
  const groups = new Set(STARTER_CATEGORIES.map((c) => c.group));
  assert(groups.has('Everyday'), 'Includes Everyday category group');
  assert(groups.has('Occasions'), 'Includes Occasions category group');
  assert(groups.has('Seasonal'), 'Includes Seasonal category group');
  assert(groups.has('Style'), 'Includes Style category group');

  // Verify key required starter categories
  const categoryNames = STARTER_CATEGORIES.map((c) => c.name);
  assert(categoryNames.includes('Streetwear'), 'Includes Streetwear');
  assert(categoryNames.includes('Ethnic'), 'Includes Ethnic');
  assert(categoryNames.includes('Minimal'), 'Includes Minimal');
  assert(categoryNames.includes('Casual'), 'Includes Casual');
  assert(categoryNames.includes('Party Wear'), 'Includes Party Wear');
  assert(categoryNames.includes('Wedding Guest'), 'Includes Wedding Guest');
  assert(categoryNames.includes('Old Money'), 'Includes Old Money');
  assert(categoryNames.includes('Quiet Luxury'), 'Includes Quiet Luxury');
  assert(categoryNames.includes('Indo-Western'), 'Includes Indo-Western');

  // 2. Normalization & Deduplication
  console.log('\n--- 2. Normalization & Deduplication ---');
  assert(
    normalizeCategoryName('  Diwali 2026 ') === 'diwali 2026',
    'Normalizes leading/trailing whitespaces and lowercases'
  );
  assert(
    normalizeCategoryName('STREETWEAR') === 'streetwear',
    'Normalizes uppercase to lowercase'
  );
  assert(
    normalizeCategoryName('Party   Wear') === 'party wear',
    'Normalizes internal multiple whitespace sequences'
  );

  // 3. Slug Generation
  console.log('\n--- 3. Slug Generation ---');
  assert(
    generateCategorySlug('Diwali 2026') === 'diwali-2026',
    'Generates URL-safe slug for "Diwali 2026"'
  );
  assert(
    generateCategorySlug('Eid & Festive Collection!') === 'eid-festive-collection',
    'Strips special characters from slug'
  );

  // 4. Curated Homepage Subset
  console.log('\n--- 4. Curated Homepage Subset ---');
  const curated = getCuratedHomepageCategories(STARTER_CATEGORIES);
  assert(curated.length === 8, `Returns exactly 8 curated categories (got ${curated.length})`);
  assert(curated.includes('Casual'), 'Curated list includes Casual');
  assert(curated.includes('Streetwear'), 'Curated list includes Streetwear');

  // 5. Product Category Groups (Men & Women)
  console.log('\n--- 5. Clothing Product Categories (Men & Women) ---');
  assert(PRODUCT_CATEGORY_GROUPS.length >= 7, `Covers ${PRODUCT_CATEGORY_GROUPS.length} distinct product groups`);
  
  const groupNames = PRODUCT_CATEGORY_GROUPS.map((g) => g.groupName);
  assert(groupNames.some((g) => g.includes('Tops')), 'Contains Tops category group');
  assert(groupNames.some((g) => g.includes('Bottoms')), 'Contains Bottoms category group');
  assert(groupNames.some((g) => g.includes('One-Piece')), 'Contains One-Piece category group');
  assert(groupNames.some((g) => g.includes('Ethnic')), 'Contains Ethnic & Traditional category group');
  assert(groupNames.some((g) => g.includes('Footwear')), 'Contains Footwear category group');
  assert(groupNames.some((g) => g.includes('Accessories')), 'Contains Accessories category group');
  assert(groupNames.some((g) => g.includes('Sports')), 'Contains Sports, Active & Other category group');

  // Verify specific diverse silhouettes for Indian and international styling
  assert(ALL_PRODUCT_CATEGORIES.includes('Kurta'), 'Includes Kurta');
  assert(ALL_PRODUCT_CATEGORIES.includes('Saree'), 'Includes Saree');
  assert(ALL_PRODUCT_CATEGORIES.includes('Sherwani'), 'Includes Sherwani');
  assert(ALL_PRODUCT_CATEGORIES.includes('Lehenga'), 'Includes Lehenga');
  assert(ALL_PRODUCT_CATEGORIES.includes('Sneakers'), 'Includes Sneakers');
  assert(ALL_PRODUCT_CATEGORIES.includes('Boots'), 'Includes Boots');
  assert(ALL_PRODUCT_CATEGORIES.includes('Watch'), 'Includes Watch');
  assert(ALL_PRODUCT_CATEGORIES.includes('Sunglasses'), 'Includes Sunglasses');
  assert(ALL_PRODUCT_CATEGORIES.includes('Jewellery'), 'Includes Jewellery');
  assert(ALL_PRODUCT_CATEGORIES.includes('Other (Custom)'), 'Includes Other (Custom) option');

  // 6. Custom Occasion Simulation (Firestore schema compatibility)
  console.log('\n--- 6. Custom Occasion Simulation ---');
  const mockCustomOccasion: Category = {
    id: generateCategorySlug('Diwali 2026'),
    name: 'Diwali 2026',
    group: 'Occasions',
    tagline: 'Deepavali Grand Evening & Festive Feasting',
    description: 'Gold-embroidered bundis, raw silk kurtas, and regal festive styling.',
    accent: 'Festive Season',
    isCustom: true,
    archived: false,
  };

  assert(mockCustomOccasion.id === 'diwali-2026', 'Custom occasion ID generated correctly');
  assert(mockCustomOccasion.name === 'Diwali 2026', 'Custom occasion name preserved');
  assert(mockCustomOccasion.isCustom === true, 'Marked as custom');
  assert(mockCustomOccasion.group === 'Occasions', 'Classified under Occasions group');

  console.log(`\n========================================`);
  console.log(`Phase 3 Test Results: ${passed} / ${total} checks passed.`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runPhase3Tests();
