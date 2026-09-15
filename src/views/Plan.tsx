import { useMemo } from 'react';
import { ANCHORED, PROVENANCE } from '../data/anchored';
import { buildSchedule, currentWeek, PHASES } from '../data/plan';
import { TOPIC_LABELS } from '../data/types';
import { planStartOf } from '../lib/store-ops';
import type { StoreApi } from '../lib/useStore';
import { copy } from '../copy';
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
          <h2 style={sx({ margin: 0 })}>{copy.plan.heading}</h2>
          {/* This stays out of the Settings panel (#36) rather than being
              deduplicated into it: the quiz date is the single input this whole
              view is computed from, the schedule below rebuilds as you change
              it, and the empty state's advice ("move it forward") is only
              actionable with the field in reach. Same setting, written from two
              places — the store is the one copy. */}
          <Field label={copy.plan.examDateLabel} htmlFor="exam">
            <input
              id="exam"
              className="ctl"
              type="date"
              value={store.settings.examDate}
              onChange={(e) => updateSettings({ examDate: e.target.value })}
            />
          </Field>
        </div>
        <p className="small muted" style={sx({ marginTop: space[3] })}>
          {copy.plan.summary(daysLeft, schedule.length)}
        </p>
      </div>

      <div className="section">
        <Card corners kicker={copy.plan.scheduleKicker}>
          {schedule.length === 0 ? (
            <p className="small muted">{copy.plan.datePassed}</p>
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

      {/* The guide sits above the phases because the phases are described in
          terms of the strands — a week labelled "A · N · C · R" means nothing
          until you have read what the letters are. */}
      <div className="section">
        <div className="spread">
          <h2 style={sx({ margin: 0 })}>{copy.strands.heading}</h2>
          <span className="pill accent">{copy.strands.kicker}</span>
        </div>
        <p className="small muted" style={sx({ maxWidth: 760 })}>{PROVENANCE}</p>
        <div className="grid two">
          {ANCHORED.map((s, i) => (
            <Card corners key={s.topic} className="item-in" style={sx({ '--stagger-i': i })}>
              {/* The provenance pill rides the footer rather than the heading:
                  beside a long title like "Cities & Geography" it wrapped onto
                  its own line on half the cards and sat inline on the rest. */}
              <h3 style={sx({ margin: 0 })}>
                <span className="mono" style={sx({ color: 'var(--color-accent-700)' })}>{s.letter}</span> — {s.name}
              </h3>
              <p className="small">{s.covers}</p>
              <div className="spread" style={sx({ alignItems: 'flex-end', gap: space[3] })}>
                <span className="tiny muted">{s.example}</span>
                <span className="pill" style={sx({ whiteSpace: 'nowrap' })}>{s.from}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>{copy.plan.phasesHeading}</h2>
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
        <h2>{copy.plan.methodHeading}</h2>
        <Card>
          {copy.plan.method.map((m, i) => (
            <p className="small" key={m.lead} style={sx(i === copy.plan.method.length - 1 ? { marginBottom: 0 } : {})}>
              <strong>{m.lead}</strong> {m.body}
            </p>
          ))}
        </Card>
      </div>
    </div>
  );
}
