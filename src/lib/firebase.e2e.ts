/**
 * The E2E stand-in for ./firebase.
 *
 * Aliased over the real module only when vite runs with E2E=1 (see
 * vite.config.ts), it is never part of a production bundle. Keeping Firebase
 * out of the E2E graph entirely means no SDK init, no IndexedDB cache, and no
 * network: sign-in is a localStorage write and a synchronous event.
 */
import { E2E_AUTH_KEY, e2eNotifyAuth } from './e2e-keys';

/** Kept in sync by hand with the copy enforced in firestore.rules. */
export const ALLOWED_DOMAINS = ['acts2.network', 'gpmail.org'];

export function isAllowedEmail(email: string | null | undefined): boolean {
  const domain = email?.split('@')[1]?.toLowerCase();
  return !!domain && ALLOWED_DOMAINS.includes(domain);
}

/**
 * Stands in for the Google popup. A test decides the outcome up front by
 * seeding `e2e:next-sign-in`, an email to accept, or the literal `cancel` to
 * make the button reject the way a dismissed popup does.
 */
export async function signIn(): Promise<void> {
  const next = localStorage.getItem('e2e:next-sign-in') ?? 'member@acts2.network';
  if (next === 'cancel') {
    throw new Error('The sign-in popup was closed before completing.');
  }
  if (!isAllowedEmail(next)) {
    throw new Error(`Sign-in is restricted to ${ALLOWED_DOMAINS.join(' and ')} accounts.`);
  }
  localStorage.setItem(E2E_AUTH_KEY, next);
  e2eNotifyAuth();
}

export async function signOutUser(): Promise<void> {
  localStorage.removeItem(E2E_AUTH_KEY);
  e2eNotifyAuth();
}
