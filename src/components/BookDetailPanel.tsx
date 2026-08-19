import { useState } from 'react';
import type { Book } from '../data/types';
import type { BookDetail } from '../data/details';
import { color, space, sx } from '../ui';

type Pane = 'overview' | 'outline' | 'events' | 'people' | 'terms';

const PANES: { id: Pane; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'outline', label: 'Outline' },
  { id: 'events', label: 'Events' },
  { id: 'people', label: 'People' },
  { id: 'terms', label: 'Terms & Numbers' },
];

/**
 * The deep view of one book. Split into panes because a book like Genesis
 * carries twenty-eight episodes and sixteen figures — dumping all of it at once
 * is a wall, and a wall gets skimmed instead of recalled.
 */
export default function BookDetailPanel({ book, detail, highlight }: {
  book: Book;
  detail: BookDetail;
  highlight?: string;
}) {
  const [pane, setPane] = useState<Pane>('overview');

  return (
    <div>
      <div className="subtabs" role="tablist">
        {PANES.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={pane === p.id}
            onClick={() => setPane(p.id)}
          >
            {p.label}
            {p.id === 'events' && ` (${detail.events.length})`}
            {p.id === 'people' && ` (${detail.figures.length})`}
          </button>
        ))}
      </div>

      {pane === 'overview' && (
        <>
          <p style={{ fontSize: '1.02rem', marginTop: 0 }}>{book.oneLine}</p>
          <dl className="facts">
            <dt>Author</dt><dd>{book.author}{book.authorNote ? ` — ${book.authorNote}` : ''}</dd>
            <dt>Written</dt><dd>{detail.written}{detail.writtenFrom ? ` · from ${detail.writtenFrom}` : ''}</dd>
            <dt>Audience</dt><dd>{detail.audience}</dd>
            <dt>Purpose</dt><dd>{detail.purpose}</dd>
            <dt>Era</dt><dd>{book.era}</dd>
            <dt>Theme</dt><dd>{book.theme}</dd>
          </dl>

          {book.keyVerse && (
            <blockquote className="verse">
              “{book.keyVerse.text}”<br />
              <span className="tiny">— {book.keyVerse.ref} (ESV)</span>
            </blockquote>
          )}
          {(detail.verses ?? []).map((v) => (
            <blockquote className="verse" key={v.ref}>
              “{v.text}”<br />
              <span className="tiny">— {v.ref} (ESV)</span>
            </blockquote>
          ))}

          <div className="christ"><strong>Christ in {book.name}:</strong> {detail.christ}</div>
          {detail.distinctive && (
            <p className="small muted">
              <strong style={sx({ color: color.text })}>What makes it unlike any other:</strong> {detail.distinctive}
            </p>
          )}
          {book.hook && <div className="hook"><strong>Remember it:</strong> {book.hook}</div>}
        </>
      )}

      {pane === 'outline' && (
        <>
          <p className="tiny muted">
            Read it once, close it, and say the movements out loud in order. The outline is the
            shelf every other fact sits on.
          </p>
          <ul className="outline">
            {detail.outline.map((s, i) => (
              <li key={s.ch} className="item-in" style={sx({ '--stagger-i': i })}>
                <span className="span">{s.ch}</span>
                <span>{s.title}</span>
              </li>
            ))}
          </ul>
          <h3 className="label-section" style={sx({ marginTop: space[6] })}>
            Key chapters
          </h3>
          <table className="data">
            <tbody>
              {book.keyChapters.map((kc) => (
                <tr key={kc.ch}>
                  <td className="mono" style={{ whiteSpace: 'nowrap', width: 1 }}>{book.abbr} {kc.ch}</td>
                  <td>{kc.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {pane === 'events' && (
        <>
          <p className="tiny muted">
            {detail.events.length} episodes in narrative order. Cover the right side and work down
            the references.
          </p>
          {detail.events.map((e, i) => (
            <div className="episode item-in" key={`${e.ref}-${i}`} style={sx({ '--stagger-i': i })}>
              <div className="head">
                <span className="ref">{book.abbr} {e.ref}</span>
                <span className="name">{mark(e.name, highlight)}</span>
              </div>
              <div className="what">{mark(e.what, highlight)}</div>
              {(e.who.length > 0 || e.where) && (
                <div className="meta">
                  {e.where && <span className="pill tiny accent">{e.where}</span>}
                  {e.who.map((w) => <span className="pill tiny" key={w}>{w}</span>)}
                </div>
              )}
              {e.detail && <div className="note">{mark(e.detail, highlight)}</div>}
            </div>
          ))}
        </>
      )}

      {pane === 'people' && (
        <>
          <p className="tiny muted">
            Who does what, in this book. The same person may do something else somewhere else —
            that is the point of listing them per book.
          </p>
          <table className="data">
            <thead><tr><th>Who</th><th>What they do here</th><th>Where</th></tr></thead>
            <tbody>
              {detail.figures.map((f) => (
                <tr key={f.name}>
                  <td><strong>{mark(f.name, highlight)}</strong></td>
                  <td>{mark(f.did, highlight)}</td>
                  <td className="mono tiny muted" style={{ whiteSpace: 'nowrap' }}>{f.ref ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {pane === 'terms' && (
        <>
          {detail.terms && detail.terms.length > 0 && (
            <>
              <h3 className="label-section">
                Terms this book runs on
              </h3>
              <table className="data">
                <tbody>
                  {detail.terms.map((t) => (
                    <tr key={t.term}>
                      <td style={{ whiteSpace: 'nowrap', width: 1 }}><strong>{mark(t.term, highlight)}</strong></td>
                      <td>{mark(t.meaning, highlight)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {detail.numbers && detail.numbers.length > 0 && (
            <>
              <h3 className="label-section" style={sx({ marginTop: space[6] })}>
                Numbers worth knowing
              </h3>
              <table className="data">
                <tbody>
                  {detail.numbers.map((n) => (
                    <tr key={n.of}>
                      <td>{cap(n.of)}</td>
                      <td><strong>{n.value}</strong></td>
                      <td className="mono tiny muted" style={{ whiteSpace: 'nowrap' }}>{n.ref ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Highlight the search term inside reference text, so a hit is findable. */
function mark(text: string, needle?: string) {
  if (!needle || needle.trim().length < 2) return text;
  const idx = text.toLowerCase().indexOf(needle.toLowerCase().trim());
  if (idx < 0) return text;
  const end = idx + needle.trim().length;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, end)}</mark>
      {text.slice(end)}
    </>
  );
}
