/**
 * buildQueue does two separable jobs, and #11 changed only the second.
 *
 * Selecting *which* cards a session holds must stay deterministic and
 * priority-ordered — most overdue first, capped by the limits — because that
 * is what makes a truncated session the right session. Presenting them is now
 * shuffled, so you stop learning the sequence instead of the answers.
 *
 * These run in Node against the real scheduler, so a regression in either half
 * says so directly rather than as a puzzling UI failure.
 */
import { expect, test } from '@playwright/test';
import { buildQueue, type CardState } from '../../src/lib/srs';

const DAY = 86_400_000;

/** A card in rotation, `overdueDays` past its due date. */
function seen(id: string, overdueDays: number): CardState {
  return {
    id,
    ease: 2.5,
    interval: 1,
    reps: 2,
    lapses: 0,
    due: Date.now() - overdueDays * DAY,
    lastSeen: Date.now() - (overdueDays + 1) * DAY,
    recent: [2, 2],
  };
}

function deck(n: number, from = 0): { ids: string[]; cards: Record<string, CardState> } {
  const ids = Array.from({ length: n }, (_, i) => `card-${from + i}`);
  const cards: Record<string, CardState> = {};
  // Descending overdue-ness, so card-0 is the most urgent.
  ids.forEach((id, i) => { cards[id] = seen(id, n - i); });
  return { ids, cards };
}

const NO_NEW = { newLimit: 0, sessionLimit: 100 };

test.describe('review queue', () => {
  test('presentation order is shuffled between sessions', () => {
    const { ids, cards } = deck(30);
    const runs = Array.from({ length: 8 }, () => buildQueue(ids, cards, NO_NEW).join(','));

    // With 30 cards the odds of two honest shuffles matching are 1/30!, so a
    // single repeat across eight runs means the order is not being shuffled.
    expect(new Set(runs).size, 'buildQueue returned the same order twice').toBe(runs.length);
  });

  test('shuffling does not lose, duplicate, or invent a card', () => {
    const { ids, cards } = deck(30);
    const q = buildQueue(ids, cards, NO_NEW);

    expect(q).toHaveLength(ids.length);
    expect(new Set(q).size).toBe(ids.length);
    expect([...q].sort()).toEqual([...ids].sort());
  });

  test('a truncated session still takes the most overdue cards', () => {
    // The selection half must survive the shuffle: cutting to 5 has to keep
    // the five most urgent cards, whatever order they are then asked in.
    const { ids, cards } = deck(20);
    const q = buildQueue(ids, cards, { newLimit: 0, sessionLimit: 5 });

    expect(q).toHaveLength(5);
    expect([...q].sort()).toEqual(['card-0', 'card-1', 'card-2', 'card-3', 'card-4']);
  });

  test('new cards are still capped by the new-card limit', () => {
    const { ids: dueIds, cards } = deck(3);
    const freshIds = Array.from({ length: 10 }, (_, i) => `fresh-${i}`);

    const q = buildQueue([...dueIds, ...freshIds], cards, { newLimit: 2, sessionLimit: 100 });

    expect(q.filter((id) => id.startsWith('fresh-'))).toHaveLength(2);
    expect(q.filter((id) => id.startsWith('card-'))).toHaveLength(3);
  });

  test('a card that is not yet due stays out of the queue', () => {
    const cards: Record<string, CardState> = {
      early: { ...seen('early', 1), due: Date.now() + 5 * DAY },
      ready: seen('ready', 1),
    };

    expect(buildQueue(['early', 'ready'], cards, NO_NEW)).toEqual(['ready']);
  });
});
