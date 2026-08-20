import { expect, test, type Page } from '@playwright/test';
import { ITEM, ORDER_SEQUENCE, openAs, readStore, soloQueue } from './harness';

/** A choice button by its option text — `.choice` also holds the 1-4 key label. */
const choice = (page: Page, label: string) =>
  page.locator('.choice').filter({ has: page.getByText(label, { exact: true }) });

/** Opens Daily Review with exactly one card queued: the given item. */
async function reviewOne(page: Page, id: string) {
  await openAs(page, { store: soloQueue(id) }, 'review');
  await page.getByRole('button', { name: 'Start review session' }).click();
}

/** Drag-free sort: walk each entry up until the list matches `want`. */
async function arrangeInto(page: Page, want: string[]) {
  const rows = page.locator('.order-item');
  const labels = () => rows.locator('span:not(.num):not(.moves)');
  for (let target = 0; target < want.length; target++) {
    for (;;) {
      const at = (await labels().allInnerTexts()).indexOf(want[target]);
      if (at <= target) break;
      await rows.nth(at).getByRole('button', { name: 'Move up' }).click();
      // Wait for the row to actually land in its new slot before re-reading.
      // Without this the next allInnerTexts() can observe the pre-click DOM,
      // compute a stale index, and walk some other row up the list — which
      // shows up as an arrangement that is only partly sorted.
      await expect(labels().nth(at - 1)).toHaveText(want[target]);
    }
  }
  // Fail in the helper, not three assertions later. Callers that submit an
  // arrangement without checking it first would otherwise report a confusing
  // count mismatch instead of "the list never got sorted".
  await expect(labels()).toHaveText(want);
}

async function currentOrder(page: Page): Promise<string[]> {
  return page.locator('.order-item span:not(.num):not(.moves)').allInnerTexts();
}

test.describe('multiple choice', () => {
  test('a right answer reveals the grade buttons and records the card', async ({ page }) => {
    await reviewOne(page, ITEM.mcq);

    await expect(page.getByText('Which book immediately follows Genesis?')).toBeVisible();
    await expect(page.locator('.choice')).toHaveCount(4);
    await choice(page, 'Exodus').click();

    await expect(page.locator('.feedback.correct')).toContainText('Correct');
    await expect(page.getByRole('button', { name: /^Ok/ })).toBeVisible();
    await page.getByRole('button', { name: /^Ok/ }).click();

    const store = await readStore(page);
    expect(store.cards[ITEM.mcq].reps).toBe(3);
    expect(store.log.at(-1)).toMatchObject({ reviewed: 1, correct: 1 });
  });

  test('a wrong answer shows the right one and marks both options', async ({ page }) => {
    await reviewOne(page, ITEM.mcq);

    await choice(page, 'Deuteronomy').click();

    await expect(page.locator('.feedback.wrong')).toContainText('Not quite');
    await expect(page.locator('.feedback')).toContainText('Answer: Exodus');
    await expect(page.locator('.choice.correct')).toHaveText(/Exodus/);
    await expect(page.locator('.choice.wrong')).toHaveText(/Deuteronomy/);
    // A miss offers no self-grading — it goes back in the queue as "again".
    await expect(page.getByRole('button', { name: /^Ok/ })).toBeHidden();
    await expect(page.getByRole('button', { name: /^Continue/ })).toBeVisible();
  });

  test('every option locks once an answer is in', async ({ page }) => {
    await reviewOne(page, ITEM.mcq);

    await choice(page, 'Deuteronomy').click();

    for (const choice of await page.locator('.choice').all()) {
      await expect(choice).toBeDisabled();
    }
  });

  test('number keys pick an option, then grade it', async ({ page }) => {
    await reviewOne(page, ITEM.mcq);

    // Options are reshuffled per item, so find where the right answer landed.
    const labels = await page.locator('.choice span:not(.key)').allInnerTexts();
    const slot = labels.indexOf('Exodus');
    expect(slot, 'the correct option should be on screen').toBeGreaterThanOrEqual(0);

    await page.keyboard.press(String(slot + 1));
    await expect(page.locator('.feedback.correct')).toBeVisible();

    await page.keyboard.press('3'); // Easy
    const store = await readStore(page);
    // Easy nudges ease up from the 2.5 default; Ok would have left it alone.
    expect(store.cards[ITEM.mcq].ease).toBeCloseTo(2.6, 5);
    expect(store.cards[ITEM.mcq].recent.at(-1)).toBe(3);
  });
});

