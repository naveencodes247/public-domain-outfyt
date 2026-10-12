/**
 * Recursively strips undefined fields from objects and arrays so Firestore never
 * encounters unsupported 'undefined' values in setDoc, updateDoc, or addDoc operations.
 *
 * Preserves:
 * - null (valid Firestore value)
 * - dates, numbers, booleans, strings
 * - custom objects / timestamps / FieldValues (like serverTimestamp())
 */
export function sanitizeFirestoreData<T>(data: T): T {
  if (data === undefined) {
    return undefined as unknown as T;
  }

  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Preserve Firestore FieldValue sentinels (e.g. serverTimestamp()) and special objects
  // FieldValues in Firestore SDK typically have _methodName or are non-plain objects without enumerable own keys
  // or instanceof Date
  if (data instanceof Date) {
    return data;
  }

  // Check if it's an Array
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestoreData(item)) as unknown as T;
  }

  // Check if it's a special Firestore FieldValue / object (e.g. serverTimestamp())
  // In modern firebase/firestore, FieldValues or internal tokens may have specific prototype or symbol markers.
  // Plain objects have constructor === Object or Object.getPrototypeOf(data) === null.
  const proto = Object.getPrototypeOf(data);
  const isPlainObject = proto === null || proto === Object.prototype;

  if (!isPlainObject) {
    // Likely a Firestore FieldValue, Timestamp instance, etc. Preserve it as is.
    return data;
  }

  const result: Record<string, any> = {};

  for (const [key, val] of Object.entries(data as Record<string, any>)) {
    if (val !== undefined) {
      result[key] = sanitizeFirestoreData(val);
    }
  }

  return result as T;
}
