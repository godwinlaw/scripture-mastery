import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TOPIC_LABELS, type Difficulty, type Item } from '../data/types';
import type { Grade } from '../lib/srs';
import { shuffle } from '../lib/rng';
import { isReference, referenceMatches } from '../lib/reference';
import { specFor } from '../lib/difficulty';

interface Props {
  item: Item;
  onGrade: (g: Grade) => void;
  starred?: boolean;
  onToggleStar?: () => void;
  /** Shown top-right, e.g. "12 / 40". */
  counter?: string;
  /**
   * How hard this card should be to answer (#36, #40). Omitted means medium.
   *
   * The card reads three dials off `specFor`: how many wrong options to
   * render, whether a reference question opens on the typed bonus round, and
   * whether the explanation is offered as a hint before answering.
   */
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

/**
 * Does this item's explanation simply state its answer? (#40)
 *
 * `explain` was written to be read *after* answering, where naming the answer
 * is the whole job — `gen-who-*` builds it as `"${p.name}: ${p.role}."` against
 * an answer of `p.name`, and something like 1,400 items across the bank follow
 * the same shape. Offering that as a hint beforehand is not a nudge, it is the
 * answer key with a button in front of it.
 *
 * Not `matches`: that one is tuned for grading what a member typed, and its
 * containment arm only fires past four characters, so it would wave through
 * "Eve: the first woman" on an item whose answer is "Eve". This is the blunter
 * comparison on purpose — plain containment of the normalized answer — because
 * the two failure modes are not symmetric. Suppressing a hint that would have
 * been safe costs one nudge; showing one that is not costs the question.
 */
function explainGivesItAway(item: Item): boolean {
  const explained = normalize(item.explain ?? '');
  if (!explained) return false;
  return [item.answer, ...(item.accepts ?? [])]
    .map(normalize)
    .some((a) => a.length > 0 && explained.includes(a));
}

/** Identifies one move button — direction plus the entry it belongs to. */
const moveKey = (dir: -1 | 1, entry: string) => `${dir}:${entry}`;

export default function QuestionCard({ item, onGrade, starred, onToggleStar, counter, difficulty }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [arranged, setArranged] = useState<string[]>([]);
  /** Whether the pre-answer hint has been opened. Off until it is asked for. */
  const [hintOpen, setHintOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * What the ordering list last did, spoken (#40).
   *
   * Rearranging was a silent operation: the rows moved, the numbers changed,
   * and a screen reader was told none of it. This is written only by `move`,
   * never during a render, so it says one sentence per press and stays quiet
   * the rest of the time — a live region that updates on every render is a
   * region nobody can bear to leave switched on.
   */
  const [orderNote, setOrderNote] = useState('');
  /** Every move button on screen, so `move` can hand focus to a specific one. */
  const moveButtons = useRef(new Map<string, HTMLButtonElement | null>());
  /** Which button should hold focus once the reordered list has rendered. */
  const pendingFocus = useRef<{ entry: string; dir: -1 | 1 } | null>(null);

  const spec = specFor(difficulty);

  /**
   * Questions whose answer is a place in scripture open with a chance to name
   * it from memory, before any options are on screen (#14). Naming a reference
   * is strictly harder than recognising one, so getting it this way is worth a
   * grade you would otherwise have to award yourself.
   *
   * Which is exactly why `easy` skips it (#40): free recall is the hardest
   * thing this app asks for, and asking it of someone who chose the gentlest
   * setting is the wrong first impression. There the choices are on screen
   * immediately. Medium and hard keep the behaviour unchanged.
   */
  const hasBonusRound = spec.bonusRound && item.kind === 'mcq' && isReference(item.answer);

  const [bonusOpen, setBonusOpen] = useState(hasBonusRound);
  const [bonusMissed, setBonusMissed] = useState(false);
  /** Named the reference unprompted — the card grades itself Easy on advance. */
  const [bonusEarned, setBonusEarned] = useState(false);

  /**
   * `explain` is what the card shows *after* answering — the reason the answer
   * is the answer. On easy it is also offered before, folded away behind a
   * button (#40): a nudge you can choose to take is a different thing from a
   * question with the answer written under it, and taking it costs nothing but
   * the satisfaction of not having needed it.
   *
   * Deliberately absent at medium and hard, where working it out unaided is
   * the point, and absent once `revealed` — the feedback block already shows
   * the same text, and two copies of it would just be noise.
   *
   * Also absent — control and all, not disabled or emptied — wherever the
   * explanation would hand over the answer, which is most of a third of the
   * bank (#40). See `explainGivesItAway`. A button that cannot be pressed
   * without spoiling the card is worse than no button, and an empty gap where
   * one used to be just asks what went missing.
   */
  const offersHint = spec.hintBeforeAnswer && Boolean(item.explain) && !explainGivesItAway(item);

  /**
   * Which wrong options this card offers — and, now, how many of them (#36, #40).
   *
   * The setting used to do nothing here but swap the set: four choices either
   * way, differing only in how obviously wrong three of them were, which is
   * most of why `hard` did not feel hard. Length is the other half of the
   * dial, and the cheaper half — three choices is a coin flip after one
   * elimination, six is not — so the card renders 3 / 4 / 6 total.
   *
   * It reads that length off the spec and slices; it never generates. The
   * generators bake `MAX_WRONG_OPTIONS` into the hard set precisely so the
   * render site can slice down without the bank ever varying by setting, which
   * would detach every card's SRS history the moment someone touched the
   * control.
   *
   * `medium` has no entry of its own — it *is* `distractors` — and plenty of
   * items carry no alternates at all, because the essentials lists and the
   * hand-written extras draw their options from somewhere other than the
   * canon. Both cases land on the same fallback, and that fallback is only
   * three long, so `hard` on such an item shows four choices rather than six.
   * That is the honest outcome: slicing short is fine, inventing options this
   * question was never given is not.
   *
   * The one pool we will swap out from under the setting is one *shorter* than
   * the medium set, because fewer choices is easier and a thin `hard` set
   * would invert the setting rather than sharpen it. `scopedSets` already tops
   * those up at generation; this is the same floor held at the render site, so
   * a future generator cannot quietly hand `hard` the easiest card on screen.
   */
  const base = item.distractors ?? [];
  const pool = item.distractorsBy?.[difficulty ?? 'medium'] ?? base;
  const wrong = (pool.length < base.length && spec.wrongOptions > pool.length ? base : pool)
    .slice(0, spec.wrongOptions);

  const options = useMemo(
    () => (item.kind === 'mcq' ? shuffle([item.answer, ...wrong]) : []),
    // Reshuffle per item so the answer is not always in the same slot. The
    // count is a pure function of the setting, so `difficulty` already covers
    // a slice length changing — there is nothing further to key on.
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
    setHintOpen(false);
    // The new card's list has never been touched, so nothing is owed to the
    // live region — and a stale sentence from the last one could otherwise be
    // read out, or re-read, against a list it does not describe (#40).
    setOrderNote('');
    pendingFocus.current = null;
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
    const entry = arranged[i];
    const next = arranged.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setArranged(next);
    // Follow the entry, not the slot: the rows are keyed by their text, so
    // React moves the actual DOM node — and a focused node that gets moved
    // loses focus to <body>, whether or not the button it holds ends up
    // disabled. Restored below, once the new order has rendered (#40).
    pendingFocus.current = { entry, dir };
    setOrderNote(`${entry}, position ${j + 1} of ${next.length}.`);
  }

  /**
   * Put focus back where the member left it (#40).
   *
   * Walking an entry to the top used to end with focus on nothing: the last
   * press disabled the very button that was pressed, and a keyboard user had
   * to tab in from the top of the document to carry on. Layout effect rather
   * than a plain one so focus lands in the same frame as the reorder, with no
   * flicker of an unfocused page in between.
   *
   * Preference is the button just pressed, so repeated presses keep working
   * without moving the hands; at the end of its travel that button is disabled
   * — which the list's ends must stay, it is how they read as ends — so focus
   * falls to its sibling, the only direction still worth pressing.
   */
  useLayoutEffect(() => {
    const want = pendingFocus.current;
    if (!want) return;
    pendingFocus.current = null;
    const pressed = moveButtons.current.get(moveKey(want.dir, want.entry));
    const sibling = moveButtons.current.get(moveKey(want.dir === -1 ? 1 : -1, want.entry));
    const target = pressed && !pressed.disabled ? pressed : sibling;
    target?.focus();
  }, [arranged]);

  // Keyboard: the number keys pick an option, then 1-3 grade. Enter advances.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = document.activeElement?.tagName === 'INPUT';
      if (!revealed) {
        // While the bonus round is up the options are not on screen, so the
        // number keys must not reach behind it and answer for you.
        // As many number keys as there are options: hard renders six, and a
        // key badge printed on a choice that no key answers is a small lie.
        if (item.kind === 'mcq' && !bonusOpen && /^[1-9]$/.test(e.key)) {
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

      {offersHint && !revealed && !bonusOpen && (
        <div style={{ marginBottom: 12 }}>
          <button
            className="btn sm"
            onClick={() => setHintOpen(!hintOpen)}
            aria-expanded={hintOpen}
            title="Shows the explanation before you answer"
          >
            {hintOpen ? 'Hide hint' : 'Show a hint'}
          </button>
          {hintOpen && (
            <p className="tiny muted" style={{ margin: '8px 0 0' }}>{item.explain}</p>
          )}
        </div>
      )}

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
              const right = correctIndex[entry] === i;
              const cls = !revealed ? '' : right ? ' correct' : ' wrong';
              return (
                <li key={entry} className={`order-item${cls}`}>
                  <span className="num">{i + 1}</span>
                  <span>{entry}</span>
                  {/* The verdict for this row in a second channel (#40). The
                      tint and the border said it in colour alone — and in the
                      one pair of colours, red against green, most likely to
                      arrive as two identical greys. `role="img"` with a label
                      is what carries it to a screen reader; the glyph is what
                      carries it to everyone else. A <b> rather than a <span>
                      keeps it out of the row's label text. */}
                  {revealed && (
                    <b
                      className="mark"
                      role="img"
                      aria-label={right ? 'Right position' : 'Wrong position'}
                    >
                      {right ? '✓' : '✗'}
                    </b>
                  )}
                  {!revealed && (
                    <span className="moves">
                      <button
                        ref={(el) => {
                          moveButtons.current.set(moveKey(-1, entry), el);
                        }}
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        ref={(el) => {
                          moveButtons.current.set(moveKey(1, entry), el);
                        }}
                        onClick={() => move(i, 1)}
                        disabled={i === arranged.length - 1}
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          {/* Mounted empty and left mounted, because a live region that is
              inserted with its text already in it is announced by roughly half
              the screen readers that exist. `move` writes the sentence; every
              other render leaves it exactly as it was, which is what keeps
              this from narrating the whole card (#40). */}
          <p className="sr-only" aria-live="polite">{orderNote}</p>
          {!revealed && (
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn primary" onClick={submitOrder}>Check order</button>
            </div>
          )}
        </div>
      )}

      {revealed && (
        <div className={`feedback ${wasCorrect ? 'correct' : 'wrong'}`}>
          {/*
            The verdict, announced (#40).

            "Correct" and "Not quite" arrived silently: the block is inserted
            after the answer is in, and an insertion is not a change any screen
            reader is watching for. `role="status"` is the polite kind — it
            waits for a gap rather than cutting across whatever is being read.

            Scoped to the verdict and the reason, with the grade buttons left
            outside it deliberately: they are the next thing to *do*, not part
            of the news, and an atomic region containing them would read out
            "Hard, see it more often, Ok, normal pace…" every time. It cannot
            fire twice per card either — the block exists only once `revealed`,
            and nothing after that edits it.
          */}
          <div role="status">
            <strong>{wasCorrect ? 'Correct' : 'Not quite'}</strong>
            {!wasCorrect && (
              <div style={{ marginTop: 4 }}>
                Answer: <strong>{item.kind === 'order' ? (item.sequence ?? []).join(' → ') : item.answer}</strong>
              </div>
            )}
            {item.explain && <div className="why">{item.explain}</div>}
          </div>

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
