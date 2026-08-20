/**
 * The app's icons must actually decode, not merely be served.
 *
 * Both shipped malformed once: an XML comment cannot contain a literal double
 * hyphen, and the comment explaining the colour tokens spelled them
 * "--color-accent-900". The files still returned 200 with the right
 * content-type, so a fetch-based check passed happily while every browser
 * rendered a broken image. Only decoding catches that.
 */
import { expect, test } from '@playwright/test';
import { openAs } from './harness';

const ICONS = ['icon.svg', 'favicon.svg'];

test.describe('app icons', () => {
  for (const file of ICONS) {
    test(`${file} decodes as an image`, async ({ page }) => {
      await openAs(page, { email: null });

      const size = await page.evaluate(
        (name) =>
          new Promise<number>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img.naturalWidth);
            img.onerror = () => resolve(-1);
            img.src = `/${name}`;
          }),
        file,
      );

      // -1 is a decode failure; 0 means it parsed but has no intrinsic size,
      // which leaves it at the mercy of whatever box it lands in.
      expect(size, `${file} did not decode`).toBeGreaterThan(0);
    });

    test(`${file} is well-formed XML`, async ({ page }) => {
      await openAs(page, { email: null });

      const err = await page.evaluate(async (name) => {
        const text = await (await fetch(`/${name}`)).text();
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        return doc.querySelector('parsererror')?.textContent ?? null;
      }, file);

      expect(err, `${file} is not well-formed`).toBeNull();
    });
  }

  test('the sign-in screen shows the mark, and it has rendered', async ({ page }) => {
    await openAs(page, { email: null });

    const mark = page.locator('.signin-mark');
    await expect(mark).toBeVisible();
    expect(await mark.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  });
});
