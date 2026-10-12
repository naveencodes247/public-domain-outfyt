async function testUploadToSignedUrl() {
  const url = 'https://mkznvbwpdtxubjwggtfm.supabase.co/functions/v1/get-upload-url';
  const now = Math.floor(Date.now() / 1000);

  function makeJwt(payload: any) {
    const header = { alg: 'RS256', typ: 'JWT' };
    const sHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const sPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${sHeader}.${sPayload}.signature`;
  }

  const adminToken = makeJwt({
    iss: 'https://securetoken.google.com/gen-lang-client-0351289836',
    aud: 'gen-lang-client-0351289836',
    email: 'naveencodes247@gmail.com',
    email_verified: true,
    exp: now + 3600,
  });

  const filePath = `outfits/OUT-001/verify_${Date.now()}.png`;

  console.log('1. Requesting signed upload URL...');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ path: filePath }),
  });
  const data = await res.json();
  console.log('Signed URL received:', data.publicUrl);

  console.log('2. Uploading file binary to signedUrl via PUT...');
  const fakePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
  const putRes = await fetch(data.signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png' },
    body: fakePng,
  });
  console.log('Upload HTTP status:', putRes.status, putRes.statusText);

  console.log('3. Verifying public retrieval from publicUrl...');
  const getRes = await fetch(data.publicUrl);
  console.log('Public retrieval HTTP status:', getRes.status);
  console.log('Public retrieval Content-Type:', getRes.headers.get('content-type'));
  const retrievedBytes = await getRes.arrayBuffer();
  console.log('Retrieved bytes count:', retrievedBytes.byteLength);

  if (putRes.status === 200 && getRes.status === 200 && retrievedBytes.byteLength === 10) {
    console.log('\n>>> COMPLETE END-TO-END UPLOAD AND PUBLIC RETRIEVAL VERIFIED! <<<');
  } else {
    throw new Error('Verification failed');
  }
}

testUploadToSignedUrl().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
