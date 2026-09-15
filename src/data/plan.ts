import { copy } from '../copy';
import type { Topic } from './types';
import { BOOKS } from './books';

/**
 * A phased plan built backwards from the exam date. The ordering is deliberate:
 * the frame (order, summaries, key chapters) comes first, because every later
 * fact has to hang on something. Detail without a frame does not stick.
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
  /** Readonly because the strings come from `copy.ts`, which is `as const`. */
  drills: readonly string[];
}

export const PHASES: Phase[] = [
  {
    id: 'frame',
    ...copy.plan.phases['frame'],
    weight: 3,
    topics: ['oneline', 'essentials'],
    scope: 'all',
  },
  {
    id: 'ot-sweep',
    ...copy.plan.phases['ot-sweep'],
    weight: 3,
    topics: ['arc', 'names', 'cities', 'rituals'],
    scope: BOOKS.filter((b) => b.testament === 'OT').map((b) => b.id),
  },
  {
    id: 'nt-sweep',
    ...copy.plan.phases['nt-sweep'],
    weight: 2.5,
    topics: ['arc', 'names', 'cities', 'context'],
    scope: BOOKS.filter((b) => b.testament === 'NT').map((b) => b.id),
  },
  {
    id: 'connections',
    ...copy.plan.phases['connections'],
    weight: 2,
    topics: ['context', 'doctrine', 'essentials', 'arc'],
    scope: 'all',
  },
  {
    id: 'consolidate',
    ...copy.plan.phases['consolidate'],
    weight: 2,
    topics: ['arc', 'names', 'cities', 'context', 'oneline', 'rituals', 'essentials', 'doctrine'],
    scope: 'all',
  },
];

export interface PlannedWeek {
  index: number;
  start: Date;
  end: Date;
  phase: Phase;
  label: string;
}

/**
 * Slice the calendar between `startDate` and the exam into weeks, assigned by
 * phase weight.
 *
 * The `new Date()` default stays for the sake of a bare "what would a plan
 * starting today look like?" call, but it is no longer what the app relies on
 * (#40): every caller passes the member's stored anchor, because a schedule
 * that re-anchors to today on each render is a schedule whose week 1 never
 * ends. Prefer `currentWeek` / `currentPhase`, which require the anchor.
 */
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

/**
 * The week the calendar is currently sitting in, clamped to the schedule's ends.
 *
 * Two views computed this inline and identically (#40), Dashboard to name the
 * phase on its hero card, Plan to mark a row `now`, and a third caller then
 * arrived in Review, which is where a duplicated definition of "today" stops
 * being a tidiness problem and starts being a correctness one: the daily queue
 * and the schedule it claims to follow have to agree on which week it is.
 *
 * `planStartISO` is required rather than defaulted, and that is the whole
 * repair. The old shape let the anchor fall back to `new Date()`, which meant
 * every call rebuilt the schedule starting today, today always landed in week
 * 1, and the plan could never advance past Phase 1, invisible while the plan
 * was decorative, and a hard cap on what anyone could study once the review
 * began filtering on it. An optional anchor would let any future caller
 * reintroduce exactly that bug in silence; a required one makes the compiler
 * ask. Callers get the value from `planStartOf(store)` in lib/store-ops.ts.
 *
 * The window runs to the day *after* `end`, which is what both views already
 * did: `end` is midnight at the head of the last day, so without the extra day
 * the final day of every week would belong to no week at all.
 *
 * Now that the anchor is a stored fact, `now` can genuinely sit outside the
 * schedule, so both ends are clamped rather than answered with null:
 *
 * - **Before the first week** (an anchor set in the future): the first week.
 *   The plan has not started; Phase 1 is still what it is asking for.
 * - **Past the last week** (an anchor far enough back that the runway has run
 *   out): the last week. Returning nothing here would be the worst answer
 *   available, the member is out of time, and Phase 5's "no new material,
 *   mixed review" is precisely the advice for that.
 *
 * Null is left for the one case with no week to name at all: an empty
 * schedule, which happens only when the anchor is itself past the exam date.
 */
export function currentWeek(
  examISO: string,
  planStartISO: string,
  now = new Date(),
): PlannedWeek | null {
  // A hand-edited or imported `planStart` can be junk; an Invalid Date here
  // would make every week boundary NaN and every comparison false, so fall
  // back to `now`, the pre-#40 behaviour, which is at least well-defined.
  const parsed = new Date(`${planStartISO}T00:00:00`);
  const schedule = buildSchedule(examISO, Number.isNaN(parsed.getTime()) ? now : parsed);
  if (schedule.length === 0) return null;

  const first = schedule[0];
  const last = schedule[schedule.length - 1];
  if (now < first.start) return first;
  const window = (w: PlannedWeek) => new Date(w.end.getTime() + 86_400_000);
  if (now > window(last)) return last;
  return schedule.find((w) => now >= w.start && now <= window(w)) ?? last;
}

/**
 * The phase that week belongs to, what the study plan is asking of you today.
 *
 * Total, deliberately: there is no date on which the honest answer is "no
 * phase". The two ways to fall off the schedule both land on Phase 5, which is
 * why the fallback below is the last phase and not null:
 *
 * - The runway ran out, handled by `currentWeek`'s clamp above.
 * - The schedule is empty because the anchor is *after* the exam date, so
 *   `buildSchedule` filters every week away. That is a plan with no time in it
 *   at all: same situation, same answer.
 *
 * Callers that want "no filtering" (Review when the setting is off) express it
 * by not calling this, rather than by hoping for a null.
 */
export function currentPhase(examISO: string, planStartISO: string, now = new Date()): Phase {
  return currentWeek(examISO, planStartISO, now)?.phase ?? PHASES[PHASES.length - 1];
}