test.describe('typed answers', () => {
  test('the matcher accepts the answer spelled out in words', async ({ page }) => {
    await reviewOne(page, ITEM.type);

    await expect(page.getByText('How many books are in the Bible?')).toBeVisible();
    await page.locator('input.answer').fill('sixty-six');
    await page.keyboard.press('Enter');

    await expect(page.locator('.feedback.correct')).toContainText('Correct');
  });

  test('the Check button and Enter do the same thing', async ({ page }) => {
    await reviewOne(page, ITEM.type);

    await page.locator('input.answer').fill('66');
    await page.getByRole('button', { name: 'Check' }).click();

    await expect(page.locator('.feedback.correct')).toBeVisible();
    await expect(page.locator('input.answer')).toBeDisabled();
  });

  test('a genuinely wrong answer is refused', async ({ page }) => {
    await reviewOne(page, ITEM.type);

    await page.locator('input.answer').fill('12');
    await page.keyboard.press('Enter');

    await expect(page.locator('.feedback.wrong')).toContainText('Not quite');
    await expect(page.locator('.feedback')).toContainText('Answer: 66');
  });

  test('an empty submission is not counted as correct', async ({ page }) => {
    await reviewOne(page, ITEM.type);

    await page.keyboard.press('Enter');

    await expect(page.locator('.feedback.wrong')).toBeVisible();
  });

  test('"I had it right" overrides a miss and logs it as correct', async ({ page }) => {
    await reviewOne(page, ITEM.type);

    await page.locator('input.answer').fill('twelve');
    await page.keyboard.press('Enter');
    await expect(page.locator('.feedback.wrong')).toBeVisible();

    await page.getByRole('button', { name: 'I had it right' }).click();

    const store = await readStore(page);
    expect(store.log.at(-1)).toMatchObject({ reviewed: 1, correct: 1 });
    expect(store.cards[ITEM.type].lapses).toBe(0);
  });
});

test.describe('ordering', () => {
  test('the entries can be sorted into the right sequence', async ({ page }) => {
    await reviewOne(page, ITEM.order);

    await expect(page.getByText('Put these events from Genesis 1–4 in the order they occur.')).toBeVisible();
    await expect(page.locator('.order-item')).toHaveCount(ORDER_SEQUENCE.length);

    await arrangeInto(page, ORDER_SEQUENCE);
    expect(await currentOrder(page)).toEqual(ORDER_SEQUENCE);

    await page.getByRole('button', { name: 'Check order' }).click();

    await expect(page.locator('.feedback.correct')).toContainText('Correct');
    await expect(page.locator('.order-item.wrong')).toHaveCount(0);
  });

  test('a wrong sequence is marked entry by entry and the answer spelled out', async ({ page }) => {
    await reviewOne(page, ITEM.order);

    // Force a known-wrong arrangement: exact reverse of the correct sequence.
    await arrangeInto(page, [...ORDER_SEQUENCE].reverse());
    await page.getByRole('button', { name: 'Check order' }).click();

    await expect(page.locator('.feedback.wrong')).toContainText('Not quite');
    await expect(page.locator('.feedback')).toContainText(ORDER_SEQUENCE.join(' → '));
    await expect(page.locator('.order-item.wrong')).toHaveCount(ORDER_SEQUENCE.length);
  });

  test('the move buttons stop at the ends of the list', async ({ page }) => {
    await reviewOne(page, ITEM.order);

    const rows = page.locator('.order-item');
    await expect(rows.first().getByRole('button', { name: 'Move up' })).toBeDisabled();
    await expect(rows.last().getByRole('button', { name: 'Move down' })).toBeDisabled();
  });

  test('Enter submits the arrangement', async ({ page }) => {
    await reviewOne(page, ITEM.order);

    await arrangeInto(page, ORDER_SEQUENCE);
    await page.keyboard.press('Enter');

    await expect(page.locator('.feedback.correct')).toBeVisible();
  });
});

test.describe('starring', () => {
  test('a card can be starred and unstarred from the question', async ({ page }) => {
    await reviewOne(page, ITEM.mcq);

    const star = page.getByRole('button', { name: 'Star for focused review' });
    await expect(star).toHaveAttribute('aria-pressed', 'false');
    await star.click();

    const starred = page.getByRole('button', { name: 'Unstar this question' });
    await expect(starred).toHaveAttribute('aria-pressed', 'true');
    expect((await readStore(page)).starred).toEqual([ITEM.mcq]);

    await starred.click();
    expect((await readStore(page)).starred).toEqual([]);
  });
});
