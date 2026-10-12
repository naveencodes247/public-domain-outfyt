import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jfhjlibbdypicynvhfgo.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGpsaWJiZHlwaWN5bnZoZmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDI5NjAsImV4cCI6MjEwNzExODk2MH0.MW_UtgF9Wv0iXDKjCJ01Mjow-3MprKdooftVQMGGCYY';

async function testSupabase() {
  console.log('Testing Supabase with anon key...');
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  // 1. Try to list bucket
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log('listBuckets:', { buckets, bErr });

  // 2. Try upload directly with anon key
  const testFileName = `test_${Date.now()}.txt`;
  const { data: upData, error: upErr } = await supabase.storage.from('outfit-media').upload(testFileName, 'Hello Outfyt', {
    contentType: 'text/plain',
  });
  console.log('direct upload with anon:', { upData, upErr });

  // 3. Try createSignedUploadUrl with anon key
  const { data: signedData, error: signedErr } = await supabase.storage.from('outfit-media').createSignedUploadUrl(`signed_${testFileName}`);
  console.log('createSignedUploadUrl with anon:', { signedData, signedErr });
}

testSupabase().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
