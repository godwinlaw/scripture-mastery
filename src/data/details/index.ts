import { BOOKS } from '../books';
import { LAW_DETAILS } from './law';
import { HISTORY_DETAILS } from './history';
import { WISDOM_DETAILS } from './wisdom';
import { MAJOR_PROPHET_DETAILS } from './major-prophets';
import { MINOR_PROPHET_DETAILS } from './minor-prophets';
import { GOSPEL_DETAILS } from './gospels';
import { PAULINE_DETAILS } from './pauline';
import { GENERAL_DETAILS } from './general';
import type { BookDetail } from './types';

export type { BookDetail, DetailEvent, Figure, NumberFact, Section, Term } from './types';

/** Every book's detail entry, in canonical order. */
export const DETAILS: BookDetail[] = [
  ...LAW_DETAILS,
  ...HISTORY_DETAILS,
  ...WISDOM_DETAILS,
  ...MAJOR_PROPHET_DETAILS,
  ...MINOR_PROPHET_DETAILS,
  ...GOSPEL_DETAILS,
  ...PAULINE_DETAILS,
  ...GENERAL_DETAILS,
];

export const DETAIL_BY_BOOK: Map<string, BookDetail> = new Map(DETAILS.map((d) => [d.book, d]));

export function detailFor(bookId: string): BookDetail | undefined {
  return DETAIL_BY_BOOK.get(bookId);
}

/**
 * Data-integrity check: every book has a detail entry, and every detail entry
 * points at a real book. A typo in a book id would otherwise silently drop
 * a book's worth of questions out of the bank.
 */
export const DETAIL_COVERAGE = {
  books: BOOKS.length,
  covered: BOOKS.filter((b) => DETAIL_BY_BOOK.has(b.id)).length,
  orphans: DETAILS.filter((d) => !BOOKS.some((b) => b.id === d.book)).map((d) => d.book),
};

/** Totals used by the Reference view and the README. */
export const DETAIL_TOTALS = {
  sections: DETAILS.reduce((n, d) => n + d.outline.length, 0),
  events: DETAILS.reduce((n, d) => n + d.events.length, 0),
  figures: DETAILS.reduce((n, d) => n + d.figures.length, 0),
  terms: DETAILS.reduce((n, d) => n + (d.terms?.length ?? 0), 0),
  numbers: DETAILS.reduce((n, d) => n + (d.numbers?.length ?? 0), 0),
  verses: DETAILS.reduce((n, d) => n + (d.verses?.length ?? 0), 0),
};
