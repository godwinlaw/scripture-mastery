/**
 * Content-integrity checks over the generated item bank.
 *
 * The bank is generated, not authored, so the failure mode is not a typo — it
 * is a rule that produces a broken question everywhere at once. Run with
 * `npm run validate`. A non-zero exit means at least one hard check failed.
 */
import { BOOKS, TOTAL_CHAPTERS } from '../src/data/books';
import { PEOPLE, PLACES } from '../src/data/people';
import { DETAILS, DETAIL_COVERAGE, DETAIL_TOTALS } from '../src/data/details';
import { ESSENTIALS, ESSENTIAL_ALIASES, ESSENTIAL_ENTRY_COUNT } from '../src/data/essentials';
import { LISTS } from '../src/data/extras';
import { ESSENTIAL_ITEM_IDS } from '../src/lib/generate-essentials';
import { TOPIC_LABELS } from '../src/data/types';
import type { Difficulty, Item } from '../src/data/types';
import { allItems } from '../src/lib/generate';

const items = allItems();
const problems: string[] = [];
const notes: string[] = [];

function hard(label: string, bad: unknown[], show = (x: any) => String(x)) {
  if (bad.length === 0) {
    notes.push(`  ok    ${label}: 0`);
    return;
  }
  problems.push(`  FAIL  ${label}: ${bad.length}`);
  bad.slice(0, 6).forEach((b) => problems.push(`          ${show(b)}`));
}

// ---------------------------------------------------------------- structure
hard('duplicate item ids', dupes(items.map((i) => i.id)));
hard('items with an empty prompt or answer', items.filter((i) => !i.prompt.trim() || !i.answer.trim()), (i: Item) => i.id);
hard('mcq items with fewer than 3 distractors', items.filter((i) => i.kind === 'mcq' && (i.distractors?.length ?? 0) < 3), (i: Item) => i.id);
hard('mcq items whose answer is also a distractor', items.filter((i) => i.distractors?.includes(i.answer)), (i: Item) => `${i.id} | ${i.prompt}`);
hard('mcq items with duplicate distractors', items.filter((i) => i.distractors && dupes(i.distractors).length > 0), (i: Item) => i.id);
// The easy and hard option sets (#36) are generated content in exactly the way
// the medium set is, and the card swaps one in wholesale at render. The three
// gates above only ever look at `distractors`, so a leaked answer or a short
// pool in an alternate set would ship invisibly — to anyone who had moved off
// the default setting, which is the whole point of having it.
(['easy', 'hard'] as Difficulty[]).forEach((level) => {
  const withSet = items.filter((i) => i.distractorsBy?.[level]);
  const optionsOf = (i: Item) => i.distractorsBy![level]!;
  hard(`mcq items with fewer than 3 ${level} distractors`, withSet.filter((i) => optionsOf(i).length < 3), (i: Item) => i.id);
  hard(`mcq items whose answer is also a ${level} distractor`, withSet.filter((i) => optionsOf(i).includes(i.answer)), (i: Item) => `${i.id} | ${i.prompt}`);
  hard(`mcq items with duplicate ${level} distractors`, withSet.filter((i) => dupes(optionsOf(i)).length > 0), (i: Item) => i.id);
});

// A "Which book is this?" card hands over its answer when the quoted line names
// the book — "God tells Hosea to marry…" is not a question about Hosea, it is a
// label. Only the quoting shapes are checked (the summary, the key verse, the
// distinctive fact); "Which book immediately follows 1 Samuel?" names a book on
// purpose. The bare title is compared (Kings, not 1 Kings), so a line naming
// one of a numbered pair leaks half the answer and is still caught.
const QUOTING_BOOK_PROMPT = /^Which book is this(?: from| true of)?\? "(.*)"$/;
const bareTitle = (name: string) => name.replace(/^[123] /, '');
hard(
  'book prompts whose quoted line names the answer',
  items.filter((i) => {
    const quoted = QUOTING_BOOK_PROMPT.exec(i.prompt)?.[1];
    return quoted !== undefined && new RegExp(`\\b${bareTitle(i.answer)}\\b`, 'i').test(quoted);
  }),
  (i: Item) => `${i.id} | ${i.prompt}`,
);

