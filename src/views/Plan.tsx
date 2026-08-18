import { useMemo } from 'react';
import { buildSchedule, PHASES } from '../data/plan';
import { TOPIC_LABELS } from '../data/types';
import type { StoreApi } from '../lib/useStore';

const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function Plan({ api }: { api: StoreApi }) {
  const { store, updateSettings, daysLeft } = api;
  const schedule = useMemo(() => buildSchedule(store.settings.examDate), [store.settings.examDate]);
  const now = new Date();

  return (
    <div>
      <div className="section">
        <div className="spread">
          <h2 style={{ margin: 0 }}>Study Plan</h2>
          <div className="row">
            <label className="tiny muted" htmlFor="exam">Quiz date</label>
            <input
              id="exam"
              className="ctl"
              type="date"
              value={store.settings.examDate}
              onChange={(e) => updateSettings({ examDate: e.target.value })}
            />
          </div>
        </div>
        <p className="small muted" style={{ marginTop: 10 }}>
          {daysLeft} days left, split across {schedule.length} weeks. The order matters: the frame
          first, then content, then connections, then mixed review. Detail learned before the frame
          has nothing to attach to.
        </p>
      </div>

      <div className="section">
        <div className="card">
          {schedule.map((w) => {
            const active = now >= w.start && now <= new Date(w.end.getTime() + 86_400_000);
            return (
              <div className={`week${active ? ' now' : ''}`} key={w.index}>
                <div>
                  <div className="when">{fmt(w.start)} – {fmt(w.end)}</div>
                  <div className="tiny muted">{w.label}</div>
                </div>
                <div>
                  <strong className="small">{w.phase.name.replace(/^Phase \d+ — /, '')}</strong>
                  <p className="small muted" style={{ margin: '3px 0 8px' }}>{w.phase.goal}</p>
                  <div className="row">
                    {w.phase.topics.map((t) => <span className="pill" key={t}>{TOPIC_LABELS[t]}</span>)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section">
        <h2>What each phase actually asks of you</h2>
        <div className="grid two">
          {PHASES.map((p) => (
            <div className="card" key={p.id}>
              <h3>{p.name}</h3>
              <p className="small muted">{p.goal}</p>
              <ul className="small" style={{ paddingLeft: 18, margin: 0 }}>
                {p.drills.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>How to study this material</h2>
        <div className="card">
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
            material means you arrive in October knowing the last two weeks well and everything else
            vaguely. The scheduler handles this for you — just clear your due cards.
          </p>
          <p className="small" style={{ marginBottom: 0 }}>
            <strong>Say it out loud.</strong> Reciting the 66 books, the eras, and the standing lists aloud
            while walking or driving costs nothing and is one of the most-recommended habits among
            competitive quizzers.
          </p>
        </div>
      </div>
    </div>
  );
}
