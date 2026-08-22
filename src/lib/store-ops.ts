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

/** `YYYY-MM-DD`, the only shape `planStart` and `SessionLog.date` are ever written in. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The date the study plan is measured from — the other end of the interval
 * `examTimeOf` gives, and the fix for #38.
 *
 * `buildSchedule` defaults its start to `new Date()`, which was harmless while
 * the plan was only drawn on screen and fatal once the daily review began
 * filtering on it: re-anchoring to today on every call keeps today inside week
 * 1 forever, so `currentPhase` answered Phase 1 for every member on every day
 * until the exam passed. Anchoring needs a fact that does not move, so it lives
 * here beside `examTimeOf` rather than being re-guessed at each call site.
 *
 * Three sources, in order of how much they know:
 *
 * 1. `settings.planStart`, when it has been recorded. An explicit answer wins,
 *    including one deliberately set in the past or the future.
 * 2. The earliest day in the review log. This is the derivation for every store
 *    that predates the key, and it is the right one: a member who has been
 *    studying for six weeks should be six weeks into the plan, not sent back to
 *    Phase 1 by an upgrade. `min` over the whole log rather than `log[0]`,
 *    because an imported store's log carries no ordering guarantee — and ISO
 *    dates compare correctly as strings, so no parsing is needed to pick it.
 * 3. Today, for a store with no history at all — a genuinely new member, and
 *    the E2E fixtures, both of which should start at Phase 1.
 *
 * A malformed `planStart` (a hand-edited or foreign import) falls through to
 * the same chain rather than poisoning the schedule with an Invalid Date.
 *
 * Note what this means for `applyReset`, which clears the log but keeps
 * settings: a member who has never had `planStart` written also loses their
 * anchor and restarts at Phase 1. That is the intended reading of "start over".
 */
export function planStartOf(store: Store, now = new Date()): string {
  const explicit = store.settings.planStart;
  if (explicit && ISO_DATE.test(explicit)) return explicit;

  let earliest = '';
  for (const entry of store.log) {
    if (!ISO_DATE.test(entry.date)) continue;
    if (!earliest || entry.date < earliest) earliest = entry.date;
  }
  return earliest || todayISO(now);
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
