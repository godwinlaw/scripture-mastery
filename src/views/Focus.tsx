/**
 * A focus track's study screen — one view, parameterised by track.
 *
 * Deliberately not `Samuel.tsx`. Everything specific to a track is data in
 * data/tracks.ts (name, books, default test date, blurb); this file knows only
 * that a track has some books and a date, so a second track is a new entry in
 * `TRACKS` and no code change at all.
 *
 * It is a near-twin of Daily Review, and that is the point rather than an
 * accident: "similar style, just a separate group" was the request, so the
 * session flow, the grading, the requeue policy and the summary screen are
 * Review's, mirrored step for step. Where it diverges it does so on purpose,
 * and each divergence is commented below. There are four:
 *
 *   1. **Scope is the track's books**, fixed, and the study plan does not
 *      filter it. A track is not a phase of the plan — it is a parallel course
 *      with its own deadline — so `followPlan` has no vote here.
 *   2. **No widening.** Review rescues an empty queue by dropping the plan
 *      filter and drawing from the whole bank, because a calendar may reorder
 *      your study but not cancel it. That rescue is wrong here: widening a
 *      Samuel session into Revelation is not a rescue, it is the wrong deck.
 *      An exhausted track says so and sends you away.
 *   3. **Grading clamps against the track's test date**, not the survey's — see
 *      `handleGrade`. This is the whole reason a track is more than a filter.
 *   4. **A fourth plate**, mastery across the track, because a track is small
 *      enough that "how much of this do I actually know?" is a question with a
 *      useful answer. Over six thousand items it is not.
 *
 * Card state is **shared** with the survey, on purpose. A 1 Samuel card studied
 * here is the same card as in Daily Review, with one schedule and one history:
 * `cards` is keyed by item id and this view scopes which ids a session draws
 * from, it does not copy them. Duplicating would give the same fact two
 * schedules that disagree, and count it twice in every mastery figure in the
 * app. The visible consequence is intended — work done here shortens tomorrow's
 * daily review, and vice versa.
 */
