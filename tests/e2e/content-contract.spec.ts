/**
 * Guards the assumptions the rest of the suite seeds against.
 *
 * The item bank is generated, not authored, so a change to a generator rule can
 * quietly retire an id or change an answer — and every spec that puts a known
 * card on screen would start failing for reasons that look like UI bugs. These
 * run in Node against the same modules the app imports, so when the contract
 * breaks it says so in one obvious place.
 */
import { expect, test } from '@playwright/test';
import { ITEM, ORDER_SEQUENCE } from './harness';
import { allItems, ITEMS_BY_ID } from '../../src/lib/generate';

test.describe('content contract', () => {
  test('the multiple-choice fixture is still a 4-option question answered by Exodus', () => {
    const item = ITEMS_BY_ID.get(ITEM.mcq);
    expect(item, `${ITEM.mcq} has left the item bank`).toBeDefined();
    expect(item!.kind).toBe('mcq');
    expect(item!.prompt).toBe('Which book immediately follows Genesis?');
    expect(item!.answer).toBe('Exodus');
    // The specs click this one to register a deliberate miss.
    expect(item!.distractors).toContain('Deuteronomy');
    expect(item!.distractors).toHaveLength(3);
  });

  test('the typed fixture still accepts the answer written out in words', () => {
    const item = ITEMS_BY_ID.get(ITEM.type);
    expect(item, `${ITEM.type} has left the item bank`).toBeDefined();
    expect(item!.kind).toBe('type');
    expect(item!.answer).toBe('66');
    expect(item!.accepts).toContain('sixty-six');
  });

  test('the ordering fixture still holds the sequence the specs sort into', () => {
    const item = ITEMS_BY_ID.get(ITEM.order);
    expect(item, `${ITEM.order} has left the item bank`).toBeDefined();
    expect(item!.kind).toBe('order');
    expect(item!.sequence).toEqual(ORDER_SEQUENCE);
  });

  test('every item id is unique — SRS history is keyed on it', () => {
    const items = allItems();
    const seen = new Set<string>();
    const duplicates = items.filter((i) => (seen.has(i.id) ? true : (seen.add(i.id), false)));
    expect(duplicates.map((d) => d.id)).toEqual([]);
    expect(items.length).toBeGreaterThan(6000);
  });

  test('no multiple-choice question hides its answer among the distractors', () => {
    const broken = allItems().filter((i) => i.kind === 'mcq' && (i.distractors ?? []).includes(i.answer));
    expect(broken.map((b) => b.id)).toEqual([]);
  });
});
