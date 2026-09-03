/**
 * The reference matcher behind the typed bonus round (#14).
 *
 * These run in Node against the real module. The prose matcher used by `type`
 * questions is deliberately loose, it strips punctuation, drops small words,
 * and accepts substrings, all of which is wrong for a citation, where the
 * colon is load-bearing and "Genesis 3" must not answer "Genesis 30". This
 * pins the behaviour that keeps the two apart.
 */
import { expect, test } from '@playwright/test';
import { isReference, parseReference, referenceMatches } from '../../src/lib/reference';

test.describe('recognising a reference', () => {
  test('an answer that names a place in scripture earns a typed round', () => {
    for (const ref of ['Genesis 3', 'Genesis 1-2', 'Josh 6', '1 Cor 15:1-8', 'Song of Solomon 2']) {
      expect(isReference(ref), ref).toBe(true);
    }
  });

  test('an answer that is a fact rather than a place does not', () => {
    for (const notRef of ['Psalms', 'Exodus', '66', 'Psalm 119 is the longest', 'Nadab and Abihu']) {
      expect(isReference(notRef), notRef).toBe(false);
    }
  });
});

test.describe('parsing a reference', () => {
  test('a book is the same book however it is written', () => {
    expect(parseReference('Joshua 6')?.book).toBe('joshua');
    expect(parseReference('Josh 6')?.book).toBe('joshua');
    expect(parseReference('josh 6')?.book).toBe('joshua');
    expect(parseReference('Josh. 6')?.book).toBe('joshua');
  });

  test('a numbered book is not confused with its unnumbered namesake', () => {
    expect(parseReference('1 John 2')?.book).toBe('1-john');
    expect(parseReference('John 2')?.book).toBe('john');
    // "Job" must not swallow the front of "John".
    expect(parseReference('Job 2')?.book).toBe('job');
  });

  test('spacing and dash style do not change the place', () => {
    expect(parseReference('1 Cor 15:1-8')?.locus).toBe('15:1-8');
    expect(parseReference('1 Cor 15 : 1 – 8')?.locus).toBe('15:1-8');
  });

  test('text that names no known book parses to nothing', () => {
    expect(parseReference('Hezekiah 3')).toBeNull();
    expect(parseReference('')).toBeNull();
  });
});

test.describe('matching a typed reference', () => {
  test('the abbreviation the issue asks for is accepted', () => {
    expect(referenceMatches('Josh 6', 'Joshua 6')).toBe(true);
    expect(referenceMatches('josh 6', 'Joshua 6')).toBe(true);
    expect(referenceMatches('Joshua 6', 'Josh 6')).toBe(true);
  });

  test('a different chapter in the right book is still wrong', () => {
    expect(referenceMatches('Joshua 5', 'Joshua 6')).toBe(false);
  });

  test('the right chapter in a different book is wrong', () => {
    expect(referenceMatches('Judges 6', 'Joshua 6')).toBe(false);
  });

  test('a chapter is not a prefix of a longer chapter number', () => {
    // The prose matcher accepts substrings, which would make this pass. A
    // citation matcher must not: Genesis 3 and Genesis 30 are 27 chapters apart.
    expect(referenceMatches('Genesis 3', 'Genesis 30')).toBe(false);
    expect(referenceMatches('Genesis 30', 'Genesis 3')).toBe(false);
    expect(referenceMatches('1 Cor 1', '1 Cor 15')).toBe(false);
  });

  test('naming the verse as well as the chapter still counts', () => {
    // More precision than asked for is more knowledge, not less.
    expect(referenceMatches('Genesis 3:15', 'Genesis 3')).toBe(true);
  });

  test('but naming only the chapter does not answer a verse-level question', () => {
    expect(referenceMatches('Genesis 3', 'Genesis 3:15')).toBe(false);
  });

  test('one chapter does not answer a span', () => {
    expect(referenceMatches('Genesis 1', 'Genesis 1-2')).toBe(false);
    expect(referenceMatches('Genesis 1-2', 'Genesis 1-2')).toBe(true);
  });

  test('a bare book name locates nothing', () => {
    expect(referenceMatches('Joshua', 'Joshua 6')).toBe(false);
    expect(referenceMatches('', 'Joshua 6')).toBe(false);
  });

  test('the colon survives normalisation', () => {
    // Stripping punctuation would turn this into chapter 151.
    expect(referenceMatches('1 Cor 15:1-8', '1 Cor 15:1-8')).toBe(true);
    expect(referenceMatches('1 Cor 151', '1 Cor 15:1-8')).toBe(false);
  });

  test('a book whose name contains a dropped word is not mangled', () => {
    // The prose matcher deletes "of", which would break this book entirely.
    expect(referenceMatches('Song of Solomon 2', 'Song of Solomon 2')).toBe(true);
    expect(referenceMatches('Song 2', 'Song of Solomon 2')).toBe(true);
  });
});
