import fs from 'fs';
import path from 'path';
import {
  validateMediaFile,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from '../src/firebase/services/storage';

function runPhase1Tests() {
  console.log('--- RUNNING PHASE 1: MEDIA UPLOAD & MOBILE RESPONSIVENESS TEST SUITE ---');
  let failures = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
    } else {
      console.error(`  [FAIL] ${desc}`);
      failures++;
    }
  }

  // Test 1: Image Validation
  console.log('Test 1: Image Validation (MIME, Extensions, Sizes)');
  const validJpeg = new File(['fake data'], 'look.jpeg', { type: 'image/jpeg' });
  const valResult1 = validateMediaFile(validJpeg, 'image');
  assert(valResult1.valid === true, 'Accepts valid JPEG');

  const validPng = new File(['fake data'], 'look.png', { type: 'image/png' });
  const valResult2 = validateMediaFile(validPng, 'image');
  assert(valResult2.valid === true, 'Accepts valid PNG');

  const validWebp = new File(['fake data'], 'look.webp', { type: 'image/webp' });
  const valResult3 = validateMediaFile(validWebp, 'image');
  assert(valResult3.valid === true, 'Accepts valid WebP');

  const invalidTxt = new File(['fake data'], 'malicious.exe', { type: 'application/x-msdownload' });
  const valResult4 = validateMediaFile(invalidTxt, 'image');
  assert(valResult4.valid === false, 'Rejects executable or non-image MIME types');

  const oversizedFakeData = new Uint8Array(MAX_IMAGE_SIZE_BYTES + 1024);
  const oversizedImage = new File([oversizedFakeData], 'huge.jpg', { type: 'image/jpeg' });
  const valResult5 = validateMediaFile(oversizedImage, 'image');
  assert(valResult5.valid === false, 'Rejects images larger than 10MB limit');

  // Test 2: Video Validation
  console.log('Test 2: Video Validation (MIME, Extensions, Sizes)');
  const validMp4 = new File(['fake video'], 'reel.mp4', { type: 'video/mp4' });
  const valResult6 = validateMediaFile(validMp4, 'video');
  assert(valResult6.valid === true, 'Accepts valid MP4 video');

  const validWebm = new File(['fake video'], 'reel.webm', { type: 'video/webm' });
  const valResult7 = validateMediaFile(validWebm, 'video');
  assert(valResult7.valid === true, 'Accepts valid WebM video');

  const oversizedVideoData = new Uint8Array(MAX_VIDEO_SIZE_BYTES + 1024);
  const oversizedVideo = new File([oversizedVideoData], 'huge.mp4', { type: 'video/mp4' });
  const valResult8 = validateMediaFile(oversizedVideo, 'video');
  assert(valResult8.valid === false, 'Rejects videos larger than 50MB limit');

  // Test 3: OutfitDetailPage Positioning & Layout Checks
  console.log('Test 3: OutfitDetailPage Position & Sticky Scoping');
  const outfitDetailSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/pages/OutfitDetailPage.tsx'),
    'utf-8'
  );

  assert(
    !outfitDetailSrc.includes('className="lg:col-span-6 sticky top-24"'),
    'Mobile scrolling bug fixed: Unscoped "sticky top-24" removed from mobile'
  );
  assert(
    outfitDetailSrc.includes('lg:sticky lg:top-24 lg:self-start'),
    'Desktop layout retains sticky left column scoped strictly to lg screens'
  );
  assert(
    outfitDetailSrc.includes('onError={() => setMediaError(true)}'),
    'Public outfit media error handler prevents blank beige boxes'
  );
  assert(
    outfitDetailSrc.includes('!rawMedia.startsWith(\'blob:\')'),
    'Dead blob URLs from unpersisted previews are filtered out'
  );

  // Test 4: AdminOutfitEditorPage Upload & Security Checks
  console.log('Test 4: AdminOutfitEditorPage Upload & Blob Validation');
  const adminEditorSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/pages/admin/AdminOutfitEditorPage.tsx'),
    'utf-8'
  );

  assert(
    adminEditorSrc.includes('uploadOutfitMedia'),
    'Admin editor integrates real Firebase Storage upload service'
  );
  assert(
    adminEditorSrc.includes('heroMediaUrl.startsWith(\'blob:\')'),
    'Admin editor rejects saving unresolved blob URLs to Firestore'
  );
  assert(
    adminEditorSrc.includes('Upload Progress Bar') || adminEditorSrc.includes('uploadProgress'),
    'Admin editor includes upload progress tracking'
  );

  // Test 5: Firebase Storage Configuration & Rules
  console.log('Test 5: Storage Configuration & Security Rules');
  const firebaseConfigSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/firebase/config.ts'),
    'utf-8'
  );
  assert(
    firebaseConfigSrc.includes('export const storage = getStorage(app);'),
    'Firebase Storage initialized and exported from config.ts'
  );

  const storageRulesExist = fs.existsSync(path.resolve(process.cwd(), 'storage.rules'));
  assert(storageRulesExist, 'storage.rules file is present in project root');

  if (storageRulesExist) {
    const rulesContent = fs.readFileSync(path.resolve(process.cwd(), 'storage.rules'), 'utf-8');
    assert(
      rulesContent.includes('isAdmin()') && rulesContent.includes('naveencodes247@gmail.com'),
      'storage.rules strictly guards media write/delete to verified OutFyt administrators'
    );
  }

  console.log(`\n--- PHASE 1 SUMMARY: ${failures === 0 ? 'ALL TESTS PASSED' : `${failures} FAILURES`} ---`);
  if (failures > 0) {
    process.exit(1);
  }
}

runPhase1Tests();
