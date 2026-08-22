/**
 * The difficulty setting (#36).
 *
 * Two halves, tested where each actually lives. The option-scoping rules are a
 * property of the generated bank, so they run in Node against the real
 * generators — the same reasoning as content-contract.spec.ts. The control
 * itself is UI, so that half drives the browser.
 *
 * The seam rule is the one worth guarding hardest: medium and hard must never
 * offer an option from the other Testament, because a New Testament book
 * against an Old Testament question is not a hard choice, just a different
 * subject (#10, #12). Easy deliberately breaks that rule — that is what makes
 * it easy — so it is pinned from the other side.
 */
import { expect, test } from '@playwright/test';
import { BOOKS, BOOKS_BY_ID } from '../../src/data/books';
import { allItems, ITEMS_BY_ID } from '../../src/lib/generate';
import { buildQueue, type ItemMeta } from '../../src/lib/srs';
import { DIFFICULTY_SPEC } from '../../src/lib/difficulty';
import { daysFromNow, ITEM, openAs, readStore, soloQueue, expectBooted } from './harness';

/** Options naming a book on the other side of the seam. */
function crossings2(
  options: string[] | undefined,
  ownTestament: string,
  byName: Map<string, { testament: string }>,
): number {
  if (!options) return 0;
  return options.filter((o) => {
    const book = byName.get(o);
    return book !== undefined && book.testament !== ownTestament;
  }).length;
}

const BOOK_BY_NAME = new Map(BOOKS.map((b) => [b.name, b]));

/**
 * Options that name a book, paired with the Testament they belong to.
 *
 * Most options are chapter summaries or references and cannot be attributed to
 * a book by string alone; the ones that are bare book names can, and they are
 * the only place a seam crossing is observable from the outside. #24 verified
 * its own rule the same way.
 */
function crossings(options: string[] | undefined, ownTestament: string): number {
  if (!options) return 0;
  return options.filter((o) => {
    const book = BOOK_BY_NAME.get(o);
    return book !== undefined && book.testament !== ownTestament;
  }).length;
}

test.describe('difficulty — option scoping', () => {
  /**
   * Only Chapter Content and Events are in scope. The seam rule was written for
   * those two (#24, #27) because a question about one passage should offer
   * other plausible passages. Book Order is deliberately exempt: "which book
   * immediately follows Genesis?" is a question about the shape of the whole
   * canon, so its options have to be able to come from anywhere in it.
   */
  const withBook = allItems().filter(
    (i) => i.book && BOOKS_BY_ID[i.book] && (i.topic === 'chapters' || i.topic === 'events'),
  );

  test('medium and hard never offer an option from the other Testament', () => {
    let mediumCrossings = 0;
    let hardCrossings = 0;
    const offenders: string[] = [];

    for (const item of withBook) {
      const own = BOOKS_BY_ID[item.book!].testament;
      const m = crossings(item.distractors, own);
      const h = crossings(item.distractorsBy?.hard, own);
      mediumCrossings += m;
      hardCrossings += h;
      if ((m || h) && offenders.length < 5) offenders.push(`${item.id} | ${item.prompt}`);
    }

    expect(mediumCrossings, `medium crossings, e.g. ${offenders.join(' ; ')}`).toBe(0);
    expect(hardCrossings, `hard crossings, e.g. ${offenders.join(' ; ')}`).toBe(0);
  });

  test('easy does reach across the seam, which is what makes it easy', () => {
    const crossed = withBook.reduce(
      (n, item) => n + crossings(item.distractorsBy?.easy, BOOKS_BY_ID[item.book!].testament),
      0,
    );
    // A floor rather than an exact count: the number moves whenever the bank
    // grows, but "easy behaves differently from medium" must not silently stop
    // being true — that would leave the setting doing nothing.
    expect(crossed).toBeGreaterThan(0);
  });

  test('every alternate set offers as many options as the medium one', () => {
    const thin = withBook.filter((i) => {
      const base = i.distractors?.length ?? 0;
      const by = i.distractorsBy;
      if (!by) return false;
      return (by.easy && by.easy.length < base) || (by.hard && by.hard.length < base);
    });
    // A short pool means a three-choice question, and three choices are easier
    // than four — which would invert hard mode rather than sharpen it.
    expect(thin.map((i) => i.id)).toEqual([]);
  });
});

