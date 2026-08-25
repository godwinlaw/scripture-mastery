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
import type { FocusTrack } from '../data/tracks';

const DAY_MS = 86_400_000;

/** End of the exam day — the ceiling every SRS interval is clamped under. */
export function examTimeOf(settings: Settings): number {
  return new Date(`${settings.examDate}T23:59:59`).getTime();
}

/**
 * Whether a date string is one this module can safely do arithmetic on.
 *
 * The failure being guarded is silent, which is why it gets a named function
 * rather than an inline check. `new Date('T23:59:59')` — what an empty date
 * produces — is NaN, and `srs.grade` writes the exam clamp as
 * `daysLeft = Math.max(0, Math.ceil((examTime - now) / DAY))` followed by
 * `daysLeft > 0`. NaN fails that comparison rather than throwing, so the clamp
 * simply stops applying and cards begin scheduling past the test date never to
 * return. The one place this app deliberately departs from SM-2 disappears, and
 * nothing on screen says so. It has bitten this codebase once already (#40).
 *
 * It lives beside `examTimeOf` rather than in a view because the quiz date is
 * editable from two screens, and the first version of this guard was written in
 * only one of them — so the Study Plan copy of the field went on committing the
 * bad value unchecked (#41).
 */
export function isUsableExamDate(raw: string): boolean {
  return raw !== '' && Number.isFinite(new Date(`${raw}T23:59:59`).getTime());
}

/**
 * End of the exam day for one focus track — the ceiling every interval graded
 * inside that track is clamped under, and the reason `trackExams` exists.
 *
 * A focus track is a separate course with a separate test, so grading a Samuel
 * card against the survey's October date would schedule it straight past the
 * test it is being studied for. The whole value of the track is that its cards
 * come back before *its* date.
 *
 * Two sources, and a floor under both:
 *
 * 1. `settings.trackExams[track.id]`, when the member has set one. An explicit
 *    answer wins, including one set in the past.
 * 2. `track.defaultExam`, the date the track ships with.
 *
 * An empty or malformed saved value falls through to the default rather than
 * producing NaN — see `isUsableExamDate` for what a NaN exam time costs. A
 * track whose own `defaultExam` is malformed would be a bug in tracks.ts, but
 * the guard covers it too and returns 0 (a time in 1970, which reads as "the
 * exam has passed" and leaves the clamp off rather than silently disabled) so
 * that no caller downstream ever has to test for NaN.
 */
export function trackExamOf(store: Store, track: FocusTrack): number {
  const saved = store.settings.trackExams?.[track.id];
  const chosen = saved && isUsableExamDate(saved) ? saved : track.defaultExam;
  const t = new Date(`${chosen}T23:59:59`).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** The ISO date a track's field should show — what `trackExamOf` resolved, as text. */
export function trackExamDateOf(store: Store, track: FocusTrack): string {
  const saved = store.settings.trackExams?.[track.id];
  return saved && isUsableExamDate(saved) ? saved : track.defaultExam;
}

export function daysLeftUntil(examTime: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((examTime - now) / DAY_MS));
}

/** `YYYY-MM-DD`, the only shape `planStart` and `SessionLog.date` are ever written in. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The date the study plan is measured from — the other end of the interval
 * `examTimeOf` gives, and the fix for #40.
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
