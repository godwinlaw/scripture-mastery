import { useMemo, useState } from 'react';
import { Card, Corners, CountUp, Meter, Segmented, Field, space } from '../ui';
import QuestionCard from '../components/QuestionCard';
import { allItems, ITEMS_BY_ID } from '../lib/generate';
import { ESSENTIAL_ITEM_IDS } from '../lib/generate-essentials';
import { BOOKS } from '../data/books';
import { currentPhase } from '../data/plan';
import { planStartOf } from '../lib/store-ops';
import { planScopeIds } from '../lib/plan-scope';
import { copy } from '../copy';
import { TOPIC_LABELS, type Topic } from '../data/types';
import { shuffle } from '../lib/rng';
import { strength, type Grade } from '../lib/srs';
import type { StoreApi } from '../lib/useStore';

/**
 * The plan-aware scope (#40).
 *
 * The daily review now follows the study plan; a quiz is where you go to test
 * yourself on demand, so it keeps every other scope untouched and simply adds
 * the plan as one more thing you can point it at. The labels, and the order
 * they are offered in, live in `copy.quiz.scopes` — this list is the shape.
 */
type Scope = 'plan' | 'all' | 'OT' | 'NT' | 'essentials' | 'starred' | 'weak';

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
        <h2>{copy.quiz.heading}</h2>
        <p className="muted small">{copy.quiz.blurb}</p>

        <Card corners kicker={copy.quiz.setupKicker} title={copy.quiz.setupTitle} style={{ marginTop: space[6] }}>
          <div className="grid two">
            <Field label={copy.quiz.topicLabel} htmlFor="topic">
              <select
                id="topic"
                className="ctl"
                value={topic}
                onChange={(e) => setTopic(e.target.value as Topic | 'all')}
                style={{ width: '100%' }}
              >
                <option value="all">{copy.quiz.allTopics}</option>
                {Object.entries(TOPIC_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label={copy.quiz.bookLabel} htmlFor="book">
              <select
                id="book"
                className="ctl"
                value={book}
                onChange={(e) => setBook(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="all">{copy.quiz.allBooks}</option>
                {BOOKS.map((b) => (
                  <option key={b.id} value={b.id}>{b.order}. {b.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="row" style={{ marginTop: space[4], gap: space[8] }}>
            <Field label={copy.quiz.scopeLabel}>
              <Segmented
                ariaLabel={copy.quiz.scopeLabel}
                value={scope}
                onChange={setScope}
                options={(Object.keys(copy.quiz.scopes) as Scope[]).map((value) => ({
                  label: copy.quiz.scopes[value],
                  value,
                }))}
              />
            </Field>
            <Field label={copy.quiz.lengthLabel}>
              <Segmented
                ariaLabel={copy.quiz.lengthAria}
                value={length}
                onChange={setLength}
                options={[10, 20, 40, 60, 100].map((n) => ({ label: n, value: n }))}
              />
            </Field>
          </div>

          <div className="row" style={{ marginTop: space[4] }}>
            <button className="btn primary" onClick={start} disabled={pool.length === 0}>
              {copy.quiz.start}
            </button>
            <span className="tiny muted">{copy.quiz.matching(pool.length)}</span>
          </div>
        </Card>
      </div>
    );
  }

  if (pos >= queue.length) {
    const pct = Math.round((right / queue.length) * 100);
    return (
      <div className="section screen">
        <Card corners kicker={copy.quiz.resultsKicker} title={copy.quiz.resultsTitle}>
          <div className="row" style={{ gap: space[8], alignItems: 'center' }}>
            <div className="stat">
              <CountUp value={right} className="n" />
              <span className="k">{copy.quiz.correctOutOf(queue.length)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Meter value={right} max={queue.length} label={`${right} of ${queue.length} correct`} />
              <p className="tiny muted" style={{ marginTop: space[2] }}>{copy.quiz.percentCorrect(pct)}</p>
            </div>
          </div>

          {missed.length > 0 && (
            <>
              <div className="label-section" style={{ marginTop: space[6] }}>{copy.quiz.missedHeading}</div>
              <div className="scroll-x">
                <table className="data">
                  <thead><tr><th>{copy.quiz.missedColumns.question}</th><th>{copy.quiz.missedColumns.answer}</th></tr></thead>
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
                {copy.quiz.missedNote}
              </p>
            </>
          )}

          <div className="row" style={{ marginTop: space[6] }}>
            <button className="btn primary" onClick={start}>{copy.quiz.retake}</button>
            <button className="btn" onClick={() => setQueue(null)}>{copy.quiz.changeFilters}</button>
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
        <button className="btn sm" onClick={() => setQueue(null)}>{copy.quiz.quit}</button>
        <span className="tiny muted">{copy.quiz.runningTally(right)}</span>
      </div>
    </div>
  );
}
