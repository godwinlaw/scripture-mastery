import { useMemo } from 'react';
import { allItems } from '../lib/generate';
import { isDue, isNew, strength } from '../lib/srs';
import { buildSchedule, DAILY_RHYTHM } from '../data/plan';
import { TOPIC_LABELS, type Topic } from '../data/types';
import type { StoreApi } from '../lib/useStore';
import { todayISO } from '../lib/storage';

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

  const schedule = useMemo(() => buildSchedule(store.settings.examDate), [store.settings.examDate]);
  const currentWeek = schedule.find((w) => {
    const now = new Date();
    return now >= w.start && now <= new Date(w.end.getTime() + 86_400_000);
  }) ?? schedule[0];

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
        <div className="grid four">
          <div className="card stat"><span className="n">{daysLeft}</span><span className="k">Days to quiz</span></div>
          <div className="card stat"><span className="n">{stats.due}</span><span className="k">Cards due</span></div>
          <div className="card stat"><span className="n">{stats.mastery}%</span><span className="k">Overall mastery</span></div>
          <div className="card stat"><span className="n">{streak}</span><span className="k">Day streak</span></div>
        </div>
      </div>

      <div className="section">
        <div className="card">
          <div className="spread">
            <div>
              <span className="pill accent">{currentWeek?.label ?? 'Week 1'}</span>
              <h2 style={{ margin: '10px 0 4px' }}>{currentWeek?.phase.name}</h2>
              <p className="small muted" style={{ maxWidth: 620, marginBottom: 0 }}>{currentWeek?.phase.goal}</p>
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
        </div>
      </div>

      <div className="section">
        <h2>Today’s rhythm</h2>
        <p className="small muted">
          Three short sessions beat one long one. Quiz-program coaches converge on the same advice:
          10–20 minutes at a time, every day, with review built in.
        </p>
        <div className="grid three">
          {DAILY_RHYTHM.map((r) => (
            <div className="card" key={r.when}>
              <span className="pill">{r.when}</span>
              <p className="small" style={{ marginTop: 10, marginBottom: 0 }}>{r.what}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Weakest areas</h2>
        <p className="small muted">Ranked by mastery across all questions in each topic.</p>
        <div className="card">
          {byTopic.map((t) => (
            <div key={t.topic} style={{ marginBottom: 14 }}>
              <div className="spread" style={{ marginBottom: 5 }}>
                <span className="small">{TOPIC_LABELS[t.topic]}</span>
                <span className="tiny muted mono">{t.pct}% mastery · {t.coverage}% seen</span>
              </div>
              <div className={`bar${t.pct >= 80 ? ' good' : ''}`}><i style={{ width: `${t.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
