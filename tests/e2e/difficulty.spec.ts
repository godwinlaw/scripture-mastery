/**
 * The difficulty setting (#36).
 *
 * Two halves, tested where each actually lives. The option-scoping rules are a
 * property of the generated bank, so they run in Node against the real
 * generators — the same reasoning as content-contract.spec.ts. The control
 * itself is UI, so that half drives the browser.
 *
 * The seam rule is the one worth guarding hardest: medium and hard must never
 * offer an option from the other Testament, because a New Testament book
 * against an Old Testament question is not a hard choice, just a different
 * subject (#10, #12). Easy deliberately breaks that rule — that is what makes
 * it easy — so it is pinned from the other side.
 */
import { expect, test } from '@playwright/test';
import { BOOKS, BOOKS_BY_ID } from '../../src/data/books';
import { allItems } from '../../src/lib/generate';
import { openAs, readStore, expectBooted } from './harness';

const BOOK_BY_NAME = new Map(BOOKS.map((b) => [b.name, b]));

/**
 * Options that name a book, paired with the Testament they belong to.
 *
 * Most options are chapter summaries or references and cannot be attributed to
 * a book by string alone; the ones that are bare book names can, and they are
 * the only place a seam crossing is observable from the outside. #24 verified
 * its own rule the same way.
 */
function crossings(options: string[] | undefined, ownTestament: string): number {
  if (!options) return 0;
  return options.filter((o) => {
    const book = BOOK_BY_NAME.get(o);
    return book !== undefined && book.testament !== ownTestament;
  }).length;
}

test.describe('difficulty — option scoping', () => {
  /**
   * Only Chapter Content and Events are in scope. The seam rule was written for
   * those two (#24, #27) because a question about one passage should offer
   * other plausible passages. Book Order is deliberately exempt: "which book
   * immediately follows Genesis?" is a question about the shape of the whole
   * canon, so its options have to be able to come from anywhere in it.
   */
  const withBook = allItems().filter(
    (i) => i.book && BOOKS_BY_ID[i.book] && (i.topic === 'chapters' || i.topic === 'events'),
  );

  test('medium and hard never offer an option from the other Testament', () => {
    let mediumCrossings = 0;
    let hardCrossings = 0;
    const offenders: string[] = [];

    for (const item of withBook) {
      const own = BOOKS_BY_ID[item.book!].testament;
      const m = crossings(item.distractors, own);
      const h = crossings(item.distractorsBy?.hard, own);
      mediumCrossings += m;
      hardCrossings += h;
      if ((m || h) && offenders.length < 5) offenders.push(`${item.id} | ${item.prompt}`);
    }

    expect(mediumCrossings, `medium crossings, e.g. ${offenders.join(' ; ')}`).toBe(0);
    expect(hardCrossings, `hard crossings, e.g. ${offenders.join(' ; ')}`).toBe(0);
  });

  test('easy does reach across the seam, which is what makes it easy', () => {
    const crossed = withBook.reduce(
      (n, item) => n + crossings(item.distractorsBy?.easy, BOOKS_BY_ID[item.book!].testament),
      0,
    );
    // A floor rather than an exact count: the number moves whenever the bank
    // grows, but "easy behaves differently from medium" must not silently stop
    // being true — that would leave the setting doing nothing.
    expect(crossed).toBeGreaterThan(0);
  });

  test('every alternate set offers as many options as the medium one', () => {
    const thin = withBook.filter((i) => {
      const base = i.distractors?.length ?? 0;
      const by = i.distractorsBy;
      if (!by) return false;
      return (by.easy && by.easy.length < base) || (by.hard && by.hard.length < base);
    });
    // A short pool means a three-choice question, and three choices are easier
    // than four — which would invert hard mode rather than sharpen it.
    expect(thin.map((i) => i.id)).toEqual([]);
  });
});

test.describe('difficulty — the control', () => {
  test('the chosen difficulty is saved and survives a reload', async ({ page }) => {
    await openAs(page, {}, 'settings');

    await page.getByRole('radio', { name: 'Hard' }).click();

    expect((await readStore(page)).settings.difficulty).toBe('hard');

    await page.reload();
    await expectBooted(page);
    await expect(page.getByRole('radio', { name: 'Hard' })).toBeChecked();
  });

  test('an existing account with no difficulty saved falls back to medium', async ({ page }) => {
    await openAs(page, {}, 'settings');

    // The setting postdates the store format, so a store written before #36 has
    // no such key. It must read as medium — the behaviour that predates the
    // setting — rather than leaving the control with nothing selected.
    await expect(page.getByRole('radio', { name: 'Medium' })).toBeChecked();
  });

  test('the theme switch moved to the panel and still drives the page', async ({ page }) => {
    await openAs(page, {}, 'settings');

    // It used to sit in the header; #36 gave it a home alongside the rest.
    await expect(page.locator('header').getByRole('radio', { name: 'Dark' })).toHaveCount(0);

    await page.getByRole('radio', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});
