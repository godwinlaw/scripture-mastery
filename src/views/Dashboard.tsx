import { useMemo } from 'react';
import { allItems } from '../lib/generate';
import { isDue, isNew, strength } from '../lib/srs';
import { currentPhase, currentWeek } from '../data/plan';
import { TOPIC_LABELS, type Topic } from '../data/types';
import type { StoreApi } from '../lib/useStore';
import { todayISO } from '../lib/storage';
import { planStartOf } from '../lib/store-ops';
import { Card, CountUp, Meter, sx } from '../ui';

export default function Dashboard({ api, go }: { api: StoreApi; go: (tab: string) => void }) {
  const { store, cards, daysLeft } = api;
  const items = allItems();

  const stats = useMemo(() => {
    const now = Date.now();
    let due = 0, fresh = 0, learning = 0, known = 0, totalStrength = 0;
    for (const it of items) {
      const c = cards[it.id];
      const s = strength(c);
      totalStrength += s;
      if (isNew(c)) fresh++;
      else {
        if (isDue(c, now)) due++;
        if (s >= 0.8) known++; else learning++;
      }
    }
    return {
      due, fresh, learning, known,
      total: items.length,
      mastery: Math.round((totalStrength / items.length) * 100),
    };
  }, [cards, items]);

  const byTopic = useMemo(() => {
    const acc: Record<string, { seen: number; sum: number; total: number }> = {};
    for (const it of items) {
      const t = it.topic;
      acc[t] ??= { seen: 0, sum: 0, total: 0 };
      acc[t].total++;
      const c = cards[it.id];
      if (c && c.reps > 0) {
        acc[t].seen++;
        acc[t].sum += strength(c);
      }
    }
    return Object.entries(acc)
      .map(([topic, v]) => ({
        topic: topic as Topic,
        pct: v.total ? Math.round((v.sum / v.total) * 100) : 0,
        coverage: v.total ? Math.round((v.seen / v.total) * 100) : 0,
      }))
      .sort((a, b) => a.pct - b.pct);
  }, [cards, items]);

  // "Which week is it?" is one question with one answer (#40), and the daily
  // review now depends on it too, so it lives in data/plan.ts rather than
  // being re-derived here.
  //
  // The anchor is the member's stored plan start, not today. Passing `now` here
  // is what pinned this card to "Week 1, Build the Frame" for everyone, on
  // every day of the plan; the schedule only advances if it is measured from a
  // fixed origin.
  const planStart = planStartOf(store);
  const week = useMemo(
    () => currentWeek(store.settings.examDate, planStart),
    [store.settings.examDate, planStart],
  );
  // The old fall back to `buildSchedule(...)[0]` is gone: `currentWeek` now
  // clamps to the schedule's own ends, so it only returns null when there are
  // no weeks at all (an anchor past the exam date). Naming "Week 1, Build the
  // Frame" in that case would contradict `currentPhase`, which answers Phase 5
  // for exactly the same store, and the review queue below this card obeys
  // `currentPhase`. So the phase comes from the same helper the queue uses, and
  // only the week pill, the part with genuinely nothing to say, drops out.
  const phase = useMemo(
    () => currentPhase(store.settings.examDate, planStart),
    [store.settings.examDate, planStart],
  );

  const streak = useMemo(() => {
    const dates = new Set(store.log.filter((l) => l.reviewed > 0).map((l) => l.date));
    let n = 0;
    const d = new Date();
    // Today does not break the streak if it has not happened yet.
    if (!dates.has(todayISO())) d.setDate(d.getDate() - 1);
    for (;;) {
      const iso = todayISO(d);
      if (!dates.has(iso)) break;
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [store.log]);

  const todayLog = store.log.find((l) => l.date === todayISO());

  return (
    <div>
      <div className="section">
        <div className="grid four stack-in">
          <div className="card stat"><span className="n"><CountUp value={daysLeft} /></span><span className="k">Days to quiz</span></div>
          <div className="card stat"><span className="n"><CountUp value={stats.due} /></span><span className="k">Cards due</span></div>
          <div className="card stat"><span className="n"><CountUp value={stats.mastery} />%</span><span className="k">Overall mastery</span></div>
          <div className="card stat"><span className="n"><CountUp value={streak} /></span><span className="k">Consecutive days</span></div>
        </div>
      </div>

      <div className="section">
        <Card corners>
          <div className="spread">
            <div>
              {week && <span className="pill accent">{week.label}</span>}
              <h2 style={{ margin: '10px 0 4px' }}>{phase.name}</h2>
              <p className="small muted" style={{ maxWidth: 620, marginBottom: 0 }}>{phase.goal}</p>
            </div>
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <button className="btn primary" onClick={() => go('review')}>
              {stats.due > 0 ? `Review ${stats.due} due card${stats.due === 1 ? '' : 's'}` : 'Start today’s review'}
            </button>
            <button className="btn" onClick={() => go('quiz')}>Take a quiz</button>
            <button className="btn" onClick={() => go('library')}>Open reference</button>
          </div>
          {todayLog && (
            <p className="tiny muted" style={{ marginTop: 14, marginBottom: 0 }}>
              Today: {todayLog.reviewed} answered, {todayLog.correct} correct
              ({Math.round((todayLog.correct / todayLog.reviewed) * 100)}%).
            </p>
          )}
        </Card>
      </div>

      <div className="section">
        <h2>Weakest areas</h2>
        <p className="small muted">Ranked by mastery across all questions in each topic.</p>
        <div className="card">
          {byTopic.map((t, i) => (
            <div key={t.topic} className="item-in" style={sx({ marginBottom: 14, '--stagger-i': i })}>
              <div className="spread" style={{ marginBottom: 5 }}>
                <span className="small">{TOPIC_LABELS[t.topic]}</span>
                <span className="tiny muted mono">{t.pct}% mastery · {t.coverage}% seen</span>
              </div>
              <Meter
                value={t.pct}
                className={t.pct >= 80 ? 'good' : ''}
                label={`${TOPIC_LABELS[t.topic]} mastery`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
