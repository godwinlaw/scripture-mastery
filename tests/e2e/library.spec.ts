import { expect, test, type Page } from '@playwright/test';
import { openAs } from './harness';

const search = (page: Page) => page.getByRole('textbox', { name: 'Search' });
const section = (page: Page, label: string) => page.getByRole('radio', { name: label });

test.describe('reference library', () => {
  test('it opens on the books, grouped by division', async ({ page }) => {
    await openAs(page, {}, 'library');

    await expect(page.getByRole('heading', { name: /^Law/ })).toBeVisible();
    await expect(page.getByRole('group').filter({ hasText: 'Genesis' }).first()).toBeVisible();
    await expect(page.locator('.counts')).toContainText('66');
  });

  test('a book opens to its detail panel', async ({ page }) => {
    await openAs(page, {}, 'library');

    const genesis = page.locator('details.book').filter({ hasText: 'Genesis' }).first();
    await genesis.getByRole('group').or(genesis.locator('summary')).first().click();

    await expect(genesis).toHaveAttribute('open', '');
    await expect(genesis.locator('.body')).toBeVisible();
  });

  test('search narrows the books and says by how much', async ({ page }) => {
    await openAs(page, {}, 'library');

    await search(page).fill('Melchizedek');

    await expect(page.getByText(/book(s)? match “Melchizedek”/)).toBeVisible();
    const shown = page.locator('details.book');
    await expect(shown.first()).toBeVisible();
    expect(await shown.count()).toBeLessThan(66);
  });

  test('search reaches into outlines and events, not just titles', async ({ page }) => {
    await openAs(page, {}, 'library');

    // "Babel" is nowhere in a book's name, only inside Genesis's event list.
    await search(page).fill('Babel');

    await expect(page.locator('details.book').filter({ hasText: 'Genesis' })).toHaveCount(1);
  });

  test('a search with no match says so instead of showing an empty page', async ({ page }) => {
    await openAs(page, {}, 'library');

    await search(page).fill('zzzznotathing');

    await expect(page.getByText('No book mentions “zzzznotathing”. Try the People tab.')).toBeVisible();
    await expect(page.locator('details.book')).toHaveCount(0);
  });

  test('the timeline lists every era in order', async ({ page }) => {
    await openAs(page, {}, 'library');

    await section(page, 'Timeline').click();

    await expect(page.getByRole('heading', { name: '1. Creation & Early World' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '2. The Patriarchs' })).toBeVisible();
    const eras = page.locator('.card').filter({ has: page.locator('.pill.accent') });
    expect(await eras.count()).toBeGreaterThanOrEqual(14);
  });

  test('people and places are searchable tables', async ({ page }) => {
    await openAs(page, {}, 'library');

    await section(page, 'People & Places').click();
    await expect(page.getByRole('heading', { name: /^People/ })).toBeVisible();

    await search(page).fill('Melchizedek');

    const peopleRows = page.locator('table.data').first().locator('tbody tr');
    await expect(peopleRows).toHaveCount(1);
    await expect(peopleRows).toContainText('Melchizedek');
  });

  test('the must-know lists show cue and content side by side', async ({ page }) => {
    await openAs(page, {}, 'library');

    await section(page, 'Lists to Know').click();

    await expect(page.getByRole('heading', { name: 'Must-know lists' })).toBeVisible();
    await expect(page.locator('.card-title').first()).toBeVisible();
    await expect(page.locator('table.data tbody tr').first()).toBeVisible();
  });

  test('a search that only matches a list narrows the lists tab', async ({ page }) => {
    await openAs(page, {}, 'library');

    await section(page, 'Lists to Know').click();
    await search(page).fill('Babel');

    await expect(page.getByText(/list(s)? match “Babel”/)).toBeVisible();
  });

  test('the reference needs no review history to be useful', async ({ page }) => {
    await openAs(page, { store: { cards: {}, log: [] } }, 'library');

    await expect(page.locator('.counts')).toContainText('66');
    await expect(page.locator('details.book')).toHaveCount(66);
  });
});
