import fs from 'fs';
import path from 'path';
import { AUTHORIZED_ADMIN_EMAILS, checkAdminStatus } from '../src/firebase/services/admin';

async function runTests() {
  console.log('--- RUNNING OUTFYT.CO.IN ADMIN AUTHORIZATION TEST SUITE ---');
  let failures = 0;

  // Test 1: Authorized Emails Constant
  console.log('Test 1: Verify exactly two authorized emails in registry');
  const expectedEmails = ['naveencodes247@gmail.com', 'outfyt.co.in@gmail.com'];
  if (
    AUTHORIZED_ADMIN_EMAILS.length === 2 &&
    expectedEmails.every((e) => AUTHORIZED_ADMIN_EMAILS.includes(e as any))
  ) {
    console.log('  [PASS] Authorized admin email registry contains exactly naveencodes247@gmail.com and outfyt.co.in@gmail.com');
  } else {
    console.error('  [FAIL] Incorrect authorized email registry:', AUTHORIZED_ADMIN_EMAILS);
    failures++;
  }

  // Test 2: Test A - Signed in as naveencodes247@gmail.com with verified email
  console.log('Test 2: Test A - Authenticated naveencodes247@gmail.com (verified)');
  const mockUserA = {
    uid: 'mock-user-naveen-123',
    email: 'naveencodes247@gmail.com',
    emailVerified: true,
  } as any;
  const statusA = await checkAdminStatus(mockUserA);
  if (statusA.isAdmin && statusA.role === 'super_admin') {
    console.log('  [PASS] naveencodes247@gmail.com successfully authorized as super_admin');
  } else {
    console.error('  [FAIL] naveencodes247@gmail.com authorization failed:', statusA);
    failures++;
  }

  // Test 3: Test B - Signed in as outfyt.co.in@gmail.com with verified email
  console.log('Test 3: Test B - Authenticated outfyt.co.in@gmail.com (verified)');
  const mockUserB = {
    uid: 'mock-user-outfyt-456',
    email: 'outfyt.co.in@gmail.com',
    emailVerified: true,
  } as any;
  const statusB = await checkAdminStatus(mockUserB);
  if (statusB.isAdmin && statusB.role === 'super_admin') {
    console.log('  [PASS] outfyt.co.in@gmail.com successfully authorized as super_admin');
  } else {
    console.error('  [FAIL] outfyt.co.in@gmail.com authorization failed:', statusB);
    failures++;
  }

  // Test 4: Unverified email attack vector
  console.log('Test 4: Unverified email should be denied even if email matches');
  const mockUnverified = {
    uid: 'mock-unverified-789',
    email: 'outfyt.co.in@gmail.com',
    emailVerified: false,
  } as any;
  const statusUnverified = await checkAdminStatus(mockUnverified);
  if (!statusUnverified.isAdmin) {
    console.log('  [PASS] Unverified outfyt.co.in@gmail.com rejected as expected');
  } else {
    console.error('  [FAIL] Unverified user was granted admin:', statusUnverified);
    failures++;
  }

  // Test 5: Test C - Signed in with unrelated Google account
  console.log('Test 5: Test C - Signed in with unrelated Google account');
  const mockUserC = {
    uid: 'mock-user-stranger-999',
    email: 'random.shopper@gmail.com',
    emailVerified: true,
  } as any;
  const statusC = await checkAdminStatus(mockUserC);
  if (!statusC.isAdmin && statusC.role === 'none') {
    console.log('  [PASS] Unrelated Google account rejected with access denied');
  } else {
    console.error('  [FAIL] Unrelated user was granted admin:', statusC);
    failures++;
  }

  // Test 6: Test D - Signed out user visiting /admin
  console.log('Test 6: Test D - Signed out user (user = null)');
  const statusD = await checkAdminStatus(null);
  if (!statusD.isAdmin && statusD.reason === 'User is not signed in.') {
    console.log('  [PASS] Null user rejected');
  } else {
    console.error('  [FAIL] Null user evaluation failed:', statusD);
    failures++;
  }

  // Test 7: Test E - Verify Footer contains discreet Admin Portal link and Header does not
  console.log('Test 7: Test E - Check Footer and Header navigation');
  const footerContent = fs.readFileSync(path.join(process.cwd(), 'src/components/layout/Footer.tsx'), 'utf-8');
  const headerContent = fs.readFileSync(path.join(process.cwd(), 'src/components/layout/Header.tsx'), 'utf-8');

  if (footerContent.includes('to="/admin"') && footerContent.includes('Admin Portal')) {
    console.log('  [PASS] Footer contains link to /admin labeled "Admin Portal"');
  } else {
    console.error('  [FAIL] Footer missing Admin Portal link');
    failures++;
  }

  if (!headerContent.includes('to="/admin"') && !headerContent.includes('Admin Portal') && !headerContent.includes('Admin Panel')) {
    console.log('  [PASS] Header does not contain public Admin links');
  } else {
    console.error('  [FAIL] Header contains unexpected Admin link');
    failures++;
  }

  // Test 8: Test F - Firestore security rules contain both administrator emails
  console.log('Test 8: Test F - Verify Firestore security rules isAdmin predicate');
  const rulesContent = fs.readFileSync(path.join(process.cwd(), 'firestore.rules'), 'utf-8');
  const hasRuleEmail1 = rulesContent.includes("request.auth.token.email == 'naveencodes247@gmail.com'");
  const hasRuleEmail2 = rulesContent.includes("request.auth.token.email == 'outfyt.co.in@gmail.com'");
  const hasVerifiedCheck = rulesContent.includes('request.auth.token.email_verified == true');

  if (hasRuleEmail1 && hasRuleEmail2 && hasVerifiedCheck) {
    console.log('  [PASS] firestore.rules strictly mandates (naveencodes247@gmail.com || outfyt.co.in@gmail.com) && email_verified == true');
  } else {
    console.error('  [FAIL] firestore.rules missing authorized email checks');
    failures++;
  }

  console.log('----------------------------------------------------');
  if (failures === 0) {
    console.log('ALL TESTS PASSED SUCCESSFULLY! (0 failures)');
    process.exit(0);
  } else {
    console.error(`TEST SUITE FAILED with ${failures} failure(s)`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