/**
 * #40 — the setting stopped being a distractor-swap and became an axis.
 *
 * Before it, two thirds of the bank carried no alternate option sets at all:
 * every `people`, `places`, `relationships`, `book-order`, `numbers`,
 * `timeline` and `summaries` question fell back to its medium set, and plenty
 * of those pools were canon-wide. So `hard` quietly offered New Testament
 * options against Old Testament questions — 637 of them, measured — which is
 * the complaint that started this. The tests below are the floor that stops
 * that regressing.
 */
test.describe('difficulty — scoping across the whole bank', () => {
  const mcq = allItems().filter((i) => i.kind === 'mcq');
  const BY_NAME = new Map(BOOKS.map((b) => [b.name, b]));

  /**
   * Topics whose options are book *names*, so a Testament can be read off them.
   *
   * People questions are excluded deliberately even though their options are
   * strings: Luke, James, Job and Zechariah are each both a person and a book,
   * so matching option text against the canon there measures the collision, not
   * a seam crossing.
   */
  const BOOK_ANSWER_TOPICS = new Set(['chapters', 'events', 'summaries']);

  test('hard never offers an option from the other Testament', () => {
    let crossings = 0;
    const offenders: string[] = [];

    for (const item of mcq) {
      if (!item.book || !BOOK_ANSWER_TOPICS.has(item.topic)) continue;
      const own = BOOKS_BY_ID[item.book]?.testament;
      if (!own) continue;
      const c = crossings2(item.distractorsBy?.hard, own, BY_NAME);
      crossings += c;
      if (c && offenders.length < 5) offenders.push(`${item.id} | ${item.prompt}`);
    }

    expect(crossings, `hard crossings, e.g. ${offenders.join(' ; ')}`).toBe(0);
  });

  /**
   * Book Order is the one family where the Testament seam is the wrong fence:
   * "which book immediately follows Malachi?" has a New Testament answer to an
   * Old Testament question, so scoping by Testament would identify the answer
   * without knowing the canon at all. What makes it hard is *canonical
   * distance* — Ezra against Nehemiah, Esther and Chronicles is a question;
   * Ezra against Matthew is a free point.
   */
  test('book-order draws hard options from canonical neighbours, and easy ones from far away', () => {
    const bookOrder = mcq.filter((i) => i.topic === 'book-order' && i.book);
    expect(bookOrder.length).toBeGreaterThan(0);

    let farOnHard = 0;
    let nearOnEasy = 0;
    for (const item of bookOrder) {
      const subject = BOOKS_BY_ID[item.book!];
      if (!subject) continue;
      for (const o of item.distractorsBy?.hard ?? []) {
        const b = BY_NAME.get(o);
        if (b && Math.abs(b.order - subject.order) > 8) farOnHard++;
      }
      for (const o of item.distractorsBy?.easy ?? []) {
        const b = BY_NAME.get(o);
        if (b && Math.abs(b.order - subject.order) <= 4) nearOnEasy++;
      }
    }

    expect(farOnHard, 'a hard book-order option more than 8 positions away').toBe(0);
    expect(nearOnEasy, 'an easy book-order option among the answer’s neighbours').toBe(0);
  });

  /**
   * `pickDistractors` excludes the answer but never knew about the *subject*,
   * so "Which book immediately precedes Leviticus?" offered Leviticus — an
   * option that is wrong for a reason the question itself gives away.
   */
  test('no question offers the book it is asking about', () => {
    const offenders: string[] = [];
    for (const item of mcq) {
      if (item.topic !== 'book-order' || !item.book) continue;
      const subject = BOOKS_BY_ID[item.book]?.name;
      if (!subject) continue;
      const every = [
        ...(item.distractors ?? []),
        ...(item.distractorsBy?.easy ?? []),
        ...(item.distractorsBy?.hard ?? []),
      ];
      if (every.includes(subject)) offenders.push(item.id);
    }
    expect(offenders).toEqual([]);
  });

  test('almost every question carries all three option sets', () => {
    const withHard = mcq.filter((i) => i.distractorsBy?.hard).length;
    // A floor, not an equality: the handful of hand-authored items in
    // src/data/extras.ts draw their options from somewhere other than the
    // canon and legitimately have none. Before #40 this was 4,554 of 5,926.
    expect(withHard / mcq.length).toBeGreaterThan(0.99);
  });

  test('hard is never thinner than medium, which would invert the setting', () => {
    const thin = mcq.filter(
      (i) => i.distractorsBy?.hard && i.distractorsBy.hard.length < (i.distractors ?? []).length,
    );
    expect(thin.map((i) => i.id)).toEqual([]);
  });

  test('hard offers more choices than medium, and easy fewer', () => {
    const rendered = (item: (typeof mcq)[number], d: 'easy' | 'medium' | 'hard') => {
      const pool = d === 'medium'
        ? item.distractors ?? []
        : item.distractorsBy?.[d] ?? item.distractors ?? [];
      return Math.min(pool.length, DIFFICULTY_SPEC[d].wrongOptions) + 1;
    };
    // The dial that costs nothing in item stability and is felt on every card:
    // a three-option question is a coin flip after one elimination.
    expect(mcq.every((i) => rendered(i, 'easy') === 3)).toBe(true);
    expect(mcq.every((i) => rendered(i, 'medium') === 4)).toBe(true);
    expect(mcq.filter((i) => rendered(i, 'hard') === 6).length / mcq.length).toBeGreaterThan(0.99);
  });

  test('no alternate set contains the answer it is meant to be wrong about', () => {
    const leaks = mcq.filter(
      (i) => (i.distractorsBy?.easy ?? []).includes(i.answer)
        || (i.distractorsBy?.hard ?? []).includes(i.answer),
    );
    expect(leaks.map((i) => i.id)).toEqual([]);
  });
});