hard('order items with a duplicated step', items.filter((i) => i.kind === 'order' && i.sequence && dupes(i.sequence).length > 0), (i: Item) => i.id);
hard('order items with fewer than 3 steps', items.filter((i) => i.kind === 'order' && (i.sequence?.length ?? 0) < 3), (i: Item) => i.id);
hard('items pointing at a book that does not exist', items.filter((i) => i.book && !BOOKS.some((b) => b.id === i.book)), (i: Item) => `${i.id} -> ${i.book}`);

// ------------------------------------------------------------- ambiguity
// The real test is not "two cards share a prompt" — the NOT-in-this-list cards
// legitimately do, each with its own single right answer. It is "one card's
// correct answer is offered as a wrong option on another card asking the same
// question." That one marks a right answer wrong.
const byPrompt = new Map<string, Item[]>();
for (const i of items) {
  const g = byPrompt.get(i.prompt);
  if (g) g.push(i);
  else byPrompt.set(i.prompt, [i]);
}
const ambiguous: string[] = [];
for (const [prompt, group] of byPrompt) {
  if (group.length < 2) continue;
  for (const a of group) {
    for (const b of group) {
      if (a === b) continue;
      if (b.distractors?.includes(a.answer)) {
        ambiguous.push(`${prompt}\n            "${a.answer}" is correct on ${a.id} but a wrong option on ${b.id}`);
      }
    }
  }
}
hard('prompts where a correct answer is a wrong option elsewhere', [...new Set(ambiguous)]);

// A shared prompt with differing answers is not automatically wrong. The four
// "which is NOT on this list" cards share a prompt on purpose, each pairing a
// different decoy with three real members — every card still has exactly one
// right answer. The genuine fault is the same prompt showing the same four
// options and expecting a different one. So the key is the whole option set,
// answer included.
const collisions: string[] = [];
for (const [prompt, group] of byPrompt) {
  if (group.length < 2) continue;
  const seen = new Map<string, string>();
  for (const g of group) {
    const options = [g.answer, ...(g.distractors ?? []), ...(g.sequence ?? [])];
    if (options.length < 2) continue;
    const optionKey = options.slice().sort().join('|');
    const prior = seen.get(optionKey);
    if (prior && prior !== g.answer) collisions.push(`${prompt} => "${prior}" vs "${g.answer}"`);
    seen.set(optionKey, g.answer);
  }
}
hard('same prompt and same four options, different answer', [...new Set(collisions)]);

// ------------------------------------------------------------- coverage
hard('books with no detail entry', BOOKS.filter((b) => !DETAILS.some((d) => d.book === b.id)).map((b) => b.name));
hard('detail entries for a book that does not exist', DETAIL_COVERAGE.orphans);
hard('duplicate person ids', dupes(PEOPLE.map((p) => p.id)));
hard('duplicate person names', dupes(PEOPLE.map((p) => p.name)));
hard('duplicate place ids', dupes(PLACES.map((p) => p.id)));
hard('people whose primary book does not exist', PEOPLE.filter((p) => !BOOKS.some((b) => b.id === p.book)).map((p) => `${p.id} -> ${p.book}`));

// ------------------------------------------------------------- essentials
// A pair list only works if each cue resolves to one thing. Two rows with the
// same cue would put two right answers behind one prompt.
hard(
  'must-know lists with a repeated cue',
  ESSENTIALS.flatMap((l) => dupes(l.entries.map((e) => e.cue)).map((c) => `${l.id}: ${c}`)),
);
hard(
  'must-know lists with a repeated answer',
  ESSENTIALS.flatMap((l) => dupes(l.entries.map((e) => e.what)).map((w) => `${l.id}: ${w}`)),
);
hard(
  'must-know entries pointing at a book that does not exist',
  ESSENTIALS.flatMap((l) =>
    l.entries
      .map((e) => e.book ?? l.book)
      .filter((b): b is string => !!b && !BOOKS.some((x) => x.id === b))
      .map((b) => `${l.id} -> ${b}`),
  ),
);
// The must-know view points at four standing lists instead of copying them.
hard(
  'must-know aliases pointing at a standing list that does not exist',
  ESSENTIAL_ALIASES.filter((a) => !LISTS.some((l) => l.id === a.listId)).map((a) => a.listId),
);
hard(
  'must-know lists that generate no cards',
  ESSENTIALS.filter((l) => !items.some((i) => i.id.startsWith(`ess-${l.id}-`))).map((l) => l.id),
);

