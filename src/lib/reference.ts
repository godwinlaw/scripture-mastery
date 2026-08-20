/**
 * Recognising and comparing Bible references, for the typed bonus round (#14).
 *
 * A reference-answered question is one whose answer is a place in scripture
 * rather than a fact about it — "Joshua 6", "1 Cor 15:1-8". Those are the
 * questions worth letting someone answer from memory before showing them four
 * options, because naming the reference is a strictly harder thing to do than
 * recognising it.
 */
import { BOOKS } from '../data/books';

/**
 * Every way a book can be written, longest first so that "1 John" wins over
 * "John" and "Song of Songs" over "Song".
 */
const BOOK_LABELS: { label: string; id: string }[] = BOOKS
  .flatMap((b) => [
    { label: b.name, id: b.id },
    { label: b.abbr, id: b.id },
  ])
  .sort((a, b) => b.label.length - a.label.length);

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** "Joshua 6", "Josh 6", "1 Cor 15:1-8" — a book label followed by a number. */
const REFERENCE = new RegExp(`^(?:${BOOK_LABELS.map((b) => escape(b.label)).join('|')})\\s+\\d`, 'i');

/** Whether an answer names a place in scripture, and so earns a typed round. */
export function isReference(answer: string): boolean {
  return REFERENCE.test(answer.trim());
}

interface ParsedReference {
  /** Canonical book id, so "Josh" and "Joshua" compare equal. */
  book: string;
  /** Everything after the book name, normalised: "1-2", "15:1-8". */
  locus: string;
}

/**
 * Splits a reference into the book it names and the part that locates it.
 * Returns null for anything that does not start with a book we know.
 */
export function parseReference(input: string): ParsedReference | null {
  const text = input
    .trim()
    // en/em dashes and the various apostrophes people actually type
    .replace(/[\u2012-\u2015]/g, '-')
    .replace(/\s+/g, ' ');

  for (const { label, id } of BOOK_LABELS) {
    // Match the label only at a word boundary, so "Job" does not swallow "John".
    const head = new RegExp(`^${escape(label)}\\b\\.?\\s*`, 'i');
    const m = text.match(head);
    if (!m) continue;
    const locus = text
      .slice(m[0].length)
      .toLowerCase()
      .replace(/\s*[-–—]\s*/g, '-')
      .replace(/\s*:\s*/g, ':')
      .replace(/[^\d:\-,]/g, '')
      .replace(/,+$/, '');
    return { book: id, locus };
  }
  return null;
}

/**
 * Whether a typed reference names the same place as the expected one.
 *
 * The book must match after abbreviation. Beyond that the rule is deliberately
 * asymmetric: extra precision passes, missing precision does not.
 *
 * - Expected "Genesis 3" (a chapter): "Genesis 3" and "Genesis 3:15" both pass.
 *   Naming the verse as well is more knowledge, not less, and a bonus that
 *   punished it would teach people to withhold what they know.
 * - Expected "Genesis 3:15" (a verse): only "Genesis 3:15" passes. "Genesis 3"
 *   is vaguer than what was asked for.
 * - "Genesis 1" never answers "Genesis 1-2". A span is a different place from
 *   one of its chapters.
 */
export function referenceMatches(input: string, expected: string): boolean {
  const got = parseReference(input);
  const want = parseReference(expected);
  if (!got || !want) return false;
  if (got.book !== want.book) return false;
  if (!got.locus || !want.locus) return false;
  if (got.locus === want.locus) return true;

  // Only a chapter-level question accepts a more precise answer, and only when
  // the chapter part is identical.
  if (want.locus.includes(':')) return false;
  return got.locus.split(':')[0] === want.locus;
}
