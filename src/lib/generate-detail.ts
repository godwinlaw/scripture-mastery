import { BOOKS } from '../data/books';
import { DETAILS, type BookDetail, type DetailEvent } from '../data/details';
import type { Item } from '../data/types';
import { pickDistractors, seededShuffle } from './rng';

const bookName = new Map(BOOKS.map((b) => [b.id, b.name]));
const bookAbbr = new Map(BOOKS.map((b) => [b.id, b.abbr]));

/** Every "what" across every book — the pool for chapter-content distractors. */
const allEventWhats = DETAILS.flatMap((d) => d.events.map((e) => e.what));
const allSectionTitles = DETAILS.flatMap((d) => d.outline.map((s) => s.title));
const allFigureDeeds = DETAILS.flatMap((d) => d.figures.map((f) => f.did));
const allFigureNames = [...new Set(DETAILS.flatMap((d) => d.figures.map((f) => f.name)))];
const allTermNames = [...new Set(DETAILS.flatMap((d) => d.terms?.map((t) => t.term) ?? []))];
const allTermMeanings = DETAILS.flatMap((d) => d.terms?.map((t) => t.meaning) ?? []);
const allNumberValues = DETAILS.flatMap((d) => d.numbers?.map((n) => n.value) ?? []);
const allChristLines = DETAILS.map((d) => d.christ);
const allPurposes = DETAILS.map((d) => d.purpose);
const allAudiences = [...new Set(DETAILS.map((d) => d.audience))];
const allWritten = [...new Set(DETAILS.map((d) => d.written))];

function ref(d: BookDetail, r: string): string {
  return `${bookName.get(d.book) ?? d.book} ${r}`;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 44);
}

/**
 * Names that appear in more than one book's event list. "In which book does
 * Peter appear?" is unanswerable for these, so who-questions about them are
 * scoped to the episode rather than the book.
 */
const nameBookCount = new Map<string, Set<string>>();
for (const d of DETAILS) {
  for (const e of d.events) {
    for (const who of e.who) {
      if (!nameBookCount.has(who)) nameBookCount.set(who, new Set());
      nameBookCount.get(who)!.add(d.book);
    }
  }
}

/** Event names repeated across books (the Transfiguration, Pentecost) get one item. */
const eventNameOwner = new Map<string, string>();
for (const d of DETAILS) {
  for (const e of d.events) {
    const key = e.name.toLowerCase();
    if (!eventNameOwner.has(key)) eventNameOwner.set(key, d.book);
  }
}

/** Books whose event list contains an event by this name — excluded from distractors. */
function booksWithEventName(name: string): Set<string> {
  const key = name.toLowerCase();
  const out = new Set<string>();
  for (const d of DETAILS) {
    if (d.events.some((e) => e.name.toLowerCase() === key)) out.add(bookName.get(d.book)!);
  }
  return out;
}

function outlineItems(d: BookDetail): Item[] {
  const items: Item[] = [];
  const name = bookName.get(d.book)!;
  const ownTitles = d.outline.map((s) => s.title);

  d.outline.forEach((sec, i) => {
    // Chapters → section. Distractors prefer this book's other sections, which
    // makes the question about structure rather than about vocabulary.
    const pool = ownTitles.length >= 4 ? ownTitles : allSectionTitles;
    items.push({
      id: `det-outline-${d.book}-${i}`, kind: 'mcq', topic: 'outlines', tier: 2, book: d.book,
      prompt: `In ${name}, what do chapters ${sec.ch} cover?`,
      answer: sec.title,
      distractors: pickDistractors(pool, sec.title, 3, `out-${d.book}-${i}`),
      explain: `${name} outline: ${d.outline.map((s) => `${s.ch} — ${s.title}`).join(' · ')}`,
    });

    // Section → chapters, within this book only.
    if (d.outline.length >= 4) {
      items.push({
        id: `det-outline-ch-${d.book}-${i}`, kind: 'mcq', topic: 'outlines', tier: 3, book: d.book,
        prompt: `Which chapters of ${name} cover this? "${sec.title}"`,
        answer: sec.ch,
        distractors: pickDistractors(d.outline.map((s) => s.ch), sec.ch, 3, `outc-${d.book}-${i}`),
      });
    }
  });

  // Recite the skeleton in order.
  if (d.outline.length >= 3) {
    const window = d.outline.slice(0, Math.min(5, d.outline.length));
    items.push({
      id: `det-outline-order-${d.book}`, kind: 'order', topic: 'outlines', tier: 2, book: d.book,
      prompt: `Put the movements of ${name} in order.`,
      answer: window.map((s) => s.title).join(' → '),
      sequence: window.map((s) => s.title),
      explain: window.map((s) => `${s.ch}: ${s.title}`).join(' · '),
    });
  }

  return items;
}

