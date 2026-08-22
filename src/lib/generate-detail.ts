import { BOOKS, BOOKS_BY_ID, booksNear, isPropheticBook, sameTestamentBooks } from '../data/books';
import { DETAILS, type BookDetail, type DetailEvent } from '../data/details';
import type { Book, Item } from '../data/types';
import { distractorSets, scopedSets } from './distractors';
import { pickDistractors, seededShuffle } from './rng';

const bookName = new Map(BOOKS.map((b) => [b.id, b.name]));
const bookAbbr = new Map(BOOKS.map((b) => [b.id, b.abbr]));

/** Lets a Book-keyed pool walk reach that book's detail entry (#10). */
const detailByBook = new Map(DETAILS.map((d) => [d.book, d]));

const allFigureDeeds = DETAILS.flatMap((d) => d.figures.map((f) => f.did));
const allFigureNames = [...new Set(DETAILS.flatMap((d) => d.figures.map((f) => f.name)))];
const allNumberValues = DETAILS.flatMap((d) => d.numbers?.map((n) => n.value) ?? []);
const allPurposes = DETAILS.map((d) => d.purpose);
const allAudiences = [...new Set(DETAILS.map((d) => d.audience))];
const allWritten = [...new Set(DETAILS.map((d) => d.written))];

/**
 * The rings every hard chain in this file walks, tightest first (#38).
 *
 * Until now the raw `pickDistractors` sites below drew from one of the
 * canon-wide arrays above (or, at best, from the whole book), so the setting
 * changed how *many* wrong options a card showed but never how close they sat
 * to the answer — "hard" was six canon-wide strangers where medium was four.
 * These rings are what the scoped chains widen through: the book itself, then
 * its division, then its Testament, never across the seam (the same fence
 * `nearbyPool` keeps, for the same reason — a Colossians option against a
 * Leviticus question is a different subject, not a harder one).
 *
 * Each ring is a strict superset of the one before, which is what makes
 * `layeredPool`'s widening monotonic. `booksNear(id, 0)` already contains the
 * book; `sameTestamentBooks` deliberately does not, so it is added back here.
 */
function ownRing(bookId: string): Book[] {
  const b = BOOKS_BY_ID[bookId];
  return b ? [b] : [];
}

function divisionRing(bookId: string): Book[] {
  return booksNear(bookId, 0);
}

function testamentRing(bookId: string): Book[] {
  return [...ownRing(bookId), ...sameTestamentBooks(bookId)];
}

/** One field out of every detail record in a ring, absent values dropped. */
function fromDetails(
  books: Book[],
  extract: (d: BookDetail) => readonly (string | undefined)[],
): string[] {
  return books.flatMap((b) => {
    const d = detailByBook.get(b.id);
    return d ? extract(d).filter((s): s is string => !!s) : [];
  });
}

/**
 * The hard chain for anything that lives *inside* a book — its cast, their
 * deeds, the people and places its episodes name, its numbers.
 *
 * The book's own record is the tightest honest pool here: telling Aaron from
 * Miriam is a Numbers question, telling Aaron from Habakkuk is not a question
 * at all. Any per-question exclusion belongs inside `extract` rather than
 * after the fact, so that a ring which cannot actually offer enough options is
 * seen as short and widened past, instead of looking full and coming up empty.
 */
function insideChain(
  bookId: string,
  extract: (d: BookDetail) => readonly (string | undefined)[],
): (() => string[])[] {
  return [
    () => fromDetails(ownRing(bookId), extract),
    () => fromDetails(divisionRing(bookId), extract),
    () => fromDetails(testamentRing(bookId), extract),
  ];
}

/**
 * The hard chain for whole-book fields — purpose, audience, date, place of
 * writing.
 *
 * There is no own-book ring on purpose: a book has exactly one purpose and it
 * is the answer, so the tightest pool that can exist is the surrounding
 * division. That is still a real tightening. "When was Nahum written?" against
 * the other Minor Prophets' dates is a date question; against the whole canon's
 * it is an Old-Testament-or-New question, which the prompt already gave away.
 */
