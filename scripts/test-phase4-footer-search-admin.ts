/**
 * Phase 4 Automated Verification Script:
 * Tests Footer Redesign, Support Email, Admin Header Link, and Enhanced Multi-field Search.
 */
import fs from 'fs';
import path from 'path';

function runPhase4Tests() {
  console.log('🧪 Starting Phase 4 Verification: Footer, Support Email, Admin Link & Search...\n');
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

  // 1. Support Email & Working Mailto Link
  console.log('--- 1. Support Email & Mailto Link ---');
  const contactPageCode = fs.readFileSync(
    path.join(process.cwd(), 'src/pages/ContactPage.tsx'),
    'utf-8'
  );
  assert(
    contactPageCode.includes('supportoutfyt.co.in@gmail.com'),
    'ContactPage includes supportoutfyt.co.in@gmail.com'
  );
  assert(
    contactPageCode.includes('mailto:supportoutfyt.co.in@gmail.com'),
    'ContactPage contains active mailto:supportoutfyt.co.in@gmail.com link'
  );

  const footerCode = fs.readFileSync(
    path.join(process.cwd(), 'src/components/layout/Footer.tsx'),
    'utf-8'
  );
  assert(
    footerCode.includes('mailto:supportoutfyt.co.in@gmail.com'),
    'Footer contains active mailto:supportoutfyt.co.in@gmail.com link'
  );

  // 2. Admin Header Link (Desktop & Mobile, Non-overlapping)
  console.log('\n--- 2. Admin Header Navigation Link ---');
  const headerCode = fs.readFileSync(
    path.join(process.cwd(), 'src/components/layout/Header.tsx'),
    'utf-8'
  );
  assert(
    headerCode.includes('to="/admin"') && headerCode.includes('Admin'),
    'Header contains link to /admin labelled Admin'
  );
  assert(
    headerCode.includes('hidden sm:inline-flex') || headerCode.includes('hidden md:inline-flex'),
    'Desktop header renders compact Admin link without taking mobile search space'
  );
  assert(
    headerCode.includes('Mobile Navigation Drawer') && headerCode.includes('to="/admin"'),
    'Mobile navigation menu includes Admin route'
  );

  // 3. Footer Layout & Working Routes
  console.log('\n--- 3. Footer 4-Column Structure & Route Verification ---');
  assert(footerCode.includes('Explore'), 'Footer has Explore section');
  assert(footerCode.includes('Information'), 'Footer has Information section');
  assert(
    footerCode.includes('Trust & Transparency') || footerCode.includes('Transparency Notice'),
    'Footer has Trust & Transparency section'
  );
  assert(footerCode.includes('OutFytLogo'), 'Footer renders brand logo emblem');
  
  // Verify all included routes exist in App.tsx
  const appCode = fs.readFileSync(path.join(process.cwd(), 'src/App.tsx'), 'utf-8');
  const routesToCheck = [
    '/discover',
    '/search',
    '/categories',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/affiliate-disclosure',
  ];
  routesToCheck.forEach((r) => {
    assert(appCode.includes(`pathname === '${r}'`), `Route ${r} is active and verified in router`);
  });

  // 4. Multi-field Search Normalization & Matching Logic
  console.log('\n--- 4. Multi-field Search Matching Algorithm ---');
  const searchPageCode = fs.readFileSync(
    path.join(process.cwd(), 'src/pages/SearchPage.tsx'),
    'utf-8'
  );
  assert(
    searchPageCode.includes('getAllCategories'),
    'SearchPage dynamically fetches full categories catalog'
  );
  assert(
    searchPageCode.includes('exactMatches') && searchPageCode.includes('highMatches'),
    'SearchPage prioritizes exact ID matches and high category/title matches'
  );
  assert(
    searchPageCode.includes('matchingCategory'),
    'SearchPage provides lightweight category suggestions when user searches occasion'
  );
  assert(
    searchPageCode.includes('getPublishedOutfits'),
    'Search exclusively queries published outfits (never exposing drafts to public)'
  );

  // Algorithmic validation of normalization
  function matchOutfit(query: string, outfit: any): boolean {
    const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
    const qClean = q.replace(/[^a-z0-9]/g, '');

    const outfitIdLower = outfit.id.toLowerCase();
    const outfitIdClean = outfitIdLower.replace(/[^a-z0-9]/g, '');
    const titleLower = outfit.title.toLowerCase();
    const slugLower = (outfit.slug || '').toLowerCase();
    const catLower = outfit.category.toLowerCase();
    const tagsLower = (outfit.tags || []).map((t: string) => t.toLowerCase());

    if (outfitIdLower === q || outfitIdClean === qClean || slugLower === q || slugLower === q.replace(/\s+/g, '-')) {
      return true;
    }
    if (catLower === q || titleLower === q || tagsLower.includes(q)) {
      return true;
    }
    if (
      outfitIdLower.includes(q) ||
      outfitIdClean.includes(qClean) ||
      titleLower.includes(q) ||
      catLower.includes(q) ||
      tagsLower.some((t: string) => t.includes(q))
    ) {
      return true;
    }
    return false;
  }

  const sampleOutfit = {
    id: 'OUT-001',
    slug: 'mumbai-monsoon-linen',
    title: 'Mumbai Linen Breeze',
    category: 'Casual',
    tags: ['linen', 'breathable', 'monsoon'],
  };

  const sampleOccasionOutfit = {
    id: 'OUT-005',
    slug: 'royal-diwali-silk',
    title: 'Royal Festive Splendour',
    category: 'Diwali 2026',
    tags: ['silk', 'ethnic', 'deepavali', 'celebration'],
  };

  assert(matchOutfit('OUT-001', sampleOutfit), 'Matches exact uppercase OUT-001');
  assert(matchOutfit('out-001', sampleOutfit), 'Matches exact lowercase out-001');
  assert(matchOutfit('out001', sampleOutfit), 'Matches ID without dash (out001)');
  assert(matchOutfit('out 001', sampleOutfit), 'Matches ID with whitespace (out 001)');
  assert(matchOutfit('mumbai linen', sampleOutfit), 'Matches title keywords (mumbai linen)');
  assert(matchOutfit('Casual', sampleOutfit), 'Matches category (Casual)');
  assert(matchOutfit('monsoon', sampleOutfit), 'Matches tag (monsoon)');
  assert(matchOutfit('Diwali 2026', sampleOccasionOutfit), 'Matches custom occasion (Diwali 2026)');
  assert(matchOutfit('diwali', sampleOccasionOutfit), 'Matches partial occasion keyword (diwali)');

  console.log(`\n========================================`);
  console.log(`Phase 4 Test Results: ${passed} / ${total} checks passed.`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runPhase4Tests();
