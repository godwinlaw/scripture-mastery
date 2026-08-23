import { BOOKS } from '../data/books';
import { ESSENTIALS, type EssentialEntry, type EssentialList } from '../data/essentials';
import type { Item } from '../data/types';
import { scopedSets } from './distractors';
import { DIFFICULTY_SPEC } from './difficulty';

/** Chapters `books.ts` already names as key chapters, per book. */
const KEY_CHAPTERS = new Map<string, Set<number>>(
  BOOKS.map((b) => [b.id, new Set(b.keyChapters.flatMap((k) => chapters(k.ch)))]),
);

/** "6-9" -> [6,7,8,9]; "3:23" -> [3]; "the Good Samaritan" -> []. */
function chapters(ref: string): number[] {
  const out: number[] = [];
  for (const part of ref.split(',')) {
    const m = part.trim().match(/^(\d+)(?:\s*[-–]\s*(\d+))?/);
    if (!m) continue;
    const from = Number(m[1]);
    const to = m[2] ? Number(m[2]) : from;
    for (let n = from; n <= to; n++) out.push(n);
  }
  return out;
}

/**
 * True when the book data already asks "what happens in this chapter?" — the
 * forward card would be a second copy of that question with a terser answer.
 * The reverse card is left alone: placing a heading in the right chapter,
 * against the other headings of the same book, is drilled nowhere else.
 */
function coveredByBookData(list: EssentialList, e: EssentialEntry): boolean {
  if (!list.chapterIndex) return false;
  const book = e.book ?? list.book;
  const covered = book ? KEY_CHAPTERS.get(book) : undefined;
  if (!covered) return false;
  return chapters(e.ch ?? e.cue).some((n) => covered.has(n));
}

