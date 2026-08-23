/**
 * The study plan drives what you study (#40).
 *
 * The plan has always been *displayed* — Plan.tsx renders the schedule and the
 * Dashboard names the current phase — but nothing filtered the queue by it, so
 * following it was left entirely to the member's own discipline. These tests
 * pin the two halves of making it real: the daily review draws from the phase,
 * and the phase actually advances as the weeks pass.
 *
 * That second half is the one worth guarding hardest. `buildSchedule` defaults
 * its start date to `new Date()`, so a schedule built today always puts today
 * in week 1 — which meant `currentPhase` answered "Phase 1" forever. Harmless
 * while the plan was decorative; the moment it gates the queue it would have
 * pinned every member to book-order and summaries, 330 of 6,098 items, until
 * the exam date passed. The anchor is a persisted plan start instead.
 */
import { expect, test } from '@playwright/test';
import { DAY, ITEM, daysFromNow, dueCard, openAs, readStore } from './harness';

/** An ISO date `n` days back, for seeding a plan that started in the past. */
function daysAgo(n: number): string {
  return daysFromNow(-n);
}

test.describe('following the study plan', () => {
  /**
   * `ITEM.mcq` is `book-order`, which Phase 1 asks for; `ITEM.type` is
   * `numbers` and `ITEM.order` is `events`, which it does not.
   */
  const straddling = {
    [ITEM.mcq]: dueCard(ITEM.mcq),
    [ITEM.type]: dueCard(ITEM.type),
    [ITEM.order]: dueCard(ITEM.order),
  };

  const settings = (over = {}) => ({
    examDate: daysFromNow(60),
    newLimit: 0,
    sessionLimit: 60,
    ...over,
  });

  test('the review session only asks what the current phase covers', async ({ page }) => {
    await openAs(page, { store: { cards: straddling, settings: settings({ followPlan: true }) } }, 'review');

    await expect(page.getByText(/Following the study plan/)).toBeVisible();
    await page.getByRole('button', { name: 'Start review session' }).click();

    // One card, and it is the book-order one — not the numbers or events cards.
    await expect(page.getByRole('progressbar', { name: '0 of 1 answered' })).toBeVisible();
    await expect(page.getByText('Which book immediately follows Genesis?')).toBeVisible();
  });

  test('you can set the plan aside for one session without changing the setting', async ({ page }) => {
    await openAs(page, { store: { cards: straddling, settings: settings({ followPlan: true }) } }, 'review');

    // One click from the same screen: it starts the session outright rather
    // than returning to the idle screen with a different setting selected.
    await page.getByRole('button', { name: 'Study everything instead' }).click();

    await expect(page.getByRole('progressbar', { name: '0 of 3 answered' })).toBeVisible();
    // Setting aside is a session-level choice; the saved preference is untouched.
    expect((await readStore(page)).settings.followPlan).toBe(true);
  });

  test('turning the setting off leaves the queue drawing on the whole bank', async ({ page }) => {
    await openAs(page, { store: { cards: straddling, settings: settings({ followPlan: false }) } }, 'review');

    await expect(page.getByText(/Following the study plan/)).toHaveCount(0);
    await page.getByRole('button', { name: 'Start review session' }).click();
    await expect(page.getByRole('progressbar', { name: '0 of 3 answered' })).toBeVisible();
  });

  test('the setting is saved and survives a reload', async ({ page }) => {
    await openAs(page, {}, 'settings');

    await page.getByRole('radio', { name: 'Off' }).click();
    expect((await readStore(page)).settings.followPlan).toBe(false);

    await page.reload();
    await expect(page.getByRole('radio', { name: 'Off' })).toBeChecked();
  });

  test('an account saved before the setting existed follows the plan by default', async ({ page }) => {
    // The key postdates the store format, so a store written before #40 has no
    // such field. It must read as on — the plan is the app's whole premise —
    // rather than leaving the control with nothing selected.
    await openAs(page, {}, 'settings');
    await expect(page.getByRole('radio', { name: 'On' })).toBeChecked();
  });

  test('the plan advances as the weeks pass rather than resetting to phase one', async ({ page }) => {
    // A member eight weeks into a plan with the exam four weeks out is well
    // past building the frame. Anchoring on `new Date()` answered "Phase 1"
    // here, which is the bug this guards.
    await openAs(page, {
      store: {
        settings: { examDate: daysFromNow(28), newLimit: 0, sessionLimit: 60, planStart: daysAgo(56) },
        log: [{ date: daysAgo(56), reviewed: 1, correct: 1 }],
      },
    }, 'review');

    await expect(page.getByText(/Following the study plan/)).toBeVisible();
    await expect(page.getByText(/Following the study plan: Phase 1/)).toHaveCount(0);
  });

  test('a plan started today is still on phase one', async ({ page }) => {
    await openAs(page, {
      store: { settings: { examDate: daysFromNow(60), newLimit: 0, sessionLimit: 60, planStart: daysFromNow(0) } },
    }, 'review');

    await expect(page.getByText(/Following the study plan: Phase 1/)).toBeVisible();
  });
});

test.describe('the quiz can be pointed at the plan', () => {
  test('this week’s plan is offered as a scope and narrows the pool', async ({ page }) => {
    await openAs(page, {}, 'quiz');

    const count = async () => {
      const text = await page.getByText(/questions? match this filter/).textContent();
      return Number(/(\d+)/.exec(text ?? '')?.[1] ?? 0);
    };

    await page.getByRole('radio', { name: 'Everything' }).click();
    const everything = await count();

    await page.getByRole('radio', { name: 'This week’s plan' }).click();
    const planned = await count();

    expect(planned).toBeGreaterThan(0);
    expect(planned).toBeLessThan(everything);
  });
});