function eventItems(d: BookDetail): Item[] {
  const items: Item[] = [];
  const name = bookName.get(d.book)!;
  const abbr = bookAbbr.get(d.book)!;

  // Two episodes can share a chapter range (Exodus 2 holds both the basket and
  // the flight to Midian). Asking "what happens in Exodus 2?" would then have
  // two right answers, so those prompts name the episode as well.
  const refCount = new Map<string, number>();
  for (const e of d.events) refCount.set(e.ref, (refCount.get(e.ref) ?? 0) + 1);

  for (const e of d.events) {
    const key = `${d.book}-${slug(e.name)}`;
    const ownWhats = d.events.map((x) => x.what);
    const shared = (refCount.get(e.ref) ?? 0) > 1;

    // Episode → what happened. The hardest and most useful form.
    items.push({
      id: `det-ev-what-${key}`, kind: 'mcq', topic: 'events', tier: 2, book: d.book,
      prompt: shared
        ? `${ref(d, e.ref)} — what happens in the episode known as "${e.name}"?`
        : `${ref(d, e.ref)} — what happens?`,
      answer: e.what,
      distractors: pickDistractors(
        ownWhats.length >= 6 ? ownWhats : allEventWhats, e.what, 3, `evw-${key}`,
      ),
      explain: [e.detail, e.where ? `Where: ${e.where}.` : null].filter(Boolean).join(' '),
    });

    // Description → reference. Tests whether you can place it.
    items.push({
      id: `det-ev-ref-${key}`, kind: 'mcq', topic: 'chapters', tier: 3, book: d.book,
      prompt: `Where does this happen? "${e.what}"`,
      answer: `${abbr} ${e.ref}`,
      distractors: pickDistractors(
        DETAILS.flatMap((x) => x.events.map((y) => `${bookAbbr.get(x.book)} ${y.ref}`)),
        `${abbr} ${e.ref}`, 3, `evr-${key}`,
      ),
      explain: `${e.name} — ${ref(d, e.ref)}.`,
    });

    // Named episode → book. One item per distinct episode name, and every book
    // that records it is kept out of the distractor pool.
    if (eventNameOwner.get(e.name.toLowerCase()) === d.book) {
      const banned = booksWithEventName(e.name);
      const pool = BOOKS.map((b) => b.name).filter((n) => !banned.has(n));
      items.push({
        id: `det-ev-book-${key}`, kind: 'mcq', topic: 'events', tier: 2, book: d.book,
        prompt: `In which book do we read about this: ${e.name}?`,
        answer: name,
        distractors: pickDistractors(pool, name, 3, `evb-${key}`),
        explain: `${ref(d, e.ref)} — ${e.what}.`,
      });
    }

    // Who was involved. Only for people tied to a single book, so the answer
    // is not "well, he is in six of them."
    const scoped = e.who.filter((w) => (nameBookCount.get(w)?.size ?? 0) === 1);
    if (scoped.length > 0) {
      const answer = scoped[0];
      const others = allFigureNames.filter((n) => !e.who.includes(n));
      items.push({
        id: `det-ev-who-${key}`, kind: 'mcq', topic: 'people', tier: 2, book: d.book,
        prompt: `Who is involved in this? "${e.what}"`,
        answer,
        distractors: pickDistractors(others, answer, 3, `evwho-${key}`),
        explain: `${e.name}, ${ref(d, e.ref)}${e.who.length > 1 ? ` — also involved: ${e.who.filter((w) => w !== answer).join(', ')}` : ''}.`,
      });
    }

    // Where it happened, when the place is worth knowing.
    if (e.where) {
      const places = DETAILS.flatMap((x) => x.events.map((y) => y.where)).filter((w): w is string => !!w);
      items.push({
        id: `det-ev-where-${key}`, kind: 'mcq', topic: 'places', tier: 3, book: d.book,
        prompt: `Where does this take place? "${e.what}"`,
        answer: e.where,
        distractors: pickDistractors(places, e.where, 3, `evwhere-${key}`),
        explain: `${e.name} — ${ref(d, e.ref)}.`,
      });
    }

    // The detail that separates this episode from every similar one.
    if (e.detail) {
      const details = DETAILS.flatMap((x) => x.events.map((y) => y.detail)).filter((x): x is string => !!x);
      items.push({
        id: `det-ev-detail-${key}`, kind: 'mcq', topic: 'events', tier: 3, book: d.book,
        prompt: `Which detail belongs to this episode: ${e.name} (${ref(d, e.ref)})?`,
        answer: e.detail,
        distractors: pickDistractors(details, e.detail, 3, `evd-${key}`),
        explain: e.what,
      });
    }
  }

  // Put this book's episodes in the order they occur.
  const ordered = orderableEvents(d);
  for (let i = 0; i + 4 <= ordered.length; i += 4) {
    const window = ordered.slice(i, i + 4);
    // The span keeps each set's prompt distinct — otherwise seven Genesis cards
    // all read "Put these events from Genesis in order" and look like one card.
    const span = `${firstChapter(window[0].ref)}–${lastChapter(window[window.length - 1].ref)}`;
    items.push({
      id: `det-ev-order-${d.book}-${i}`, kind: 'order', topic: 'events', tier: 2, book: d.book,
      prompt: `Put these events from ${name} ${span} in the order they occur.`,
      answer: window.map((e) => e.name).join(' → '),
      sequence: window.map((e) => e.name),
      explain: window.map((e) => `${e.name} (${ref(d, e.ref)})`).join(' · '),
    });
  }

  return items;
}

