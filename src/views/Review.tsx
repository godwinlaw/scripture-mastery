import { useMemo, useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import { allItems, ITEMS_BY_ID } from '../lib/generate';
import { currentPhase } from '../data/plan';
import { planStartOf } from '../lib/store-ops';
import { planScopeIds, withTopUp } from '../lib/plan-scope';
import { specFor } from '../lib/difficulty';
import { buildQueue, isDue, isNew, type ItemMeta, type Grade } from '../lib/srs';
import { todayISO } from '../lib/storage';
import type { StoreApi } from '../lib/useStore';
import { copy } from '../copy';
import { Card, Corners, CountUp, Meter, sx, space } from '../ui';

/**
 * Per-item metadata for the queue builder, built once for the process.
 *
 * The bank is ~6,000 items and never changes at runtime, while `cards` changes
 * on every answer — so this cannot live in a `useMemo` keyed on store state
 * without rebuilding six thousand objects each time a card is graded.
 */
const ITEM_META: Record<string, ItemMeta> = (() => {
  const meta: Record<string, ItemMeta> = {};
  for (const item of allItems()) meta[item.id] = { tier: item.tier, book: item.book };
  return meta;
})();

export default function Review({ api }: { api: StoreApi }) {
  const { store, cards, answer, toggleStar } = api;
  const items = allItems();

  const [queue, setQueue] = useState<string[]>([]);
  const [pos, setPos] = useState(0);
  const [tally, setTally] = useState({ right: 0, wrong: 0 });
  const [requeues, setRequeues] = useState<Record<string, number>>({});
  const [started, setStarted] = useState(false);

  /**
   * The phase the plan is asking for today, or null when the setting is off.
   *
   * `currentPhase` is total — there is no date on which "no phase" is the
   * honest answer, and a member who has run out of runway belongs in Phase 5's
   * mixed review rather than nowhere — so the setting is the only thing that
   * can switch the plan off here. The anchor is the persisted plan start, not
   * today: passing `new Date()` is what pinned every member to Phase 1
   * forever, because today is always inside week 1 of a schedule that begins
   * today (#40).
   *
   * Every decision below reads this one value, so the screen cannot claim to
   * be following a phase the queue is ignoring.
   */
  const phase = store.settings.followPlan
    ? currentPhase(store.settings.examDate, planStartOf(store))
    : null;

  /**
   * The ids the plan puts in scope today, in the bank's own order.
   *
   * Shared by the counts and the queue on purpose: the idle screen promises a
   * number of due cards and then hands you a session, and those two have to be
   * counting the same material or the promise is a lie.
   */
  const scopedIds = useMemo(() => {
    if (!phase) return null;
    const inScope = planScopeIds(phase, items);
    return items.filter((i) => inScope.has(i.id)).map((i) => i.id);
  }, [phase, items]);

  /**
   * The three plates, counted inside whatever the session will actually draw
   * from — plus one figure that is deliberately counted outside it.
   *
   * `bankActionable` exists because the plates alone would lock the reader out:
   * a phase whose material is all seen and none of it yet due shows zeroes,
   * while `start` would happily widen and hand over a full session. The button
   * has to follow the queue's rule, not the plates'.
   */
  /** The new-card limit after the difficulty's own scaling — what buildQueue will take. */
  const newToday = Math.max(
    0,
    Math.round(store.settings.newLimit * specFor(store.settings.difficulty).newLimitFactor),
  );

  /**
   * The three plates answer two different questions, so they are counted two
   * different ways.
   *
   * `due` and `fresh` describe *this session*: what it is about to ask. They
   * therefore follow the same rule the queue does — revision from anywhere,
   * new material from the phase — because a plate that promises one number and
   * then hands over a different one is worse than no plate.
   *
   * `seen` describes *your progress*, which is not a property of today's
   * session at all. Counting it inside the phase would mean the work you did
   * in Phase 1 disappeared from the screen the week Phase 2 began.
   */
  const counts = useMemo(() => {
    const now = Date.now();
    const inScope = scopedIds ? new Set(scopedIds) : null;
    let due = 0, fresh = 0, seen = 0, bankActionable = 0;
    for (const it of items) {
      const c = cards[it.id];
      if (isNew(c) || isDue(c, now)) bankActionable++;
      if (!isNew(c)) {
        seen++;
        if (isDue(c, now)) due++;
        continue;
      }
      if (inScope && !inScope.has(it.id)) continue;
      fresh++;
    }
    return { due, fresh, seen, total: items.length, bankActionable };
  }, [cards, items, scopedIds]);

  function start(ignorePlan = false) {
    const allIds = items.map((i) => i.id);
    const { sessionLimit } = store.settings;

    /**
     * Widening is measured on the cards a session could actually contain, not
     * on the raw scope.
     *
     * `withTopUp` takes id lists, and a phase's raw scope always holds several
     * hundred items — so handing it the unfiltered lists would mean the top-up
     * never fires, and the starvation it exists to prevent is not "the phase is
     * small" but "the phase is exhausted": late in a phase everything in it has
     * been seen and nothing is due yet. Filtering to due-or-new first is what
     * makes the widening answer that. It is free of side effects on the queue —
     * buildQueue discards anything that is neither due nor new anyway, and the
     * pre-filter preserves order, so the new-card cut is untouched.
     */
    const actionable = (id: string) => isNew(cards[id]) || isDue(cards[id]);

    /**
     * The plan rations *new* material. It does not get to withhold a card that
     * is already due.
     *
     * Scoping both together silently broke the one guarantee the scheduler
     * makes. `grade()` clamps every interval so nothing is scheduled past the
     * quiz date without one more look at it — but a due date is only a promise
     * if something acts on it. Phases 2 through 4 do not list `book-order`
     * among their topics, so scoping due cards by phase meant every card built
     * during Phase 1 fell out of the queue for the five or six weeks those
     * phases run, however overdue it got. The widening could not save it
     * either: `withTopUp` fires only when the phase cannot fill a session, and
     * a phase holding three thousand items always can.
     *
     * So the two are scoped separately. New cards come from the phase, which is
     * what "follow the plan" means — you are not introduced to the Epistles in
     * week two. Due cards come from wherever they are, which is what spaced
     * repetition means.
     */
    const inScope = scopedIds ? new Set(scopedIds) : null;
    const admits = (id: string) => {
      const c = cards[id];
      if (!isNew(c) && isDue(c)) return true;
      return isNew(c) && (!inScope || inScope.has(id));
    };
    const ids =
      ignorePlan || !scopedIds
        ? allIds
        : withTopUp(allIds.filter(admits), allIds.filter(actionable), sessionLimit);

    const build = (from: string[]) =>
      buildQueue(from, cards, {
        newLimit: store.settings.newLimit,
        sessionLimit,
        difficulty: store.settings.difficulty,
        meta: ITEM_META,
        // Seeded per day rather than per session: reloading the page mid-review
        // must not reshuffle the new cards out from under you, but tomorrow's
        // session should not open on the same order as today's.
        seed: todayISO(),
      });

    // The second starvation guard, and the one that catches what `withTopUp`
    // structurally cannot. The top-up counts candidates; buildQueue applies the
    // new-card limit *after* it, so a phase holding hundreds of untouched cards
    // and nothing due looks well stocked to the top-up and still yields an
    // empty queue once `newLimit` is 0. An empty session is the single output
    // this feature must never produce — a calendar may reorder your study, not
    // cancel it — so the plan filter drops entirely rather than hand back
    // nothing.
    const q = build(ids);
    setQueue(q.length === 0 && !ignorePlan && scopedIds ? build(allIds) : q);
    setPos(0);
    setTally({ right: 0, wrong: 0 });
    setRequeues({});
    setStarted(true);
  }

  function handleGrade(g: Grade) {
    const id = queue[pos];
    answer(id, g);
    setTally((t) => (g === 0 ? { ...t, wrong: t.wrong + 1 } : { ...t, right: t.right + 1 }));
    // A failed card comes back at the end of the session rather than disappearing,
    // but only twice — otherwise a card you cannot get keeps the session open forever.
    //
    // On hard it does not come back at all (#40): a second look minutes after
    // the first is recognition, not recall, and hard's whole premise is that you
    // meet the card again cold. The cap still governs wherever requeueing is on.
    if (g === 0 && specFor(store.settings.difficulty).requeueMissed && (requeues[id] ?? 0) < 2) {
      setRequeues((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }));
      setQueue((q) => [...q, id]);
    }
    setPos((p) => p + 1);
  }

  if (!started) {
    // What the session can actually deal, not what is theoretically available.
    // `fresh` counts every unseen card in scope, but the queue will only
    // introduce `newToday` of them — so a phase holding nothing but new cards
    // with a new-card limit of 0 offered an enabled Start button that dealt an
    // empty session and jumped straight to "Session complete — 0 answered"
    // (#41). Settings clamps the limit above 0, but an imported store or one
    // written by an older build does not have to.
    const inPhase = counts.due + Math.min(counts.fresh, newToday);
    const canStart = inPhase > 0 || (phase !== null && counts.bankActionable > 0);
    const widening = phase !== null && inPhase === 0 && counts.bankActionable > 0;
    return (
      <div className="section screen" key="idle">
        <h2>Daily Review</h2>
        <p className="muted small">
          Spaced repetition over everything you have unlocked. Cards you miss come back sooner;
          cards you know get pushed out — but never past your exam date.
        </p>
        {phase && (
          // Said before the session starts, not discovered inside it: a reader
          // who does not know the queue is scoped will read a short session as
          // a bug, and the way out has to be one click from the same screen.
          <p className="small" style={sx({ marginTop: space[3] })}>
            {copy.settings.followPlan.activeOn(phase.name)}{' '}
            <span className="muted">{phase.goal}</span>
          </p>
        )}
        <div className="grid three stack-in" style={sx({ margin: `${space[6]} 0` })}>
          <Card className="stat">
            <span className="n"><CountUp value={counts.due} /></span>
            <span className="k">Due now</span>
          </Card>
          <Card className="stat">
            {/*
              * The plate has to promise the number the session will actually
              * take. The setting scales the new-card limit — hard introduces
              * half again as much — so reading the raw setting here would say
              * 20 and then deal 30 (#40).
              */}
            <span className="n"><CountUp value={Math.min(counts.fresh, newToday)} /></span>
            <span className="k">New today</span>
          </Card>
          <Card className="stat">
            <span className="n"><CountUp value={counts.seen} /></span>
            <span className="k">Seen so far</span>
          </Card>
        </div>
        <div className="row">
          <button className="btn primary" onClick={() => start()} disabled={!canStart}>
            Start review session
          </button>
          {phase && (
            <button className="btn" onClick={() => start(true)} disabled={counts.bankActionable === 0}>
              {copy.settings.followPlan.studyEverything}
            </button>
          )}
        </div>
        {widening && (
          <p className="small muted" style={sx({ marginTop: space[3] })}>
            Nothing is left waiting in this phase, so today’s session widens to the rest of the bank.
          </p>
        )}
        {!canStart && (
          <p className="small muted" style={sx({ marginTop: space[3] })}>
            Nothing is due right now. Take a mixed quiz instead, or raise your daily new-card limit in Progress.
          </p>
        )}
      </div>
    );
  }

  if (pos >= queue.length) {
    const total = tally.right + tally.wrong;
    const accuracy = total ? Math.round((tally.right / total) * 100) : 0;
    return (
      <div className="section screen" key="complete">
        <h2>Session complete</h2>
        <p className="muted small">
          That's everything queued for today. Come back tomorrow, or start another session now.
        </p>
        <div className="grid three stack-in" style={sx({ margin: `${space[6]} 0` })}>
          <Card className="stat">
            <span className="n"><CountUp value={total} /></span>
            <span className="k">Answered</span>
          </Card>
          <Card className="stat">
            <span className="n"><CountUp value={tally.right} /></span>
            <span className="k">Correct</span>
          </Card>
          <Card className="stat">
            <span className="n"><CountUp value={accuracy} />%</span>
            <span className="k">Accuracy</span>
          </Card>
        </div>
        <div className="row">
          <button className="btn primary" onClick={() => start()}>Another session</button>
          <button className="btn" onClick={() => setStarted(false)}>Done</button>
        </div>
      </div>
    );
  }

  const item = ITEMS_BY_ID.get(queue[pos])!;

  return (
    <div className="section screen" key="session">
      <div style={sx({ marginBottom: space[4] })}>
        <Meter value={pos} max={queue.length} label={`${pos} of ${queue.length} answered`} />
      </div>
      {/*
        Keyed on the queue position, not the item id (#40).

        A missed card is appended to the queue, and when it was the last entry
        the copy lands immediately after itself: `queue[pos + 1] === queue[pos]`.
        Keyed by id, that key does not change, so React reuses the mounted
        QuestionCard — and QuestionCard resets itself from an effect keyed on
        `item.id`, which does not change either. The card came back still
        revealed, still showing "Not quite" with its answer and a Continue
        button, and pressing Continue graded the same miss a second and third
        time: three reps, three lapses and three log entries from one miss,
        one short of the four that mark an item a leech.
        Position is unique per step by construction, so the same id repeating
        back-to-back still remounts the card and asks it cold — which is the
        only reason to requeue it at all.
      */}
      <div className="card-swap" key={pos} style={sx({ position: 'relative' })}>
        <Corners />
        <QuestionCard
          item={item}
          onGrade={handleGrade}
          starred={store.starred.includes(item.id)}
          onToggleStar={() => toggleStar(item.id)}
          counter={`${pos + 1} / ${queue.length}`}
          difficulty={store.settings.difficulty}
        />
      </div>
      <div className="row" style={sx({ marginTop: space[4] })}>
        <button className="btn sm" onClick={() => setStarted(false)}>End session</button>
        <span className="tiny muted">{tally.right} right · {tally.wrong} missed</span>
      </div>
    </div>
  );
}
