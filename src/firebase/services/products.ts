import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError, OperationType } from '../errors';
import { sanitizeFirestoreData } from '../utils/cleanData';
import { Product } from '../../types/schema';

const COLLECTION_NAME = 'products';

/**
 * Fetches all products associated with a specific outfit.
 * Supports primary outfit ID (e.g., 'OUT-001') and optional fallback identifier (e.g. slug 'collegefit')
 * to ensure products resolve reliably even if references vary.
 */
export async function getProductsByOutfitId(
  outfitId?: string | null,
  fallbackId?: string | null
): Promise<Product[]> {
  try {
    const candidates: string[] = [];
    if (outfitId && typeof outfitId === 'string' && outfitId.trim()) {
      const clean = outfitId.trim();
      candidates.push(clean);
      if (clean.toUpperCase() !== clean) candidates.push(clean.toUpperCase());
      if (clean.toLowerCase() !== clean) candidates.push(clean.toLowerCase());
    }

    if (fallbackId && typeof fallbackId === 'string' && fallbackId.trim()) {
      const cleanFb = fallbackId.trim();
      if (!candidates.includes(cleanFb)) candidates.push(cleanFb);
      if (cleanFb.toUpperCase() !== cleanFb && !candidates.includes(cleanFb.toUpperCase())) {
        candidates.push(cleanFb.toUpperCase());
      }
      if (cleanFb.toLowerCase() !== cleanFb && !candidates.includes(cleanFb.toLowerCase())) {
        candidates.push(cleanFb.toLowerCase());
      }
    }

    if (candidates.length === 0) {
      return [];
    }

    // Try candidate identifiers until matching products are found
    for (const id of candidates) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('outfitId', '==', id)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
        return products.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
    }

    return [];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

/**
 * Creates or overwrites a product attached to an outfit. (Admin only)
 * Safely handles optional price (omits if undefined/null/empty, never writes undefined to Firestore).
 */
export async function createProduct(
  productId: string,
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${productId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    
    // Build sanitized payload without undefined values
    const rawPayload: Record<string, any> = {
      outfitId: product.outfitId,
      name: product.name,
      retailer: product.retailer,
      currency: product.currency || 'INR',
      affiliateUrl: product.affiliateUrl,
      sortOrder: product.sortOrder ?? 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Optional clothing category (e.g., Shirt, Pants, Footwear, Accessories)
    if (product.category && typeof product.category === 'string' && product.category.trim()) {
      rawPayload.category = product.category.trim();
    }

    // Optional direct retailer logo URL
    if (product.retailerLogoUrl && typeof product.retailerLogoUrl === 'string' && product.retailerLogoUrl.trim()) {
      rawPayload.retailerLogoUrl = product.retailerLogoUrl.trim();
    }

    // Only set price if it is a valid finite number
    if (typeof product.price === 'number' && !isNaN(product.price)) {
      rawPayload.price = product.price;
    }

    // Only set imageUrl if present and non-empty
    if (product.imageUrl) {
      rawPayload.imageUrl = product.imageUrl;
    }

    const payload = sanitizeFirestoreData(rawPayload);
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Updates a product. (Admin only)
 */
export async function updateProduct(
  productId: string,
  updates: Partial<Omit<Product, 'id' | 'outfitId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${productId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    const rawPayload: Record<string, any> = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // If price is explicitly undefined, delete or omit it
    if (rawPayload.price === undefined) {
      delete rawPayload.price;
    }

    const payload = sanitizeFirestoreData(rawPayload);
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Deletes a product. (Admin only)
 */
export async function deleteProduct(productId: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${productId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Deletes all products belonging to an outfit.
 */
export async function deleteProductsByOutfitId(outfitId: string): Promise<void> {
  try {
    const products = await getProductsByOutfitId(outfitId);
    for (const p of products) {
      if (p.id) {
        await deleteDoc(doc(db, COLLECTION_NAME, p.id));
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, COLLECTION_NAME);
  }
}