import { useMemo, useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import { allItems, ITEMS_BY_ID } from '../lib/generate';
import { DIFFICULTIES, type Difficulty, type Item } from '../data/types';
import type { FocusTrack } from '../data/tracks';
import { specFor } from '../lib/difficulty';
import { buildQueue, isDue, isNew, strength, type ItemMeta, type Grade } from '../lib/srs';
import { todayISO } from '../lib/storage';
import {
  daysLeftUntil,
  isUsableExamDate,
  trackExamDateOf,
  trackExamOf,
} from '../lib/store-ops';
import type { StoreApi } from '../lib/useStore';
import { copy } from '../copy';
import { Card, Corners, CountUp, Field, Meter, Segmented, sx, space } from '../ui';

/**
 * The track's items and their queue metadata, computed once per track.
 *
 * Same reasoning as Review's module-level `ITEM_META`: the bank is thousands of
 * items and never changes at runtime, while `cards` changes on every answer, so
 * this cannot sit in a `useMemo` keyed on store state without re-filtering the
 * whole bank each time a card is graded. Cached by track id rather than built
 * for all tracks eagerly, so an unvisited track costs nothing.
 */
const SCOPES = new Map<string, { items: Item[]; meta: Record<string, ItemMeta> }>();

function scopeFor(track: FocusTrack): { items: Item[]; meta: Record<string, ItemMeta> } {
  const cached = SCOPES.get(track.id);
  if (cached) return cached;
  const books = new Set(track.books);
  // `i.book` is the only membership test available and the only one that stays
  // correct: item ids encode a generator prefix, not a book, so matching on the
  // id would quietly miss whole question kinds.
  const items = allItems().filter((i) => i.book !== undefined && books.has(i.book));
  const meta: Record<string, ItemMeta> = {};
  for (const item of items) meta[item.id] = { tier: item.tier, book: item.book };
  const scope = { items, meta };
  SCOPES.set(track.id, scope);
  return scope;
}

const DIFFICULTY_OPTIONS = DIFFICULTIES.map((value) => ({
  label: copy.settings.difficulty.options[value].label,
  value,
}));

export default function Focus({ track, api }: { track: FocusTrack; api: StoreApi }) {
  const { store, cards, answer, toggleStar, updateSettings } = api;
  const { items, meta } = scopeFor(track);

  const [queue, setQueue] = useState<string[]>([]);
  const [pos, setPos] = useState(0);
  const [tally, setTally] = useState({ right: 0, wrong: 0 });
  const [requeues, setRequeues] = useState<Record<string, number>>({});
  const [started, setStarted] = useState(false);

  /**
   * What the date field shows, which is not the same thing as what the store
   * holds — the pattern Settings.tsx uses and for the same reason. Clamping the
   * rendered value would make the field miserable to edit: a half-typed date is
   * a state of the input, not an instruction to un-set the test date. The draft
   * is free, only the commit is guarded, and the field re-syncs on blur to show
   * what was actually saved.
   */
  const [dateDraft, setDateDraft] = useState(() => trackExamDateOf(store, track));

  /**
   * The ceiling every interval graded on this screen is clamped under.
   *
   * Never NaN — `trackExamOf` guarantees that, and it matters: a NaN exam time
   * does not throw, it silently switches the SRS clamp off, and cards start
   * scheduling past the date they are being studied for.
   */
  const examTime = trackExamOf(store, track);
  const daysLeft = daysLeftUntil(examTime);
  const examLabel = new Date(examTime).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });

  /** The new-card limit after the difficulty's own scaling — what buildQueue will take. */
  const newToday = Math.max(
    0,
    Math.round(store.settings.newLimit * specFor(store.settings.difficulty).newLimitFactor),
  );

  /**
   * The four plates. Three describe the session about to be dealt, one does not.
   *
   * Review's rule, kept: "Due now" and "New today" are promises about what the
   * button will hand you, so they count inside exactly what the queue will draw
   * from — and "New today" is capped at the difficulty-scaled limit, because a
   * plate reading 20 above a session that deals 30 is simply a lie. "Seen so
   * far" and "Mastery" are progress across the whole track and are deliberately
   * not session figures; mastery in particular has to be measured over every
   * item in the track, including the ones today will not touch, or it would
   * climb by ignoring material rather than by learning it.
   */
  const counts = useMemo(() => {
    const now = Date.now();
    let due = 0;
    let fresh = 0;
    let totalStrength = 0;
    for (const it of items) {
      const c = cards[it.id];
      if (isNew(c)) fresh++;
      else if (isDue(c, now)) due++;
      totalStrength += strength(c);
    }
    return {
      due,
      fresh,
      total: items.length,
      mastery: items.length ? Math.round((totalStrength / items.length) * 100) : 0,
    };
  }, [cards, items]);

  function start() {
    setQueue(
      buildQueue(
        items.map((i) => i.id),
        cards,
        {
          newLimit: store.settings.newLimit,
          sessionLimit: store.settings.sessionLimit,
          difficulty: store.settings.difficulty,
          meta,
          // Seeded per day rather than per session, exactly as Review does:
          // reloading the page mid-session must not reshuffle the new cards out
          // from under you, but tomorrow should not open on today's order.
          seed: todayISO(),
        },
      ),
    );
    setPos(0);
    setTally({ right: 0, wrong: 0 });
    setRequeues({});
    setStarted(true);
  }

  function handleGrade(g: Grade) {
    const id = queue[pos];

    /**
     * Graded against the *track's* test date, not the survey's.
     *
     * The clamp is the one place this app departs from SM-2, and the only
     * guarantee that a card is seen once more before the test. A Samuel card
     * clamped under the survey's October date could schedule straight past the
     * test on the 30th — which does not break loudly, it just quietly stops
     * protecting the thing being studied.
     */
    answer(id, g, examTime);

    setTally((t) => (g === 0 ? { ...t, wrong: t.wrong + 1 } : { ...t, right: t.right + 1 }));
    // Review's requeue policy verbatim: a missed card comes back at the end of
    // the session, but at most twice, and on hard not at all — a second look
    // minutes after the first is recognition, not recall.
    if (g === 0 && specFor(store.settings.difficulty).requeueMissed && (requeues[id] ?? 0) < 2) {
      setRequeues((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }));
      setQueue((q) => [...q, id]);
    }
    setPos((p) => p + 1);
  }

  function commitDate(raw: string) {
    setDateDraft(raw);
    // A cleared or half-entered date is a state of the input, not an
    // instruction to un-set the test date. And the map is merged by hand: the
    // settings patch is a shallow spread, so writing `{ [track.id]: raw }` bare
    // would drop every other track's date.
    if (!isUsableExamDate(raw)) return;
    updateSettings({ trackExams: { ...store.settings.trackExams, [track.id]: raw } });
  }

  if (!started) {
    const canStart = counts.due + counts.fresh > 0;
    return (
      <div className="section screen" key="idle">
        <h2>{track.name}</h2>
        <p className="muted small">{track.blurb}</p>

        <Card corners style={sx({ marginTop: space[6] })}>
          <div className="spread">
            <div>
              <strong className="small">
                {copy.focus.countdown(daysLeft, examLabel)}
              </strong>
              <p className="tiny muted" style={sx({ margin: `${space[1]} 0 0`, maxWidth: '62ch' })}>
                {copy.focus.examNote}
              </p>
            </div>
            <Field label={copy.focus.examDate} htmlFor={`focus-exam-${track.id}`}>
              <input
                id={`focus-exam-${track.id}`}
                className="ctl"
                type="date"
                value={dateDraft}
                onChange={(e) => commitDate(e.target.value)}
                onBlur={() => setDateDraft(trackExamDateOf(store, track))}
              />
            </Field>
          </div>

          {/* The difficulty control sits in the track rather than only in
              Settings because this is where the reader is studying, and a
              setting you have to leave the screen to change is a setting you
              do not change. It writes the one global `difficulty` the whole app
              reads — there is no per-track difficulty, and the note says so, so
              nobody discovers it by finding Daily Review changed underneath
              them. */}
          <div
            className="spread"
            style={sx({
              marginTop: space[6],
              paddingTop: space[6],
              borderTop: '1px solid var(--color-divider)',
            })}
          >
            <div>
              <strong className="small">{copy.focus.difficultyCaption}</strong>
              <p className="tiny muted" style={sx({ margin: `${space[1]} 0 0`, maxWidth: '62ch' })}>
                {copy.focus.difficultyNote}
              </p>
            </div>
            <Segmented
              ariaLabel={copy.settings.difficulty.label}
              options={DIFFICULTY_OPTIONS}
              value={store.settings.difficulty}
              onChange={(next: Difficulty) => updateSettings({ difficulty: next })}
            />
          </div>
        </Card>

        <div className="grid four stack-in" style={sx({ margin: `${space[6]} 0` })}>
          <Card className="stat">
            <span className="n"><CountUp value={counts.due} /></span>
            <span className="k">{copy.focus.plates.due}</span>
          </Card>
          <Card className="stat">
            <span className="n"><CountUp value={Math.min(counts.fresh, newToday)} /></span>
            <span className="k">{copy.focus.plates.new}</span>
          </Card>
          <Card className="stat">
            <span className="n"><CountUp value={counts.total - counts.fresh} /></span>
            <span className="k">{copy.focus.plates.seen}</span>
          </Card>
          <Card className="stat">
            <span className="n"><CountUp value={counts.mastery} />%</span>
            <span className="k">{copy.focus.plates.mastery}</span>
          </Card>
        </div>

        <div className="row">
          <button className="btn primary" onClick={() => start()} disabled={!canStart}>
            {copy.focus.start}
          </button>
        </div>
        {!canStart && (
          <p className="small muted" style={sx({ marginTop: space[3] })}>
            {copy.focus.nothingDue}
          </p>
        )}
        <p className="tiny muted" style={sx({ marginTop: space[6], maxWidth: '68ch' })}>
          {copy.focus.sharedHistory}
        </p>
      </div>
    );
  }

  if (pos >= queue.length) {
    const total = tally.right + tally.wrong;
    const accuracy = total ? Math.round((tally.right / total) * 100) : 0;
    return (
      <div className="section screen" key="complete">
        <h2>{copy.focus.session.completeHeading}</h2>
        <p className="muted small">{copy.focus.session.completeBody}</p>
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
          <button className="btn primary" onClick={() => start()}>
            {copy.focus.session.again}
          </button>
          <button className="btn" onClick={() => setStarted(false)}>
            {copy.focus.session.done}
          </button>
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
        Keyed on the queue position, not the item id — Review's fix, and it has
        to be repeated here because the bug belongs to the requeue policy this
        view shares, not to that file.

        A missed card is appended to the queue, and when it was the last entry
        the copy lands immediately after itself: `queue[pos + 1] === queue[pos]`.
        Keyed by id, that key does not change, so React reuses the mounted
        QuestionCard — which resets itself from an effect keyed on `item.id`,
        also unchanged. The card came back still revealed, showing its answer
        and a Continue button, and pressing Continue graded the same miss again:
        three reps and three lapses out of one miss. Position is unique per step
        by construction, so a repeated id still remounts and asks it cold, which
        is the only reason to requeue it at all.
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
        <button className="btn sm" onClick={() => setStarted(false)}>
          {copy.focus.session.end}
        </button>
        <span className="tiny muted">{tally.right} right · {tally.wrong} missed</span>
      </div>
    </div>
  );
}