function firstChapter(r: string): string {
  return r.split(/[-,]/)[0].trim();
}

function lastChapter(r: string): string {
  const parts = r.split(/[-,]/);
  return parts[parts.length - 1].trim();
}

/**
 * Events are listed in narrative order already, but two entries sharing a
 * chapter range are not reliably ordered relative to each other — drop the
 * later one from sequencing drills rather than assert an order we do not know.
 */
function orderableEvents(d: BookDetail): DetailEvent[] {
  const seen = new Set<string>();
  const out: DetailEvent[] = [];
  for (const e of d.events) {
    if (seen.has(e.ref)) continue;
    seen.add(e.ref);
    out.push(e);
  }
  return out;
}

function figureItems(d: BookDetail): Item[] {
  const items: Item[] = [];
  const name = bookName.get(d.book)!;

  for (const f of d.figures) {
    const key = `${d.book}-${slug(f.name)}`;
    // What did this person do in this book? Distractors come from the same
    // book first — knowing the cast is not the same as knowing who did what.
    const ownDeeds = d.figures.map((x) => x.did);
    items.push({
      id: `det-fig-did-${key}`, kind: 'mcq', topic: 'people', tier: 2, book: d.book,
      prompt: `In ${name}, what does ${f.name} do?`,
      answer: f.did,
      distractors: pickDistractors(
        ownDeeds.length >= 6 ? ownDeeds : allFigureDeeds, f.did, 3, `figd-${key}`,
      ),
      explain: f.ref ? `See ${f.ref}.` : undefined,
    });

    // Deed → person, scoped to this book's cast.
    if (d.figures.length >= 4) {
      items.push({
        id: `det-fig-who-${key}`, kind: 'mcq', topic: 'people', tier: 3, book: d.book,
        prompt: `Who is this, in ${name}? "${f.did}"`,
        answer: f.name,
        distractors: pickDistractors(d.figures.map((x) => x.name), f.name, 3, `figw-${key}`),
        explain: f.ref,
      });
    }
  }

  return items;
}