/**
 * The dial a member actually feels, card by card (#40).
 *
 * Option scoping is invisible unless you already know the canon; option *count*
 * is not. Three choices is a coin flip after one elimination, six is a real
 * question, and neither costs anything in item stability — the bank stays
 * difficulty-blind and the render site slices.
 */
/**
 * Which new cards get introduced, and whether you can predict them (#40).
 *
 * The complaint: "build the frame is great in going through all of the books
 * but it's in order — for easy mode that's fine but for hard mode it should
 * not be. It's too easy to predict." It was literally true at every setting.
 * `fresh` arrives in the bank's generation order, which is canonical, and
 * `buildQueue` took `fresh.slice(0, newLimit)`. The within-session shuffle
 * (#11) never touched it, because it only reorders cards already chosen.
 */
test.describe('difficulty — how new material is introduced', () => {
  const items = allItems();
  const meta: Record<string, ItemMeta> = {};
  for (const i of items) meta[i.id] = { tier: i.tier, book: i.book };

  const introduced = (difficulty: 'easy' | 'medium' | 'hard', seed: string) =>
    new Set(buildQueue(items.map((i) => i.id), {}, {
      newLimit: 10, sessionLimit: 10, difficulty, meta, seed,
    }));

  const bookSpan = (ids: Set<string>) => {
    const orders = [...ids]
      .map((id) => BOOKS_BY_ID[ITEMS_BY_ID.get(id)!.book ?? '']?.order)
      .filter((n): n is number => typeof n === 'number');
    return orders.length ? Math.max(...orders) - Math.min(...orders) : 0;
  };

  test('easy walks the canon from the beginning', () => {
    const first = introduced('easy', '2026-08-22');
    const orders = [...first]
      .map((id) => BOOKS_BY_ID[ITEMS_BY_ID.get(id)!.book ?? '']?.order)
      .filter((n): n is number => typeof n === 'number');

    // Genesis-first, and tightly clustered — the frame is built front to back.
    // This is also why the tier bias is not allowed to reorder `canonical`:
    // floating tier 1 forward opened easy on Isaiah instead of Genesis.
    expect(Math.min(...orders)).toBe(1);
    expect(bookSpan(first)).toBeLessThan(10);
  });

  test('hard draws from across the whole scope instead', () => {
    expect(bookSpan(introduced('hard', '2026-08-22'))).toBeGreaterThan(20);
  });

  test('hard deals a different hand each day, where easy deals the same one', () => {
    const easyToday = introduced('easy', '2026-08-22');
    const easyTomorrow = introduced('easy', '2026-08-23');
    const hardToday = introduced('hard', '2026-08-22');
    const hardTomorrow = introduced('hard', '2026-08-23');

    const overlap = (a: Set<string>, b: Set<string>) => [...a].filter((x) => b.has(x)).length;

    // Easy is deliberately predictable: the same next cards until you clear them.
    expect(overlap(easyToday, easyTomorrow)).toBe(easyToday.size);
    // Hard is not. This is the whole complaint, inverted into a guarantee.
    expect(overlap(hardToday, hardTomorrow)).toBeLessThan(hardToday.size / 2);
  });

  test('a reload does not deal a different hand mid-session', () => {
    // Seeded, not Math.random(): unpredictable across days, fixed within one.
    const a = introduced('hard', '2026-08-22');
    const b = introduced('hard', '2026-08-22');
    expect([...a].sort()).toEqual([...b].sort());
  });

  test('hard introduces more new cards than medium, and easy fewer', () => {
    // A session limit well above the new-card limit, or the cut hides the
    // difference this is measuring.
    const count = (difficulty: 'easy' | 'medium' | 'hard') =>
      buildQueue(items.map((i) => i.id), {}, {
        newLimit: 10, sessionLimit: 500, difficulty, meta, seed: 's',
      }).length;

    expect(count('hard')).toBeGreaterThan(count('medium'));
    expect(count('easy')).toBeLessThan(count('medium'));
  });
});

