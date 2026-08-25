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
   * currently in (#40).
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
   * account has never had one recorded (#40).
   *
   * The plan was decorative until #40 gated the daily review on it, and the
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
  /**
   * Per-focus-track quiz dates, keyed by track id — `{}` for an account that
   * has never moved one.
   *
   * A focus track is a separate course with a separate test (see
   * data/tracks.ts), so it cannot share `examDate`: the survey is scheduled
   * against one date and a Samuel test against another, and a single field
   * would make setting either one wrong the other. Keyed rather than a second
   * flat date because tracks are data — a second track is a new entry in
   * `TRACKS`, and it must not also be a new key here.
   *
   * The default is the empty map, not a map pre-filled from `TRACKS`. Same
   * reasoning as `planStart`: the honest default is not a constant this file
   * can name, it is the track's own `defaultExam`, and a copy of that value
   * sitting in every store would go stale the moment the track's date was
   * corrected. So the map holds only what the member has actually chosen, and
   * `trackExamOf` in store-ops.ts resolves the rest — including a hand-edited
   * or unparseable entry, which falls back rather than poisoning the clamp.
   *
   * Back-compatibility is the usual one: both hooks and `importStore` spread
   * `DEFAULT_SETTINGS` underneath the saved settings, so a store written before
   * this key reads as `{}` rather than `undefined` and every reader still gets
   * a complete Settings.
   */
  trackExams: Record<string, string>;
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
  // Empty on purpose — see `Settings.trackExams`. Each track carries its own
  // default date; `trackExamOf` is what reads it.
  trackExams: {},
};

export function emptyStore(): Store {
  // `trackExams` is cloned rather than carried by reference: the spread of
  // DEFAULT_SETTINGS is shallow, so every empty store would otherwise share one
  // map object with the module constant. Nothing mutates it today — settings are
  // always replaced wholesale — but a shared mutable default is the kind of
  // thing that is free to prevent and expensive to find.
  return {
    cards: {},
    settings: { ...DEFAULT_SETTINGS, trackExams: { ...DEFAULT_SETTINGS.trackExams } },
    log: [],
    starred: [],
  };
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
    const settings = { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) };
    // Same clone as emptyStore, for the same reason: an import whose settings
    // predate the key would otherwise carry the module constant's own map.
    settings.trackExams = { ...settings.trackExams };
    return {
      cards: parsed.cards ?? {},
      settings,
      log: parsed.log ?? [],
      starred: parsed.starred ?? [],
    };
  } catch {
    return null;
  }
}
