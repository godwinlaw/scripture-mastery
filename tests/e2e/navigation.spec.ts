import { expect, test, type Page } from '@playwright/test';
import { openAs } from './harness';

/** Each tab, and the heading that proves it actually rendered. */
const TABS = [
  { label: 'Dashboard', hash: 'home', heading: 'Weakest areas' },
  { label: 'Daily Review', hash: 'review', heading: 'Daily Review' },
  { label: 'Quiz', hash: 'quiz', heading: 'Mixed Quiz' },
  { label: 'Reference', hash: 'library', heading: 'Reference' },
  { label: 'Study Plan', hash: 'plan', heading: 'Study Plan' },
  { label: 'Progress', hash: 'progress', heading: 'Last 14 days' },
  { label: 'Settings', hash: 'settings', heading: 'Study' },
];

const tab = (page: Page, label: string) => page.getByRole('navigation').getByRole('button', { name: label });

test.describe('navigation', () => {
  for (const { label, hash, heading } of TABS) {
    test(`the ${label} tab opens, marks itself current, and owns the hash`, async ({ page }) => {
      await openAs(page);

      await tab(page, label).click();

      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`#${hash}$`));
      await expect(tab(page, label)).toHaveAttribute('aria-current', 'page');
    });
  }

  test('only one tab is ever marked current', async ({ page }) => {
    await openAs(page, {}, 'plan');
    await expect(page.getByRole('button', { name: 'Study Plan' })).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('nav button[aria-current="page"]')).toHaveCount(1);
  });

  test('a deep link opens that tab directly', async ({ page }) => {
    await openAs(page, {}, 'library');

    await expect(page.getByRole('heading', { name: 'Reference' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reference' })).toHaveAttribute('aria-current', 'page');
  });

  test('an unknown hash falls back to the dashboard rather than a blank screen', async ({ page }) => {
    await openAs(page, {}, 'not-a-tab');

    await expect(page.getByRole('heading', { name: 'Weakest areas' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
  });

  test('the back button returns to the previous tab', async ({ page }) => {
    await openAs(page);

    await tab(page, 'Quiz').click();
    await expect(page.getByRole('heading', { name: 'Mixed Quiz' })).toBeVisible();
    await tab(page, 'Study Plan').click();
    await expect(page.getByRole('heading', { name: 'Study Plan' })).toBeVisible();

    await page.goBack();

    await expect(page.getByRole('heading', { name: 'Mixed Quiz' })).toBeVisible();
    await expect(tab(page, 'Quiz')).toHaveAttribute('aria-current', 'page');
  });

  test('the dashboard call to action jumps to the review queue', async ({ page }) => {
    await openAs(page);

    await page.getByRole('button', { name: /review|Start today/i }).first().click();

    await expect(page.getByRole('heading', { name: 'Daily Review' })).toBeVisible();
    await expect(page).toHaveURL(/#review$/);
  });
});
