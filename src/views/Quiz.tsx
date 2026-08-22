import { useMemo, useState } from 'react';
import { Card, Corners, CountUp, Meter, Segmented, Field, space } from '../ui';
import QuestionCard from '../components/QuestionCard';
import { allItems, ITEMS_BY_ID } from '../lib/generate';
import { ESSENTIAL_ITEM_IDS } from '../lib/generate-essentials';
import { BOOKS } from '../data/books';
import { currentPhase } from '../data/plan';
import { planStartOf } from '../lib/store-ops';
import { planScopeIds } from '../lib/plan-scope';
import { TOPIC_LABELS, type Topic } from '../data/types';
import { shuffle } from '../lib/rng';
import { strength, type Grade } from '../lib/srs';
import type { StoreApi } from '../lib/useStore';

type Scope = 'plan' | 'all' | 'OT' | 'NT' | 'essentials' | 'starred' | 'weak';

/**
 * The plan-aware scope (#40).
 *
 * The daily review now follows the study plan; a quiz is where you go to test
 * yourself on demand, so it keeps every other scope untouched and simply adds
 * the plan as one more thing you can point it at. It leads the list because it
 * is the answer to "what should I be drilling right now?" — and it is dropped
 * entirely, not greyed out, when the quiz date has passed and there is no
 * current phase to name.
 */
const PLAN_SCOPE_LABEL = 'This week’s plan';

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

  /**
   * The anchor is the persisted plan start rather than today: a schedule that
   * begins today always puts today in week 1, which is what pinned the whole
   * app to Phase 1 (#40). `currentPhase` is total, so there is always a phase
   * to point the quiz at.
   */
  const phase = currentPhase(store.settings.examDate, planStartOf(store));
  const planIds = useMemo(() => planScopeIds(phase, items), [phase, items]);

  const pool = useMemo(() => {
    let out = items;
    if (topic !== 'all') out = out.filter((i) => i.topic === topic);
    if (book !== 'all') out = out.filter((i) => i.book === book);
    if (scope === 'plan') out = out.filter((i) => planIds.has(i.id));
    if (scope === 'OT') out = out.filter((i) => i.book && otIds.has(i.book));
    if (scope === 'NT') out = out.filter((i) => i.book && ntIds.has(i.book));
    if (scope === 'essentials') out = out.filter((i) => ESSENTIAL_ITEM_IDS.has(i.id));
    if (scope === 'starred') out = out.filter((i) => store.starred.includes(i.id));
    if (scope === 'weak') {
      out = out
        .filter((i) => cards[i.id] && strength(cards[i.id]) < 0.6)
        .sort((a, b) => strength(cards[a.id]) - strength(cards[b.id]));
    }
    return out;
  }, [items, topic, book, scope, planIds, store.starred, cards, otIds, ntIds]);

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
      <div className="section stack-in">
        <h2>Mixed Quiz</h2>
        <p className="muted small">
          Test yourself under quiz conditions. Interleaving topics is harder than drilling one at a
          time — and that difficulty is what makes it stick. Narrow to a single book when you are
          working through it; leave it on everything once you are consolidating.
        </p>

        <Card corners kicker="Setup" title="Choose what to cover" style={{ marginTop: space[6] }}>
          <div className="grid two">
            <Field label="Topic" htmlFor="topic">
              <select
                id="topic"
                className="ctl"
                value={topic}
                onChange={(e) => setTopic(e.target.value as Topic | 'all')}
                style={{ width: '100%' }}
              >
                <option value="all">All topics</option>
                {Object.entries(TOPIC_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Book" htmlFor="book">
              <select
                id="book"
                className="ctl"
                value={book}
                onChange={(e) => setBook(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="all">Every book</option>
                {BOOKS.map((b) => (
                  <option key={b.id} value={b.id}>{b.order}. {b.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="row" style={{ marginTop: space[4], gap: space[8] }}>
            <Field label="Scope">
              <Segmented
                ariaLabel="Scope"
                value={scope}
                onChange={setScope}
                options={[
                  { label: PLAN_SCOPE_LABEL, value: 'plan' as const },
                  { label: 'Everything', value: 'all' },
                  { label: 'Old Testament', value: 'OT' },
                  { label: 'New Testament', value: 'NT' },
                  { label: 'Must-know lists', value: 'essentials' },
                  { label: 'Starred', value: 'starred' },
                  { label: 'Weak spots', value: 'weak' },
                ]}
              />
            </Field>
            <Field label="Questions">
              <Segmented
                ariaLabel="Number of questions"
                value={length}
                onChange={setLength}
                options={[10, 20, 40, 60, 100].map((n) => ({ label: n, value: n }))}
              />
            </Field>
          </div>

          <div className="row" style={{ marginTop: space[4] }}>
            <button className="btn primary" onClick={start} disabled={pool.length === 0}>
              Start quiz
            </button>
            <span className="tiny muted">
              {pool.length} question{pool.length === 1 ? '' : 's'} match this filter
            </span>
          </div>
        </Card>
      </div>
    );
  }

  if (pos >= queue.length) {
    const pct = Math.round((right / queue.length) * 100);
    return (
      <div className="section screen">
        <Card corners kicker="Results" title="Quiz complete">
          <div className="row" style={{ gap: space[8], alignItems: 'center' }}>
            <div className="stat">
              <CountUp value={right} className="n" />
              <span className="k">correct out of {queue.length}</span>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Meter value={right} max={queue.length} label={`${right} of ${queue.length} correct`} />
              <p className="tiny muted" style={{ marginTop: space[2] }}>{pct}% correct</p>
            </div>
          </div>

          {missed.length > 0 && (
            <>
              <div className="label-section" style={{ marginTop: space[6] }}>What you missed</div>
              <div className="scroll-x">
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
              <p className="tiny muted" style={{ marginTop: space[3] }}>
                These are scheduled to come back soon in your daily review.
              </p>
            </>
          )}

          <div className="row" style={{ marginTop: space[6] }}>
            <button className="btn primary" onClick={start}>Retake</button>
            <button className="btn" onClick={() => setQueue(null)}>Change filters</button>
          </div>
        </Card>
      </div>
    );
  }

  const item = ITEMS_BY_ID.get(queue[pos])!;

  return (
    <div className="section screen">
      <div style={{ marginBottom: space[4] }}>
        <Meter value={pos} max={queue.length} label={`Progress: question ${pos + 1} of ${queue.length}`} />
      </div>
      <div key={item.id} className="card-swap" style={{ position: 'relative' }}>
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
      <div className="row" style={{ marginTop: space[4] }}>
        <button className="btn sm" onClick={() => setQueue(null)}>Quit quiz</button>
        <span className="tiny muted">{right} correct so far</span>
      </div>
    </div>
  );
}