test.describe('difficulty — what reaches the card', () => {
  const CHOICES = { easy: 3, medium: 4, hard: 6 } as const;

  for (const [difficulty, expected] of Object.entries(CHOICES)) {
    test(`${difficulty} puts ${expected} choices on the card`, async ({ page }) => {
      await openAs(page, { store: { ...soloQueue(ITEM.mcq), settings: {
        examDate: daysFromNow(60), newLimit: 0, sessionLimit: 1, difficulty,
      } } }, 'review');
      await page.getByRole('button', { name: 'Start review session' }).click();

      await expect(page.getByText('Which book immediately follows Genesis?')).toBeVisible();
      await expect(page.locator('.choice')).toHaveCount(expected);
    });
  }

  /**
   * A reference question opens with a chance to name it from memory before any
   * options appear (#14). Naming is strictly harder than recognising, so easy
   * skips the prompt and goes straight to recognition; medium and hard ask.
   *
   * `gen-locate-joshua-6` is a `gen-locate` item, so its answer is a reference.
   */
  const REF_ITEM = 'gen-locate-joshua-6';
  const refSeed = (difficulty: string) => ({
    ...soloQueue(REF_ITEM),
    settings: { examDate: daysFromNow(60), newLimit: 0, sessionLimit: 1, difficulty },
  });

  test('easy shows the options straight away', async ({ page }) => {
    await openAs(page, { store: refSeed('easy') }, 'review');
    await page.getByRole('button', { name: 'Start review session' }).click();

    await expect(page.locator('.choice')).toHaveCount(3);
  });

  test('medium asks for the reference before showing any options', async ({ page }) => {
    await openAs(page, { store: refSeed('medium') }, 'review');
    await page.getByRole('button', { name: 'Start review session' }).click();

    await expect(page.locator('.choice')).toHaveCount(0);
  });

});

test.describe('difficulty — the control', () => {
  test('the chosen difficulty is saved and survives a reload', async ({ page }) => {
    await openAs(page, {}, 'settings');

    await page.getByRole('radio', { name: 'Hard' }).click();

    expect((await readStore(page)).settings.difficulty).toBe('hard');

    await page.reload();
    await expectBooted(page);
    await expect(page.getByRole('radio', { name: 'Hard' })).toBeChecked();
  });

  test('an existing account with no difficulty saved falls back to medium', async ({ page }) => {
    await openAs(page, {}, 'settings');

    // The setting postdates the store format, so a store written before #36 has
    // no such key. It must read as medium — the behaviour that predates the
    // setting — rather than leaving the control with nothing selected.
    await expect(page.getByRole('radio', { name: 'Medium' })).toBeChecked();
  });

  test('the theme switch moved to the panel and still drives the page', async ({ page }) => {
    await openAs(page, {}, 'settings');

    // It used to sit in the header; #36 gave it a home alongside the rest.
    await expect(page.locator('header').getByRole('radio', { name: 'Dark' })).toHaveCount(0);

    await page.getByRole('radio', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});
