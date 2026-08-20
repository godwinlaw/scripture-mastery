import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, isAllowedEmail } from './firebase';
import { emptyStore, type Settings, type Store } from './storage';
import type { CardState, Grade } from './srs';
import {
  applyAnswer,
  applyReset,
  applyToggleStar,
  applyUpdateSettings,
  daysLeftUntil,
  examTimeOf,
} from './store-ops';

export type AuthStatus = 'loading' | 'signed-out' | 'denied' | 'ready';

function storeDoc(uid: string) {
  return doc(db, 'users', uid);
}

export function useStore() {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [store, setStore] = useState<Store>(emptyStore);
  const [storeReady, setStoreReady] = useState(false);
  const storeRef = useRef(store);
  storeRef.current = store;

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthStatus(!u ? 'signed-out' : isAllowedEmail(u.email) ? 'ready' : 'denied');
      }),
    [],
  );

  useEffect(() => {
    setStoreReady(false);
    if (authStatus !== 'ready' || !user) return;
    const ref = storeDoc(user.uid);
    return onSnapshot(
      ref,
      (snap) => {
        const data = snap.exists() ? (snap.data() as Store) : emptyStore();
        storeRef.current = data;
        setStore(data);
        setStoreReady(true);
        if (!snap.exists()) setDoc(ref, data).catch((err) => console.error('Init store failed', err));
      },
      (err) => {
        console.error('Store sync failed', err);
        setStoreReady(true);
      },
    );
  }, [authStatus, user]);

  const commit = useCallback(
    (next: Store) => {
      storeRef.current = next;
      setStore(next);
      if (user && authStatus === 'ready') {
        setDoc(storeDoc(user.uid), next).catch((err) => console.error('Save failed', err));
      }
    },
    [user, authStatus],
  );

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

  const daysLeft = daysLeftUntil(examTime);

  return {
    store,
    cards: store.cards as Record<string, CardState>,
    answer,
    toggleStar,
    updateSettings,
    replaceStore,
    reset,
    examTime,
    daysLeft,
    authStatus,
    storeReady,
    user,
  };
}

export type StoreApi = ReturnType<typeof useStore>;
