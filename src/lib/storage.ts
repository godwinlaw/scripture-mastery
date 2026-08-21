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
