import { expect, test, type Page } from '@playwright/test';
import { DAY, ITEM, daysFromNow, dueCard, expectStat, openAs, readStore } from './harness';

const poolCount = (page: Page) => page.getByText(/questions? match(es)? this filter/);
const scope = (page: Page, label: string) => page.getByRole('radio', { name: label });
/** Card titles are styled divs, not headings — locate them by class. */
const cardTitle = (page: Page, text: string) => page.locator('.card-title', { hasText: text });

/** Reads the "6,581 questions across 66 books" figure out of the header. */
async function bankSize(page: Page): Promise<number> {
  const tagline = await page.locator('.brand span').innerText();
  return Number(tagline.replace(/,/g, '').match(/\d+/)![0]);
}

test.describe('mixed quiz', () => {
  test('the unfiltered pool is the whole item bank', async ({ page }) => {
    await openAs(page, {}, 'quiz');

    await expect(poolCount(page)).toContainText(`${await bankSize(page)} questions`);
    await expect(page.getByRole('button', { name: 'Start quiz' })).toBeEnabled();
  });

  test('narrowing to one book shrinks the pool', async ({ page }) => {
    await openAs(page, {}, 'quiz');
    const everything = await bankSize(page);

    await page.selectOption('#book', 'genesis');

    const narrowed = Number((await poolCount(page).innerText()).replace(/,/g, '').match(/\d+/)![0]);
    expect(narrowed).toBeGreaterThan(0);
    expect(narrowed).toBeLessThan(everything);
  });

  test('topic and book filters compose', async ({ page }) => {
    await openAs(page, {}, 'quiz');

    await page.selectOption('#book', 'genesis');
    const bookOnly = Number((await poolCount(page).innerText()).replace(/,/g, '').match(/\d+/)![0]);
    await page.selectOption('#topic', 'events');
    const both = Number((await poolCount(page).innerText()).replace(/,/g, '').match(/\d+/)![0]);

    expect(both).toBeLessThanOrEqual(bookOnly);
  });

  test('a scope with nothing in it cannot be started', async ({ page }) => {
    await openAs(page, {}, 'quiz');

    await scope(page, 'Starred').click();

    await expect(poolCount(page)).toContainText('0 questions');
    await expect(page.getByRole('button', { name: 'Start quiz' })).toBeDisabled();
  });

  test('a quiz runs to results, and what was missed is listed with its answer', async ({ page }) => {
    await openAs(page, { store: { starred: [ITEM.mcq] } }, 'quiz');

    await scope(page, 'Starred').click();
    // Grammar note: the app renders "1 question match this filter".
    await expect(poolCount(page)).toContainText(/^1 question match/);
    await page.getByRole('button', { name: 'Start quiz' }).click();

    await expect(page.getByRole('progressbar', { name: 'Progress: question 1 of 1' })).toBeVisible();
    await page.locator('.choice').filter({ has: page.getByText('36', { exact: true }) }).click();
    await page.getByRole('button', { name: /^Continue/ }).click();

    await expect(cardTitle(page, 'Quiz complete')).toBeVisible();
    await expectStat(page, 'correct out of 1', 0);
    await expect(page.getByText('What you missed')).toBeVisible();

    const missedRow = page.locator('table.data tbody tr');
    await expect(missedRow).toHaveCount(1);
    await expect(missedRow).toContainText('How many chapters are in Genesis?');
    await expect(missedRow).toContainText('50');
  });

  test('a clean run reports full marks and lists nothing missed', async ({ page }) => {
    await openAs(page, { store: { starred: [ITEM.mcq] } }, 'quiz');

    await scope(page, 'Starred').click();
    await page.getByRole('button', { name: 'Start quiz' }).click();
    await page.locator('.choice').filter({ has: page.getByText('50', { exact: true }) }).click();
    await page.getByRole('button', { name: /^Good/ }).click();

    await expect(cardTitle(page, 'Quiz complete')).toBeVisible();
    await expectStat(page, 'correct out of 1', 1);
    await expect(page.getByText('100% correct')).toBeVisible();
    await expect(page.getByText('What you missed')).toBeHidden();
  });

  test('results offer a retake and a way back to the filters', async ({ page }) => {
    await openAs(page, { store: { starred: [ITEM.mcq] } }, 'quiz');
    await scope(page, 'Starred').click();
    await page.getByRole('button', { name: 'Start quiz' }).click();
    await page.locator('.choice').filter({ has: page.getByText('50', { exact: true }) }).click();
    await page.getByRole('button', { name: /^Good/ }).click();

    await page.getByRole('button', { name: 'Retake' }).click();
    await expect(page.getByRole('progressbar', { name: 'Progress: question 1 of 1' })).toBeVisible();

    await page.getByRole('button', { name: 'Quit quiz' }).click();
    await expect(cardTitle(page, 'Choose what to cover')).toBeVisible();
  });

  test('weak spots only draws on cards already seen and not yet known', async ({ page }) => {
    await openAs(page, {
      store: {
        cards: {
          // Missed repeatedly — weak.
          [ITEM.mcq]: dueCard(ITEM.mcq, { recent: [0, 0, 1, 0], interval: 1 }),
          // Answered easily and spaced far out — strong.
          [ITEM.type]: dueCard(ITEM.type, { recent: [3, 3, 3, 3], interval: 30, due: Date.now() + 20 * DAY }),
        },
      },
    }, 'quiz');

    await scope(page, 'Weak spots').click();

    await expect(poolCount(page)).toContainText(/^1 question match/);
    await page.getByRole('button', { name: 'Start quiz' }).click();
    await expect(page.getByText('How many chapters are in Genesis?')).toBeVisible();
  });

  test('quiz answers feed the same review schedule', async ({ page }) => {
    await openAs(page, { store: { starred: [ITEM.mcq], settings: { examDate: daysFromNow(60), newLimit: 20, sessionLimit: 60 } } }, 'quiz');

    await scope(page, 'Starred').click();
    await page.getByRole('button', { name: 'Start quiz' }).click();
    await page.locator('.choice').filter({ has: page.getByText('50', { exact: true }) }).click();
    await page.getByRole('button', { name: /^Good/ }).click();
    await expect(cardTitle(page, 'Quiz complete')).toBeVisible();

    const store = await readStore(page);
    expect(store.cards[ITEM.mcq]).toMatchObject({ reps: 1, lapses: 0 });
    expect(store.cards[ITEM.mcq].due).toBeGreaterThan(Date.now());
    expect(store.log.at(-1)).toMatchObject({ reviewed: 1, correct: 1 });
  });

  test('the scope control keeps the arrow-key contract of a radio group', async ({ page }) => {
    await openAs(page, {}, 'quiz');

    await scope(page, 'Everything').click();
    await expect(scope(page, 'Everything')).toHaveAttribute('aria-checked', 'true');

    await page.keyboard.press('ArrowRight');

    await expect(scope(page, 'Old Testament')).toHaveAttribute('aria-checked', 'true');
    await expect(scope(page, 'Everything')).toHaveAttribute('aria-checked', 'false');
  });
});
