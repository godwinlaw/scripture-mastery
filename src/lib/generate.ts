import {
  BOOKS,
  BOOKS_BY_ID,
  booksNear,
  distantBooks,
  isPropheticBook,
  neighborBooks,
  sameTestamentBooks,
} from '../data/books';
import { PEOPLE, PLACES } from '../data/people';
import type { Person, Place } from '../data/people';
import { ERAS, EVENTS } from '../data/timeline';
import type { Era } from '../data/timeline';
import { AUTHORED, LIST_DECOYS, LISTS } from '../data/extras';
import type { Book, Division, Item } from '../data/types';
import { DIVISION_GUIDES } from '../data/divisions';
import { distractorSets, scopedSets } from './distractors';
import { buildDetailItems } from './generate-detail';
import { buildEssentialItems } from './generate-essentials';
import { pickDistractors } from './rng';

const bookNames = BOOKS.map((b) => b.name);

/** Distractors drawn from the same division are hard but fair. */
function siblingNames(bookId: string): string[] {
  const b = BOOKS.find((x) => x.id === bookId)!;
  const sameDivision = BOOKS.filter((x) => x.division === b.division && x.id !== b.id).map((x) => x.name);
  return sameDivision.length >= 3 ? sameDivision : bookNames.filter((n) => n !== b.name);
}

/*
 * ---------------------------------------------------------------------------
 * Scoped option pools (#40)
 * ---------------------------------------------------------------------------
 *
 * Difficulty used to bite on roughly a third of the bank: the questions routed
 * through `distractorSets` carried easy and hard alternates, and everything
 * else fell back to one canon-wide `pickDistractors` draw at every setting.
 * That is why "hard" did not feel hard — a question about Leviticus would
 * happily offer Philemon, which is not a harder question, just a different
 * subject you can rule out without knowing anything.
 *
 * The helpers below give every remaining family the same shape the existing
 * ones already have: `hard` is a chain of pool builders ordered tightest-first
 * that `layeredPool` widens through only when the tight pool cannot fill a
 * six-choice card, and `easy` is the widest pool available, because the point
 * of easy is wrong options that are wrong on sight.
 *
 * `medium` is never touched. It is what lands in `Item.distractors`, which
 * validate.ts, the content-contract spec and every card rendered at the default
 * setting read, so each call below passes the *identical* pool expression and
 * seed the generator used before, and `scopedSets` reproduces the old value
 * exactly.
 */

/**
 * The rings a book-shaped question tightens through: the answer's own division,
 * one division further out, its Testament, then the whole canon.
 *
 * This is the same fence `nearbyPool` uses for the medium pools, for the same
 * reason (#10, #12) — a wrong option only tests anything if it is a plausible
 * neighbour. Book-order questions are the documented exception; see
 * `bookOrderSets`.
 */
function bookRings(bookId: string): (() => Book[])[] {
  return [
    () => booksNear(bookId, 0),
    () => booksNear(bookId, 1),
    () => sameTestamentBooks(bookId),
    () => BOOKS,
  ];
}

/** `bookRings` projected through `extract`, ready to hand to `scopedSets`. */
function bookPools(bookId: string, extract: (b: Book) => string[]): (() => string[])[] {
  return bookRings(bookId).map((ring) => () => ring().flatMap(extract));
}

/**
 * The rings a People or Relationships question tightens through: the figures of
 * the answer's own book, then of its era, then of its Testament, then everyone.
 *
 * Book first rather than era first because "who is this?" is nearly always
 * answered from a story, and the people you confuse with Gideon are the other
 * judges in Judges — not everyone who happens to sit in the same century.
 */
function peopleRings(p: Person): (() => Person[])[] {
  const testament = BOOKS_BY_ID[p.book]?.testament;
  return [
    () => PEOPLE.filter((x) => x.book === p.book),
    () => PEOPLE.filter((x) => x.era === p.era),
    () => PEOPLE.filter((x) => BOOKS_BY_ID[x.book]?.testament === testament),
    () => PEOPLE,
  ];
}

