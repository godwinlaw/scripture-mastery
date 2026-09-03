/**
 * One question, three sets of wrong options, one per difficulty setting (#36).
 *
 * The sets are computed here, once, at generation time and baked onto the item,
 * rather than regenerating the bank when the setting changes. Item ids have to
 * stay byte-identical because SRS history is keyed on them, so a bank that
 * varied with the setting would detach every card the moment someone touched
 * the control. Generation stays difficulty-blind; only the render site chooses.
 *
 * The `medium` set is whatever the app produced before this file existed, and
 * it is still what lands in `Item.distractors`, so every existing reader,
 * validate.ts, the content-contract tests, the quiz results table, is
 * untouched.
 */
import { BOOKS_BY_ID, canonPool, nearbyPool } from '../data/books';
import type { Book, Difficulty } from '../data/types';
import { pickDistractors } from './rng';
import { MAX_WRONG_OPTIONS } from './difficulty';

/**
 * How tight `hard` is allowed to be for this question.
 *
 * Chapter Content asks about the inside of one book, so its wrong options can
 * come from that same book and still be answerable. High-level Events questions
 * ("in which book does this happen?") have no inside to draw from, the answer
 * *is* a book, so the tightest honest pool there is the surrounding division.
 */
export type HardScope = 'book' | 'division';

export interface DistractorSets {
  /** The medium set, unchanged from what the app has always generated. */
  distractors: string[];
  /** The easy and hard alternates. Medium is omitted, it is `distractors`. */
  distractorsBy: Partial<Record<Difficulty, string[]>>;
}

/**
 * The pool `hard` draws from: as close to the answer as it can get while still
 * filling the card.
 *
 * The widening matters more than the tightness. A pool that cannot supply `n`
 * distinct options leaves a question with three choices instead of four, and a
 * three-choice question is *easier*, which would invert the entire setting.
 * So when the strict pool comes up short we fall back to the same ring-by-ring
 * widening `medium` uses: own division first, one division further out per
 * step, and never across the Testament seam.
 */
function hardPool(
  bookId: string,
  extract: (b: Book) => string[],
  answer: string,
  n: number,
  scope: HardScope,
): string[] {
  if (scope === 'book') {
    const own = BOOKS_BY_ID[bookId];
    const inside = own ? [...new Set(extract(own))].filter((s) => s !== answer) : [];
    if (inside.length >= n) return inside;
  }
  // Division scope starts here anyway: nearbyPool's first ring is booksNear(id, 0),
  // the book's own division, and it widens only when that cannot fill the card.
  return nearbyPool(bookId, extract, answer, n);
}

/**
 * Build all three option sets for one question.
 *
 * `extract` pulls candidate strings out of a book, exactly as `nearbyPool`
 * expects, and it is where any per-question exclusion belongs, books that also
 * record the event return `[]`, so that the widening counts only books it can
 * actually offer. Filtering after the pool is built would let a division look
 * full, stop widening, and then come up short (#12).
 *
 * Each set gets its own seed suffix. Without that, a wider pool reshuffled by
 * the same seed lands on nearly the same handful of strings and easy, medium
 * and hard become three names for one question.
 */
export function distractorSets(
  bookId: string,
  extract: (b: Book) => string[],
  answer: string,
  seed: string,
  hardScope: HardScope,
  n = 3,
): DistractorSets {
  // `hard` asks for the widest set any setting renders, not `n`: the render
  // site slices down per setting, and a hard card that could only fill three
  // slots would show fewer choices than medium, easier, not harder (#40).
  return scopedSets(answer, seed, {
    medium: nearbyPool(bookId, extract, answer, n),
    easy: [() => canonPool(extract, answer)],
    hard: [
      () => hardPool(bookId, extract, answer, MAX_WRONG_OPTIONS, hardScope),
      () => hardPool(bookId, extract, answer, n, hardScope),
      () => nearbyPool(bookId, extract, answer, MAX_WRONG_OPTIONS),
    ],
  }, n);
}

/**
 * Walk `chain` from its tightest pool outward and return the first that can
 * supply `n` distinct options other than `answer`; if none can, return the
 * widest.
 *
 * Every scoped pool in the app needs this shape, because tightness that
 * silently yields a short pool does not make a question harder, it makes it
 * *shorter*, and a three-choice question is easier than a six-choice one. The
 * widening is the guarantee that a `hard` card is never accidentally the
 * easiest card on screen (#40).
 */
export function layeredPool(
  chain: readonly (() => string[])[],
  answer: string,
  n: number,
): string[] {
  let widest: string[] = [];
  for (const build of chain) {
    const pool = [...new Set(build())].filter((s) => s && s !== answer);
    if (pool.length > widest.length) widest = pool;
    if (pool.length >= n) return pool;
  }
  return widest;
}

/**
 * The one entry point every generator uses to bake its three option sets.
 *
 * `medium` is passed as a ready-made pool because it has to stay byte-identical
 * to what the generator produced before, `Item.distractors` is what validate.ts,
 * the content-contract tests and every existing user's rendered card read, and
 * item ids are the key SRS history is stored under. `easy` and `hard` are
 * chains: `hard` tightest-first, widening only when the tight pool cannot fill
 * the card; `easy` widest-first, because the whole point of easy is options
 * that are wrong on sight.
 *
 * Each set gets its own seed suffix. Without that a wider pool reshuffled by
 * the same seed lands on nearly the same handful of strings, and the three
 * settings become three names for one question.
 */
export function scopedSets(
  answer: string,
  seed: string,
  pools: {
    medium: readonly string[];
    easy: readonly (() => string[])[];
    hard: readonly (() => string[])[];
  },
  n = 3,
): DistractorSets {
  const distractors = pickDistractors(pools.medium, answer, n, seed);
  const floor = distractors.length;
  const easyPool = layeredPool(pools.easy, answer, Math.max(floor, n));
  const hardPool = layeredPool(pools.hard, answer, MAX_WRONG_OPTIONS);

  const easy = pickDistractors(easyPool, answer, Math.max(floor, n), `${seed}:easy`);
  let hard = pickDistractors(hardPool, answer, MAX_WRONG_OPTIONS, `${seed}:hard`);

  // The thinness guard. A hard set shorter than the medium one would render
  // fewer choices than medium does, inverting the setting. Top it up from the
  // wider pools rather than shipping a three-choice "hard" question.
  if (hard.length < floor) {
    const topUp = pickDistractors(
      [...hardPool, ...easyPool, ...pools.medium],
      answer,
      MAX_WRONG_OPTIONS,
      `${seed}:hard:topup`,
    );
    hard = [...new Set([...hard, ...topUp])].slice(0, MAX_WRONG_OPTIONS);
  }

  return { distractors, distractorsBy: { easy, hard } };
}
