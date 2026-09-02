import { useMemo } from 'react';
import { buildSchedule, currentWeek, PHASES } from '../data/plan';
import { isUsableExamDate } from '../lib/store-ops';
import { TOPIC_LABELS } from '../data/types';
import { planStartOf } from '../lib/store-ops';
import type { StoreApi } from '../lib/useStore';
import { Card, Field, space, sx } from '../ui';

const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function Plan({ api }: { api: StoreApi }) {
  const { store, updateSettings, daysLeft } = api;
  // The schedule is drawn from the member's stored plan start, not from today
  // (#40). Rebuilding it from `new Date()` on every render was what made every
  // week between the start and now silently disappear — the first row always
  // said "this week", so the view could only ever show a plan about to begin.
  const planStart = planStartOf(store);
  const schedule = useMemo(
    () => buildSchedule(store.settings.examDate, new Date(`${planStart}T00:00:00`)),
    [store.settings.examDate, planStart],
  );
  // Which row wears the `now` highlight is the same question the Dashboard and
  // the daily review ask, so it comes from the one helper (#40) and is matched
  // by index rather than re-testing the date range row by row.
  const active = useMemo(
    () => currentWeek(store.settings.examDate, planStart),
    [store.settings.examDate, planStart],
  );

  return (
    <div className="stack-in">
      <div className="section">
        <div className="spread">
          <h2 style={sx({ margin: 0 })}>Study Plan</h2>
          {/* This stays out of the Settings panel (#36) rather than being
              deduplicated into it: the quiz date is the single input this whole
              view is computed from, the schedule below rebuilds as you change
              it, and the empty state's advice ("move it forward") is only
              actionable with the field in reach. Same setting, written from two
              places — the store is the one copy. */}
          <Field label="Quiz date" htmlFor="exam">
            <input
              id="exam"
              className="ctl"
              type="date"
              value={store.settings.examDate}
              // Guarded exactly as the Settings copy of this field is: an
              // emptied or half-typed date commits NaN, which silently disables
              // the SRS exam clamp (#41).
              onChange={(e) => {
                const raw = e.target.value;
                if (isUsableExamDate(raw)) updateSettings({ examDate: raw });
              }}
            />
          </Field>
        </div>
        <p className="small muted" style={sx({ marginTop: space[3] })}>
          {daysLeft} days left. The plan below runs {schedule.length} weeks from the day you
          started, not from today, so it moves on as the weeks pass. The order matters: the frame
          first, then content, then connections, then mixed review. Detail learned before the frame
          has nothing to attach to.
        </p>
      </div>

      <div className="section">
        <Card corners kicker="Schedule">
          {schedule.length === 0 ? (
            <p className="small muted">
              No weeks to show — the quiz date above has already passed. Move it forward to rebuild
              the plan.
            </p>
          ) : (
            schedule.map((w, i) => {
              // Weeks can now genuinely be behind you, which they never could
              // while the schedule restarted at today (#40). Three states, from
              // the one `active` index rather than three date tests: done,
              // current, still to come. Deliberately not a new stylesheet rule
              // — `.week.now` already carries the highlight, and a past week
              // only needs to read as receded, so it dims and says so.
              const isNow = w.index === active?.index;
              const isPast = active != null && w.index < active.index;
              return (
                <div
                  className={`week${isNow ? ' now' : ''} item-in`}
                  style={sx({ '--stagger-i': i, opacity: isPast ? 0.5 : undefined })}
                  key={w.index}
                >
                  <div>
                    <div className="when">{fmt(w.start)} – {fmt(w.end)}</div>
                    <div className="tiny muted">{w.label}{isPast ? ' · past' : ''}</div>
                  </div>
                  <div>
                    <strong className="small">{w.phase.name.replace(/^Phase \d+ — /, '')}</strong>
                    <p className="small muted" style={sx({ margin: `${space[1]} 0 ${space[3]}` })}>
                      {w.phase.goal}
                    </p>
                    <div className="row">
                      {w.phase.topics.map((t) => <span className="pill" key={t}>{TOPIC_LABELS[t]}</span>)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      </div>

      <div className="section">
        <h2>What each phase actually asks of you</h2>
        <div className="grid two">
          {PHASES.map((p) => (
            <Card key={p.id}>
              <h3>{p.name}</h3>
              <p className="small muted">{p.goal}</p>
              <ul className="small" style={sx({ paddingLeft: 18, margin: 0 })}>
                {p.drills.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>How to study this material</h2>
        <Card>
          <p className="small">
            <strong>Retrieve before you re-read.</strong> Practice testing and spaced repetition are the
            two techniques a well-known review of ten study methods rated “high utility.” Re-reading
            a book summary feels productive and mostly is not. Close the page and say it out loud
            first; open it only to check.
          </p>
          <p className="small">
            <strong>Short and often beats long and rare.</strong> Bible quiz coaches say the same thing
            independently of the psychology literature: three 10-minute sessions in a day work better
            than one 2-hour block.
          </p>
          <p className="small">
            <strong>Mix topics rather than blocking them.</strong> Answering twenty Genesis questions in a
            row feels easier and teaches less than twenty questions drawn from everywhere. That is
            why the review queue interleaves by design.
          </p>
          <p className="small">
            <strong>Review is the whole game.</strong> New material every day without revisiting old
            material means you arrive on quiz day knowing the last two weeks well and everything else
            vaguely. The scheduler handles this for you — just clear your due cards.
          </p>
          <p className="small" style={sx({ marginBottom: 0 })}>
            <strong>Say it out loud.</strong> Reciting the 66 books, the eras, and the standing lists aloud
            while walking or driving costs nothing and is one of the most-recommended habits among
            competitive quizzers.
          </p>
        </Card>
      </div>
    </div>
  );
}
