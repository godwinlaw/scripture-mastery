/**
 * What each difficulty setting actually changes.
 *
 * Before this file the setting had two effects: it swapped the wrong-option set
 * on the ~30% of items that carried alternates, and it leaned the review queue
 * by ease. Everything else, how many options a question offers, whether it
 * asks for free recall first, and the order new material is introduced in,
 * was identical at all three settings, which is why `hard` did not feel hard
 * and `easy` did not feel easy.
 *
 * The rule that governs every dial below: **the item bank stays
 * difficulty-blind**. Item ids are the key SRS history is stored under, so a
 * bank that generated different items per setting would detach every card the
 * moment someone touched the control. Difficulty therefore lives entirely in
 * (a) which of an item's pre-baked option sets is rendered, (b) how much of it
 * is rendered, and (c) which cards get selected and in what order.
 */
import type { Difficulty } from '../data/types';

export interface DifficultySpec {
  /**
   * Wrong options offered alongside the answer.
   *
   * Fewer choices is straightforwardly easier, a 3-option question is a coin
   * flip after one elimination, so this is the single cheapest honest dial in
   * the whole system, and it costs nothing in item stability.
   */
  wrongOptions: number;
  /**
   * Whether a question whose answer is a scripture reference opens with a
   * chance to name it from memory before any options appear (#14).
   *
   * Free recall is strictly harder than recognition, so `easy` skips straight
   * to the choices and `hard` always asks first.
   */
  bonusRound: boolean;
  /**
   * How new cards are ordered as they are introduced.
   *
   * `canonical` walks the bank in generation order, Genesis first, straight
   * through the canon. That is the right shape for a beginner building the
   * frame, and it is exactly what made the trainer predictable at every other
   * setting: you could tell what was coming next from where you were.
   */
  newOrder: 'canonical' | 'interleaved' | 'shuffled';
  /**
   * Which detail tiers new material is drawn from first. 1 = foundational,
   * 3 = fine detail. `hard` stops protecting you from tier 3.
   */
  tierBias: 'foundation-first' | 'balanced' | 'detail-first';
  /**
   * Multiplier on the configured new-card limit. Easy introduces less at once
   * and spends the session consolidating; hard pushes more new ground.
   */
  newLimitFactor: number;
  /**
   * How hard the queue leans on per-card ease when it cuts to the session
   * limit, in days of borrowed urgency. Signed by the setting: `hard` pulls
   * forward the cards you keep fumbling, `easy` the ones you nearly have.
   */
  easeLeanDays: number;
  /** Whether missed cards come back inside the same session. */
  requeueMissed: boolean;
  /** Whether the answer's explanation is offered before answering, as a hint. */
  hintBeforeAnswer: boolean;
}

export const DIFFICULTY_SPEC: Record<Difficulty, DifficultySpec> = {
  easy: {
    wrongOptions: 2,
    bonusRound: false,
    newOrder: 'canonical',
    tierBias: 'foundation-first',
    newLimitFactor: 0.6,
    easeLeanDays: -3,
    requeueMissed: true,
    hintBeforeAnswer: true,
  },
  medium: {
    wrongOptions: 3,
    bonusRound: true,
    newOrder: 'interleaved',
    tierBias: 'balanced',
    newLimitFactor: 1,
    easeLeanDays: 0,
    requeueMissed: true,
    hintBeforeAnswer: false,
  },
  hard: {
    wrongOptions: 5,
    bonusRound: true,
    newOrder: 'shuffled',
    tierBias: 'detail-first',
    newLimitFactor: 1.5,
    easeLeanDays: 3,
    requeueMissed: false,
    hintBeforeAnswer: false,
  },
};

export function specFor(d: Difficulty | undefined): DifficultySpec {
  return DIFFICULTY_SPEC[d ?? 'medium'];
}

/**
 * How many wrong options a generator has to bake so that every setting can be
 * served from one difficulty-blind bank: the largest number any setting asks
 * for. Rendering slices down; it never has to reach for more.
 */
export const MAX_WRONG_OPTIONS = Math.max(
  ...Object.values(DIFFICULTY_SPEC).map((s) => s.wrongOptions),
);