/**
 * `peopleRings` projected through `extract`.
 *
 * Any per-question exclusion belongs inside `extract`, not after the pool is
 * built — the same lesson #12 recorded for events. A ring that looks full and
 * only loses its illegal entries afterwards stops the widening early and leaves
 * the card short.
 */
function peoplePools(p: Person, extract: (x: Person) => string[]): (() => string[])[] {
  return peopleRings(p).map((ring) => () => ring().flatMap(extract));
}

/**
 * The rings a Places question tightens through.
 *
 * `Place` carries a `book` and an `era` and nothing finer — no region, no
 * coordinates — so locality here means "belongs to the same stretch of the
 * story", which is the association a reader actually has. Gethsemane against
 * Golgotha and the Mount of Olives is a real question; Gethsemane against Ur is
 * not.
 */
function placeRings(pl: Place): (() => Place[])[] {
  const testament = BOOKS_BY_ID[pl.book]?.testament;
  return [
    () => PLACES.filter((x) => x.book === pl.book),
    () => PLACES.filter((x) => x.era === pl.era),
    () => PLACES.filter((x) => BOOKS_BY_ID[x.book]?.testament === testament),
    () => PLACES,
  ];
}

function placePools(pl: Place, extract: (x: Place) => string[]): (() => string[])[] {
  return placeRings(pl).map((ring) => () => ring().flatMap(extract));
}

/**
 * Book-order questions are the one family where the Testament seam is the wrong
 * fence, and canonical distance is the right one.
 *
 * "Which book immediately follows Malachi?" has a New Testament answer to an
 * Old Testament question, so scoping the options by Testament would mark the
 * correct one out without the reader knowing a thing about the canon. What
 * makes these hard is proximity in the running order: Ezra against Nehemiah,
 * Esther and Chronicles is a question; Ezra against Matthew is a free point.
 * Hence `neighborBooks`/`distantBooks`, which cross the seam on purpose (#40).
 *
 * Two further notes on the medium set:
 *
 *  - The subject book was showing up as a wrong option on its own question —
 *    "Which book immediately precedes Leviticus?" offered Leviticus, because
 *    `pickDistractors` only excludes the *answer*. It has to come out of every
 *    pool, medium included.
 *  - It cannot come out of the medium *pool*, though. `seededShuffle` is a
 *    function of the array handed to it, so dropping one of 66 names reshuffles
 *    all 130 book-order cards — including the four-option Genesis card the
 *    content contract pins. So medium draws one extra and drops the subject
 *    after the fact: the 124 cards that never had the bug keep their exact
 *    options, and only the six that did are corrected.
 */
/** "1st", "2nd", "3rd", "4th", "11th", "12th", "13th" ... */
function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

/** The division as a shelf you can count books on. */
const SHELF_LABEL: Record<Division, string> = {
  Law: 'books of the Law',
  History: 'History books',
  Wisdom: 'Wisdom books',
  'Major Prophets': 'Major Prophets',
  'Minor Prophets': 'Minor Prophets',
  Gospels: 'Gospels',
  Acts: 'Acts',
  'Pauline Epistles': 'letters of Paul',
  'General Epistles': 'General Epistles',
  Apocalyptic: 'Apocalyptic',
};

/**
 * The explanation behind a book-order card: where the book sits on its shelf,
 * what stands either side of it, why that shelf is in the order it is, and a
 * mnemonic for the run. Read after answering, so it names books freely; the
 * hint-before-answer logic in QuestionCard suppresses it on its own.
 */
