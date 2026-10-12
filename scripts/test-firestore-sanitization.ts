import { sanitizeFirestoreData } from '../src/firebase/utils/cleanData';

function runTests() {
  console.log('--- RUNNING OUTFYT.CO.IN FIRESTORE SANITIZATION & PRICE TEST SUITE ---');
  let failures = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
    } else {
      console.error(`  [FAIL] ${desc}`);
      failures++;
    }
  }

  // Test 1: Undefined price field omitted from product payload
  console.log('Test 1: Undefined price handling');
  const productWithUndefinedPrice = {
    outfitId: 'OUT-002',
    name: 'Silk Linen Kurta',
    retailer: 'Manyavar',
    price: undefined,
    currency: 'INR',
    affiliateUrl: 'https://example.com/item',
    sortOrder: 1,
  };
  const sanitized1 = sanitizeFirestoreData(productWithUndefinedPrice);
  assert(!('price' in sanitized1), 'price key is completely omitted when undefined');
  assert(sanitized1.name === 'Silk Linen Kurta', 'name field is preserved');
  assert(sanitized1.currency === 'INR', 'currency field is preserved');

  // Test 2: Valid numeric price is preserved
  console.log('Test 2: Valid numeric price handling');
  const productWithNumericPrice = {
    outfitId: 'OUT-002',
    name: 'Linen Kurta',
    retailer: 'Fabindia',
    price: 3499,
    currency: 'INR',
    affiliateUrl: 'https://example.com/item',
    sortOrder: 2,
  };
  const sanitized2 = sanitizeFirestoreData(productWithNumericPrice);
  assert(sanitized2.price === 3499, 'valid price 3499 is preserved without modification');
  assert(typeof sanitized2.price === 'number', 'price remains a number');

  // Test 3: Null field preserved (valid in Firestore) vs undefined removed
  console.log('Test 3: Null vs Undefined handling');
  const productWithNullAndUndefined = {
    outfitId: 'OUT-002',
    name: 'Bundi Jacket',
    retailer: 'Fabindia',
    price: undefined,
    imageUrl: null,
    heroThumbnailUrl: undefined,
  };
  const sanitized3 = sanitizeFirestoreData(productWithNullAndUndefined);
  assert(!('price' in sanitized3), 'undefined price omitted');
  assert(!('heroThumbnailUrl' in sanitized3), 'undefined heroThumbnailUrl omitted');
  assert(sanitized3.imageUrl === null, 'explicit null value is preserved for Firestore null fields');

  // Test 4: Nested objects and array recursion
  console.log('Test 4: Deep recursive sanitization of nested structures');
  const nestedData = {
    title: 'Summer Outfit',
    meta: {
      photographer: 'Editorial Studio',
      notes: undefined,
      deep: {
        valid: 42,
        invalid: undefined,
      },
    },
    items: [
      { id: '1', price: undefined, name: 'Item 1' },
      undefined,
      { id: '2', price: 1500, name: 'Item 2' },
    ],
  };
  const sanitized4 = sanitizeFirestoreData(nestedData);
  assert(!('notes' in (sanitized4.meta as any)), 'nested undefined notes removed');
  assert(!('invalid' in (sanitized4.meta.deep as any)), 'deep nested undefined removed');
  assert(sanitized4.meta.deep.valid === 42, 'deep valid preserved');
  assert(sanitized4.items.length === 2, 'undefined array element filtered out');
  assert(!('price' in (sanitized4.items[0] as any)), 'price omitted from first item in array');
  assert((sanitized4.items[1] as any).price === 1500, 'price preserved in second item in array');

  // Test 5: Firestore FieldValues or non-plain objects are preserved
  console.log('Test 5: Non-plain objects and Dates preserved');
  const testDate = new Date('2026-10-12T00:00:00.000Z');
  const mockFieldValue = Object.create({ _methodName: 'serverTimestamp' });
  const objectWithSentinels = {
    createdAt: mockFieldValue,
    dateField: testDate,
    price: undefined,
  };
  const sanitized5 = sanitizeFirestoreData(objectWithSentinels);
  assert(sanitized5.createdAt === mockFieldValue, 'FieldValue sentinel preserved untouched');
  assert(sanitized5.dateField === testDate, 'Date instance preserved untouched');
  assert(!('price' in sanitized5), 'undefined price omitted');

  console.log('\n--- SUMMARY ---');
  if (failures === 0) {
    console.log('ALL TESTS PASSED SUCCESSFULLY! No undefined values will reach Firestore setDoc().');
  } else {
    console.error(`${failures} test(s) failed.`);
    process.exit(1);
  }
}

runTests();