function aboutChain(
  bookId: string,
  extract: (d: BookDetail) => readonly (string | undefined)[],
): (() => string[])[] {
  return [
    () => fromDetails(divisionRing(bookId), extract),
    () => fromDetails(testamentRing(bookId), extract),
  ];
}

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
    //
    // Own book first, as before. The fallback used to be the whole canon; it is
    // now the surrounding division, widening only as needed (#12). That rule is
    // this question's medium set, so it is kept here rather than handed to
    // distractorSets — the helper still supplies the easy and hard alternates.
    const whatSets = distractorSets(
      d.book,
      (x) => (detailByBook.get(x.id)?.events ?? []).map((y) => y.what),
      e.what, `evw-${key}`, 'division',
    );
    items.push({
      id: `det-ev-what-${key}`, kind: 'mcq', topic: 'events', tier: 2, book: d.book,
      prompt: shared
        ? `${ref(d, e.ref)} — what happens in the episode known as "${e.name}"?`
        : `${ref(d, e.ref)} — what happens?`,
      answer: e.what,
      distractors: ownWhats.length >= 6
        ? pickDistractors(ownWhats, e.what, 3, `evw-${key}`)
        : whatSets.distractors,
      distractorsBy: whatSets.distractorsBy,
      explain: [e.detail, e.where ? `Where: ${e.where}.` : null].filter(Boolean).join(' '),
    });

    // Description → reference. Tests whether you can place it.
    items.push({
      id: `det-ev-ref-${key}`, kind: 'mcq', topic: 'chapters', tier: 3, book: d.book,
      prompt: `Where does this happen? "${e.what}"`,
      answer: `${abbr} ${e.ref}`,
      ...distractorSets(
        d.book,
        (x) => (detailByBook.get(x.id)?.events ?? []).map((y) => `${bookAbbr.get(x.id)} ${y.ref}`),
        `${abbr} ${e.ref}`, `evr-${key}`, 'book',
      ),
      explain: `${e.name} — ${ref(d, e.ref)}.`,
    });

    // Named episode → book. One item per distinct episode name, and every book
    // that records it is kept out of the distractor pool.
    if (eventNameOwner.get(e.name.toLowerCase()) === d.book) {
      const banned = booksWithEventName(e.name);
      // Same-division books, widening only as far as it must — "Miriam's
      // leprosy" should offer the books of Moses, not Colossians (#12). The
      // ban is folded in so the widening counts only offerable books, in every
      // difficulty's pool alike.
      items.push({
        id: `det-ev-book-${key}`, kind: 'mcq', topic: 'events', tier: 2, book: d.book,
        prompt: `In which book do we read about this: ${e.name}?`,
        answer: name,
        ...distractorSets(
          d.book, (x) => (banned.has(x.name) ? [] : [x.name]), name,
          `evb-${key}`, 'division',
        ),
        explain: `${ref(d, e.ref)} — ${e.what}.`,
      });
    }

    // Who was involved. Only for people tied to a single book, so the answer
    // is not "well, he is in six of them."
    //
    // The cue is the episode's own summary, and #13 rewrote those to name
    // their subject instead of opening on a bare "He". That is right for the
    // where- and when- questions, but it hands this one its answer — so any
    // candidate the cue already names is not a candidate here.
    const scoped = e.who.filter(
      (w) => (nameBookCount.get(w)?.size ?? 0) === 1 && !e.what.includes(w),
    );
    if (scoped.length > 0) {
      const answer = scoped[0];
      const others = allFigureNames.filter((n) => !e.who.includes(n));
      // Everyone the episode actually names is barred from *every* tier, not
      // just from `others`. A tighter pool that let a genuine participant
      // through would be offering a second right answer, and validate.ts only
      // ever compares options against `answer` itself, so nothing downstream
      // would catch it (#38).
      const notPresent = (n: string) => !e.who.includes(n);
      items.push({
        id: `det-ev-who-${key}`, kind: 'mcq', topic: 'people', tier: 2, book: d.book,
        prompt: `Who is involved in this? "${e.what}"`,
        answer,
        // Medium has always been every figure in the canon, which makes this a
        // which-book question in disguise. Hard offers the other people this
        // book's own episodes put on stage, so it asks who did *this* (#38).
        ...scopedSets(answer, `evwho-${key}`, {
          medium: others,
          easy: [() => others],
          hard: insideChain(d.book, (x) => x.events.flatMap((y) => y.who).filter(notPresent)),
        }),
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
        // Hard offers the other places this book's own episodes happen: Sinai
        // against Kadesh, Nebo and the Red Sea is a where-in-Exodus question;
        // Sinai against Patmos and Antioch is a which-Testament one (#38).
        ...scopedSets(e.where, `evwhere-${key}`, {
          medium: places,
          easy: [() => places],
          hard: insideChain(d.book, (x) => x.events.map((y) => y.where)),
        }),
        explain: `${e.name} — ${ref(d, e.ref)}.`,
      });
    }

    // The detail that separates this episode from every similar one.
    if (e.detail) {
      items.push({
        id: `det-ev-detail-${key}`, kind: 'mcq', topic: 'events', tier: 3, book: d.book,
        prompt: `Which detail belongs to this episode: ${e.name} (${ref(d, e.ref)})?`,
        answer: e.detail,
        ...distractorSets(
          d.book,
          (x) => (detailByBook.get(x.id)?.events ?? []).map((y) => y.detail).filter((y): y is string => !!y),
          // The detail is a fact from *inside* one episode, so the tightest
          // honest pool is the other details that book records — unlike
          // "in which book does this happen?", where the answer is a book and
          // the division is as tight as it can get.
          e.detail, `evd-${key}`, 'book',
        ),
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
      // Medium keeps its old rule exactly — this book's deeds when the cast is
      // big enough, the canon's otherwise. Hard always starts from this book,
      // so the small-cast books stop pitting a Ruth deed against a Revelation
      // one merely because Ruth lists fewer than six figures (#38).
      ...scopedSets(f.did, `figd-${key}`, {
        medium: ownDeeds.length >= 6 ? ownDeeds : allFigureDeeds,
        easy: [() => allFigureDeeds],
        hard: insideChain(d.book, (x) => x.figures.map((y) => y.did)),
      }),
      explain: f.ref ? `See ${f.ref}.` : undefined,
    });

    // Deed → person, scoped to this book's cast.
    if (d.figures.length >= 4) {
      items.push({
        id: `det-fig-who-${key}`, kind: 'mcq', topic: 'people', tier: 3, book: d.book,
        prompt: `Who is this, in ${name}? "${f.did}"`,
        answer: f.name,
        // Medium is already this book's own cast, so hard cannot sit tighter;
        // what it adds is the extra two options. A four-figure book cannot fill
        // six slots from its own list, and the chain widens to the division
        // rather than let the hardest setting render the shortest card (#38).
        ...scopedSets(f.name, `figw-${key}`, {
          medium: d.figures.map((x) => x.name),
          easy: [() => allFigureNames],
          hard: insideChain(d.book, (x) => x.figures.map((y) => y.name)),
        }),
        explain: f.ref,
      });
    }
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
      // `numbers` is the sparsest field in the detail layer — most books record
      // none at all — so even the Testament ring often cannot reach six values
      // and `scopedSets`' thinness guard tops the hard set up from the wider
      // pools. That is the intended outcome: a genuinely scoped hard set where
      // one exists, and a full card rather than a short one where it does not.
      ...scopedSets(n.value, `num-${key}`, {
        medium: ownValues.length >= 5 ? ownValues : allNumberValues,
        easy: [() => allNumberValues],
        hard: insideChain(d.book, (x) => (x.numbers ?? []).map((y) => y.value)),
      }),
      explain: n.ref,
    });
  }

  return items;
}