export function orderExplain(b: Book): string {
  const shelf = BOOKS.filter((x) => x.division === b.division);
  const at = shelf.findIndex((x) => x.id === b.id) + 1;
  const place = shelf.length === 1
    ? `${b.name} is book ${b.order} of 66 and stands on a shelf of its own.`
    : `${b.name} is book ${b.order} of 66, the ${ordinal(at)} of the ${shelf.length} ${SHELF_LABEL[b.division]} (${shelf.map((x) => x.name).join(', ')}).`;
  const edge = (x: Book, side: 'before' | 'after') => {
    if (x.division === b.division) return x.name;
    const n = BOOKS.filter((y) => y.division === x.division).length;
    if (n === 1) return `${x.name}, a shelf of its own`;
    return `${x.name}, ${side === 'before' ? 'closing' : 'opening'} the ${SHELF_LABEL[x.division]}`;
  };
  const prev = BOOKS[b.order - 2];
  const next = BOOKS[b.order];
  const before = prev ? `Before it: ${edge(prev, 'before')}.` : 'Before it: nothing; it opens the Bible.';
  const after = next ? `After it: ${edge(next, 'after')}.` : 'After it: nothing; it closes the Bible.';
  const g = DIVISION_GUIDES[b.division];
  return `${place} ${before} ${after} Why this order: ${g.why} Mnemonic: ${g.mnemonic}`;
}

function bookOrderSets(subject: Book, answer: string, seed: string): Pick<Item, 'distractors' | 'distractorsBy'> {
  const notSubject = (n: string) => n !== subject.name;
  const names = (books: Book[]) => books.map((b) => b.name).filter(notSubject);
  const wholeCanon = bookNames.filter(notSubject);

  const distractors = pickDistractors(bookNames, answer, 4, seed).filter(notSubject).slice(0, 3);

  // `scopedSets` recomputes the medium draw from the pool it is given, which is
  // the un-post-filtered version; only its alternates are wanted here, so the
  // corrected `distractors` above is the one that ships.
  const { distractorsBy } = scopedSets(answer, seed, {
    medium: wholeCanon,
    easy: [() => names(distantBooks(subject.id, 12)), () => wholeCanon],
    hard: [
      () => names(neighborBooks(subject.id, 4)),
      () => names(neighborBooks(subject.id, 8)),
      () => names(sameTestamentBooks(subject.id)),
      () => wholeCanon,
    ],
  });

  return { distractors, distractorsBy };
}

/**
 * The rings a Timeline question tightens through, by `seq`.
 *
 * Eras are a single ordered spine, so "near" means adjacent in that spine and
 * nothing else: the Divided Kingdom against the United Kingdom and the Exile is
 * a real question, against Creation it is not.
 */
function eraPools(e: Era, within: number): () => string[] {
  return () => ERAS.filter((x) => x.id !== e.id && Math.abs(x.seq - e.seq) <= within).map((x) => x.name);
}

function eraNamesBeyond(e: Era, span: number): () => string[] {
  return () => ERAS.filter((x) => Math.abs(x.seq - e.seq) > span).map((x) => x.name);
}