function termItems(d: BookDetail): Item[] {
  const items: Item[] = [];
  const name = bookName.get(d.book)!;

  for (const t of d.terms ?? []) {
    const key = `${d.book}-${slug(t.term)}`;
    items.push({
      id: `det-term-mean-${key}`, kind: 'mcq', topic: 'terms', tier: 2, book: d.book,
      prompt: `What does "${t.term}" mean?`,
      answer: t.meaning,
      distractors: pickDistractors(allTermMeanings, t.meaning, 3, `tm-${key}`),
      explain: `A key term in ${name}.`,
    });
    items.push({
      id: `det-term-name-${key}`, kind: 'mcq', topic: 'terms', tier: 3, book: d.book,
      prompt: `Which term is this? "${t.meaning}"`,
      answer: t.term,
      distractors: pickDistractors(allTermNames, t.term, 3, `tn-${key}`),
      explain: `From ${name}.`,
    });
  }

  return items;
}

function numberItems(d: BookDetail): Item[] {
  const items: Item[] = [];
  const name = bookName.get(d.book)!;

  // Reads like a flashcard, which is what it is: "Numbers — years of wandering?"
  // Distractors come from this book's own figures when there are enough of them,
  // so the question is "which number in Numbers" rather than "which of these
  // four is obviously not about the wilderness."
  const ownValues = (d.numbers ?? []).map((x) => x.value);
  for (const n of d.numbers ?? []) {
    const key = `${d.book}-${slug(n.of)}`;
    items.push({
      id: `det-num-${key}`, kind: 'mcq', topic: 'numbers', tier: 3, book: d.book,
      prompt: `${name} — ${n.of}?`,
      answer: n.value,
      distractors: pickDistractors(
        ownValues.length >= 5 ? ownValues : allNumberValues, n.value, 3, `num-${key}`,
      ),
      explain: n.ref,
    });
  }

  return items;
}

