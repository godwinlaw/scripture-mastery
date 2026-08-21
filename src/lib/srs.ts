/**
 * SM-2 style scheduler with one deliberate change: intervals are clamped so that
 * every card comes back at least once before the exam date. A card scheduled for
 * 60 days out is useless when the test is in 40.
 */
import type { Difficulty } from '../data/types';
import { shuffle } from './rng';

export type Grade = 0 | 1 | 2 | 3; // again | hard | ok | easy

export interface CardState {
  id: string;
  ease: number;
  /** Days until next review. */
  interval: number;
  reps: number;
  lapses: number;
  /** Epoch ms. */
  due: number;
  lastSeen: number;
  /** Rolling record of the last few grades, newest last. */
  recent: Grade[];
}

export const DAY = 86_400_000;

export function newCard(id: string): CardState {
  return { id, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: 0, lastSeen: 0, recent: [] };
}

/** Cards that keep failing — worth studying differently rather than drilling. */
export function isLeech(c: CardState): boolean {
  return c.lapses >= 4;
}

export function isNew(c: CardState | undefined): boolean {
  return !c || c.reps === 0;
}

export function isDue(c: CardState | undefined, now = Date.now()): boolean {
  return !c || c.due <= now;
}

/**
 * Grade a card and return its next state.
 * `examDate` clamps the interval so nothing sails past the test unreviewed.
 */
export function grade(card: CardState, g: Grade, examDate: number, now = Date.now()): CardState {
  const next: CardState = { ...card, recent: [...card.recent, g].slice(-8) };
  next.lastSeen = now;
  next.reps += 1;

  if (g === 0) {
    next.lapses += 1;
    next.ease = Math.max(1.3, card.ease - 0.2);
    next.interval = 0; // same-session repeat
    next.due = now + 60_000; // back in a minute
    return next;
  }

  // Ease adjustment mirrors SM-2's quality response curve.
  if (g === 1) next.ease = Math.max(1.3, card.ease - 0.15);
  if (g === 3) next.ease = Math.min(3.0, card.ease + 0.1);

  const step = card.interval;
  let interval: number;
  if (step === 0) interval = g === 1 ? 1 : g === 2 ? 1 : 3;
  else if (step <= 1) interval = g === 1 ? 2 : g === 2 ? 3 : 5;
  else interval = Math.round(step * next.ease * (g === 1 ? 0.6 : g === 3 ? 1.3 : 1));

  interval = Math.max(1, interval);

  // Exam clamp: leave room for at least one more review before the test.
  const daysLeft = Math.max(0, Math.ceil((examDate - now) / DAY));
  if (daysLeft > 0) interval = Math.min(interval, Math.max(1, Math.floor(daysLeft / 2)));

  next.interval = interval;
  next.due = now + interval * DAY;
  return next;
}

/** How well-known a card is, 0–1. Used for progress bars and weak-spot ranking. */
export function strength(c: CardState | undefined): number {
  if (!c || c.reps === 0) return 0;
  const recent = c.recent.slice(-4);
  if (recent.length === 0) return 0;
  const score = recent.reduce<number>((sum, g) => sum + (g === 0 ? 0 : g === 1 ? 0.5 : g === 2 ? 0.85 : 1), 0) / recent.length;
  // Long intervals mean it has survived spacing, which counts for something.
  const durability = Math.min(1, c.interval / 14);
  return Math.min(1, score * 0.75 + durability * 0.25);
}

export interface QueueOptions {
  /** Max new cards to introduce this session. */
  newLimit: number;
  /** Max total cards this session. */
  sessionLimit: number;
  /**
   * Which cards a truncated session should favour (#36). Absent means
   * `medium`, which is no weighting at all.
   */
  difficulty?: Difficulty;
}

/**
 * How far a point of ease can move a card in the queue, expressed in days of
 * borrowed urgency. Large enough to reorder cards of similar overdue-ness,
 * small enough that a badly overdue card still leads — the queue's first duty
 * is that nothing sails past its due date unreviewed.
 */
const EASE_LEAN_DAYS = 3;

/**
 * Selection priority for a due card: lower goes first, and it is the cut at
 * the session limit that really consumes this.
 *
 * `ease` is the scheduler's own record of how hard *this* user finds *this*
 * card, which makes it the honest signal for the setting: `hard` pulls forward
 * the cards you keep fumbling, `easy` pulls forward the ones you have nearly
 * got. `medium` returns the bare due date — the same number buildQueue has
 * always sorted on, so that path is unchanged rather than merely equivalent.
 */
function priority(c: CardState, difficulty: Difficulty): number {
  if (difficulty === 'medium') return c.due;
  const lean = difficulty === 'hard' ? 1 : -1;
  return c.due + lean * (c.ease - 2.5) * EASE_LEAN_DAYS * DAY;
}

/**
 * Build a review queue: everything overdue first (most overdue first), then new
 * cards up to the limit. Interleaved rather than blocked — mixing topics beats
 * drilling one topic at a time.
 */
export function buildQueue(
  ids: string[],
  cards: Record<string, CardState>,
  opts: QueueOptions,
  now = Date.now(),
): string[] {
  const due: string[] = [];
  const fresh: string[] = [];

  for (const id of ids) {
    const c = cards[id];
    if (!c || c.reps === 0) fresh.push(id);
    else if (c.due <= now) due.push(id);
  }

  const difficulty = opts.difficulty ?? 'medium';
  due.sort((a, b) => priority(cards[a], difficulty) - priority(cards[b], difficulty));
  const picked = [...due, ...fresh.slice(0, opts.newLimit)];
  // Order matters twice here, for different reasons.
  //
  // Selecting: sort by how overdue a card is, interleave the books, and only
  // then cut to the session limit — so a truncated session still takes the
  // most urgent cards and a spread of books, not the first N of one.
  //
  // The difficulty setting leans on that sort and nothing else (#36): it
  // changes which cards win the cut, not how they are spread or presented.
  // New cards are left out of the lean deliberately — every one of them has
  // the same seeded ease, so there is no signal there to weight on.
  //
  // Presenting: shuffle what survived. The selection above is deterministic,
  // so without this you meet the same cards in the same order every day and
  // start recalling the sequence rather than the answer (#11).
  return shuffle(interleave(picked).slice(0, opts.sessionLimit));
}

/** Spread same-prefix items apart so you are not answering six Genesis cards in a row. */
function interleave(ids: string[]): string[] {
  const buckets = new Map<string, string[]>();
  for (const id of ids) {
    const key = id.split('-').slice(0, 2).join('-');
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(id);
  }
  const lists = [...buckets.values()];
  const out: string[] = [];
  let placed = 0;
  const total = ids.length;
  while (placed < total) {
    for (const list of lists) {
      const next = list.shift();
      if (next) {
        out.push(next);
        placed++;
      }
    }
  }
  return out;
}
