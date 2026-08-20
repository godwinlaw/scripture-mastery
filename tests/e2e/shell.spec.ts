import { expect, test } from '@playwright/test';
import { MEMBER, OUTSIDER, expectStat, openApp, openAs, seed } from './harness';

test.describe('shell and auth', () => {
  test('a signed-out visitor gets the sign-in prompt, not the app', async ({ page }) => {
    await openAs(page, { email: null });

    await expect(page.getByText('Sign in with your acts2.network or gpmail.org account to begin.')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  });

  test('signing in swaps the prompt for the dashboard', async ({ page }) => {
    await openAs(page, { email: null });

    await page.getByRole('button', { name: 'Sign in with Google' }).click();

    await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Weakest areas' })).toBeVisible();
  });

  test('a dismissed popup surfaces the error and keeps the prompt up', async ({ page }) => {
    await openAs(page, { email: null, nextSignIn: 'cancel' });

    await page.getByRole('button', { name: 'Sign in with Google' }).click();

    await expect(page.getByText('The sign-in popup was closed before completing.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  });

  test('an off-domain account is refused by name and offered a way out', async ({ page }) => {
    await openAs(page, { email: OUTSIDER });

    await expect(
      page.getByText(`${OUTSIDER} isn’t on an allowed domain. Sign in with acts2.network or gpmail.org instead.`),
    ).toBeVisible();
    await expect(page.getByRole('navigation')).toBeHidden();

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByText('Sign in with your acts2.network or gpmail.org account to begin.')).toBeVisible();
  });

  test('the boot splash holds, then hands off to the app', async ({ page }) => {
    await seed(page, { email: MEMBER });
    await page.goto('/#home');

    const splash = page.locator('.boot-splash');
    await expect(splash).toHaveAttribute('aria-label', 'Scripture Mastery — Loading…');
    await expect(splash).toBeHidden();
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('the header counts down to the seeded quiz date', async ({ page }) => {
    await openAs(page, { store: { settings: { examDate: '2027-03-04', newLimit: 20, sessionLimit: 60 } } });

    const days = Math.max(0, Math.ceil((new Date('2027-03-04T23:59:59').getTime() - Date.now()) / 86_400_000));
    await expect(page.locator('.countdown')).toHaveText(`${days.toLocaleString()} days until March 4`);
    await expectStat(page, 'Days to quiz', days);
  });

  test('signing out from the header returns to the prompt', async ({ page }) => {
    await openAs(page);

    await page.locator('header').getByRole('button', { name: 'Sign out' }).click();

    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
    await expect(page.getByRole('navigation')).toBeHidden();
  });
});