function frameItems(d: BookDetail): Item[] {
  const items: Item[] = [];
  const name = bookName.get(d.book)!;

  // Purpose and audience summarise the book rather than teach its contents, so
  // they follow the same prophets-only rule as the other summary questions (#9).
  if (isPropheticBook(d.book)) {
    items.push({
      id: `det-purpose-${d.book}`, kind: 'mcq', topic: 'summaries', tier: 2, book: d.book,
      prompt: `Why was ${name} written?`,
      answer: d.purpose,
      // Only the prophets ask this (#9), and the prophets are exactly where a
      // canon-wide pool gives the game away: "why was Joel written?" against
      // Philemon and Leviticus answers itself. Hard keeps it among the other
      // Minor Prophets, whose stated purposes genuinely overlap (#38).
      ...scopedSets(d.purpose, `pur-${d.book}`, {
        medium: allPurposes,
        easy: [() => allPurposes],
        hard: aboutChain(d.book, (x) => [x.purpose]),
      }),
      explain: `Audience: ${d.audience}.`,
    });

    items.push({
      id: `det-audience-${d.book}`, kind: 'mcq', topic: 'summaries', tier: 3, book: d.book,
      prompt: `Who was ${name} written to?`,
      answer: d.audience,
      ...scopedSets(d.audience, `aud-${d.book}`, {
        medium: allAudiences,
        easy: [() => allAudiences],
        hard: aboutChain(d.book, (x) => [x.audience]),
      }),
      explain: d.purpose,
    });
  }

  items.push({
    id: `det-written-${d.book}`, kind: 'mcq', topic: 'timeline', tier: 3, book: d.book,
    prompt: `When was ${name} written?`,
    answer: d.written,
    // Dates are the clearest case for scoping: books in one division were
    // written within decades of each other, so the division's dates are the
    // options a reader actually has to weigh. The canon's span a millennium,
    // which quietly turns this into an OT-or-NT question (#38).
    ...scopedSets(d.written, `wr-${d.book}`, {
      medium: allWritten,
      easy: [() => allWritten],
      hard: aboutChain(d.book, (x) => [x.written]),
    }),
    explain: `${name}: ${d.purpose}.`,
  });

  // "How does X point to Christ?" was generated here as its own topic. #16
  // dropped it as a study category: the answers are interpretive rather than
  // recall, so a four-option quiz was the wrong shape for them. The `christ`
  // line survives on BookDetail and still reads in the Library panel — it is
  // reference material now, not a question.

  if (d.distinctive && isPropheticBook(d.book)) {
    items.push({
      id: `det-distinctive-${d.book}`, kind: 'mcq', topic: 'summaries', tier: 3, book: d.book,
      prompt: `Which book is this true of? "${d.distinctive}"`,
      answer: name,
      // The pool here is book names rather than a detail field, so this walks
      // the rings directly instead of through `aboutChain`. Only prophetic
      // books ask it, which means the tight ring is the other Major or Minor
      // Prophets — the seventeen books #9 kept these questions for, and the one
      // stretch of the canon where "which book is this?" is a real question.
      ...scopedSets(name, `dis-${d.book}`, {
        medium: BOOKS.map((b) => b.name),
        easy: [() => BOOKS.map((b) => b.name)],
        hard: [
          () => divisionRing(d.book).map((b) => b.name),
          () => testamentRing(d.book).map((b) => b.name),
        ],
      }),
      explain: d.purpose,
    });
  }

  if (d.writtenFrom) {
    const froms = DETAILS.map((x) => x.writtenFrom).filter((x): x is string => !!x);
    items.push({
      id: `det-from-${d.book}`, kind: 'mcq', topic: 'places', tier: 3, book: d.book,
      prompt: `Where was ${name} written from?`,
      answer: d.writtenFrom,
      // `writtenFrom` is recorded almost only for the Pauline epistles, so the
      // division ring and the canon-wide pool are nearly the same handful of
      // cities. The scoping is honest but thin here; the widening and the
      // thinness guard are what keep the card full (#38).
      ...scopedSets(d.writtenFrom, `frm-${d.book}`, {
        medium: froms,
        easy: [() => froms],
        hard: aboutChain(d.book, (x) => [x.writtenFrom]),
      }),
      explain: `${name}, ${d.written}.`,
    });
  }

  // Extra landmark verses.
  (d.verses ?? []).forEach((v, i) => {
    items.push({
      id: `det-verse-${d.book}-${i}`, kind: 'mcq', topic: 'chapters', tier: 3, book: d.book,
      prompt: `Where is this from? "${v.text}"`,
      answer: v.ref,
      ...distractorSets(
        d.book, (x) => (detailByBook.get(x.id)?.verses ?? []).map((y) => y.ref),
        v.ref, `vs-${d.book}-${i}`, 'book',
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
    // Same exclusion rule as the in-book who-question: nobody the episode
    // actually involves may surface as a wrong option in any tier, or the card
    // has two right answers.
    const others = allFigureNames.filter((n) => !e.who.includes(n));
    items.push({
      id: `det-x-who-${d.book}-${slug(e.name)}`, kind: 'mcq', topic: 'people', tier: 3, book: d.book,
      prompt: `Who is at the center of this event: ${e.name}?`,
      answer,
      // This item is deliberately cross-book, so medium spans the canon. Hard
      // narrows to the cast of the book the episode came from: the golden calf
      // against Aaron, Joshua and Hur is a question about Exodus; against
      // Nehemiah and Titus it is a question about the table of contents (#38).
      ...scopedSets(answer, `xw-${d.book}-${e.name}`, {
        medium: others,
        easy: [() => others],
        hard: insideChain(d.book, (x) => x.figures.map((y) => y.name).filter((n) => !e.who.includes(n))),
      }),
      explain: `${ref(d, e.ref)} — ${e.what}`,
    });
  }

  return items;
}

export function buildDetailItems(): Item[] {
  const items: Item[] = [];
  for (const d of DETAILS) {
    items.push(
      ...eventItems(d),
      ...figureItems(d),
      ...numberItems(d),
      ...frameItems(d),
    );
  }
  items.push(...crossBookItems());
  return items;
}
