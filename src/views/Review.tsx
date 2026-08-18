import { useMemo, useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import { allItems, ITEMS_BY_ID } from '../lib/generate';
import { buildQueue, isDue, isNew, type Grade } from '../lib/srs';
import type { StoreApi } from '../lib/useStore';

export default function Review({ api }: { api: StoreApi }) {
  const { store, cards, answer, toggleStar } = api;
  const items = allItems();

  const [queue, setQueue] = useState<string[]>([]);
  const [pos, setPos] = useState(0);
  const [tally, setTally] = useState({ right: 0, wrong: 0 });
  const [requeues, setRequeues] = useState<Record<string, number>>({});
  const [started, setStarted] = useState(false);

  const counts = useMemo(() => {
    const now = Date.now();
    let due = 0, fresh = 0;
    for (const it of items) {
      const c = cards[it.id];
      if (isNew(c)) fresh++;
      else if (isDue(c, now)) due++;
    }
    return { due, fresh, total: items.length };
  }, [cards, items]);

  function start() {
    const q = buildQueue(items.map((i) => i.id), cards, {
      newLimit: store.settings.newLimit,
      sessionLimit: store.settings.sessionLimit,
    });
    setQueue(q);
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
    if (g === 0 && (requeues[id] ?? 0) < 2) {
      setRequeues((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }));
      setQueue((q) => [...q, id]);
    }
    setPos((p) => p + 1);
  }

  if (!started) {
    return (
      <div className="section">
        <h2>Daily Review</h2>
        <p className="muted small">
          Spaced repetition over everything you have unlocked. Cards you miss come back sooner;
          cards you know get pushed out — but never past your exam date.
        </p>
        <div className="grid three" style={{ margin: '20px 0' }}>
          <div className="card stat"><span className="n">{counts.due}</span><span className="k">Due now</span></div>
          <div className="card stat"><span className="n">{Math.min(counts.fresh, store.settings.newLimit)}</span><span className="k">New today</span></div>
          <div className="card stat"><span className="n">{counts.total - counts.fresh}</span><span className="k">Seen so far</span></div>
        </div>
        <button className="btn primary" onClick={start} disabled={counts.due + counts.fresh === 0}>
          Start review session
        </button>
        {counts.due + counts.fresh === 0 && (
          <p className="small muted" style={{ marginTop: 12 }}>
            Nothing is due. Take a mixed quiz instead, or raise your daily new-card limit in Progress.
          </p>
        )}
      </div>
    );
  }

  if (pos >= queue.length) {
    const total = tally.right + tally.wrong;
    return (
      <div className="section">
        <h2>Session complete</h2>
        <div className="grid three" style={{ margin: '20px 0' }}>
          <div className="card stat"><span className="n">{total}</span><span className="k">Answered</span></div>
          <div className="card stat"><span className="n">{tally.right}</span><span className="k">Correct</span></div>
          <div className="card stat"><span className="n">{total ? Math.round((tally.right / total) * 100) : 0}%</span><span className="k">Accuracy</span></div>
        </div>
        <div className="row">
          <button className="btn primary" onClick={start}>Another session</button>
          <button className="btn" onClick={() => setStarted(false)}>Done</button>
        </div>
      </div>
    );
  }

  const item = ITEMS_BY_ID.get(queue[pos])!;

  return (
    <div className="section">
      <div className="bar" style={{ marginBottom: 18 }}>
        <i style={{ width: `${(pos / queue.length) * 100}%` }} />
      </div>
      <QuestionCard
        item={item}
        onGrade={handleGrade}
        starred={store.starred.includes(item.id)}
        onToggleStar={() => toggleStar(item.id)}
        counter={`${pos + 1} / ${queue.length}`}
      />
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn sm" onClick={() => setStarted(false)}>End session</button>
        <span className="tiny muted">{tally.right} right · {tally.wrong} missed</span>
      </div>
    </div>
  );
}
