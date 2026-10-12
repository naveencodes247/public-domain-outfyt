import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError, OperationType } from '../errors';
import { sanitizeFirestoreData } from '../utils/cleanData';
import { Outfit } from '../../types/schema';

const COLLECTION_NAME = 'outfits';

/**
 * Safely normalizes Firestore timestamps, Date objects, numeric ms, and ISO strings to milliseconds.
 */
export function parseTimestampMs(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val.toMillis === 'function') return val.toMillis();
  if (typeof val.toDate === 'function') return val.toDate().getTime();
  if (typeof val.seconds === 'number') return val.seconds * 1000 + (val.nanoseconds || 0) / 1000000;
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Fetches all published outfits for public discovery and browsing.
 * Evaluates under the security rule: (resource.data.status == 'published').
 * Sorted newest publication first.
 */
export async function getPublishedOutfits(): Promise<Outfit[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((d) => ({ ...d.data() } as Outfit));
    return results.sort((a, b) => {
      const timeA = parseTimestampMs(a.publishedAt || a.createdAt);
      const timeB = parseTimestampMs(b.publishedAt || b.createdAt);
      return timeB - timeA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

/**
 * Subscribes to published outfits in real-time.
 * Automatically pushes updates to the UI whenever an outfit is published, modified, or unpublished.
 */
export function subscribeToPublishedOutfits(
  onUpdate: (outfits: Outfit[]) => void,
  onError: (error: any) => void
): () => void {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'published')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const results = snapshot.docs.map((d) => ({ ...d.data() } as Outfit));
      results.sort((a, b) => {
        const timeA = parseTimestampMs(a.publishedAt || a.createdAt);
        const timeB = parseTimestampMs(b.publishedAt || b.createdAt);
        return timeB - timeA;
      });
      onUpdate(results);
    },
    (error) => {
      onError(error);
    }
  );
}

/**
 * Fetches all outfits for the Admin Management Dashboard (admin only).
 */
export async function getAllOutfitsAdmin(): Promise<Outfit[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const results = snapshot.docs.map((d) => ({ ...d.data() } as Outfit));
    return results.sort((a, b) => {
      const timeA = parseTimestampMs(a.updatedAt || a.createdAt);
      const timeB = parseTimestampMs(b.updatedAt || b.createdAt);
      return timeB - timeA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

/**
 * Fetches an outfit by its business ID (e.g., 'OUT-001').
 */
export async function getOutfitById(outfitId: string): Promise<Outfit | null> {
  const path = `${COLLECTION_NAME}/${outfitId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, outfitId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return null;
    }
    return snapshot.data() as Outfit;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Fetches an outfit by its URL slug. Only returns published outfits for public viewing.
 */
export async function getOutfitBySlug(slug: string): Promise<Outfit | null> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('slug', '==', slug),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as Outfit;
    }
    // Fallback: check if slug matches business id
    const byId = await getOutfitById(slug.toUpperCase());
    if (byId && byId.status === 'published') {
      return byId;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

/**
 * Creates a new outfit document. (Admin only)
 */
export async function createOutfit(
  outfit: Omit<Outfit, 'createdAt' | 'updatedAt' | 'publishedAt'> & {
    publishedAt?: any;
  }
): Promise<void> {
  const path = `${COLLECTION_NAME}/${outfit.id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, outfit.id);
    const rawPayload: any = {
      ...outfit,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (outfit.status === 'published') {
      rawPayload.publishedAt = serverTimestamp();
    }
    const payload = sanitizeFirestoreData(rawPayload);
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Updates an existing outfit. (Admin only)
 */
export async function updateOutfit(
  outfitId: string,
  updates: Partial<Omit<Outfit, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${outfitId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, outfitId);
    const rawPayload: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    if (updates.status === 'published') {
      rawPayload.publishedAt = serverTimestamp();
    }
    const payload = sanitizeFirestoreData(rawPayload);
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Deletes an outfit. (Admin only)
 */
export async function deleteOutfit(outfitId: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${outfitId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, outfitId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
