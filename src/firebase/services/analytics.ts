import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config';
import { handleFirestoreError, OperationType } from '../errors';

const COLLECTION_NAME = 'clickEvents';

/**
 * Records an outbound affiliate click event.
 * Follows minimal privacy principles: only outfitId, productId, retailer, clickedAt.
 * Protected by security rules: append-only with request.time verification.
 */
export async function recordAffiliateClick(
  outfitId: string,
  productId: string,
  retailer: string
): Promise<string> {
  const clickId = `clk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const path = `${COLLECTION_NAME}/${clickId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, clickId);
    await setDoc(docRef, {
      outfitId,
      productId,
      retailer,
      clickedAt: serverTimestamp(),
    });
    return clickId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