function buildBookItems(): Item[] {
  const items: Item[] = [];

  for (const b of BOOKS) {
    // Per-book chapter counts used to live here. They were rote trivia — 66
    // questions whose answer is a number you can read off a contents page —
    // and they crowded the Numbers & Counts topic with the one kind of recall
    // that teaches nothing about the book. Removed in #8.

    // --- Summary → book, and book → theme. Prophets only: see
    // isPropheticBook() for why the rest of the canon stopped asking (#9).
    if (isPropheticBook(b.id)) {
      items.push({
        id: `gen-summary-to-book-${b.id}`, kind: 'mcq', topic: 'summaries', tier: 1, book: b.id,
        prompt: `Which book is this? "${b.oneLine}"`,
        answer: b.name,
        // Medium already draws from the division (`siblingNames`); hard keeps
        // that and widens only when a five-book division cannot fill six
        // choices, easy goes canon-wide (#40).
        ...scopedSets(b.name, `s2b-${b.id}`, {
          medium: siblingNames(b.id),
          easy: [() => bookNames],
          hard: bookPools(b.id, (x) => [x.name]),
        }),
        explain: b.hook,
      });

      items.push({
        id: `gen-theme-${b.id}`, kind: 'mcq', topic: 'summaries', tier: 2, book: b.id,
        prompt: `What is the central theme of ${b.name}?`,
        answer: b.theme,
        // Themes of neighbouring prophets overlap heavily, which is exactly
        // what makes them a hard set and a canon-wide draw an easy one.
        ...scopedSets(b.theme, `theme-${b.id}`, {
          medium: BOOKS.map((x) => x.theme),
          easy: [() => BOOKS.map((x) => x.theme)],
          hard: bookPools(b.id, (x) => [x.theme]),
        }),
        explain: b.oneLine,
      });
    }

    // --- Position in canon. A numbered sequel is skipped in both directions:
    // "Which book follows 1 Samuel?" and "Which book precedes 2 Samuel?" are
    // answered by the name in the prompt, so they test reading, not the canon.
    // The pair's outer edges ("precedes 1 Samuel", "follows 2 Samuel") stay.
    const nextAnswer = b.order < 66 ? BOOKS[b.order].name : 'Nothing — it is the last book of the Bible';
    const nextSets = bookOrderSets(b, nextAnswer, `next-${b.id}`);
    if (!sameTitle(b.name, nextAnswer)) items.push({
      id: `gen-position-${b.id}`, kind: 'mcq', topic: 'book-order', tier: 3, book: b.id,
      prompt: `Which book immediately follows ${b.name}?`,
      answer: nextAnswer,
      explain: orderExplain(b),
      // Revelation's medium options are authored, not drawn — the answer there
      // is a sentence rather than a book, and the three near-misses at the end
      // of the canon are the whole question. Only the alternates are generated.
      ...(b.order < 66
        ? nextSets
        : { distractors: ['Jude', '3 John', '2 Peter'], distractorsBy: nextSets.distractorsBy }),
    });

    if (b.order > 1 && !sameTitle(b.name, BOOKS[b.order - 2].name)) {
      items.push({
        id: `gen-prev-${b.id}`, kind: 'mcq', topic: 'book-order', tier: 3, book: b.id,
        prompt: `Which book immediately precedes ${b.name}?`,
        answer: BOOKS[b.order - 2].name,
        explain: orderExplain(b),
        ...bookOrderSets(b, BOOKS[b.order - 2].name, `prev-${b.id}`),
      });
    }

    // --- Key chapters: what happens where
    for (const kc of b.keyChapters) {
      items.push({
        id: `gen-chapter-${b.id}-${kc.ch}`, kind: 'mcq', topic: 'chapters', tier: 2, book: b.id,
        prompt: `What happens in ${b.name} ${kc.ch}?`,
        answer: kc.what,
        // Chapter Content, so `hard` may stay inside this one book (#36).
        ...distractorSets(
          b.id, (x) => x.keyChapters.map((k) => k.what), kc.what,
          `chwhat-${b.id}-${kc.ch}`, 'book',
        ),
      });
      items.push({
        id: `gen-locate-${b.id}-${kc.ch}`, kind: 'mcq', topic: 'chapters', tier: 2, book: b.id,
        prompt: `Where does this happen? "${kc.what}"`,
        answer: `${b.name} ${kc.ch}`,
        ...distractorSets(
          b.id, (x) => x.keyChapters.map((k) => `${x.name} ${k.ch}`), `${b.name} ${kc.ch}`,
          `loc-${b.id}-${kc.ch}`, 'book',
        ),
      });
    }

    // --- Key events → book. Many events appear in more than one book (the
    // Transfiguration is in three Gospels), so distractors exclude every book
    // that also records the event — otherwise a right answer scores as wrong.
    for (const ev of b.keyEvents) {
      const key = eventKey(ev);
      if (eventOwner.get(key) !== b.id) continue; // one item per event, first book wins
      const banned = booksRecording(ev);
      // The ban is folded into the extract rather than applied afterwards, so
      // the widening in nearbyPool counts only books it can actually offer —
      // filtering after the fact could leave a division short and still stop (#12).
      // It stays inside the extract for all three difficulty pools, for the
      // same reason.
      items.push({
        id: `gen-event-${b.id}-${slug(ev)}`, kind: 'mcq', topic: 'events', tier: 2, book: b.id,
        prompt: `In which book does this occur: ${ev}?`,
        answer: b.name,
        // The answer is a book, so the tightest `hard` can be is the division.
        ...distractorSets(
          b.id, (x) => (banned.has(x.name) ? [] : [x.name]), b.name,
          `ev-${b.id}-${ev}`, 'division',
        ),
        explain: b.oneLine,
      });
    }

    // --- Key verse → book
    if (b.keyVerse) {
      items.push({
        id: `gen-verse-${b.id}`, kind: 'mcq', topic: 'chapters', tier: 3, book: b.id,
        prompt: `Which book is this from? "${b.keyVerse.text}"`,
        answer: b.name,
        ...distractorSets(b.id, (x) => [x.name], b.name, `kv-${b.id}`, 'book'),
        explain: `${b.keyVerse.ref} (ESV)`,
      });
    }
  }

  return items;
}

