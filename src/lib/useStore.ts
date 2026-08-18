import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, isAllowedEmail } from './firebase';
import { emptyStore, todayISO, type Settings, type Store } from './storage';
import { grade as gradeCard, newCard, type CardState, type Grade } from './srs';

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

  const examTime = useMemo(
    () => new Date(`${store.settings.examDate}T23:59:59`).getTime(),
    [store.settings.examDate],
  );

  const answer = useCallback(
    (id: string, g: Grade) => {
      const prev = storeRef.current;
      const card = prev.cards[id] ?? newCard(id);
      const next = gradeCard(card, g, examTime);
      const date = todayISO();
      const log = [...prev.log];
      const todayEntry = log.find((l) => l.date === date);
      if (todayEntry) {
        todayEntry.reviewed += 1;
        if (g > 0) todayEntry.correct += 1;
      } else {
        log.push({ date, reviewed: 1, correct: g > 0 ? 1 : 0 });
      }
      commit({ ...prev, cards: { ...prev.cards, [id]: next }, log });
    },
    [examTime, commit],
  );

  const toggleStar = useCallback(
    (id: string) => {
      const prev = storeRef.current;
      commit({
        ...prev,
        starred: prev.starred.includes(id)
          ? prev.starred.filter((s) => s !== id)
          : [...prev.starred, id],
      });
    },
    [commit],
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      const prev = storeRef.current;
      commit({ ...prev, settings: { ...prev.settings, ...patch } });
    },
    [commit],
  );

  const replaceStore = useCallback((next: Store) => commit(next), [commit]);

  const reset = useCallback(() => {
    const prev = storeRef.current;
    commit({ ...prev, cards: {}, log: [], starred: [] });
  }, [commit]);

  const daysLeft = Math.max(0, Math.ceil((examTime - Date.now()) / 86_400_000));

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
