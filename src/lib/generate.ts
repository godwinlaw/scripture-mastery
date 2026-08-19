import { BOOKS } from '../data/books';
import { PEOPLE, PLACES } from '../data/people';
import { ERAS, EVENTS } from '../data/timeline';
import { AUTHORED, LIST_DECOYS, LISTS } from '../data/extras';
import type { Item } from '../data/types';
import { buildDetailItems } from './generate-detail';
import { pickDistractors, seededShuffle } from './rng';

const bookNames = BOOKS.map((b) => b.name);
const chapterCounts = [...new Set(BOOKS.map((b) => String(b.chapters)))];

/** Distractors drawn from the same division are hard but fair. */
function siblingNames(bookId: string): string[] {
  const b = BOOKS.find((x) => x.id === bookId)!;
  const sameDivision = BOOKS.filter((x) => x.division === b.division && x.id !== b.id).map((x) => x.name);
  return sameDivision.length >= 3 ? sameDivision : bookNames.filter((n) => n !== b.name);
}

function buildBookItems(): Item[] {
  const items: Item[] = [];

  for (const b of BOOKS) {
    // --- Chapter count. Distractors are drawn from numerically nearby counts;
    // offering 50 against 3, 5, and 7 tests nothing.
    items.push({
      id: `gen-chapters-${b.id}`, kind: 'mcq', topic: 'numbers', tier: 3, book: b.id,
      prompt: `How many chapters are in ${b.name}?`,
      answer: String(b.chapters),
      distractors: pickDistractors(nearbyCounts(b.chapters), String(b.chapters), 3, `ch-${b.id}`),
    });

    // --- Summary → book
    items.push({
      id: `gen-summary-to-book-${b.id}`, kind: 'mcq', topic: 'summaries', tier: 1, book: b.id,
      prompt: `Which book is this? "${b.oneLine}"`,
      answer: b.name,
      distractors: pickDistractors(siblingNames(b.id), b.name, 3, `s2b-${b.id}`),
      explain: b.hook,
    });

    // --- Book → theme
    items.push({
      id: `gen-theme-${b.id}`, kind: 'mcq', topic: 'summaries', tier: 2, book: b.id,
      prompt: `What is the central theme of ${b.name}?`,
      answer: b.theme,
      distractors: pickDistractors(BOOKS.map((x) => x.theme), b.theme, 3, `theme-${b.id}`),
      explain: b.oneLine,
    });

    // --- Position in canon
    items.push({
      id: `gen-position-${b.id}`, kind: 'mcq', topic: 'book-order', tier: 3, book: b.id,
      prompt: `Which book immediately follows ${b.name}?`,
      answer: b.order < 66 ? BOOKS[b.order].name : 'Nothing — it is the last book of the Bible',
      distractors: b.order < 66
        ? pickDistractors(bookNames, BOOKS[b.order].name, 3, `next-${b.id}`)
        : ['Jude', '3 John', '2 Peter'],
    });

    if (b.order > 1) {
      items.push({
        id: `gen-prev-${b.id}`, kind: 'mcq', topic: 'book-order', tier: 3, book: b.id,
        prompt: `Which book immediately precedes ${b.name}?`,
        answer: BOOKS[b.order - 2].name,
        distractors: pickDistractors(bookNames, BOOKS[b.order - 2].name, 3, `prev-${b.id}`),
      });
    }

    // --- Key chapters: what happens where
    for (const kc of b.keyChapters) {
      items.push({
        id: `gen-chapter-${b.id}-${kc.ch}`, kind: 'mcq', topic: 'chapters', tier: 2, book: b.id,
        prompt: `What happens in ${b.name} ${kc.ch}?`,
        answer: kc.what,
        distractors: pickDistractors(
          BOOKS.flatMap((x) => x.keyChapters.map((k) => k.what)),
          kc.what, 3, `chwhat-${b.id}-${kc.ch}`,
        ),
      });
      items.push({
        id: `gen-locate-${b.id}-${kc.ch}`, kind: 'mcq', topic: 'chapters', tier: 2, book: b.id,
        prompt: `Where does this happen? "${kc.what}"`,
        answer: `${b.name} ${kc.ch}`,
        distractors: pickDistractors(
          BOOKS.flatMap((x) => x.keyChapters.map((k) => `${x.name} ${k.ch}`)),
          `${b.name} ${kc.ch}`, 3, `loc-${b.id}-${kc.ch}`,
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
      const pool = siblingNames(b.id).filter((n) => !banned.has(n));
      const fallback = pool.length >= 3 ? pool : bookNames.filter((n) => !banned.has(n));
      items.push({
        id: `gen-event-${b.id}-${slug(ev)}`, kind: 'mcq', topic: 'events', tier: 2, book: b.id,
        prompt: `In which book does this occur: ${ev}?`,
        answer: b.name,
        distractors: pickDistractors(fallback, b.name, 3, `ev-${b.id}-${ev}`),
        explain: b.oneLine,
      });
    }

    // --- Key verse → book
    if (b.keyVerse) {
      items.push({
        id: `gen-verse-${b.id}`, kind: 'mcq', topic: 'chapters', tier: 3, book: b.id,
        prompt: `Which book is this from? "${b.keyVerse.text}"`,
        answer: b.name,
        distractors: pickDistractors(bookNames, b.name, 3, `kv-${b.id}`),
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
      distractors: pickDistractors(names, p.name, 3, `who-${p.id}`),
      explain: `${p.name}: ${p.role}.`,
    });
    items.push({
      id: `gen-role-${p.id}`, kind: 'mcq', topic: 'people', tier: 2, book: p.book,
      prompt: `Who was ${p.name}?`,
      answer: p.role,
      distractors: pickDistractors(roles, p.role, 3, `role-${p.id}`),
      explain: p.clue,
    });
    items.push({
      id: `gen-personbook-${p.id}`, kind: 'mcq', topic: 'people', tier: 3, book: p.book,
      prompt: `In which book do we primarily read about ${p.name}?`,
      answer: BOOKS.find((b) => b.id === p.book)!.name,
      distractors: pickDistractors(bookNames, BOOKS.find((b) => b.id === p.book)!.name, 3, `pb-${p.id}`),
    });
  }

  // --- Family and relationships. Generated from the Person record so adding
  // a `father` or `spouse` adds a question without any authoring.
  const allFathers = [...new Set(PEOPLE.map((p) => p.father).filter((x): x is string => !!x))];
  const allMothers = [...new Set(PEOPLE.map((p) => p.mother).filter((x): x is string => !!x))];
  const allSpouses = [...new Set(PEOPLE.map((p) => p.spouse).filter((x): x is string => !!x))];
  const allTribes = [...new Set(PEOPLE.map((p) => p.tribe).filter((x): x is string => !!x))];
  const allDeaths = [...new Set(PEOPLE.map((p) => p.died).filter((x): x is string => !!x))];

  for (const p of PEOPLE) {
    if (p.father && allFathers.length >= 4) {
      items.push({
        id: `gen-father-${p.id}`, kind: 'mcq', topic: 'relationships', tier: 2, book: p.book,
        prompt: `Who was the father of ${p.name}?`,
        answer: p.father,
        distractors: pickDistractors(allFathers, p.father, 3, `fa-${p.id}`),
        explain: `${p.name}: ${p.role}.`,
      });
    }
    if (p.mother && allMothers.length >= 4) {
      items.push({
        id: `gen-mother-${p.id}`, kind: 'mcq', topic: 'relationships', tier: 3, book: p.book,
        prompt: `Who was the mother of ${p.name}?`,
        answer: p.mother,
        distractors: pickDistractors(allMothers, p.mother, 3, `mo-${p.id}`),
        explain: `${p.name}: ${p.role}.`,
      });
    }
    if (p.spouse && allSpouses.length >= 4) {
      items.push({
        id: `gen-spouse-${p.id}`, kind: 'mcq', topic: 'relationships', tier: 2, book: p.book,
        prompt: `Who was married to ${p.name}?`,
        answer: p.spouse,
        distractors: pickDistractors(allSpouses, p.spouse, 3, `sp-${p.id}`),
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
          distractors: pickDistractors(otherChildren, child, 3, `ch-${p.id}`),
          explain: `${p.name}’s children: ${p.children.join(', ')}.`,
        });
      }
    }
    if (p.tribe && allTribes.length >= 4) {
      items.push({
        id: `gen-tribe-${p.id}`, kind: 'mcq', topic: 'relationships', tier: 3, book: p.book,
        prompt: `Which tribe did ${p.name} belong to?`,
        answer: p.tribe,
        distractors: pickDistractors(allTribes, p.tribe, 3, `tr-${p.id}`),
        explain: p.role,
      });
    }
    if (p.died && allDeaths.length >= 4) {
      items.push({
        id: `gen-died-${p.id}`, kind: 'mcq', topic: 'people', tier: 3, book: p.book,
        prompt: `How did ${p.name} die?`,
        answer: p.died,
        distractors: pickDistractors(allDeaths, p.died, 3, `di-${p.id}`),
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
          distractors: pickDistractors(others, aka, 3, `aka-${p.id}`),
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
      distractors: pickDistractors(PLACES.map((x) => x.name), pl.name, 3, `pl-${pl.id}`),
    });
    items.push({
      id: `gen-placewhat-${pl.id}`, kind: 'mcq', topic: 'places', tier: 3,
      prompt: `What is ${pl.name} known for?`,
      answer: pl.what,
      distractors: pickDistractors(PLACES.map((x) => x.what), pl.what, 3, `plw-${pl.id}`),
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
      distractors: pickDistractors(eraNames, e.name, 3, `era-${e.id}`),
      explain: `${e.name}: ${e.span}.`,
    });
    items.push({
      id: `gen-erabooks-${e.id}`, kind: 'mcq', topic: 'timeline', tier: 3,
      prompt: `During which era does ${e.markers[0]} occur?`,
      answer: e.name,
      distractors: pickDistractors(eraNames, e.name, 3, `erab-${e.id}`),
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

  for (const list of LISTS) {
    // Membership: which of these does NOT belong? One authored decoy against
    // three real members.
    const decoys = LIST_DECOYS[list.id] ?? [];
    decoys.forEach((decoy, di) => {
      items.push({
        id: `gen-list-not-${list.id}-${di}`, kind: 'mcq', topic: 'summaries', tier: 2,
        prompt: `Which of these is NOT part of ${list.title}?`,
        answer: decoy,
        distractors: seededShuffle(list.items, `notd-${list.id}-${di}`).slice(0, 3),
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
          distractors: pickDistractors(list.items, entry, 3, `pos-${list.id}-${idx}`),
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

/** Chapter counts closest to `n`, so the wrong options are actually tempting. */
function nearbyCounts(n: number): string[] {
  return [...chapterCounts]
    .sort((a, b) => Math.abs(Number(a) - n) - Math.abs(Number(b) - n))
    .slice(0, 9);
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

let cache: Item[] | null = null;

/** The full item bank. Stable ids mean SRS progress survives content edits. */
export function allItems(): Item[] {
  if (cache) return cache;
  const items = [
    ...buildBookItems(),
    ...buildDetailItems(),
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