function buildPeopleItems(): Item[] {
  const items: Item[] = [];
  const names = PEOPLE.map((p) => p.name);
  const roles = PEOPLE.map((p) => p.role);

  for (const p of PEOPLE) {
    items.push({
      id: `gen-who-${p.id}`, kind: 'mcq', topic: 'people', tier: 1, book: p.book,
      prompt: `Who is this? ${p.clue}.`,
      answer: p.name,
      ...scopedSets(p.name, `who-${p.id}`, {
        medium: names,
        easy: [() => names],
        hard: peoplePools(p, (x) => [x.name]),
      }),
      explain: `${p.name}: ${p.role}.`,
    });
    items.push({
      id: `gen-role-${p.id}`, kind: 'mcq', topic: 'people', tier: 2, book: p.book,
      prompt: `Who was ${p.name}?`,
      answer: p.role,
      ...scopedSets(p.role, `role-${p.id}`, {
        medium: roles,
        easy: [() => roles],
        hard: peoplePools(p, (x) => [x.role]),
      }),
      explain: p.clue,
    });
    items.push({
      id: `gen-personbook-${p.id}`, kind: 'mcq', topic: 'people', tier: 3, book: p.book,
      prompt: `In which book do we primarily read about ${p.name}?`,
      answer: BOOKS.find((b) => b.id === p.book)!.name,
      // The answer here is a book, so this scopes like a book question rather
      // than a people one: same division first, then the Testament.
      ...scopedSets(BOOKS.find((b) => b.id === p.book)!.name, `pb-${p.id}`, {
        medium: bookNames,
        easy: [() => bookNames],
        hard: bookPools(p.book, (x) => [x.name]),
      }),
    });
  }

  // --- Family and relationships. Generated from the Person record so adding
  // a `father` or `spouse` adds a question without any authoring.
  const allFathers = [...new Set(PEOPLE.map((p) => p.father).filter((x): x is string => !!x))];
  const allMothers = [...new Set(PEOPLE.map((p) => p.mother).filter((x): x is string => !!x))];
  const allSpouses = [...new Set(PEOPLE.map((p) => p.spouse).filter((x): x is string => !!x))];
  const allTribes = [...new Set(PEOPLE.map((p) => p.tribe).filter((x): x is string => !!x))];
  const allDeaths = [...new Set(PEOPLE.map((p) => p.died).filter((x): x is string => !!x))];

  // Every relationship question scopes the same way: hard draws the *same*
  // field from people in the answer's own book, then era, then Testament, so
  // the wrong fathers are other fathers from the same story. Easy keeps the
  // canon-wide list these questions have always used — a father from Acts
  // against a question about Genesis is wrong on sight (#40).
  for (const p of PEOPLE) {
    if (p.father && allFathers.length >= 4) {
      items.push({
        id: `gen-father-${p.id}`, kind: 'mcq', topic: 'relationships', tier: 2, book: p.book,
        prompt: `Who was the father of ${p.name}?`,
        answer: p.father,
        ...scopedSets(p.father, `fa-${p.id}`, {
          medium: allFathers,
          easy: [() => allFathers],
          hard: peoplePools(p, (x) => (x.father ? [x.father] : [])),
        }),
        explain: `${p.name}: ${p.role}.`,
      });
    }
    if (p.mother && allMothers.length >= 4) {
      items.push({
        id: `gen-mother-${p.id}`, kind: 'mcq', topic: 'relationships', tier: 3, book: p.book,
        prompt: `Who was the mother of ${p.name}?`,
        answer: p.mother,
        ...scopedSets(p.mother, `mo-${p.id}`, {
          medium: allMothers,
          easy: [() => allMothers],
          hard: peoplePools(p, (x) => (x.mother ? [x.mother] : [])),
        }),
        explain: `${p.name}: ${p.role}.`,
      });
    }
    if (p.spouse && allSpouses.length >= 4) {
      items.push({
        id: `gen-spouse-${p.id}`, kind: 'mcq', topic: 'relationships', tier: 2, book: p.book,
        prompt: `Who was married to ${p.name}?`,
        answer: p.spouse,
        ...scopedSets(p.spouse, `sp-${p.id}`, {
          medium: allSpouses,
          easy: [() => allSpouses],
          hard: peoplePools(p, (x) => (x.spouse ? [x.spouse] : [])),
        }),
        explain: p.clue,
      });
    }
    if (p.children && p.children.length > 0) {
      const child = p.children[0];
      const otherChildren = PEOPLE.flatMap((x) => (x.id === p.id ? [] : x.children ?? []))
        .filter((c) => !p.children!.includes(c));
      if (otherChildren.length >= 3) {
        items.push({
          id: `gen-child-${p.id}`, kind: 'mcq', topic: 'relationships', tier: 3, book: p.book,
          prompt: `Which of these was a child of ${p.name}?`,
          answer: child,
          // The "not one of p's own children" ban lives inside the extract, not
          // after the pool is built, so a tight ring that is full of siblings
          // widens instead of quietly shipping a card with a second right
          // answer on it (#12).
          ...scopedSets(child, `ch-${p.id}`, {
            medium: otherChildren,
            easy: [() => otherChildren],
            hard: peoplePools(p, (x) =>
              x.id === p.id ? [] : (x.children ?? []).filter((c) => !p.children!.includes(c)),
            ),
          }),
          explain: `${p.name}’s children: ${p.children.join(', ')}.`,
        });
      }
    }
    if (p.tribe && allTribes.length >= 4) {
      items.push({
        id: `gen-tribe-${p.id}`, kind: 'mcq', topic: 'relationships', tier: 3, book: p.book,
        prompt: `Which tribe did ${p.name} belong to?`,
        answer: p.tribe,
        ...scopedSets(p.tribe, `tr-${p.id}`, {
          medium: allTribes,
          easy: [() => allTribes],
          hard: peoplePools(p, (x) => (x.tribe ? [x.tribe] : [])),
        }),
        explain: p.role,
      });
    }
    if (p.died && allDeaths.length >= 4) {
      items.push({
        id: `gen-died-${p.id}`, kind: 'mcq', topic: 'people', tier: 3, book: p.book,
        prompt: `How did ${p.name} die?`,
        answer: p.died,
        ...scopedSets(p.died, `di-${p.id}`, {
          medium: allDeaths,
          easy: [() => allDeaths],
          hard: peoplePools(p, (x) => (x.died ? [x.died] : [])),
        }),
        explain: p.clue,
      });
    }
    if (p.alsoKnownAs && p.alsoKnownAs.length > 0) {
      const aka = p.alsoKnownAs[0];
      const others = PEOPLE.flatMap((x) => (x.id === p.id ? [] : x.alsoKnownAs ?? []));
      if (others.length >= 3) {
        items.push({
          id: `gen-aka-${p.id}`, kind: 'mcq', topic: 'people', tier: 3, book: p.book,
          prompt: `By what other name is ${p.name} known?`,
          answer: aka,
          // p's own aliases are excluded inside the extract for the same reason
          // as the children ban above: every one of them is a right answer.
          ...scopedSets(aka, `aka-${p.id}`, {
            medium: others,
            easy: [() => others],
            hard: peoplePools(p, (x) => (x.id === p.id ? [] : x.alsoKnownAs ?? [])),
          }),
          explain: p.clue,
        });
      }
    }
  }

  for (const pl of PLACES) {
    items.push({
      id: `gen-place-${pl.id}`, kind: 'mcq', topic: 'places', tier: 2,
      prompt: `Which place is this? ${pl.what}.`,
      answer: pl.name,
      ...scopedSets(pl.name, `pl-${pl.id}`, {
        medium: PLACES.map((x) => x.name),
        easy: [() => PLACES.map((x) => x.name)],
        hard: placePools(pl, (x) => [x.name]),
      }),
    });
    items.push({
      id: `gen-placewhat-${pl.id}`, kind: 'mcq', topic: 'places', tier: 3,
      prompt: `What is ${pl.name} known for?`,
      answer: pl.what,
      ...scopedSets(pl.what, `plw-${pl.id}`, {
        medium: PLACES.map((x) => x.what),
        easy: [() => PLACES.map((x) => x.what)],
        hard: placePools(pl, (x) => [x.what]),
      }),
    });
  }

  return items;
}

