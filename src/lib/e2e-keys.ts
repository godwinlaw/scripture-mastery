/**
 * The contract between the E2E stand-ins and the Playwright harness.
 *
 * Both localStorage keys are written by tests before the app boots
 * (`tests/e2e/harness.ts`), and read back by `useStore.e2e.ts`. Only ever
 * loaded in the E2E build.
 */

/** Holds the signed-in email, or is absent when signed out. */
export const E2E_AUTH_KEY = 'e2e:auth';

/** Holds the whole Store as JSON — how a test seeds cards, log and settings. */
export const E2E_STORE_KEY = 'e2e:store';

/** Same-tab auth change; `storage` only fires for *other* tabs. */
export const E2E_AUTH_EVENT = 'e2e:auth-changed';

export function e2eNotifyAuth(): void {
  window.dispatchEvent(new Event(E2E_AUTH_EVENT));
}
