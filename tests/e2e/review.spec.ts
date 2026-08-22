import { expect, test, type Page } from '@playwright/test';
import { DAY, ITEM, daysFromNow, dueCard, expectStat, openAs, readStore, soloQueue } from './harness';

const start = (page: Page) => page.getByRole('button', { name: 'Start review session' }).click();

/** Answer whatever is on screen correctly, if it is the MCQ we seeded. */
async function answerMcq(page: Page, label: string) {
  await page.locator('.choice').filter({ has: page.getByText(label, { exact: true }) }).click();
}

test.describe('daily review', () => {
  test('the idle screen counts what is due, what is new, and what has been seen', async ({ page }) => {
    const cards = {
      [ITEM.mcq]: dueCard(ITEM.mcq),
      [ITEM.type]: dueCard(ITEM.type),
      // Not due for a week — should count as seen but not as due.
      [ITEM.order]: dueCard(ITEM.order, { due: Date.now() + 7 * DAY }),
    };
    await openAs(page, { store: { cards, settings: { examDate: daysFromNow(60), newLimit: 5, sessionLimit: 60 } } }, 'review');

    await expectStat(page, 'Due now', 2);
    await expectStat(page, 'New today', 5); // capped by the new-card limit
    await expectStat(page, 'Seen so far', 3);
  });

  test('a session runs from first card to summary and logs what happened', async ({ page }) => {
    await openAs(page, { store: soloQueue(ITEM.mcq) }, 'review');
    await start(page);

    await expect(page.getByRole('progressbar', { name: '0 of 1 answered' })).toBeVisible();
    await expect(page.getByText('1 / 1')).toBeVisible();

    await answerMcq(page, 'Exodus');
    await page.getByRole('button', { name: /^Ok/ }).click();

    await expect(page.getByRole('heading', { name: 'Session complete' })).toBeVisible();
    await expectStat(page, 'Answered', 1);
    await expectStat(page, 'Correct', 1);
    await expectStat(page, 'Accuracy', 100);

    const store = await readStore(page);
    expect(store.log.at(-1)).toMatchObject({ reviewed: 1, correct: 1 });
  });

  test('a missed card is requeued and asked again', async ({ page }) => {
    // Fixed in #38 by keying the session card on the queue position rather than
    // `item.id`. When a missed card was requeued as the *very next* card — which
    // is what happens whenever you miss the last card of a session — React
    // reused the component, QuestionCard's reset effect (keyed on the same
    // `item.id`) never fired, and the card returned still revealed. There was no
    // retrieval, which is the entire point of requeueing it; worse, the only way
    // forward was Continue, which graded the same miss again. One miss recorded
    // three reps and three lapses, one short of the leech threshold.
    await openAs(page, { store: soloQueue(ITEM.mcq) }, 'review');
    await start(page);

    await answerMcq(page, 'Deuteronomy');
    await page.getByRole('button', { name: /^Continue/ }).click();

    // The card is back — it should be asked afresh, not shown already answered.
    await expect(page.getByText('Which book immediately follows Genesis?')).toBeVisible();
    await expect(page.locator('.feedback')).toHaveCount(0);
    await expect(page.locator('.choice').first()).toBeEnabled();
  });

  test('a missed card comes back twice at most, then the session ends', async ({ page }) => {
    await openAs(page, { store: soloQueue(ITEM.mcq) }, 'review');
    await start(page);

    // Miss it three times; the third must not extend the session again.
    for (let attempt = 1; attempt <= 3; attempt++) {
      await expect(page.getByText('Which book immediately follows Genesis?')).toBeVisible();
      await answerMcq(page, 'Deuteronomy');
      await page.getByRole('button', { name: /^Continue/ }).click();
    }

    await expect(page.getByRole('heading', { name: 'Session complete' })).toBeVisible();
    await expectStat(page, 'Answered', 3);
    await expectStat(page, 'Correct', 0);
    await expectStat(page, 'Accuracy', 0);

    const store = await readStore(page);
    expect(store.cards[ITEM.mcq].lapses).toBe(3);
    // "Again" schedules a same-session repeat, not a day away.
    expect(store.cards[ITEM.mcq].interval).toBe(0);
  });

  test('the running tally updates as the session goes', async ({ page }) => {
    const cards = { [ITEM.mcq]: dueCard(ITEM.mcq), [ITEM.type]: dueCard(ITEM.type) };
    await openAs(page, { store: { cards, settings: { examDate: daysFromNow(60), newLimit: 0, sessionLimit: 2 } } }, 'review');
    await start(page);

    await expect(page.getByText('0 right · 0 missed')).toBeVisible();
    await expect(page.getByRole('progressbar', { name: '0 of 2 answered' })).toBeVisible();
  });

  test('ending a session early returns to the idle screen', async ({ page }) => {
    await openAs(page, { store: soloQueue(ITEM.mcq) }, 'review');
    await start(page);

    await page.getByRole('button', { name: 'End session' }).click();

    await expect(page.getByRole('button', { name: 'Start review session' })).toBeVisible();
    await expect(page.locator('.card-swap')).toBeHidden();
  });

  test('another session can be started from the summary', async ({ page }) => {
    await openAs(page, { store: soloQueue(ITEM.mcq) }, 'review');
    await start(page);
    await answerMcq(page, 'Exodus');
    await page.getByRole('button', { name: /^Ok/ }).click();

    await expect(page.getByRole('heading', { name: 'Session complete' })).toBeVisible();
    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByRole('button', { name: 'Start review session' })).toBeVisible();
  });

  test('review intervals never outrun the quiz date', async ({ page }) => {
    // Exam in 10 days: an "easy" grade must land inside it, not the ~7 days
    // SM-2 would otherwise give a card with a 3-day interval.
    await openAs(page, {
      store: {
        cards: { [ITEM.mcq]: dueCard(ITEM.mcq, { interval: 3, ease: 2.5 }) },
        settings: { examDate: daysFromNow(10), newLimit: 0, sessionLimit: 1 },
      },
    }, 'review');
    await start(page);

    await answerMcq(page, 'Exodus');
    await page.getByRole('button', { name: /^Easy/ }).click();

    const store = await readStore(page);
    const card = store.cards[ITEM.mcq];
    expect(card.interval).toBeLessThanOrEqual(6); // half the days remaining
    expect(card.due).toBeLessThan(new Date(`${daysFromNow(10)}T23:59:59`).getTime());
  });
});