const bookCounts = new Map<string, number>();
for (const i of items) if (i.book) bookCounts.set(i.book, (bookCounts.get(i.book) ?? 0) + 1);
hard('books with fewer than 20 questions', BOOKS.filter((b) => (bookCounts.get(b.id) ?? 0) < 20).map((b) => `${b.name}: ${bookCounts.get(b.id) ?? 0}`));

// TOTAL_CHAPTERS is derived from BOOKS, so compare it against the canon's
// actual figure rather than against itself.
const CANON_CHAPTERS = 1189;
const otChapters = BOOKS.filter((b) => b.testament === 'OT').reduce((n, b) => n + b.chapters, 0);
const ntChapters = BOOKS.filter((b) => b.testament === 'NT').reduce((n, b) => n + b.chapters, 0);
hard('chapter total does not match the canon', TOTAL_CHAPTERS === CANON_CHAPTERS ? [] : [`${TOTAL_CHAPTERS} != ${CANON_CHAPTERS}`]);
hard('Old Testament chapter total is not 929', otChapters === 929 ? [] : [`${otChapters} != 929`]);
hard('New Testament chapter total is not 260', ntChapters === 260 ? [] : [`${ntChapters} != 260`]);
hard('book count is not 66', BOOKS.length === 66 ? [] : [String(BOOKS.length)]);
hard('canonical order has a gap', BOOKS.filter((b, i) => b.order !== i + 1).map((b) => `${b.name} order=${b.order}`));

// ------------------------------------------------------------- report
const byTopic = new Map<string, number>();
const byTier = new Map<number, number>();
const byKind = new Map<string, number>();
for (const i of items) {
  byTopic.set(i.topic, (byTopic.get(i.topic) ?? 0) + 1);
  byTier.set(i.tier, (byTier.get(i.tier) ?? 0) + 1);
  byKind.set(i.kind, (byKind.get(i.kind) ?? 0) + 1);
}

console.log(`\n${items.length.toLocaleString()} questions across ${BOOKS.length} books\n`);
console.log('  By topic');
for (const [t, n] of [...byTopic].sort((a, b) => b[1] - a[1])) {
  console.log(`    ${(TOPIC_LABELS as Record<string, string>)[t].padEnd(24)} ${String(n).padStart(5)}`);
}
console.log('\n  By kind    ', [...byKind].map(([k, n]) => `${k} ${n}`).join('  '));
console.log('  By tier    ', [...byTier].sort().map(([k, n]) => `tier ${k}: ${n}`).join('  '));
console.log('\n  Source data');
console.log(`    books ${BOOKS.length} · people ${PEOPLE.length} · places ${PLACES.length}`);
console.log(`    outline sections ${DETAIL_TOTALS.sections} · detailed events ${DETAIL_TOTALS.events} · per-book figures ${DETAIL_TOTALS.figures}`);
console.log(`    key terms ${DETAIL_TOTALS.terms} · numeric facts ${DETAIL_TOTALS.numbers} · landmark verses ${DETAIL_TOTALS.verses}`);

console.log(`    must-know lists ${ESSENTIALS.length} · cue/content pairs ${ESSENTIAL_ENTRY_COUNT} · cards ${ESSENTIAL_ITEM_IDS.size}`);

const thinnest = [...bookCounts].sort((a, b) => a[1] - b[1]).slice(0, 3);
console.log(`\n  Thinnest books: ${thinnest.map(([b, n]) => `${b} (${n})`).join(', ')}`);

console.log('\n  Checks');
notes.forEach((n) => console.log(n));
if (problems.length > 0) {
  console.log('');
  problems.forEach((p) => console.log(p));
  console.log(`\n${problems.filter((p) => p.startsWith('  FAIL')).length} check(s) failed.\n`);
  process.exit(1);
}
console.log('\nAll checks passed.\n');

function dupes<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const out = new Set<T>();
  for (const x of arr) {
    if (seen.has(x)) out.add(x);
    seen.add(x);
  }
  return [...out];
}
