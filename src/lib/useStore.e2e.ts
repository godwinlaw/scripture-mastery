/**
 * The E2E stand-in for useStore.
 *
 * Aliased over the real hook only when vite runs with E2E=1 (see
 * vite.config.ts), never part of a production bundle. It swaps the transport
 * (Firestore → localStorage) and nothing else: every transition still goes
 * through ./store-ops, the same code the real hook runs, so a Playwright test
 * exercises the actual grading, logging and clamping logic rather than a
 * re-implementation of it.
 *
 * The declared `StoreApi` return type is deliberate, if the real hook's
 * surface changes, this file stops compiling.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { isAllowedEmail } from './firebase.e2e';
import { emptyStore, mergeSettings, type Settings, type Store } from './storage';
import type { CardState, Grade } from './srs';
import { E2E_AUTH_EVENT, E2E_AUTH_KEY, E2E_STORE_KEY } from './e2e-keys';
import {
  applyAnswer,
  applyReset,
  applyToggleStar,
  applyUpdateSettings,
  daysLeftUntil,
  examTimeOf,
} from './store-ops';
import type { AuthStatus, StoreApi } from './useStore';

function readEmail(): string | null {
  return localStorage.getItem(E2E_AUTH_KEY);
}

function readStore(): Store {
  const raw = localStorage.getItem(E2E_STORE_KEY);
  if (!raw) return emptyStore();
  try {
    const parsed = JSON.parse(raw) as Partial<Store>;
    // Settings go through the same merge as a Firestore snapshot: a seeded
    // fixture writes only the keys its test cares about, so anything added
    // since (difficulty in #36, followPlan in #40) back-fills here too, and
    // so does the move off the old default quiz date.
    const base = emptyStore();
    return {
      cards: parsed.cards ?? base.cards,
      settings: mergeSettings(parsed.settings),
      log: parsed.log ?? base.log,
      starred: parsed.starred ?? base.starred,
    };
  } catch {
    return emptyStore();
  }
}

function statusFor(email: string | null): AuthStatus {
  if (!email) return 'signed-out';
  return isAllowedEmail(email) ? 'ready' : 'denied';
}

/** A stand-in for the Firebase User, only `email` and `uid` are ever read. */
function fakeUser(email: string): User {
  return { uid: `e2e-${email}`, email, displayName: email.split('@')[0] } as User;
}

export function useStore(): StoreApi {
  const [email, setEmail] = useState<string | null>(readEmail);
  const [store, setStore] = useState<Store>(readStore);
  const storeRef = useRef(store);
  storeRef.current = store;

  // Mirrors onAuthStateChanged: sign-in and sign-out re-render the shell.
  useEffect(() => {
    const sync = () => setEmail(readEmail());
    window.addEventListener(E2E_AUTH_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(E2E_AUTH_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const authStatus = statusFor(email);

  const commit = useCallback((next: Store) => {
    storeRef.current = next;
    setStore(next);
    localStorage.setItem(E2E_STORE_KEY, JSON.stringify(next));
  }, []);

  const examTime = useMemo(() => examTimeOf(store.settings), [store.settings]);

  const answer = useCallback(
    (id: string, g: Grade) => commit(applyAnswer(storeRef.current, id, g, examTime)),
    [examTime, commit],
  );

  const toggleStar = useCallback(
    (id: string) => commit(applyToggleStar(storeRef.current, id)),
    [commit],
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => commit(applyUpdateSettings(storeRef.current, patch)),
    [commit],
  );

  const replaceStore = useCallback((next: Store) => commit(next), [commit]);

  const reset = useCallback(() => commit(applyReset(storeRef.current)), [commit]);

  return {
    store,
    cards: store.cards as Record<string, CardState>,
    answer,
    toggleStar,
    updateSettings,
    replaceStore,
    reset,
    examTime,
    daysLeft: daysLeftUntil(examTime),
    authStatus,
    // The real hook waits on a Firestore snapshot; localStorage is already here.
    storeReady: authStatus === 'ready',
    user: email ? fakeUser(email) : null,
  };
}
