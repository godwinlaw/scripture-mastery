import type { CardState } from './srs';
import type { Difficulty } from '../data/types';

export interface Settings {
  /** ISO date of the quiz. Drives the study plan and the SRS interval clamp. */
  examDate: string;
  newLimit: number;
  sessionLimit: number;
  /**
   * How tightly wrong options are drawn, and which cards the queue favours.
   * Defaults to `medium`, which is the behaviour that predates the setting,
   * so a store written before #36 back-fills to no change at all.
   */
  difficulty: Difficulty;
  /**
   * Whether the daily review draws only from the phase the study plan is
   * currently in (#38).
   *
   * Defaults to `true` — unlike `difficulty`, this one deliberately changes
   * behaviour for an account that predates it, because a plan the app ignored
   * was the complaint. A store written before this key back-fills to on, the
   * same way `difficulty` back-fills to `medium`: every reader trusts Settings
   * to be complete, so the gap is closed on the way in rather than guessed at
   * each call site.
   */
  followPlan: boolean;
  /**
   * ISO date (`YYYY-MM-DD`) the study plan is measured from, or `''` when this
   * account has never had one recorded (#38).
   *
   * The plan was decorative until #38 gated the daily review on it, and the
   * moment it stopped being decorative `buildSchedule`'s default start —
   * `new Date()` — became a bug: re-anchoring to "today" on every call puts
   * today inside week 1 forever, so the plan could never advance past Phase 1.
   * A schedule is only meaningful relative to a fixed origin, so the origin has
   * to be a stored fact rather than a re-derived one.
   *
   * Unlike `difficulty` and `followPlan`, the sensible default is not a
   * constant: it is "when this member actually started", which is only knowable
   * per-store. So the default here is the empty sentinel and the real answer is
   * derived by `planStartOf` in store-ops.ts, which reads the review log. The
   * spread-under-defaults in both hooks still applies — a store written before
   * this key resolves to `''` rather than `undefined`, which keeps Settings
   * complete for every reader and puts the "not recorded" case in one shape
   * instead of two.
   */
  planStart: string;
}

export interface SessionLog {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  reviewed: number;
  correct: number;
}

export interface Store {
  cards: Record<string, CardState>;
  settings: Settings;
  log: SessionLog[];
  /** Item ids the user has starred for focused review. */
  starred: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  examDate: '2026-10-31',
  newLimit: 20,
  sessionLimit: 60,
  difficulty: 'medium',
  followPlan: true,
  // Empty on purpose — see `Settings.planStart`. A literal date here would be
  // wrong for everybody the moment it was written; `planStartOf` resolves it.
  planStart: '',
};

export function emptyStore(): Store {
  return { cards: {}, settings: { ...DEFAULT_SETTINGS }, log: [], starred: [] };
}

/** Local calendar date, not UTC — otherwise the streak breaks late at night. */
export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function exportStore(store: Store): string {
  return JSON.stringify(store, null, 2);
}

export function importStore(json: string): Store | null {
  try {
    const parsed = JSON.parse(json) as Partial<Store>;
    if (typeof parsed !== 'object' || parsed === null) return null;
    return {
      cards: parsed.cards ?? {},
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      log: parsed.log ?? [],
      starred: parsed.starred ?? [],
    };
  } catch {
    return null;
  }
}