function fill(template: string, e: EssentialEntry): string {
  return template.replace('{cue}', e.cue).replace('{what}', e.what);
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

/* -------------------------------------------------------------- difficulty */

/**
 * Every card in this file used to bake exactly one set of wrong options — the
 * other entries of its own list — and nothing else. That is a perfectly good
 * medium set, but with no `distractorsBy` on the item the render site has
 * nothing to swap in, so the easy/medium/hard control was inert across the
 * whole must-know section: three settings, one question (#40).
 *
 * The medium set is not what changes here. `scopedSets` is handed the same
 * pool and the same seed the call site used before, so `Item.distractors` is
 * byte-for-byte what it has always been — item ids key SRS history, and
 * validate.ts, the content-contract test and every rendered card read that
 * field. All that is new is the two alternates alongside it.
 *
 * The scoping principle for a pair list is that the list *is* the confusable
 * set. "Which chapter is the Fall?" is a real question when the options are
 * the other eleven Genesis landmarks and a giveaway when one of them is Ehud:
 *
 *   hard    the entries of this same list, widened only when the list is too
 *           short to out-offer medium on its own (see `hardChain`);
 *   easy    entries from a list on the far side of the Testament seam, minus
 *           anything this list itself indexes — wrong on sight;
 *   medium  untouched.
 */

/** Wrong options a medium card renders — the bar a hard card has to clear. */
const MEDIUM_WRONG_OPTIONS = DIFFICULTY_SPEC.medium.wrongOptions;

/** Which half of the pair a question's options are drawn from. */
type Side = 'cue' | 'what';

function sideValues(list: EssentialList, side: Side): string[] {
  return list.entries.map((e) => (side === 'cue' ? e.cue : e.what));
}

function flatten(lists: EssentialList[], side: Side): string[] {
  return lists.flatMap((l) => sideValues(l, side));
}

/**
 * Lists near enough that their entries are still a fair *hard* option: another
 * index of the same book (Genesis by chapter and the seven days of creation),
 * or another list of the same kind on the same side of the seam (the key
 * epistle chapters and the parables of Luke are both NT chapter indexes).
 *
 * Family never crosses the Testament seam — same book implies same testament,
 * and the topic arm requires it — which is what keeps it disjoint from the easy
 * pool below. No string can be reached by both a tight ring and the "obviously
 * wrong" one.
 */
function family(list: EssentialList): EssentialList[] {
  return ESSENTIALS.filter(
    (l) =>
      l.id !== list.id &&
      ((!!l.book && l.book === list.book) ||
        (l.testament === list.testament && l.topic === list.topic)),
  );
}

/**
 * Tightest first: this list, then this list plus its family, then everything on
 * this side of the seam, then the whole must-know set.
 *
 * Each ring contains the one before it. `layeredPool` takes a ring whole, so a
 * ring that dropped its own list's entries on the way out would hand a widened
 * hard card *easier* options than the medium card it replaces — the exact
 * inversion the layered shape exists to prevent (#40).
 *
 * The widening is gated on the reason it exists. Its whole job is to stop hard
 * rendering *fewer or easier* choices than medium, so a list that already beats
 * medium's three wrong options from its own entries does not widen at all: the
 * five round numbers have four rivals each, which is one more than medium
 * shows and all four are dates. Widened, that card read
 * "~1500 BC / 46 / Ehud / 7 / Jephthah / Elisha" — the answer was the only date
 * on screen, a giveaway, and hard came out easier than medium. Tight and one
 * short beats padded and shape-mismatched (#40).
 *
 * The rings below are therefore live code for a list too short to beat medium
 * on its own — four entries or fewer, which none currently is — and every list
 * of six or more satisfies the first ring outright. Only a genuinely tiny list
 * would ever reach the testament or canon-wide rings.
 */
function hardChain(list: EssentialList, side: Side): (() => string[])[] {
  const own = sideValues(list, side);
  const sameTestament = ESSENTIALS.filter((l) => l.id !== list.id && l.testament === list.testament);
  // Entries are unique within a list — validate.ts gates both sides — so every
  // other entry is one usable rival.
  if (own.length - 1 > MEDIUM_WRONG_OPTIONS) return [() => own];
  return [
    () => own,
    () => [...own, ...flatten(family(list), side)],
    () => [...own, ...flatten(sameTestament, side)],
    () => flatten(ESSENTIALS, side),
  ];
}

/**
 * Widest first, because the whole job of an easy option is to be wrong on
 * sight. The other Testament is the cheapest guarantee of that and — see
 * `family` — is the one region no hard ring short of the last can reach.
 *
 * The subtraction matters more than the source. Half these lists are indexed by
 * bare chapter numbers, so John's "11" and Genesis's "11" are the same string;
 * borrowing it back as an easy option would quietly rebuild the medium set. Any
 * value this list already indexes is therefore dropped, whichever list it came
 * from.
 *
 * The last ring is this list's own pool. It fires only if a list is ever left
 * with nothing outside it to borrow, and it is here because an *empty* easy set
 * would render a question with a single option — worse than an easy set that is
 * merely no easier than medium.
 */
function easyChain(list: EssentialList, side: Side): (() => string[])[] {
  const own = new Set(sideValues(list, side));
  const kin = new Set(family(list).map((l) => l.id));
  const outside = (lists: EssentialList[]) => flatten(lists, side).filter((v) => !own.has(v));
  return [
    () => outside(ESSENTIALS.filter((l) => l.testament !== list.testament)),
    () => outside(ESSENTIALS.filter((l) => l.id !== list.id && !kin.has(l.id))),
    () => [...own],
  ];
}

/** The group pool `groupItems` offers — the list's groups, decoy last. */
function groupPool(list: EssentialList): string[] {
  const groups = [...new Set(list.entries.map((e) => e.group).filter((g): g is string => !!g))];
  return list.groupDecoy ? [...groups, list.groupDecoy] : groups;
}

/**
 * "The northern kingdom" against "The northern kingdom of Israel" is not a
 * wrong option, it is the right one said shorter.
 *
 * The two grouped lists name the same periods with different fullness, and a
 * group pool has to widen across them to reach six choices at all, so without
 * this guard hard mode would mark a correct answer wrong. Matching on a token
 * prefix rather than a substring is deliberate: the pair lists are indexed by
 * bare numbers, where "1" sits inside "11", "12" and "119", and a substring
 * rule would gut them if it were ever reused there.
 */
function isRenaming(a: string, b: string): boolean {
  const tokens = (s: string) =>
    s.toLowerCase().replace(/^the\s+/, '').split(/[^a-z0-9]+/).filter(Boolean);
  const x = tokens(a);
  const y = tokens(b);
  const [short, long] = x.length <= y.length ? [x, y] : [y, x];
  return short.length > 0 && short.every((w, i) => long[i] === w);
}

/**
 * Group cards ask which period or kingdom an entry belongs to, and only two
 * lists have groups at all — the major kings and the prophets by period. Both
 * are OT people lists, so they are each other's family and there is no
 * unrelated list to borrow from.
 *
 * That shapes both chains. Hard has to widen into the sibling list to reach six
 * choices, since a list's own groups number four at most; easy borrows the
 * sibling's phrasing of the same periods, and falls back to the list's own
 * groups when the renaming guard thins that below three. Easy is genuinely
 * easier here mostly because it renders two wrong options where hard renders
 * five — an honest limit of the data rather than of the scoping (#40).
 */
function groupHardChain(list: EssentialList, answer: string): (() => string[])[] {
  const own = groupPool(list);
  const borrow = (lists: EssentialList[]) =>
    lists.flatMap(groupPool).filter((g) => !isRenaming(g, answer));
  return [
    () => own,
    () => [...own, ...borrow(family(list))],
    () => [...own, ...borrow(ESSENTIALS.filter((l) => l.id !== list.id))],
  ];
}

function groupEasyChain(list: EssentialList, answer: string): (() => string[])[] {
  const own = groupPool(list);
  return [
    () =>
      ESSENTIALS.filter((l) => l.id !== list.id)
        .flatMap(groupPool)
        .filter((g) => !own.includes(g) && !isRenaming(g, answer)),
    () => own,
  ];
}

/** The pair itself, then where it comes from — a miss should teach the entry. */
function why(list: EssentialList, e: EssentialEntry): string {
  return [`${e.cue} — ${e.what}.`, e.group ? `${e.group}.` : null, e.note, list.source]
    .filter(Boolean)
    .join(' ');
}

function listItems(list: EssentialList): Item[] {
  const items: Item[] = [];
  const cues = list.entries.map((e) => e.cue);
  const whats = list.entries.map((e) => e.what);
  // The chains are per list, not per entry — `layeredPool` re-walks them for
  // every card, but which lists they draw from never varies inside one list.
  const forwardScopes = { easy: easyChain(list, 'what'), hard: hardChain(list, 'what') };
  const backScopes = { easy: easyChain(list, 'cue'), hard: hardChain(list, 'cue') };

  for (const e of list.entries) {
    const key = `${list.id}-${slug(e.cue)}`;
    const book = e.book ?? list.book;

    if (!coveredByBookData(list, e)) {
      items.push({
        id: `ess-${key}-f`, kind: 'mcq', topic: list.topic, tier: 1, book,
        prompt: fill(list.forward, e),
        answer: e.what,
        // Same pool, same seed, same count as before — `distractors` comes out
        // byte-identical; what is new is the easy and hard sets beside it.
        ...scopedSets(e.what, `essf-${key}`, { medium: whats, ...forwardScopes }),
        explain: why(list, e),
      });
    }

    if (list.back) {
      items.push({
        id: `ess-${key}-b`, kind: 'mcq', topic: list.topic, tier: 1, book,
        prompt: fill(list.back, e),
        answer: e.cue,
        ...scopedSets(e.cue, `essb-${key}`, { medium: cues, ...backScopes }),
        explain: why(list, e),
      });
    }
  }

  items.push(...groupItems(list), ...orderItems(list));
  return items;
}

/**
 * "Which kingdom did Ahab rule?" Only worth a card when there are enough
 * groups to make four options — a two-way choice is a coin flip, not recall.
 */
function groupItems(list: EssentialList): Item[] {
  if (!list.groupAsk) return [];
  const pool = groupPool(list);
  if (pool.length < 4) return [];

  return list.entries
    .filter((e) => e.group)
    .map((e) => ({
      id: `ess-${list.id}-${slug(e.cue)}-g`, kind: 'mcq' as const, topic: list.topic, tier: 1 as const,
      book: e.book ?? list.book,
      prompt: fill(list.groupAsk!, e),
      answer: e.group!,
      // The seed is the raw cue, not the slug the other two cards use. It is
      // wrong-looking and it stays: changing it would reshuffle every group
      // card's medium options.
      ...scopedSets(e.group!, `essg-${list.id}-${e.cue}`, {
        medium: pool,
        easy: groupEasyChain(list, e.group!),
        hard: groupHardChain(list, e.group!),
      }),
      // The group is the answer here, so `why` would just repeat it back.
      explain: [`${e.cue} — ${e.what}.`, e.note, list.source].filter(Boolean).join(' '),
    }));
}

/** One sequencing card per group, where the sequence is long enough to be real. */
function orderItems(list: EssentialList): Item[] {
  if (!list.ordered) return [];
  const byGroup = new Map<string, EssentialEntry[]>();
  for (const e of list.entries) {
    const g = e.group ?? '';
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g)!.push(e);
  }

  const out: Item[] = [];
  for (const [group, entries] of byGroup) {
    if (entries.length < 4) continue; // three steps is barely a sequence
    const steps = entries.slice(0, 8).map((e) => (list.orderBy === 'what' ? e.what : e.cue));
    out.push({
      id: `ess-${list.id}-order${group ? `-${slug(group)}` : ''}`, kind: 'order', topic: list.topic, tier: 1,
      book: list.book,
      prompt: (list.orderAsk ?? `${list.title} — put these in order.`)
        .replace('{group}', group.replace(/^The /, 'the ')),
      answer: steps.join(' → '),
      sequence: steps,
      explain: `${list.source.replace(/\.$/, '')}. ${entries.map((e) => `${e.cue}: ${e.what}`).join(' · ')}`,
    });
  }
  return out;
}

let cache: Item[] | null = null;

export function buildEssentialItems(): Item[] {
  if (!cache) cache = ESSENTIALS.flatMap(listItems);
  return cache;
}

/** Ids of every must-know card, for the "Must-know lists" quiz scope. */
export const ESSENTIAL_ITEM_IDS: Set<string> = new Set(buildEssentialItems().map((i) => i.id));
