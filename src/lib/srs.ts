/**
 * SM-2 style scheduler with one deliberate change: intervals are clamped so that
 * every card comes back at least once before the exam date. A card scheduled for
 * 60 days out is useless when the test is in 40.
 */
import type { Difficulty } from '../data/types';
import { specFor, type DifficultySpec } from './difficulty';
import { seededShuffle, shuffle } from './rng';

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

/** What the queue needs to know about an item to order new cards intelligently. */
export interface ItemMeta {
  tier: 1 | 2 | 3;
  book?: string;
}

export interface QueueOptions {
  /** Max new cards to introduce this session. */
  newLimit: number;
  /** Max total cards this session. */
  sessionLimit: number;
  /**
   * Which cards the session takes, and in what order it opens new ground
   * (#36, #40). It now drives three things, not one: how hard the cut at the
   * session limit leans on per-card ease, how many new cards the limit really
   * allows, and — the point of #40 — the order unseen material is drawn in.
   *
   * Absent means today's behaviour exactly: no ease lean, no reordering, the
   * configured new-card limit taken at face value. That is deliberately *not*
   * the same as passing `medium`, which opts into the spec's ordering rules
   * even where they happen to be no-ops.
   */
  difficulty?: Difficulty;
  /**
   * Per-item metadata, keyed by item id. Absent means today's behaviour: book
   * spreading and tier bias both need to know something about an item that its
   * id does not carry, so without this they are skipped rather than guessed at.
   */
  meta?: Record<string, ItemMeta>;
  /**
   * Rotates the shuffled new-card order. Callers pass a per-day value.
   *
   * Shuffled has to be unpredictable *between* days and stable *within* one:
   * a session that reshuffled on every reload would hand you a different set
   * of new cards mid-study. Seeding on the day gives both. Defaults to the
   * date derived from `now`.
   */
  seed?: string;
}

/**
 * Selection priority for a due card: lower goes first, and it is the cut at
 * the session limit that really consumes this.
 *
 * `ease` is the scheduler's own record of how hard *this* user finds *this*
 * card, which makes it the honest signal for the setting: a positive lean
 * (`hard`) pulls forward the cards you keep fumbling, a negative one (`easy`)
 * pulls forward the ones you have nearly got.
 *
 * The magnitude of the lean now comes from the difficulty spec rather than a
 * constant here (#40), so the setting can say *how much* it leans and not just
 * which way. It is still measured in days of borrowed urgency, and still kept
 * small enough that a badly overdue card leads regardless — the queue's first
 * duty is that nothing sails past its due date unreviewed.
 *
 * A lean of 0 (`medium`, and the no-difficulty default) returns the bare due
 * date early. The arithmetic would come out the same, but returning `c.due`
 * itself keeps that path byte-identical to the sort buildQueue has always
 * done, rather than merely equivalent to it.
 */
function priority(c: CardState, spec: DifficultySpec): number {
  if (spec.easeLeanDays === 0) return c.due;
  return c.due + (c.ease - 2.5) * spec.easeLeanDays * DAY;
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

  const spec = specFor(opts.difficulty);
  due.sort((a, b) => priority(cards[a], spec) - priority(cards[b], spec));
  const picked = [...due, ...orderNew(fresh, opts, spec, now)];
  // Order matters twice here, for different reasons.
  //
  // Selecting: sort by how overdue a card is, interleave the books, and only
  // then cut to the session limit — so a truncated session still takes the
  // most urgent cards and a spread of books, not the first N of one.
  //
  // The difficulty setting leans on that sort (#36): it changes which due
  // cards win the cut. Due cards only — every new card carries the same seeded
  // ease, so there is no signal there to weight on. What decides *which* new
  // cards get introduced is orderNew (#40), a separate question the ease lean
  // cannot answer.
  //
  // Presenting: shuffle what survived. The selection above is deterministic,
  // so without this you meet the same cards in the same order every day and
  // start recalling the sequence rather than the answer (#11). Note this is
  // the presentation shuffle, not #40's: it reorders one session's cards after
  // the cut, and cannot change which cards were introduced in the first place.
  // Cut by urgency first, then spread. Interleaving before the cut let the
  // round-robin decide which cards survived it (#41).
  return shuffle(interleave(picked.slice(0, opts.sessionLimit), opts.meta));
}

/**
 * Choose which unseen cards this session introduces, and take the difficulty's
 * share of them (#40).
 *
 * The complaint this answers: "build the frame is great in going through all of
 * the books but it's in order — for hard mode it's too easy to predict." It was
 * literally true. `fresh` arrives in the bank's generation order, which is the
 * canonical order, so new material marched Genesis-first through the canon at
 * every setting. Within-session shuffling never touched that, because it only
 * reorders cards that have already been chosen.
 *
 * So the fix has to happen here, before the cut. Note the ordering of the two
 * steps: newOrder first, tier bias second and *stable*, so the bias is a bias —
 * it floats a tier forward while leaving the shuffle intact within that tier.
 * Sorting by tier first would have the shuffle undo it.
 *
 * With no `difficulty` this is the old `fresh.slice(0, newLimit)` untouched,
 * which is what keeps every existing caller's behaviour exactly as it was.
 */
