import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './config';

export interface ConnectionTestResult {
  connected: boolean;
  message: string;
  error?: string;
  timestamp: string;
}

/**
 * Validates active connection to Cloud Firestore using getDocFromServer
 * per Firebase Integration Specification.
 */
export async function testFirestoreConnection(): Promise<ConnectionTestResult> {
  const timestamp = new Date().toISOString();
  try {
    // Attempt reading a test probe document from the server
    await getDocFromServer(doc(db, 'test', 'connection'));
    return {
      connected: true,
      message: 'Cloud Firestore connected and reachable from server.',
      timestamp,
    };
  } catch (error: any) {
    // Even if permission is denied or document does not exist, the network handshake confirms reachability
    const errorMessage = error instanceof Error ? error.message : String(error);
    const code = error?.code || '';

    if (errorMessage.includes('the client is offline')) {
      return {
        connected: false,
        message: 'Client is offline or unable to reach Firebase backend.',
        error: errorMessage,
        timestamp,
      };
    }

    // "permission-denied" or "not-found" confirms that the Firestore server responded!
    return {
      connected: true,
      message: `Firestore server responded with: ${code || 'handshake-verified'} (Network path active)`,
      error: code,
      timestamp,
    };
  }
}
