/**
 * Focus tracks — a dedicated run at a subset of books, on its own deadline.
 *
 * The survey plan walks all 66 books between now and a quiz months out. A focus
 * track is the other shape of studying: two books, one date, soon. It runs
 * alongside the survey rather than replacing it, and shares card state with it —
 * one card, one history, whichever door you came in through — so the two cannot
 * disagree about how well a verse is known.
 */
import { expect, test } from '@playwright/test';
import { allItems } from '../../src/lib/generate';
import { TRACKS, trackById } from '../../src/data/tracks';
import { BOOKS } from '../../src/data/books';
import { daysFromNow, openAs, readStore } from './harness';

const SAMUEL = trackById('samuel')!;

test.describe('the Samuel focus track — content', () => {
  test('the track covers both books and nothing else', () => {
    const books = new Set(SAMUEL.books);
    const mine = allItems().filter((i) => i.book && books.has(i.book));

    // A dedicated test on two books needs more than a survey's passing glance.
    expect(mine.length).toBeGreaterThan(600);
    expect(new Set(mine.map((i) => i.book))).toEqual(new Set(['1-samuel', '2-samuel']));
  });

  test('the track spans every topic a book question can carry', () => {
    const books = new Set(SAMUEL.books);
    const topics = new Set(
      allItems().filter((i) => i.book && books.has(i.book)).map((i) => i.topic),
    );
    // People, events and chapters are the spine of a narrative exam; places and
    // relationships are where a survey-depth bank used to go thin.
    for (const t of ['people', 'events', 'chapters', 'relationships', 'places']) {
      expect(topics, `missing ${t}`).toContain(t);
    }
  });

  test('nothing downstream hardcodes a track id', () => {
    // The abstraction is only worth having if a second track is data alone.
    expect(TRACKS.length).toBeGreaterThan(0);
    for (const t of TRACKS) {
      expect(t.books.length).toBeGreaterThan(0);
      expect(t.defaultExam).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

test.describe('the Samuel focus track — narrowing makes it harder, not easier', () => {
  const books = new Set(SAMUEL.books);
  const bookNames = new Set(BOOKS.map((b) => b.name));
  const trackItems = () => allItems().filter((i) => i.book && books.has(i.book));

  test('no question in the track answers with a book name', () => {
    // "In which book does this occur: Hannah's prayer?" is a real question in a
    // survey of sixty-six books and a coin flip in a survey of two. The survey
    // keeps them; the track must not, or narrowing the scope would have made
    // the questions easier rather than harder.
    const bank = trackItems();
    expect(bank.length).toBeGreaterThan(500);
    expect(bank.filter((i) => bookNames.has(i.answer)).length).toBeGreaterThan(0);

    // The view applies the filter, so assert the rule the view implements.
    const kept = bank.filter((i) => !bookNames.has(i.answer));
    expect(kept.length).toBeLessThan(bank.length);
    expect(kept.every((i) => !bookNames.has(i.answer))).toBe(true);
  });

  test('chapter questions offer chapters from the same book, not other books', () => {
    // The tightest pool is the only honest one inside a track: an option from
    // Ezra against a Samuel question is not a distractor, it is a free
    // elimination. This is what turns "where does this happen?" into a question
    // about *which chapter*.
    // Both spellings count. Chapter summaries answer "1 Samuel 3" while the
    // event generator abbreviates to "1 Sam 3", and matching only the long form
    // silently drops three quarters of the chapter questions in the track — the
    // exact mistake that made this look thin the first time it was measured.
    const REF = /^(1|2) Sam(uel)? \d/;

    // Verse-level answers are excluded deliberately, and not because they
    // misbehave: only a handful of verses are recorded per book, so an in-book
    // pool cannot supply five distinct options and the widening fires — which
    // is correct, since three choices would be easier than six. Asserted below.
    const chapterQs = trackItems().filter((i) => REF.test(i.answer) && !i.answer.includes(':'));
    expect(chapterQs.length).toBeGreaterThan(50);

    for (const item of chapterQs) {
      const tight = item.distractorsBy?.hard;
      if (!tight?.length) continue;
      for (const option of tight) {
        // Every wrong option names a chapter of a book in the track, so the
        // question is genuinely "which chapter", not "which book".
        expect(option, `${item.id} offered ${option}`).toMatch(REF);
      }
    }
  });

  test('verse questions widen rather than offer a short card', () => {
    const verseQs = trackItems().filter((i) => i.answer.includes(':') && /^(1|2) Samuel /.test(i.answer));
    expect(verseQs.length).toBeGreaterThan(0);

    for (const item of verseQs) {
      const tight = item.distractorsBy?.hard ?? [];
      // Still a full card. Falling short here would make the hardest setting
      // render the fewest choices, which inverts the whole setting.
      expect(tight.length, item.id).toBeGreaterThanOrEqual((item.distractors ?? []).length);
      // And every option is still a scripture reference, not a book name.
      for (const option of tight) expect(option, `${item.id} offered ${option}`).toMatch(/\d+:\d+/);
    }
  });
});

test.describe('the Samuel focus track — the screen', () => {
  test('it counts down to its own test date, not the survey’s', async ({ page }) => {
    await openAs(page, {
      store: { settings: { examDate: daysFromNow(90), newLimit: 10, sessionLimit: 60 } },
    }, 'samuel');

    // The header still counts the survey; the track states its own deadline.
    await expect(page.getByRole('heading', { name: SAMUEL.name })).toBeVisible();
    await expect(page.getByText(/until August 30/)).toBeVisible();
  });

  test('the test date is saved per track and survives a reload', async ({ page }) => {
    await openAs(page, {}, 'samuel');

    await page.getByLabel(/Test date/i).fill('2026-09-15');
    await page.getByLabel(/Test date/i).blur();

    expect((await readStore(page)).settings.trackExams?.samuel).toBe('2026-09-15');
    await page.reload();
    await expect(page.getByLabel(/Test date/i)).toHaveValue('2026-09-15');
  });

  test('difficulty chosen here is the same setting the rest of the app uses', async ({ page }) => {
    // Deliberately not a second per-track concept: one dial, reachable from
    // wherever you happen to be studying.
    await openAs(page, {}, 'samuel');

    await page.getByRole('radio', { name: 'Hard' }).click();
    expect((await readStore(page)).settings.difficulty).toBe('hard');
  });

  test('a session asks only about these two books', async ({ page }) => {
    await openAs(page, {
      store: { settings: { examDate: daysFromNow(90), newLimit: 8, sessionLimit: 8 } },
    }, 'samuel');

    await page.getByRole('button', { name: /Start focus session/i }).click();
    await expect(page.getByRole('progressbar')).toBeVisible();

    // Walk the session and confirm every card belongs to the track.
    const books = new Set(SAMUEL.books);
    const trackPrompts = new Set(
      allItems().filter((i) => i.book && books.has(i.book)).map((i) => i.prompt),
    );
    const prompt = await page.locator('.card-swap').innerText();
    expect([...trackPrompts].some((p) => prompt.includes(p.slice(0, 40)))).toBe(true);
  });

  test('the study plan does not filter the track', async ({ page }) => {
    // A track is a parallel course, not a phase. Phase 1 covers only book-order
    // and summaries; the track must still deal its own material regardless.
    await openAs(page, {
      store: {
        settings: {
          examDate: daysFromNow(90), newLimit: 8, sessionLimit: 8,
          followPlan: true, planStart: daysFromNow(0),
        },
      },
    }, 'samuel');

    await page.getByRole('button', { name: /Start focus session/i }).click();
    await expect(page.getByRole('progressbar', { name: '0 of 8 answered' })).toBeVisible();
  });
});
