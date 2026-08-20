/**
 * Pure store transitions, split out of useStore.
 *
 * The hook owns the transport — Firestore in the app, localStorage in the E2E
 * build — and nothing else. Everything that decides what a store *becomes* when
 * you answer a card, star an item, or change a setting lives here, so both
 * hooks run the same code and a browser test exercises the real logic rather
 * than a re-implementation of it.
 */
import { todayISO, type Settings, type Store } from './storage';
import { grade as gradeCard, newCard, type Grade } from './srs';

const DAY_MS = 86_400_000;

/** End of the exam day — the ceiling every SRS interval is clamped under. */
export function examTimeOf(settings: Settings): number {
  return new Date(`${settings.examDate}T23:59:59`).getTime();
}

export function daysLeftUntil(examTime: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((examTime - now) / DAY_MS));
}

/** Grade one card and fold the result into today's session log. */
export function applyAnswer(
  store: Store,
  id: string,
  g: Grade,
  examTime: number,
  now = Date.now(),
): Store {
  const card = store.cards[id] ?? newCard(id);
  const next = gradeCard(card, g, examTime, now);
  const date = todayISO(new Date(now));
  const correct = g > 0 ? 1 : 0;
  const seenToday = store.log.some((l) => l.date === date);
  const log = seenToday
    ? store.log.map((l) =>
        l.date === date ? { ...l, reviewed: l.reviewed + 1, correct: l.correct + correct } : l,
      )
    : [...store.log, { date, reviewed: 1, correct }];
  return { ...store, cards: { ...store.cards, [id]: next }, log };
}

export function applyToggleStar(store: Store, id: string): Store {
  return {
    ...store,
    starred: store.starred.includes(id)
      ? store.starred.filter((s) => s !== id)
      : [...store.starred, id],
  };
}

export function applyUpdateSettings(store: Store, patch: Partial<Settings>): Store {
  return { ...store, settings: { ...store.settings, ...patch } };
}

/** Wipe review history but keep the member's settings. */
export function applyReset(store: Store): Store {
  return { ...store, cards: {}, log: [], starred: [] };
}
