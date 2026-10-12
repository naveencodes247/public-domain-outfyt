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

  // 1. Check authorized administrator email allowlist with verified email
  const isAuthorizedEmail = AUTHORIZED_ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase() === userEmail
  );

  if (isAuthorizedEmail && user.emailVerified) {
    return {
      isAdmin: true,
      role: 'super_admin',
      reason: `Authenticated as authorized administrator (${user.email}) with verified email.`,
    };
  }

  // 2. Check /admins/{uid} Firestore allowlist
  try {
    const adminDocRef = doc(db, 'admins', user.uid);
    const snap = await getDoc(adminDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        isAdmin: true,
        role: data.role || 'editor',
        reason: `Matched active record in /admins/${user.uid}`,
      };
    }
  } catch (err) {
    // If permission denied or query fails, user is not admin
  }

  return {
    isAdmin: false,
    role: 'none',
    reason: `Account (${user.email || user.uid}) is not listed in administrator registry.`,
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
