/**
 * Seeding and reading helpers for the E2E build.
 *
 * The app under test runs with `E2E=1`, which swaps its Firestore transport for
 * localStorage (see vite.config.ts). That is the whole seam: a test writes a
 * Store before the page boots and reads it back afterwards, while every
 * transition in between runs the app's real logic.
 */
import { expect, type Page } from '@playwright/test';
import { E2E_AUTH_KEY, E2E_STORE_KEY } from '../../src/lib/e2e-keys';
import type { CardState } from '../../src/lib/srs';
import type { Store } from '../../src/lib/storage';

export const DAY = 86_400_000;

export const MEMBER = 'member@acts2.network';
export const OUTSIDER = 'someone@gmail.com';

/**
 * Item ids that are stable across regeneration — one per question kind, so a
 * test can put an exact card in front of itself. Kept honest by
 * `content-contract.spec.ts`, which fails loudly if the bank stops producing them.
 */
export const ITEM = {
  /**
   * "Which book immediately follows Genesis?" → Exodus.
   *
   * Deliberately a `book-order` item rather than a summary or a chapter fact:
   * the canon's sequence is the one thing no content issue is going to
   * rewrite. The previous fixture here was `gen-chapters-genesis`, which #8
   * deleted outright.
   */
  mcq: 'gen-position-genesis',
  /** "How many books are in the Bible?" → 66, accepts "sixty-six" */
  type: 'a-count-total',
  /** "Put these events from Genesis 1–4 in the order they occur." */
  order: 'det-ev-order-genesis-0',
} as const;

export const ORDER_SEQUENCE = ['Creation', 'The garden', 'The Fall', 'Cain and Abel'];

/** ISO date `n` days from now — keeps the exam clamp away from wall-clock drift. */
export function daysFromNow(n: number): string {
  const d = new Date(Date.now() + n * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** A card already in rotation and overdue, so it lands in today's queue. */
export function dueCard(id: string, over: Partial<CardState> = {}): CardState {
  return {
    id,
    ease: 2.5,
    interval: 1,
    reps: 2,
    lapses: 0,
    due: Date.now() - DAY,
    lastSeen: Date.now() - 2 * DAY,
    recent: [2, 2],
    ...over,
  };
}

/** A card that keeps being missed — four lapses is the leech threshold. */
export function leechCard(id: string): CardState {
  return dueCard(id, { lapses: 4, reps: 6, recent: [0, 0, 1, 0] });
}

export function storeWith(over: Partial<Store> = {}): Store {
  return {
    cards: {},
    settings: { examDate: daysFromNow(60), newLimit: 20, sessionLimit: 60 },
    log: [],
    starred: [],
    ...over,
  };
}

interface SeedOptions {
  /** Signed-in address; null leaves the app signed out. Defaults to a member. */
  email?: string | null;
  store?: Partial<Store>;
  /** What the stubbed Google popup will do on the next click. */
  nextSignIn?: string;
}

/**
 * Writes auth + store into localStorage before any app code runs.
 *
 * Init scripts re-run on every navigation, so the write is guarded by a
 * sentinel: the seed lands once, before the first load, and a reload or a
 * sign-out then reflects what the app itself persisted rather than being
 * silently reset to the seed.
 */
export async function seed(page: Page, options: SeedOptions = {}): Promise<void> {
  const { email = MEMBER, store, nextSignIn } = options;
  const payload = {
    authKey: E2E_AUTH_KEY,
    storeKey: E2E_STORE_KEY,
    seededKey: 'e2e:seeded',
    email,
    store: JSON.stringify(storeWith(store)),
    nextSignIn,
  };
  await page.addInitScript((data) => {
    if (localStorage.getItem(data.seededKey)) return;
    localStorage.setItem(data.seededKey, '1');
    if (data.email) localStorage.setItem(data.authKey, data.email);
    else localStorage.removeItem(data.authKey);
    localStorage.setItem(data.storeKey, data.store);
    if (data.nextSignIn) localStorage.setItem('e2e:next-sign-in', data.nextSignIn);
  }, payload);
}

/** Navigate to a tab and wait out the boot splash's minimum hold. */
export async function openApp(page: Page, tab = 'home'): Promise<void> {
  await page.goto(`/#${tab}`);
  await expect(page.locator('.boot-splash')).toBeHidden();
}

/** Seed a member, then open the app — the common two-line preamble. */
export async function openAs(page: Page, options: SeedOptions = {}, tab = 'home'): Promise<void> {
  await seed(page, options);
  await openApp(page, tab);
}

/**
 * A stat plate's figure. CountUp prints its number from a CSS counter, so the
 * value is only in the accessible name — never in text content.
 */
export function statFigure(page: Page, label: string) {
  return page
    .locator('.stat')
    .filter({ has: page.locator('.k', { hasText: new RegExp(`^${label}`) }) })
    .locator('.count-up');
}

export async function expectStat(page: Page, label: string, value: number | string): Promise<void> {
  await expect(statFigure(page, label)).toHaveAttribute('aria-label', String(value));
}

/** The store as the app last persisted it. */
export async function readStore(page: Page, storeKey = E2E_STORE_KEY): Promise<Store> {
  const raw = await page.evaluate((key) => localStorage.getItem(key), storeKey);
  expect(raw, 'expected the app to have persisted a store').not.toBeNull();
  return JSON.parse(raw!) as Store;
}

/** Days the header will count down for a given exam date — the app's own sum. */
export function daysUntil(examDate: string): number {
  return Math.max(0, Math.ceil((new Date(`${examDate}T23:59:59`).getTime() - Date.now()) / DAY));
}

/** Puts exactly one card in the review queue: one due, no new cards allowed. */
export function soloQueue(id: string, over: Partial<Store> = {}): Partial<Store> {
  return {
    cards: { [id]: dueCard(id) },
    settings: { examDate: daysFromNow(60), newLimit: 0, sessionLimit: 1 },
    ...over,
  };
}