function buildTimelineItems(): Item[] {
  const items: Item[] = [];
  const eraNames = ERAS.map((e) => e.name);

  for (const e of ERAS) {
    items.push({
      id: `gen-era-${e.id}`, kind: 'mcq', topic: 'timeline', tier: 2,
      prompt: `Which era of biblical history is this? ${e.summary}`,
      answer: e.name,
      // Eras are one ordered spine, so "near" is `seq` and nothing else: hard
      // offers the eras either side of this one, easy the ones an age away (#40).
      ...scopedSets(e.name, `era-${e.id}`, {
        medium: eraNames,
        easy: [eraNamesBeyond(e, 4), () => eraNames],
        hard: [eraPools(e, 2), eraPools(e, 4), () => eraNames],
      }),
      explain: `${e.name}: ${e.span}.`,
    });
    items.push({
      id: `gen-erabooks-${e.id}`, kind: 'mcq', topic: 'timeline', tier: 3,
      prompt: `During which era does ${e.markers[0]} occur?`,
      answer: e.name,
      ...scopedSets(e.name, `erab-${e.id}`, {
        medium: eraNames,
        easy: [eraNamesBeyond(e, 4), () => eraNames],
        hard: [eraPools(e, 2), eraPools(e, 4), () => eraNames],
      }),
      explain: e.summary,
    });
  }

  // Era ordering — three sliding windows of four.
  for (let i = 0; i + 4 <= ERAS.length; i += 2) {
    const window = ERAS.slice(i, i + 4);
    items.push({
      id: `gen-eraorder-${i}`, kind: 'order', topic: 'timeline', tier: 1,
      prompt: 'Put these eras in chronological order.',
      answer: window.map((e) => e.name).join(' → '),
      sequence: window.map((e) => e.name),
    });
  }

  // Event ordering — sliding windows of four dated events.
  const sorted = [...EVENTS].sort((a, b) => a.year - b.year);
  for (let i = 0; i + 4 <= sorted.length; i += 3) {
    const window = sorted.slice(i, i + 4);
    items.push({
      id: `gen-evorder-${i}`, kind: 'order', topic: 'timeline', tier: 2,
      prompt: 'Put these events in chronological order.',
      answer: window.map((e) => e.label).join(' → '),
      sequence: window.map((e) => e.label),
      explain: window.map((e) => `${e.label} (${e.when})`).join(' · '),
    });
  }

  return items;
}