function orderNew(fresh: string[], opts: QueueOptions, spec: DifficultySpec, now: number): string[] {
  if (!opts.difficulty) return fresh.slice(0, opts.newLimit);

  const meta = opts.meta;
  let ordered = fresh;

  if (spec.newOrder === 'shuffled') {
    // Seeded, not Math.random(): the day's new material has to be drawn from
    // anywhere in the scope, but a reload must not deal a different hand
    // mid-session. A per-day seed rotates the draw exactly once a day.
    ordered = seededShuffle(ordered, opts.seed ?? new Date(now).toISOString().slice(0, 10));
  } else if (spec.newOrder === 'interleaved' && meta) {
    ordered = spreadByBook(ordered, meta);
  }

  // Tier bias needs to know each item's tier, and ids do not carry it, so
  // without meta there is nothing to bias on — skip rather than guess.
  //
  // `canonical` is exempt, and that exemption is the point rather than an
  // oversight. Floating tier 1 forward reorders across the whole canon: the
  // foundational items are scattered through it, so a member on `easy` opened
  // on Isaiah instead of Genesis. Walking the books in order *is* easy mode's
  // pedagogy — the frame has to be built front to back — so nothing is allowed
  // to reorder it. The settings that shuffle or spread have already given up
  // canonical position, and there the bias costs nothing (#40).
  if (meta && spec.tierBias !== 'balanced' && spec.newOrder !== 'canonical') {
    const dir = spec.tierBias === 'foundation-first' ? 1 : -1;
    // Array.prototype.sort is stable per spec (ES2019+), which is load-bearing
    // here: it is what makes this a nudge on top of the order above rather
    // than a replacement for it.
    ordered = ordered.slice().sort((a, b) => dir * (tierOf(a, meta) - tierOf(b, meta)));
  }

  // Easy opens less new ground and spends the session consolidating; hard
  // pushes more. A configured limit of 0 stays 0 — someone who has switched
  // new cards off has not asked for one anyway.
  const limit = opts.newLimit <= 0 ? 0 : Math.max(1, Math.round(opts.newLimit * spec.newLimitFactor));
  return ordered.slice(0, limit);
}

function tierOf(id: string, meta: Record<string, ItemMeta>): number {
  return meta[id]?.tier ?? 2;
}

function bookOf(id: string, meta?: Record<string, ItemMeta>): string {
  // Same fallback key `interleave` uses, so an item missing a book still gets
  // grouped the way the rest of the queue groups it.
  return meta?.[id]?.book ?? id.split('-').slice(0, 2).join('-');
}

/**
 * The beginner-friendly middle: keep the canonical march, but stop it handing
 * you six consecutive cards from the same book.
 *
 * Deliberately *not* a round-robin across books like `interleave` below — that
 * would deal one card from each of the sixty-six books before returning to
 * Genesis, which is not a march through the canon at all, it is a random-access
 * tour with extra steps. Instead this walks the list in order and only defers a
 * card when it would repeat the book just emitted, which spreads adjacent cards
 * while leaving the large-scale progression intact.
 */
function spreadByBook(ids: string[], meta: Record<string, ItemMeta>): string[] {
  const remaining = ids.slice();
  const out: string[] = [];
  let last: string | undefined;
  while (remaining.length > 0) {
    let idx = 0;
    if (last !== undefined) {
      const alt = remaining.findIndex((id) => bookOf(id, meta) !== last);
      if (alt !== -1) idx = alt;
    }
    const [id] = remaining.splice(idx, 1);
    out.push(id);
    last = bookOf(id, meta);
  }
  return out;
}

/** Spread same-prefix items apart so you are not answering six Genesis cards in a row. */
function interleave(ids: string[], meta?: Record<string, ItemMeta>): string[] {
  const buckets = new Map<string, string[]>();
  for (const id of ids) {
    // Bucket by book. The id prefix looks like a book key and is not one: it
    // yields families such as `gen-position` and `det-ev`, each spanning the
    // whole canon, so nearly the entire bank lands in a handful of buckets that
    // are all "every book". Round-robin across those does not spread books at
    // all — and because the session cut happens after this, it also decides
    // *which* cards survive: a bucket holding two due cards got the same share
    // as one holding nine hundred, so the most overdue cards were routinely
    // cut. Falls back to the old key only when meta is absent (#41).
    const key = bookOf(id, meta) || id.split('-').slice(0, 2).join('-');
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
