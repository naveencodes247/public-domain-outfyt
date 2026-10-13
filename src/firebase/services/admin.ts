import { doc, getDoc } from 'firebase/firestore';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { db, auth, googleProvider } from '../config';

export const AUTHORIZED_ADMIN_EMAILS = [
  'naveencodes247@gmail.com',
  'outfyt.co.in@gmail.com',
] as const;

export interface AdminStatus {
  isAdmin: boolean;
  role: 'super_admin' | 'editor' | 'none';
  reason: string;
}

/**
 * Checks whether the current user possesses administrative authority.
 * Evaluates both the immutable authorized administrator identities and Firestore /admins/{uid} collection.
 */
export async function checkAdminStatus(user: User | null): Promise<AdminStatus> {
  if (!user) {
    return {
      isAdmin: false,
      role: 'none',
      reason: 'User is not signed in.',
    };
  }

  const userEmail = (user.email || '').trim().toLowerCase();

  // 1. Mandatory check: Account must match the approved allowlist and have a verified email.
  // An existing document in the admins collection cannot independently bypass these requirements.
  const isAuthorizedEmail = AUTHORIZED_ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase() === userEmail
  );

  if (!isAuthorizedEmail || !user.emailVerified) {
    return {
      isAdmin: false,
      role: 'none',
      reason: isAuthorizedEmail
        ? `Account (${user.email}) email is not verified.`
        : `Account (${user.email || user.uid}) is not listed in administrator registry.`,
    };
  }

  // 2. Verified allowlist user: check /admins/{uid} Firestore record for role assignment
  try {
    const adminDocRef = doc(db, 'admins', user.uid);
    const snap = await getDoc(adminDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        isAdmin: true,
        role: data.role || 'super_admin',
        reason: `Authenticated as authorized administrator (${user.email}) with verified email and active registry record.`,
      };
    }
  } catch (err) {
    // If permission denied or query fails, default to super_admin from allowlist
  }

  return {
    isAdmin: true,
    role: 'super_admin',
    reason: `Authenticated as authorized administrator (${user.email}) with verified email.`,
  };
}

/**
 * Initiates Google Sign-In with popup per environment recommendation.
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Signs out current user.
 */
export async function logOut(): Promise<void> {
  await signOut(auth);
}
