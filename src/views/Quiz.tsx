import { useMemo, useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import { allItems, ITEMS_BY_ID } from '../lib/generate';
import { BOOKS } from '../data/books';
import { TOPIC_LABELS, type Topic } from '../data/types';
import { shuffle } from '../lib/rng';
import { strength, type Grade } from '../lib/srs';
import type { StoreApi } from '../lib/useStore';

type Scope = 'all' | 'OT' | 'NT' | 'starred' | 'weak';

export default function Quiz({ api }: { api: StoreApi }) {
  const { store, cards, answer, toggleStar } = api;
  const items = allItems();

  const [scope, setScope] = useState<Scope>('all');
  const [topic, setTopic] = useState<Topic | 'all'>('all');
  const [book, setBook] = useState<string>('all');
  const [length, setLength] = useState(20);
  const [queue, setQueue] = useState<string[] | null>(null);
  const [pos, setPos] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [right, setRight] = useState(0);

  const otIds = useMemo(() => new Set(BOOKS.filter((b) => b.testament === 'OT').map((b) => b.id)), []);
  const ntIds = useMemo(() => new Set(BOOKS.filter((b) => b.testament === 'NT').map((b) => b.id)), []);

  const pool = useMemo(() => {
    let out = items;
    if (topic !== 'all') out = out.filter((i) => i.topic === topic);
    if (book !== 'all') out = out.filter((i) => i.book === book);
    if (scope === 'OT') out = out.filter((i) => i.book && otIds.has(i.book));
    if (scope === 'NT') out = out.filter((i) => i.book && ntIds.has(i.book));
    if (scope === 'starred') out = out.filter((i) => store.starred.includes(i.id));
    if (scope === 'weak') {
      out = out
        .filter((i) => cards[i.id] && strength(cards[i.id]) < 0.6)
        .sort((a, b) => strength(cards[a.id]) - strength(cards[b.id]));
    }
    return out;
  }, [items, topic, book, scope, store.starred, cards, otIds, ntIds]);

  function start() {
    const picked = scope === 'weak' ? pool.slice(0, length) : shuffle(pool).slice(0, length);
    setQueue(picked.map((i) => i.id));
    setPos(0);
    setMissed([]);
    setRight(0);
  }

  function handleGrade(g: Grade) {
    const id = queue![pos];
    answer(id, g);
    if (g === 0) setMissed((m) => [...m, id]);
    else setRight((r) => r + 1);
    setPos((p) => p + 1);
  }

  if (!queue) {
    return (
      <div className="section">
        <h2>Mixed Quiz</h2>
        <p className="muted small">
          Test yourself under quiz conditions. Interleaving topics is harder than drilling one at a
          time — and that difficulty is what makes it stick. Narrow to a single book when you are
          working through it; leave it on everything once you are consolidating.
        </p>

        <div className="card" style={{ marginTop: 18 }}>
          <div className="grid three">
            <div>
              <label className="field" htmlFor="scope">Scope</label>
              <select id="scope" className="ctl" value={scope} onChange={(e) => setScope(e.target.value as Scope)} style={{ width: '100%' }}>
                <option value="all">Everything</option>
                <option value="OT">Old Testament only</option>
                <option value="NT">New Testament only</option>
                <option value="starred">Starred items</option>
                <option value="weak">Weak spots</option>
              </select>
            </div>
            <div>
              <label className="field" htmlFor="topic">Topic</label>
              <select id="topic" className="ctl" value={topic} onChange={(e) => setTopic(e.target.value as Topic | 'all')} style={{ width: '100%' }}>
                <option value="all">All topics</option>
                {Object.entries(TOPIC_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field" htmlFor="book">Book</label>
              <select id="book" className="ctl" value={book} onChange={(e) => setBook(e.target.value)} style={{ width: '100%' }}>
                <option value="all">Every book</option>
                {BOOKS.map((b) => (
                  <option key={b.id} value={b.id}>{b.order}. {b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field" htmlFor="len">Questions</label>
              <select id="len" className="ctl" value={length} onChange={(e) => setLength(Number(e.target.value))} style={{ width: '100%' }}>
                {[10, 20, 40, 60, 100].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <button className="btn primary" onClick={start} disabled={pool.length === 0}>
              Start quiz
            </button>
            <span className="tiny muted">{pool.length} questions match this filter</span>
          </div>
        </div>
      </div>
    );
  }

  if (pos >= queue.length) {
    const pct = Math.round((right / queue.length) * 100);
    return (
      <div className="section">
        <h2>Score: {right} / {queue.length} ({pct}%)</h2>
        {missed.length > 0 && (
          <>
            <h3 style={{ marginTop: 24 }}>What you missed</h3>
            <div className="card scroll-x">
              <table className="data">
                <thead><tr><th>Question</th><th>Answer</th></tr></thead>
                <tbody>
                  {missed.map((id) => {
                    const it = ITEMS_BY_ID.get(id)!;
                    return (
                      <tr key={id}>
                        <td>{it.prompt}</td>
                        <td><strong>{it.kind === 'order' ? (it.sequence ?? []).join(' → ') : it.answer}</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="tiny muted" style={{ marginTop: 10 }}>
              These are now scheduled to come back soon in your daily review.
            </p>
          </>
        )}
        <div className="row" style={{ marginTop: 22 }}>
          <button className="btn primary" onClick={start}>Retake</button>
          <button className="btn" onClick={() => setQueue(null)}>Change filters</button>
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
        <button className="btn sm" onClick={() => setQueue(null)}>Quit quiz</button>
        <span className="tiny muted">{right} correct so far</span>
      </div>
    </div>
  );
}
