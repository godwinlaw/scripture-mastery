import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Persists the offline cache across reloads and keeps multiple tabs of the
// app in sync with each other without extra plumbing.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

/** Kept in sync by hand with the copy enforced in firestore.rules. */
export const ALLOWED_DOMAINS = ['acts2.network', 'gpmail.org'];

export function isAllowedEmail(email: string | null | undefined): boolean {
  const domain = email?.split('@')[1]?.toLowerCase();
  return !!domain && ALLOWED_DOMAINS.includes(domain);
}

const googleProvider = new GoogleAuthProvider();
// Hints Google's account chooser to offer only Workspace accounts, not personal
// Gmail — a UX nicety only. isAllowedEmail + firestore.rules do the real check.
googleProvider.setCustomParameters({ hd: '*' });

export async function signIn(): Promise<void> {
  const cred = await signInWithPopup(auth, googleProvider);
  if (!isAllowedEmail(cred.user.email)) {
    await signOut(auth);
    throw new Error(`Sign-in is restricted to ${ALLOWED_DOMAINS.join(' and ')} accounts.`);
  }
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}
