import { expect, test } from '@playwright/test';
import { openAs, seed } from './harness';

/**
 * Runs only under the `mobile` project (Pixel 5). The gate is a dead end by
 * design — it must refuse *before* auth or the boot splash, so a member who
 * cannot get in is never made to watch the press warm up.
 */
test.describe('mobile gate', () => {
  test('a phone is refused in the app’s own voice', async ({ page }) => {
    await openAs(page);

    await expect(page.getByText('This trainer is built for a full keyboard and a wide screen')).toBeVisible();
    await expect(page.getByText('Scripture Mastery')).toBeVisible();
  });

  test('the gate offers nothing to press and no way through', async ({ page }) => {
    await openAs(page);

    await expect(page.getByRole('button')).toHaveCount(0);
    await expect(page.getByRole('navigation')).toBeHidden();
    await expect(page.locator('.boot-splash')).toBeHidden();
  });

  test('it refuses a signed-out phone too, without showing the sign-in', async ({ page }) => {
    await seed(page, { email: null });
    await page.goto('/#home');

    await expect(page.locator('.mobile-gate')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeHidden();
  });

  test('a deep link to a tab is gated the same way', async ({ page }) => {
    await openAs(page, {}, 'quiz');

    await expect(page.locator('.mobile-gate')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mixed Quiz' })).toBeHidden();
  });
});