function buildListItems(): Item[] {
  const items: Item[] = [];

  // Members of every *other* standing list — the "wrong on sight" pool that
  // makes a positional question easy. It is deliberately not used for the
  // NOT-in-this-list cards below; see the note there.
  const otherListItems = (id: string) =>
    LISTS.filter((l) => l.id !== id).flatMap((l) => l.items);

  for (const list of LISTS) {
    // Membership: which of these does NOT belong? One authored decoy against
    // three real members.
    const decoys = LIST_DECOYS[list.id] ?? [];
    decoys.forEach((decoy, di) => {
      items.push({
        id: `gen-list-not-${list.id}-${di}`, kind: 'mcq', topic: 'summaries', tier: 2,
        prompt: `Which of these is NOT part of ${list.title}?`,
        answer: decoy,
        // All three settings draw from this list and only this list. A NOT
        // question inverts the usual logic: a member of some *other* list is
        // also "not part of ${list.title}", so the canon-wide pool that makes
        // every other card easy would put a second correct answer on this one.
        // Difficulty here is the number of choices, not their provenance (#40).
        ...scopedSets(decoy, `notd-${list.id}-${di}`, {
          medium: list.items,
          easy: [() => list.items],
          hard: [() => list.items],
        }),
        explain: `${list.title} — ${list.note}: ${list.items.join(', ')}.`,
      });
    });

    if (list.ordered) {
      const window = list.items.slice(0, Math.min(5, list.items.length));
      items.push({
        id: `gen-list-order-${list.id}`, kind: 'order', topic: 'summaries', tier: 2,
        prompt: `Put the first ${window.length} of ${list.title} in order.`,
        answer: window.join(' → '),
        sequence: window,
        explain: list.note,
      });
      // Positional recall
      list.items.forEach((entry, idx) => {
        items.push({
          id: `gen-list-pos-${list.id}-${idx}`, kind: 'mcq', topic: 'summaries', tier: 3,
          prompt: `In ${list.title}, what is #${idx + 1}?`,
          answer: entry,
          // Medium is already the tightest honest pool — the other members of
          // this same list — so hard keeps it and only widens if a short list
          // cannot fill six choices. Easy is where the setting earns its keep:
          // an item from a different list is wrong without knowing the order.
          ...scopedSets(entry, `pos-${list.id}-${idx}`, {
            medium: list.items,
            easy: [() => otherListItems(list.id)],
            hard: [() => list.items, () => [...list.items, ...otherListItems(list.id)]],
          }),
          explain: list.note,
        });
      });
    }
  }

  return items;
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'and', 'in', 'to', 'on', 'at', 'by', 'for', 'his',
  'her', 'its', 'into', 'with', 'is', 'as', 'from', 'out',
]);

