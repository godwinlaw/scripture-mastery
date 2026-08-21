import { useEffect, useMemo, useRef, useState } from 'react';
import { TOPIC_LABELS, type Difficulty, type Item } from '../data/types';
import type { Grade } from '../lib/srs';
import { shuffle } from '../lib/rng';
import { isReference, referenceMatches } from '../lib/reference';

interface Props {
  item: Item;
  onGrade: (g: Grade) => void;
  starred?: boolean;
  onToggleStar?: () => void;
  /** Shown top-right, e.g. "12 / 40". */
  counter?: string;
  /** Which of the item's option sets to offer (#36). Omitted means medium. */
  difficulty?: Difficulty;
}

/** Loose comparison so "3 days" and "three days" both count. */
function normalize(s: string): string {
  const words: Record<string, string> = {
    one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7',
    eight: '8', nine: '9', ten: '10', twelve: '12', forty: '40', fifty: '50',
    seventy: '70', 'fifty-two': '52', 'sixty-six': '66', 'thirty-nine': '39',
    'twenty-seven': '27', thirteen: '13',
  };
  let t = s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\b(the|a|an|of|and)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  for (const [w, n] of Object.entries(words)) {
    t = t.replace(new RegExp(`\\b${w}\\b`, 'g'), n);
  }
  return t;
}

function matches(input: string, item: Item): boolean {
  const got = normalize(input);
  if (!got) return false;
  const targets = [item.answer, ...(item.accepts ?? [])].map(normalize);
  return targets.some((t) => t === got || (t.length > 4 && got.length > 4 && (t.includes(got) || got.includes(t))));
}

