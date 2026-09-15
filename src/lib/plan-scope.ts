/**
 * Turning a study phase into a set of item ids (#40).
 *
 * The plan has been decorative since it was written: `buildSchedule` sliced the
 * calendar, Plan drew it, Dashboard named the current phase, and the daily
 * review then handed you the whole 6,000-item bank regardless. "Follow the study
 * plan" is the user's ask, and this is the join it needs: a phase declares
 * `topics` and a `scope`, an item carries a `topic` and sometimes a `book`, and
 * the intersection is what the phase actually means by "study this".
 *
 * Kept out of data/plan.ts on purpose. That file is pure schedule arithmetic
 * with no knowledge of the item bank; this one needs `Item`, and pointing the
 * data layer at the generated bank would make the plan un-testable without it.
 */
import type { Phase } from '../data/plan';
import type { Item } from '../data/types';

/**
 * Item ids belonging to a phase: the topic must match, and, unless the phase
 * covers the whole canon, the item must sit in one of its books.
 *
 * The ~310 book-less items (the timeline, the standing lists, the whole-canon
 * counts) are the judgment call here. They are included whenever the topic
 * matches and `scope` is `'all'`, and excluded outright when the phase names a
 * book list. That asymmetry is deliberate rather than an oversight: a phase
 * that says "Old Testament books" is asking you to walk those books, and "how
 * many books are in the Bible?" is not a fact about any of them, letting it in
 * would quietly re-widen a scope the plan just narrowed. The phases that do
 * want that material (Phase 1's summaries, Phase 4's timeline and counts,
 * Phase 5's mixed review) all carry `scope: 'all'`, so nothing in the plan as
 * written ends up unreachable.
 */
export function planScopeIds(phase: Phase, items: readonly Item[]): Set<string> {
  const topics = new Set<string>(phase.topics);
  const books = phase.scope === 'all' ? null : new Set(phase.scope);
  const out = new Set<string>();
  for (const item of items) {
    if (!topics.has(item.topic)) continue;
    if (books && (!item.book || !books.has(item.book))) continue;
    out.add(item.id);
  }
  return out;
}

/**
 * Widen a plan-scoped list with out-of-scope ids, but only when it is too thin
 * to fill a session.
 *
 * This is the edge that decides whether the feature is usable. Late in a phase
 * the material inside it is all seen and none of it is due yet, and a daily
 * review that answers "nothing to study" because of a calendar is worse than
 * one that quietly reaches past it, the reader came to study, and the plan is
 * meant to prioritise their attention, not ration it.
 *
 * Order is `all`'s, so the widening inherits whatever ordering the caller
 * already trusted; ids already in `scoped` are never repeated.
 */
export function withTopUp(scoped: string[], all: string[], want: number): string[] {
  if (scoped.length >= want) return scoped;
  // Widen to *everything* rather than to exactly `want`.
  //
  // Stopping at `want` capped the candidate pool at the session limit, taken as
  // a plain prefix of the bank, which is canonical order. Every later stage
  // that decides what a session contains, the due-date sort and the hard-mode
  // shuffle alike, then ran inside a Genesis-first slice of sixty. For a member
  // with a real backlog that meant the most overdue cards were never even
  // candidates: the queue was choosing from the front of the canon and calling
  // it urgency. `want` now decides only *whether* to widen, never how far, and
  // buildQueue does the cut on its own terms (#41).
  const have = new Set(scoped);
  return [...scoped, ...all.filter((id) => !have.has(id))];
}