/** Crude stem + stopword strip, enough to tell related event phrasings apart. */
function tokens(s: string): Set<string> {
  return new Set(
    s.toLowerCase()
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
      .map((w) => (w.endsWith('s') ? w.slice(0, -1) : w)),
  );
}

function eventKey(ev: string): string {
  return [...tokens(ev)].sort().join(' ');
}

function isSubset(a: Set<string>, b: Set<string>): boolean {
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

/** Two phrasings describe the same event if one contains the other, or they overlap heavily. */
function related(a: string, b: string): boolean {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return false;
  if (isSubset(ta, tb) || isSubset(tb, ta)) return true;
  let shared = 0;
  for (const x of ta) if (tb.has(x)) shared++;
  return shared >= 2;
}

/** Every book whose key events describe this same event. */
function booksRecording(ev: string): Set<string> {
  const out = new Set<string>();
  for (const b of BOOKS) {
    if (b.keyEvents.some((e) => related(e, ev))) out.add(b.name);
  }
  return out;
}

/** First book (in canonical order) that records each distinct event. */
const eventOwner = new Map<string, string>();
for (const b of BOOKS) {
  for (const ev of b.keyEvents) {
    const key = eventKey(ev);
    if (!eventOwner.has(key)) eventOwner.set(key, b.id);
  }
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

let cache: Item[] | null = null;

/** The full item bank. Stable ids mean SRS progress survives content edits. */
/** Whether two book names differ only by their number: 1 Samuel and 2 Samuel, 2 John and 3 John. */
export function sameTitle(a: string, b: string): boolean {
  const bare = (n: string) => n.replace(/^[123] /, '');
  return a !== b && bare(a) === bare(b);
}

export function allItems(): Item[] {
  if (cache) return cache;
  const items = [
    ...buildBookItems(),
    ...buildDetailItems(),
    ...buildEssentialItems(),
    ...buildPeopleItems(),
    ...buildTimelineItems(),
    ...buildListItems(),
    ...AUTHORED,
  ];
  // Guard against duplicate ids silently clobbering SRS records.
  const seen = new Set<string>();
  cache = items.filter((i) => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });
  return cache;
}

export const ITEMS_BY_ID: Map<string, Item> = new Map();
for (const it of allItems()) ITEMS_BY_ID.set(it.id, it);
