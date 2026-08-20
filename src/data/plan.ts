import type { Topic } from './types';
import { BOOKS } from './books';

/**
 * A phased plan built backwards from the exam date. The ordering is deliberate:
 * the frame (order, summaries) comes first, because every later fact has to
 * hang on something. Detail without a frame does not stick.
 */
export interface Phase {
  id: string;
  name: string;
  goal: string;
  /** Share of the remaining time, normalized against the other phases. */
  weight: number;
  topics: Topic[];
  /** Book ids to focus on, or 'all'. */
  scope: string[] | 'all';
  drills: string[];
}

export const PHASES: Phase[] = [
  {
    id: 'frame',
    name: 'Phase 1 — Build the Frame',
    goal: 'Know all 66 books cold: order and one-sentence summary. Nothing else sticks without this.',
    weight: 3,
    topics: ['book-order', 'summaries'],
    scope: 'all',
    drills: [
      'Recite the 66 books in order out loud, daily',
      'Match each book to its one-line summary',
    ],
  },
  {
    id: 'ot-sweep',
    name: 'Phase 2 — Old Testament Sweep',
    goal: 'Walk the OT storyline book by book: key chapters, people, and events.',
    weight: 3,
    topics: ['chapters', 'people', 'relationships', 'events', 'places'],
    scope: BOOKS.filter((b) => b.testament === 'OT').map((b) => b.id),
    drills: [
      'For each book, say its key chapters and what happens in them',
      'Tell the OT story start to finish in five minutes, no notes',
      'Identify every major character from a one-line clue',
      'Name the father, mother, spouse, or tribe of any figure called out',
    ],
  },
  {
    id: 'nt-sweep',
    name: 'Phase 3 — New Testament Sweep',
    goal: 'Walk the NT: Gospels, Acts, the letters — audience and occasion — and Revelation.',
    weight: 2.5,
    topics: ['chapters', 'people', 'relationships', 'events', 'places'],
    scope: BOOKS.filter((b) => b.testament === 'NT').map((b) => b.id),
    drills: [
      'Name all 13 Pauline letters in order and their one-line point',
      'Trace Paul’s journeys through Acts, city by city',
      'Distinguish the four Gospels by audience and emphasis',
      'For each letter: to whom, from where, and why',
    ],
  },
  {
    id: 'connections',
    name: 'Phase 4 — Timeline & Connections',
    goal: 'Lock the chronology and the standing lists, then connect books to eras.',
    weight: 2,
    topics: ['timeline', 'numbers', 'summaries', 'christ'],
    scope: 'all',
    drills: [
      'Put the 14 eras in order from memory',
      'Recite the ten plagues, the twelve apostles, the fruit of the Spirit',
      'Place every book on the timeline',
      'Memorize the two fall dates: 722 BC and 586 BC',
      'For each book, say in one sentence how it points to Christ',
    ],
  },
  {
    id: 'consolidate',
    name: 'Phase 5 — Mixed Review & Mock Quizzes',
    goal: 'No new material. Mixed review, weak spots, and full-length practice under time.',
    weight: 2,
    topics: ['book-order', 'summaries', 'chapters', 'people', 'relationships', 'events', 'places', 'timeline', 'numbers', 'christ'],
    scope: 'all',
    drills: [
      'Take a 40-question mixed quiz every other day',
      'Drill only what you have missed twice or more',
      'Re-recite the 66 books and the timeline daily',
    ],
  },
];

export interface PlannedWeek {
  index: number;
  start: Date;
  end: Date;
  phase: Phase;
  label: string;
}

/** Slice the calendar between now and the exam into weeks, assigned by phase weight. */
export function buildSchedule(examISO: string, startDate = new Date()): PlannedWeek[] {
  const exam = new Date(`${examISO}T23:59:59`);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const totalDays = Math.max(7, Math.ceil((exam.getTime() - start.getTime()) / 86_400_000));
  const totalWeeks = Math.max(1, Math.floor(totalDays / 7));
  const totalWeight = PHASES.reduce((n, p) => n + p.weight, 0);

  // Distribute weeks proportionally, guaranteeing each phase at least one week
  // when there is room for it.
  const counts = PHASES.map((p) => Math.max(1, Math.round((p.weight / totalWeight) * totalWeeks)));
  let drift = counts.reduce((a, b) => a + b, 0) - totalWeeks;
  for (let i = counts.length - 1; drift > 0 && i >= 0; i--) {
    while (drift > 0 && counts[i] > 1) {
      counts[i]--;
      drift--;
    }
  }
  while (drift < 0) {
    counts[counts.length - 1]++;
    drift++;
  }

  const weeks: PlannedWeek[] = [];
  let cursor = new Date(start);
  let index = 1;
  PHASES.forEach((phase, pi) => {
    for (let w = 0; w < counts[pi]; w++) {
      const weekStart = new Date(cursor);
      const weekEnd = new Date(cursor);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weeks.push({
        index,
        start: weekStart,
        end: weekEnd > exam ? exam : weekEnd,
        phase,
        label: `Week ${index}`,
      });
      cursor.setDate(cursor.getDate() + 7);
      index++;
    }
  });

  return weeks.filter((w) => w.start <= exam);
}
