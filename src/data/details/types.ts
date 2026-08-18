/**
 * The detail layer.
 *
 * `books.ts` carries the frame — order, author, division, one-liner. That is
 * what gets you through a survey quiz's first round. This file's shape carries
 * the second round: what actually happens inside each book, chapter by chapter,
 * and who it happens to.
 *
 * Everything here is keyed by book id and generates questions mechanically, so
 * adding a book's detail entry adds questions everywhere at once.
 */

/** One movement of a book — the structural skeleton you can recite. */
export interface Section {
  /** Chapter range within the book, e.g. "1-11". */
  ch: string;
  /** What that block of chapters is doing. */
  title: string;
}

/** A single narrative episode, pinned to a reference and its participants. */
export interface DetailEvent {
  /** Chapter or chapter range, e.g. "22" or "6-9". */
  ref: string;
  /** Short name — how a quiz would refer to it. */
  name: string;
  /** What happens, in enough detail to answer a follow-up. */
  what: string;
  /** People involved. Names should match PEOPLE where they overlap. */
  who: string[];
  /** Where it happens, when the place is itself worth knowing. */
  where?: string;
  /** A detail that separates this episode from every similar one. */
  detail?: string;
}

/** A person's role *inside this particular book*. */
export interface Figure {
  name: string;
  /** What they do here — not their whole biography. */
  did: string;
  /** Where they show up. */
  ref?: string;
}

/** A word, title, or concept the book depends on. */
export interface Term {
  term: string;
  meaning: string;
}

/** A number the book is known for. */
export interface NumberFact {
  /** The question a quiz asks, phrased as a noun: "years of wandering". */
  of: string;
  value: string;
  ref?: string;
}

export interface BookDetail {
  /** Book id from BOOKS. */
  book: string;
  /** Who it was written to. */
  audience: string;
  /** Why it was written, in one clause. */
  purpose: string;
  /** Approximate date of composition, as a survey course would give it. */
  written: string;
  /** Where the book was written from, when that is known and worth knowing. */
  writtenFrom?: string;
  /** The book's structural outline. */
  outline: Section[];
  events: DetailEvent[];
  figures: Figure[];
  terms?: Term[];
  numbers?: NumberFact[];
  /** How this book points to Christ — a survey-quiz staple. */
  christ: string;
  /** Additional landmark verses beyond the one in books.ts. */
  verses?: { ref: string; text: string }[];
  /** What makes this book unlike any other. Good for "which book…" questions. */
  distinctive?: string;
}
