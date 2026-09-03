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

export type Topic =
  | 'book-order'
  | 'summaries'
  | 'chapters'
  | 'people'
  | 'relationships'
  | 'events'
  | 'places'
  | 'timeline'
  | 'numbers';

export const TOPIC_LABELS: Record<Topic, string> = {
  'book-order': 'Book Order',
  summaries: 'Book Summaries',
  chapters: 'Chapter Content',
  people: 'People',
  relationships: 'Family & Relationships',
  events: 'Events',
  places: 'Places',
  timeline: 'Timeline',
  numbers: 'Numbers & Counts',
};