function frameItems(d: BookDetail): Item[] {
  const items: Item[] = [];
  const name = bookName.get(d.book)!;

  items.push({
    id: `det-purpose-${d.book}`, kind: 'mcq', topic: 'summaries', tier: 2, book: d.book,
    prompt: `Why was ${name} written?`,
    answer: d.purpose,
    distractors: pickDistractors(allPurposes, d.purpose, 3, `pur-${d.book}`),
    explain: `Audience: ${d.audience}.`,
  });

  items.push({
    id: `det-audience-${d.book}`, kind: 'mcq', topic: 'summaries', tier: 3, book: d.book,
    prompt: `Who was ${name} written to?`,
    answer: d.audience,
    distractors: pickDistractors(allAudiences, d.audience, 3, `aud-${d.book}`),
    explain: d.purpose,
  });

  items.push({
    id: `det-written-${d.book}`, kind: 'mcq', topic: 'timeline', tier: 3, book: d.book,
    prompt: `When was ${name} written?`,
    answer: d.written,
    distractors: pickDistractors(allWritten, d.written, 3, `wr-${d.book}`),
    explain: `${name}: ${d.purpose}.`,
  });

  items.push({
    id: `det-christ-${d.book}`, kind: 'mcq', topic: 'christ', tier: 2, book: d.book,
    prompt: `How does ${name} point to Christ?`,
    answer: d.christ,
    distractors: pickDistractors(allChristLines, d.christ, 3, `chr-${d.book}`),
    explain: d.purpose,
  });

  if (d.distinctive) {
    items.push({
      id: `det-distinctive-${d.book}`, kind: 'mcq', topic: 'summaries', tier: 3, book: d.book,
      prompt: `Which book is this true of? "${d.distinctive}"`,
      answer: name,
      distractors: pickDistractors(BOOKS.map((b) => b.name), name, 3, `dis-${d.book}`),
      explain: d.purpose,
    });
  }

  if (d.writtenFrom) {
    const froms = DETAILS.map((x) => x.writtenFrom).filter((x): x is string => !!x);
    items.push({
      id: `det-from-${d.book}`, kind: 'mcq', topic: 'places', tier: 3, book: d.book,
      prompt: `Where was ${name} written from?`,
      answer: d.writtenFrom,
      distractors: pickDistractors(froms, d.writtenFrom, 3, `frm-${d.book}`),
      explain: `${name}, ${d.written}.`,
    });
  }

  // Extra landmark verses.
  (d.verses ?? []).forEach((v, i) => {
    items.push({
      id: `det-verse-${d.book}-${i}`, kind: 'mcq', topic: 'chapters', tier: 3, book: d.book,
      prompt: `Where is this from? "${v.text}"`,
      answer: v.ref,
      distractors: pickDistractors(
        DETAILS.flatMap((x) => (x.verses ?? []).map((y) => y.ref)), v.ref, 3, `vs-${d.book}-${i}`,
      ),
      explain: `${name} — ${d.purpose}`,
    });
  });

  return items;
}

/** Cross-book items built from the detail layer as a whole. */
function crossBookItems(): Item[] {
  const items: Item[] = [];

  // Match a named episode to the person at the center of it, across the canon.
  const soloEvents = DETAILS.flatMap((d) =>
    d.events
      .filter((e) => e.who.length > 0 && (nameBookCount.get(e.who[0])?.size ?? 0) === 1)
      .map((e) => ({ d, e })),
  );
  const sample = seededShuffle(soloEvents, 'cross-who').slice(0, 60);
  for (const { d, e } of sample) {
    const answer = e.who[0];
    items.push({
      id: `det-x-who-${d.book}-${slug(e.name)}`, kind: 'mcq', topic: 'people', tier: 3, book: d.book,
      prompt: `Who is at the center of this event: ${e.name}?`,
      answer,
      distractors: pickDistractors(allFigureNames.filter((n) => !e.who.includes(n)), answer, 3, `xw-${d.book}-${e.name}`),
      explain: `${ref(d, e.ref)} — ${e.what}`,
    });
  }

  // Which book is this outline from? Tests the skeleton, not the details.
  for (const d of DETAILS) {
    if (d.outline.length < 4) continue;
    const shape = d.outline.map((s) => s.title.split(' — ')[0]).slice(0, 4).join(' · ');
    items.push({
      id: `det-x-outline-book-${d.book}`, kind: 'mcq', topic: 'outlines', tier: 3, book: d.book,
      prompt: `Which book has this shape? "${shape}"`,
      answer: bookName.get(d.book)!,
      distractors: pickDistractors(BOOKS.map((b) => b.name), bookName.get(d.book)!, 3, `xo-${d.book}`),
      explain: d.purpose,
    });
  }

  return items;
}

export function buildDetailItems(): Item[] {
  const items: Item[] = [];
  for (const d of DETAILS) {
    items.push(
      ...outlineItems(d),
      ...eventItems(d),
      ...figureItems(d),
      ...termItems(d),
      ...numberItems(d),
      ...frameItems(d),
    );
  }
  items.push(...crossBookItems());
  return items;
}
