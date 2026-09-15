import { copy } from '../copy';
export type Testament = 'OT' | 'NT';

export type Division =
  | 'Law'
  | 'History'
  | 'Wisdom'
  | 'Major Prophets'
  | 'Minor Prophets'
  | 'Gospels'
  | 'Acts'
  | 'Pauline Epistles'
  | 'General Epistles'
  | 'Apocalyptic';

export interface KeyChapter {
  /** Chapter reference within the book, e.g. "22" or "6-9" */
  ch: string;
  /** What happens there, in a single recallable clause. */
  what: string;
}

export interface Book {
  id: string;
  name: string;
  abbr: string;
  /** Canonical position, 1-66. */
  order: number;
  testament: Testament;
  division: Division;
  /** Traditional/commonly-taught author, what a survey quiz expects. */
  author: string;
  /** Nuance a quiz might not ask for but you should know. */
  authorNote?: string;
  chapters: number;
  /** Approximate date of the events or the writing. */
  era: string;
  /** One-sentence summary of the whole book. */
  oneLine: string;
  /**
   * The O of ANCHORED (#35), the handle you hang the book on, terser than
   * `oneLine` and testable in both directions for all 66. The framework asks
   * for "one word or sentence"; a word alone collides (several books are about
   * beginnings), and a sentence is a recital, so a line is what actually sticks.
   */
  line: string;
  /** The single theme to hang everything else on. */
  theme: string;
  keyPeople: string[];
  keyEvents: string[];
  keyChapters: KeyChapter[];
  /** A landmark verse, cited by reference (ESV). */
  keyVerse?: { ref: string; text: string };
  /** Mnemonic or association to make the book stick. */
  hook?: string;
}

/**
 * How tightly wrong options are drawn, and which cards the review queue
 * favours (#36).
 *
 * `medium` is what the app has always done, options from the answer's own
 * division, widening outward, never crossing the Old/New Testament seam, so
 * it is the default and an existing user sees no change.
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

export type QuestionKind =
  | 'mcq'      // pick one of four
  | 'type'     // type the answer
  | 'order';   // arrange in sequence

/** A single testable atom. */
export interface Item {
  /** Stable id, survives regeneration so SRS history is preserved. */
  id: string;
  kind: QuestionKind;
  /** Topic tag used for filtering and for the study plan. */
  topic: Topic;
  prompt: string;
  answer: string;
  /** Wrong options for mcq. Generated pools keep these plausible. */
  distractors?: string[];
  /**
   * Alternate option sets for the easy and hard settings (#36).
   *
   * All three sets are baked in at generation rather than regenerating the
   * bank when the setting changes, because `id` has to stay stable, SRS
   * history is keyed on it, so a bank that regenerated per difficulty would
   * detach every card the moment someone toggled the control. Keeping
   * `distractors` as the medium set also means every existing reader keeps
   * working untouched; only the render site consults this.
   */
  distractorsBy?: Partial<Record<Difficulty, string[]>>;
  /** For 'order' questions: the correct sequence. */
  sequence?: string[];
  /** Accepted alternate spellings for 'type' questions. */
  accepts?: string[];
  /** Shown after answering, the "why", so a miss teaches something. */
  explain?: string;
  /** Book id this item belongs to, when applicable. */
  book?: string;
  /** 1 = foundational, 2 = standard, 3 = fine detail. */
  tier: 1 | 2 | 3;
}

/**
 * The eight strands of ANCHORED (#35).
 *
 * The first six come from the framework a college-ministry podcast lays out for
 * surveying scripture: arc, names, cities, historical context, one word per
 * book, rituals and festivals. **The last two are ours**: the transcript stops
 * at R and then changes subject, so ANCHOR is the source's complete acronym.
 * Essentials and Doctrine complete the word the episode is named after, and
 * both cover real ground the framework leaves out: the must-know lists, and
 * where primary doctrine is found in the text.
 *
 * Declared in acronym order, because the quiz's topic control renders
 * `TOPIC_LABELS` in insertion order and the list should read A-N-C-H-O-R-E-D.
 */
export type Topic =
  | 'arc'
  | 'names'
  | 'cities'
  | 'context'
  | 'oneline'
  | 'rituals'
  | 'essentials'
  | 'doctrine';

/**
 * The eight labels, sourced from `copy.ts` so every user-facing string in the
 * app lives in one file. The letter is part of the label rather than a second
 * map, so every render site, the quiz filter, the dashboard's mastery rows,
 * the plan pills, the pill on each card, teaches the acronym for free.
 *
 * The annotation is what keeps `copy` honest: drop a strand from
 * `copy.strands.labels` and this stops compiling.
 */
export const TOPIC_LABELS: Record<Topic, string> = copy.strands.labels;
