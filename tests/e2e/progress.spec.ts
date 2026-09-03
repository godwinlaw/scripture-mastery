import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { ITEM, daysFromNow, daysUntil, dueCard, expectBooted, expectStat, leechCard, openApp, openAs, readStore, seed, storeWith } from './harness';

test.describe('progress and settings', () => {
  test('session limits are editable and survive a reload', async ({ page }) => {
    // These three fields moved to the Settings panel in #36; the ids are
    // unchanged, so only the tab they are reached through differs.
    await openAs(page, {}, 'settings');

    await page.locator('#nl').fill('35');
    await page.locator('#sl').fill('120');

    expect((await readStore(page)).settings).toMatchObject({ newLimit: 35, sessionLimit: 120 });

    await page.reload();
    await expectBooted(page);
    await expect(page.locator('#nl')).toHaveValue('35');
    await expect(page.locator('#sl')).toHaveValue('120');
  });

  test('a store still on the old October default is moved to the January date on load', async ({ page }) => {
    await openAs(page, { store: { settings: { examDate: '2026-10-31', newLimit: 20, sessionLimit: 60 } } }, 'settings');

    await expect(page.locator('#exam2')).toHaveValue('2027-01-31');
    // The rewrite happens on read, like the other back-fills, so the saved
    // document carries the new date from the next write on.
    await page.locator('#nl').fill('25');
    expect((await readStore(page)).settings).toMatchObject({ examDate: '2027-01-31', newLimit: 25 });
  });

  test('a quiz date the member chose is left alone on load', async ({ page }) => {
    await openAs(page, { store: { settings: { examDate: '2026-11-14', newLimit: 20, sessionLimit: 60 } } }, 'settings');

    await expect(page.locator('#exam2')).toHaveValue('2026-11-14');
  });

  test('the quiz date drives the countdown in the header', async ({ page }) => {
    await openAs(page, {}, 'settings');

    await page.locator('#exam2').fill(daysFromNow(30));

    await expect(page.locator('.countdown')).toContainText(`${daysUntil(daysFromNow(30))} days until`);
    expect((await readStore(page)).settings.examDate).toBe(daysFromNow(30));
  });

  test('the study plan and Settings share one quiz date', async ({ page }) => {
    await openAs(page, {}, 'plan');

    await page.locator('#exam').fill(daysFromNow(45));

    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.locator('#exam2')).toHaveValue(daysFromNow(45));
  });

  test('mastery by book reflects what has been answered', async ({ page }) => {
    await openAs(page, { store: { cards: { [ITEM.mcq]: dueCard(ITEM.mcq, { recent: [3, 3, 3, 3], interval: 20 }) } } }, 'progress');

    const genesisRow = page.locator('table.data tbody tr').filter({ hasText: 'Genesis' }).first();
    await expect(genesisRow).toContainText('/');
    await expect(genesisRow.getByRole('progressbar')).toHaveAttribute('aria-valuenow', /\d+/);
  });

  test('cards missed four times are surfaced as stuck, with their answers', async ({ page }) => {
    await openAs(page, { store: { cards: { [ITEM.mcq]: leechCard(ITEM.mcq) } } }, 'progress');

    await expect(page.getByRole('heading', { name: /Stuck items/ })).toBeVisible();
    const stuckRow = page.locator('h2:has-text("Stuck items") ~ * table.data tbody tr');
    await expect(stuckRow).toContainText('Which book immediately follows Genesis?');
    await expect(stuckRow).toContainText('Exodus');
  });

  test('a clean history shows no stuck items at all', async ({ page }) => {
    await openAs(page, {}, 'progress');

    await expect(page.getByRole('heading', { name: /Stuck items/ })).toBeHidden();
  });

  test('export downloads the store as readable JSON', async ({ page }) => {
    await openAs(page, { store: { cards: { [ITEM.mcq]: dueCard(ITEM.mcq) }, starred: [ITEM.type] } }, 'progress');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export progress' }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/^scripture-mastery-progress-\d{4}-\d{2}-\d{2}\.json$/);
    const saved = JSON.parse(readFileSync(await download.path(), 'utf8'));
    expect(saved.cards[ITEM.mcq].id).toBe(ITEM.mcq);
    expect(saved.starred).toEqual([ITEM.type]);
    expect(saved.settings).toHaveProperty('examDate');
  });

  test('import replaces the store and says so', async ({ page }) => {
    await openAs(page, {}, 'progress');

    const restored = storeWith({
      cards: { [ITEM.mcq]: dueCard(ITEM.mcq, { reps: 9 }) },
      starred: [ITEM.order],
      log: [{ date: '2026-01-01', reviewed: 42, correct: 40 }],
    });
    await page.getByRole('button', { name: 'Import progress' }).click();
    await page.locator('input[type=file]').setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(restored)),
    });

    await expect(page.getByText('Progress restored.')).toBeVisible();
    const store = await readStore(page);
    expect(store.cards[ITEM.mcq].reps).toBe(9);
    expect(store.starred).toEqual([ITEM.order]);
  });

  test('an unreadable import is refused without wiping what is there', async ({ page }) => {
    await openAs(page, { store: { cards: { [ITEM.mcq]: dueCard(ITEM.mcq) } } }, 'progress');

    await page.locator('input[type=file]').setInputFiles({
      name: 'not-json.json',
      mimeType: 'application/json',
      buffer: Buffer.from('this is not json at all'),
    });

    await expect(page.getByText('That file could not be read.')).toBeVisible();
    expect((await readStore(page)).cards[ITEM.mcq]).toBeDefined();
  });

  test('reset asks first, and only then clears the history', async ({ page }) => {
    await openAs(page, {
      store: { cards: { [ITEM.mcq]: dueCard(ITEM.mcq) }, starred: [ITEM.type], log: [{ date: '2026-01-01', reviewed: 5, correct: 5 }] },
    }, 'progress');

    // Dismiss the confirm first, nothing should change.
    page.once('dialog', (d) => d.dismiss());
    await page.getByRole('button', { name: 'Reset progress' }).click();
    expect((await readStore(page)).cards[ITEM.mcq]).toBeDefined();

    page.once('dialog', (d) => {
      expect(d.message()).toContain('Erase all review history');
      return d.accept();
    });
    await page.getByRole('button', { name: 'Reset progress' }).click();

    await expect(page.getByText('Progress cleared.')).toBeVisible();
    const store = await readStore(page);
    expect(store.cards).toEqual({});
    expect(store.log).toEqual([]);
    expect(store.starred).toEqual([]);
    // Settings are preserved, a reset is not a factory wipe.
    expect(store.settings).toHaveProperty('examDate');
  });

  test('the 14-day chart always shows a fortnight, gaps included', async ({ page }) => {
    await seed(page, { store: { log: [{ date: daysFromNow(0), reviewed: 12, correct: 10 }] } });
    await openApp(page, 'progress');

    await expect(page.getByRole('heading', { name: 'Last 14 days' })).toBeVisible();
    await expect(page.locator('.card [title$="answered"]')).toHaveCount(14);
  });

  test('the dashboard streak counts consecutive days of study', async ({ page }) => {
    await openAs(page, {
      store: {
        log: [-2, -1, 0].map((back) => ({ date: daysFromNow(back), reviewed: 5, correct: 5 })),
      },
    });

    await expectStat(page, 'Consecutive days', 3);
  });

  test('a broken streak resets the count', async ({ page }) => {
    await openAs(page, {
      store: {
        log: [-5, 0].map((back) => ({ date: daysFromNow(back), reviewed: 5, correct: 5 })),
      },
    });

    await expectStat(page, 'Consecutive days', 1);
  });
});
