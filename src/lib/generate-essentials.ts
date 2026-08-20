import { BOOKS } from '../data/books';
import { ESSENTIALS, type EssentialEntry, type EssentialList } from '../data/essentials';
import type { Item } from '../data/types';
import { pickDistractors } from './rng';

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

  for (const e of list.entries) {
    const key = `${list.id}-${slug(e.cue)}`;
    const book = e.book ?? list.book;

    if (!coveredByBookData(list, e)) {
      items.push({
        id: `ess-${key}-f`, kind: 'mcq', topic: list.topic, tier: 1, book,
        prompt: fill(list.forward, e),
        answer: e.what,
        distractors: pickDistractors(whats, e.what, 3, `essf-${key}`),
        explain: why(list, e),
      });
    }

    if (list.back) {
      items.push({
        id: `ess-${key}-b`, kind: 'mcq', topic: list.topic, tier: 1, book,
        prompt: fill(list.back, e),
        answer: e.cue,
        distractors: pickDistractors(cues, e.cue, 3, `essb-${key}`),
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
  const groups = [...new Set(list.entries.map((e) => e.group).filter((g): g is string => !!g))];
  const pool = list.groupDecoy ? [...groups, list.groupDecoy] : groups;
  if (pool.length < 4) return [];

  return list.entries
    .filter((e) => e.group)
    .map((e) => ({
      id: `ess-${list.id}-${slug(e.cue)}-g`, kind: 'mcq' as const, topic: list.topic, tier: 1 as const,
      book: e.book ?? list.book,
      prompt: fill(list.groupAsk!, e),
      answer: e.group!,
      distractors: pickDistractors(pool, e.group!, 3, `essg-${list.id}-${e.cue}`),
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
