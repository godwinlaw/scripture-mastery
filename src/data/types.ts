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
  /** Traditional/commonly-taught author — what a survey quiz expects. */
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

export type QuestionKind =
  | 'mcq'      // pick one of four
  | 'type'     // type the answer
  | 'order';   // arrange in sequence

/** A single testable atom. */
export interface Item {
  /** Stable id — survives regeneration so SRS history is preserved. */
  id: string;
  kind: QuestionKind;
  /** Topic tag used for filtering and for the study plan. */
  topic: Topic;
  prompt: string;
  answer: string;
  /** Wrong options for mcq. Generated pools keep these plausible. */
  distractors?: string[];
  /** For 'order' questions: the correct sequence. */
  sequence?: string[];
  /** Accepted alternate spellings for 'type' questions. */
  accepts?: string[];
  /** Shown after answering — the "why", so a miss teaches something. */
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
  | 'numbers'
  | 'christ';

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
  christ: 'Christ in Scripture',
};
