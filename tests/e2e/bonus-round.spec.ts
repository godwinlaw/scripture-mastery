/**
 * The typed bonus round (#14), driven through the real card.
 *
 * A question whose answer is a place in scripture asks you to name it before
 * it will show you four options. Naming it is strictly harder than picking it,
 * so it grades itself Easy; taking the choices instead scores as normal.
 */
import { expect, test, type Page } from '@playwright/test';
import { openAs, readStore, soloQueue } from './harness';

/**
 * The issue's own example: "Israel marches around the city…" → Joshua 6.
 * A `gen-locate` item, so its answer is a reference and it opens on the bonus.
 */
const REF_ITEM = 'gen-locate-joshua-6';

const input = (page: Page) => page.getByRole('textbox', { name: 'Type the reference for a bonus' });
const choices = (page: Page) => page.locator('.choice');

async function reviewOne(page: Page, id: string) {
  await openAs(page, { store: soloQueue(id) }, 'review');
  await page.getByRole('button', { name: 'Start review session' }).click();
}

test.describe('typed reference bonus', () => {
  test('a reference question asks you to name it before showing any options', async ({ page }) => {
    await reviewOne(page, REF_ITEM);

    await expect(page.getByText('The walls of Jericho fall after seven days of marching')).toBeVisible();
    await expect(input(page)).toBeVisible();
    // The whole point: the answer is not on screen to be recognised.
    await expect(choices(page)).toHaveCount(0);
  });

  test('naming the reference grades the card Easy without asking', async ({ page }) => {
    await reviewOne(page, REF_ITEM);

    await input(page).fill('Joshua 6');
    await page.getByRole('button', { name: 'Check reference' }).click();

    await expect(page.locator('.feedback.correct')).toContainText('Correct');
    // No grade to choose, the row is replaced by a single Continue.
    await expect(page.getByRole('button', { name: /^Hard/ })).toBeHidden();
    await expect(page.getByRole('button', { name: /^Ok/ })).toBeHidden();
    await expect(page.getByRole('button', { name: /^Easy/ })).toBeHidden();

    await page.getByRole('button', { name: /^Continue/ }).click();

    await expect(page.getByRole('heading', { name: 'Session complete' })).toBeVisible();
    const store = await readStore(page);
    // Easy is grade 3, which pushes ease above the 2.5 default.
    expect(store.cards[REF_ITEM].ease).toBeGreaterThan(2.5);
    expect(store.log.at(-1)).toMatchObject({ reviewed: 1, correct: 1 });
  });

  test('winning the bonus closes the round rather than leaving it open', async ({ page }) => {
    // The controls stayed live after a correct answer, so you could still ask
    // for the choices, or re-submit, on a card you had already won.
    await reviewOne(page, REF_ITEM);

    await input(page).fill('Joshua 6');
    await page.getByRole('button', { name: 'Check reference' }).click();

    await expect(page.getByRole('button', { name: 'Check reference' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Show me the choices' })).toBeHidden();
    // What was typed stays on screen, but cannot be edited.
    await expect(input(page)).toBeDisabled();
    await expect(input(page)).toHaveValue('Joshua 6');
  });

  test('the abbreviation from the issue is accepted', async ({ page }) => {
    await reviewOne(page, REF_ITEM);

    await input(page).fill('Josh 6');
    await page.keyboard.press('Enter');

    await expect(page.locator('.feedback.correct')).toContainText('Correct');
  });

  test('a wrong reference costs the bonus but not the question', async ({ page }) => {
    await reviewOne(page, REF_ITEM);

    await input(page).fill('Joshua 5');
    await page.getByRole('button', { name: 'Check reference' }).click();

    // Not marked wrong, it falls through to the ordinary multiple choice.
    await expect(page.locator('.feedback')).toHaveCount(0);
    await expect(input(page)).toBeHidden();
    await expect(choices(page)).toHaveCount(4);

    await page.locator('.choice').filter({ has: page.getByText('Joshua 6', { exact: true }) }).click();
    await expect(page.locator('.feedback.correct')).toContainText('Correct');
    // Scored normally, so the member grades it themselves.
    await expect(page.getByRole('button', { name: /^Ok/ })).toBeVisible();
  });

  test('you can decline the bonus and take the choices', async ({ page }) => {
    await reviewOne(page, REF_ITEM);

    await page.getByRole('button', { name: 'Show me the choices' }).click();

    await expect(input(page)).toBeHidden();
    await expect(choices(page)).toHaveCount(4);
    await expect(page.locator('.feedback')).toHaveCount(0);
  });

  test('digits typed into the reference box do not pick an option', async ({ page }) => {
    // The number keys are an answering shortcut for multiple choice. While the
    // bonus input is up they must stay out of the way, or "1 Cor 15" would
    // answer the card on its first keystroke.
    await reviewOne(page, REF_ITEM);

    await input(page).fill('');
    await page.keyboard.type('1');

    await expect(page.locator('.feedback')).toHaveCount(0);
    await expect(input(page)).toHaveValue('1');
  });

  test('a question whose answer is not a reference is unaffected', async ({ page }) => {
    // gen-position-genesis answers "Exodus", a book, not a place in it.
    await reviewOne(page, 'gen-position-genesis');

    await expect(input(page)).toBeHidden();
    await expect(choices(page)).toHaveCount(4);
  });
});