export default function QuestionCard({ item, onGrade, starred, onToggleStar, counter, difficulty }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [arranged, setArranged] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Questions whose answer is a place in scripture open with a chance to name
   * it from memory, before any options are on screen (#14). Naming a reference
   * is strictly harder than recognising one, so getting it this way is worth a
   * grade you would otherwise have to award yourself.
   */
  const hasBonusRound = item.kind === 'mcq' && isReference(item.answer);
  const [bonusOpen, setBonusOpen] = useState(hasBonusRound);
  const [bonusMissed, setBonusMissed] = useState(false);
  /** Named the reference unprompted — the card grades itself Easy on advance. */
  const [bonusEarned, setBonusEarned] = useState(false);

  /**
   * The setting chooses which of the item's option sets is offered (#36).
   *
   * `medium` has no entry of its own — it *is* `distractors` — and plenty of
   * items carry no alternates at all, because the essentials lists and the
   * hand-written extras draw their options from somewhere other than the
   * canon. Both cases land on the same fallback.
   */
  const wrong = item.distractorsBy?.[difficulty ?? 'medium'] ?? item.distractors ?? [];

  const options = useMemo(
    () => (item.kind === 'mcq' ? shuffle([item.answer, ...wrong]) : []),
    // Reshuffle per item so the answer is not always in the same slot.
    [item.id, difficulty],
  );

  useEffect(() => {
    setPicked(null);
    setTyped('');
    setRevealed(false);
    setWasCorrect(false);
    setArranged(item.kind === 'order' ? shuffle(item.sequence ?? []) : []);
    setBonusOpen(hasBonusRound);
    setBonusMissed(false);
    setBonusEarned(false);
    if (item.kind === 'type' || hasBonusRound) setTimeout(() => inputRef.current?.focus(), 30);
  }, [item.id]);

  function resolve(correct: boolean) {
    setWasCorrect(correct);
    setRevealed(true);
  }

  /** Give up on the bonus and show the four options at the normal score. */
  function showChoices() {
    setBonusOpen(false);
    setTyped('');
  }

  function submitReference() {
    if (revealed || !bonusOpen) return;
    if (!referenceMatches(typed, item.answer)) {
      // One attempt. A wrong guess costs the bonus, not the question — the
      // options appear and the card is scored the ordinary way from here.
      setBonusMissed(true);
      showChoices();
      return;
    }
    // Reveal first. Grading immediately would advance the session before the
    // member ever saw "Correct" or the explanation, which is the part of a
    // right answer worth keeping.
    setBonusEarned(true);
    setWasCorrect(true);
    setRevealed(true);
  }

  function choose(opt: string) {
    if (revealed) return;
    setPicked(opt);
    resolve(opt === item.answer);
  }

  function submitTyped() {
    if (revealed) return;
    resolve(matches(typed, item));
  }

  function submitOrder() {
    if (revealed) return;
    resolve(arranged.join('|') === (item.sequence ?? []).join('|'));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= arranged.length) return;
    const next = arranged.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setArranged(next);
  }

  // Keyboard: 1-4 pick an option, then 1-3 grade. Enter advances.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = document.activeElement?.tagName === 'INPUT';
      if (!revealed) {
        // While the bonus round is up the options are not on screen, so the
        // number keys must not reach behind it and answer for you.
        if (item.kind === 'mcq' && !bonusOpen && /^[1-4]$/.test(e.key)) {
          const opt = options[Number(e.key) - 1];
          if (opt) { e.preventDefault(); choose(opt); }
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (bonusOpen) submitReference();
          else if (item.kind === 'type') submitTyped();
          else if (item.kind === 'order') submitOrder();
        }
        return;
      }
      if (typing) return;
      if (bonusEarned) {
        // No grade to choose — Enter just advances, filed as Easy.
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onGrade(3); }
        return;
      }
      if (!wasCorrect) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onGrade(0); }
        return;
      }
      if (e.key === 'Enter') { e.preventDefault(); onGrade(2); }
      if (e.key === '1') { e.preventDefault(); onGrade(1); }
      if (e.key === '2') { e.preventDefault(); onGrade(2); }
      if (e.key === '3') { e.preventDefault(); onGrade(3); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, wasCorrect, options, item.id, typed, arranged, bonusOpen, bonusEarned]);

  const correctIndex = (item.sequence ?? []).reduce<Record<string, number>>((m, s, i) => ({ ...m, [s]: i }), {});

  return (
    <div className="card">
      <div className="spread" style={{ marginBottom: 4 }}>
        <span className="pill">{TOPIC_LABELS[item.topic]}</span>
        <span className="row">
          {counter && <span className="tiny muted mono">{counter}</span>}
          {onToggleStar && (
            <button
              className="btn sm"
              onClick={onToggleStar}
              title="Star for focused review"
              aria-pressed={starred}
              aria-label={starred ? 'Unstar this question' : 'Star for focused review'}
            >
              <span aria-hidden="true">{starred ? '★' : '☆'}</span>
            </button>
          )}
        </span>
      </div>

      <p className="q-prompt">{item.prompt}</p>

      {bonusOpen && (
        <div>
          <input
            ref={inputRef}
            className="answer"
            value={typed}
            disabled={revealed}
            placeholder="Type the reference, e.g. Josh 6"
            aria-label="Type the reference for a bonus"
            onChange={(e) => setTyped(e.target.value)}
          />
          {/* Once it is answered the round is over: leave what was typed on
              screen, but take away the controls that would re-open it. */}
          {!revealed && (
            <>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn primary" onClick={submitReference}>Check reference</button>
                <button className="btn sm" onClick={showChoices}>Show me the choices</button>
              </div>
              <p className="tiny muted" style={{ marginTop: 10, marginBottom: 0 }}>
                Name it and the card grades itself Easy. Abbreviations are fine.
                Take the choices instead and it scores as normal.
              </p>
            </>
          )}
        </div>
      )}

      {item.kind === 'mcq' && !bonusOpen && (
        <div className="choices">
          {bonusMissed && !revealed && (
            <p className="tiny muted" style={{ margin: '0 0 10px' }}>
              Not that reference — no bonus. Pick it from the choices instead.
            </p>
          )}
          {options.map((opt, i) => {
            const cls = !revealed ? '' : opt === item.answer ? ' correct' : opt === picked ? ' wrong' : '';
            return (
              <button key={opt} className={`choice${cls}`} disabled={revealed} onClick={() => choose(opt)}>
                <span className="key">{i + 1}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {item.kind === 'type' && (
        <div>
          <input
            ref={inputRef}
            className="answer"
            value={typed}
            disabled={revealed}
            placeholder="Type your answer, then press Enter"
            onChange={(e) => setTyped(e.target.value)}
          />
          {!revealed && (
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn primary" onClick={submitTyped}>Check</button>
              <span className="tiny muted">or press <span className="kbd">Enter</span></span>
            </div>
          )}
        </div>
      )}

      {item.kind === 'order' && (
        <div>
          <ul className="order-list">
            {arranged.map((entry, i) => {
              const cls = !revealed ? '' : correctIndex[entry] === i ? ' correct' : ' wrong';
              return (
                <li key={entry} className={`order-item${cls}`}>
                  <span className="num">{i + 1}</span>
                  <span>{entry}</span>
                  {!revealed && (
                    <span className="moves">
                      <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                      <button onClick={() => move(i, 1)} disabled={i === arranged.length - 1} aria-label="Move down">↓</button>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          {!revealed && (
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn primary" onClick={submitOrder}>Check order</button>
            </div>
          )}
        </div>
      )}

      {revealed && (
        <div className={`feedback ${wasCorrect ? 'correct' : 'wrong'}`}>
          <strong>{wasCorrect ? 'Correct' : 'Not quite'}</strong>
          {!wasCorrect && (
            <div style={{ marginTop: 4 }}>
              Answer: <strong>{item.kind === 'order' ? (item.sequence ?? []).join(' → ') : item.answer}</strong>
            </div>
          )}
          {item.explain && <div className="why">{item.explain}</div>}

          <div className="row" style={{ marginTop: 14 }}>
            {bonusEarned ? (
              // Named unprompted, which is the strongest evidence of recall
              // this app can collect — so it grades itself Easy rather than
              // asking. The button still exists, to keep the explanation on
              // screen until the member is done reading it.
              <button className="btn primary sm" onClick={() => onGrade(3)}>
                Continue <span className="kbd">↵</span>
                <span className="hint">named it — filed as Easy</span>
              </button>
            ) : wasCorrect ? (
              <>
                <button className="btn sm" onClick={() => onGrade(1)}>
                  Hard <span className="kbd">1</span>
                  <span className="hint">see it more often</span>
                </button>
                <button className="btn primary sm" onClick={() => onGrade(2)}>
                  Ok <span className="kbd">2</span>
                  <span className="hint">normal pace</span>
                </button>
                <button className="btn sm" onClick={() => onGrade(3)}>
                  Easy <span className="kbd">3</span>
                  <span className="hint">see it less often</span>
                </button>
              </>
            ) : (
              <>
                <button className="btn primary sm" onClick={() => onGrade(0)}>Continue <span className="kbd">↵</span></button>
                {item.kind === 'type' && (
                  <button className="btn sm" onClick={() => onGrade(2)} title="Override if your wording was right">
                    I had it right
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
