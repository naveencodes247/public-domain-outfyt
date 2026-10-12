function makeJwt(payload: any) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const sHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const sPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${sHeader}.${sPayload}.signature`;
}

async function testEdgeScenarios() {
  const url = 'https://mkznvbwpdtxubjwggtfm.supabase.co/functions/v1/get-upload-url';
  const now = Math.floor(Date.now() / 1000);

  // Test 1: Non-admin email
  console.log('--- Test 1: Non-admin account ---');
  const nonAdminToken = makeJwt({
    iss: 'https://securetoken.google.com/gen-lang-client-0351289836',
    aud: 'gen-lang-client-0351289836',
    email: 'random@gmail.com',
    email_verified: true,
    exp: now + 3600,
  });

  const res1 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${nonAdminToken}` },
    body: JSON.stringify({ path: 'outfits/OUT-001/test.jpg' }),
  });
  console.log('Status 1:', res1.status, await res1.json());

  // Test 2: Unverified admin email
  console.log('\n--- Test 2: Unverified admin email ---');
  const unverifiedToken = makeJwt({
    iss: 'https://securetoken.google.com/gen-lang-client-0351289836',
    aud: 'gen-lang-client-0351289836',
    email: 'naveencodes247@gmail.com',
    email_verified: false,
    exp: now + 3600,
  });
  const res2 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${unverifiedToken}` },
    body: JSON.stringify({ path: 'outfits/OUT-001/test.jpg' }),
  });
  console.log('Status 2:', res2.status, await res2.json());

  // Test 3: Authorized admin email (naveencodes247@gmail.com)
  console.log('\n--- Test 3: Authorized admin email ---');
  const adminToken = makeJwt({
    iss: 'https://securetoken.google.com/gen-lang-client-0351289836',
    aud: 'gen-lang-client-0351289836',
    email: 'naveencodes247@gmail.com',
    email_verified: true,
    exp: now + 3600,
  });
  const res3 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ path: 'outfits/OUT-001/test.jpg' }),
  });
  console.log('Status 3:', res3.status);
  const data3 = await res3.json();
  console.log('Response 3:', data3);
}

testEdgeScenarios().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
