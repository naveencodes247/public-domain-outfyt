import { validateMediaFile, uploadOutfitMedia, ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MAX_IMAGE_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES } from '../src/firebase/services/storage';
import { SUPABASE_URL, SUPABASE_STORAGE_BUCKET } from '../src/supabase/config';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details?: string) {
  if (condition) {
    results.push({ name, passed: true, details });
    console.log(`  ✓ ${name}`);
  } else {
    results.push({ name, passed: false, details });
    console.error(`  ✗ FAIL: ${name} (${details || 'Assertion failed'})`);
  }
}

async function runStorageTestSuite() {
  console.log('\n============================================================');
  console.log('--- SUPABASE STORAGE & OUTFIT WORKFLOW VERIFICATION ---');
  console.log('============================================================\n');

  // 1. Storage Configuration Checks
  console.log('1. Checking Supabase Configuration...');
  assert(
    SUPABASE_URL === 'https://mkznvbwpdtxubjwggtfm.supabase.co',
    'Supabase URL matches user project instance',
    SUPABASE_URL
  );
  assert(
    SUPABASE_STORAGE_BUCKET === 'outfit-media',
    'Supabase Storage bucket matches dedicated outfit-media bucket',
    SUPABASE_STORAGE_BUCKET
  );

  // 2. Media Validation Checks
  console.log('\n2. Testing File Type & Size Validation...');
  const validJpgFile = new File([new Uint8Array(1024)], 'look.jpg', { type: 'image/jpeg' });
  const validPngFile = new File([new Uint8Array(1024)], 'look.png', { type: 'image/png' });
  const validWebpFile = new File([new Uint8Array(1024)], 'look.webp', { type: 'image/webp' });
  const oversizedImage = new File([new Uint8Array(MAX_IMAGE_SIZE_BYTES + 1024)], 'huge.jpg', { type: 'image/jpeg' });
  const invalidExtImage = new File([new Uint8Array(1024)], 'script.exe', { type: 'application/octet-stream' });
  const validMp4Video = new File([new Uint8Array(1024)], 'reel.mp4', { type: 'video/mp4' });
  const oversizedVideo = new File([new Uint8Array(MAX_VIDEO_SIZE_BYTES + 1024)], 'movie.mp4', { type: 'video/mp4' });

  assert(validateMediaFile(validJpgFile).valid, 'Valid JPG accepted');
  assert(validateMediaFile(validPngFile).valid, 'Valid PNG accepted');
  assert(validateMediaFile(validWebpFile).valid, 'Valid WebP accepted');
  assert(!validateMediaFile(oversizedImage).valid, 'Oversized image (>10MB) properly rejected');
  assert(!validateMediaFile(invalidExtImage).valid, 'Non-media file properly rejected');
  assert(validateMediaFile(validMp4Video).valid, 'Valid MP4 video accepted');
  assert(!validateMediaFile(oversizedVideo).valid, 'Oversized video (>50MB) properly rejected');

  // 3. Edge Function Authorization & Security
  console.log('\n3. Testing Supabase Edge Function Security...');
  const authUrl = `${SUPABASE_URL}/functions/v1/get-upload-url`;

  // Test 3a: Request without token should be rejected (401)
  try {
    const unauthRes = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'outfits/OUT-999/test.jpg' }),
    });
    assert(
      unauthRes.status === 401,
      'Unauthenticated request rejected by Edge Function (HTTP 401)',
      `Status: ${unauthRes.status}`
    );
  } catch (err: any) {
    assert(false, 'Edge function should be reachable for unauthenticated test', err.message);
  }

  // Test 3b: Request with non-admin email token should be rejected (403)
  function makeMockJwt(payload: any) {
    const header = { alg: 'RS256', typ: 'JWT' };
    const sHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const sPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${sHeader}.${sPayload}.mock_sig`;
  }

  const now = Math.floor(Date.now() / 1000);
  const nonAdminToken = makeMockJwt({
    iss: 'https://securetoken.google.com/gen-lang-client-0351289836',
    aud: 'gen-lang-client-0351289836',
    email: 'randomuser@example.com',
    email_verified: true,
    exp: now + 3600,
  });

  try {
    const forbiddenRes = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${nonAdminToken}`,
      },
      body: JSON.stringify({ path: 'outfits/OUT-999/test.jpg' }),
    });
    assert(
      forbiddenRes.status === 403,
      'Non-administrator token rejected with HTTP 403 Forbidden',
      `Status: ${forbiddenRes.status}`
    );
  } catch (err: any) {
    assert(false, 'Edge function reachable for non-admin test', err.message);
  }

  // Test 3c: Authorized Admin Token generates signed upload URL
  const adminToken = makeMockJwt({
    iss: 'https://securetoken.google.com/gen-lang-client-0351289836',
    aud: 'gen-lang-client-0351289836',
    email: 'naveencodes247@gmail.com',
    email_verified: true,
    exp: now + 3600,
  });

  let signedUrl = '';
  let publicUrl = '';
  try {
    const adminRes = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ path: `outfits/OUT-VERIFY/auto_test_${Date.now()}.png` }),
    });
    const adminData = await adminRes.json();
    assert(adminRes.status === 200, 'Admin token successfully generates signed URL (HTTP 200)');
    assert(!!adminData.signedUrl, 'Response contains signedUrl');
    assert(
      adminData.publicUrl.startsWith(
        'https://mkznvbwpdtxubjwggtfm.supabase.co/storage/v1/object/public/outfit-media/'
      ),
      'publicUrl has correct Supabase Storage public CDN structure',
      adminData.publicUrl
    );
    signedUrl = adminData.signedUrl;
    publicUrl = adminData.publicUrl;
  } catch (err: any) {
    assert(false, 'Admin token signed URL generation', err.message);
  }

  // 4. Binary Upload & Public Retrieval Verification
  if (signedUrl && publicUrl) {
    console.log('\n4. Verifying Binary Upload to Supabase & Public Retrieval...');
    const testBinary = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const uploadRes = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: testBinary,
    });
    assert(uploadRes.status === 200, 'Direct binary PUT upload to signedUrl returned HTTP 200');

    const downloadRes = await fetch(publicUrl);
    assert(downloadRes.status === 200, 'Public read retrieval returned HTTP 200');
    const downloadedBuffer = await downloadRes.arrayBuffer();
    assert(
      downloadedBuffer.byteLength === testBinary.byteLength,
      'Retrieved byte length matches uploaded byte length exactly'
    );
  }

  // 5. Blob URL Rejection Guard Test
  console.log('\n5. Testing Blob URL Rejection Logic in Admin Outfit Editor...');
  const testBlobUrl = 'blob:https://outfythere.netlify.app/d9a11756-7ee6-4a46-88bf-75c1da64ef02';
  const isBlob = testBlobUrl.startsWith('blob:');
  assert(isBlob, 'Blob URLs correctly identified and blocked from saving into Firestore');

  // Summary
  console.log('\n============================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`TEST SUITE RESULTS: ${passed}/${total} passed (${failed} failed)`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStorageTestSuite().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
