import { copy } from '../copy';
import { useMemo, useState } from 'react';
import { BOOKS } from '../data/books';
import { LISTS } from '../data/extras';
import { ESSENTIALS, ESSENTIAL_ALIASES, ESSENTIAL_ENTRY_COUNT } from '../data/essentials';
import { ERAS } from '../data/timeline';
import { PEOPLE, PLACES } from '../data/people';
import { DETAIL_BY_BOOK, DETAIL_TOTALS } from '../data/details';
import BookDetailPanel from '../components/BookDetailPanel';
import type { Division } from '../data/types';
import { Card, Segmented, Field, sx } from '../ui';

const DIVISION_ORDER: Division[] = [
  'Law', 'History', 'Wisdom', 'Major Prophets', 'Minor Prophets',
  'Gospels', 'Acts', 'Pauline Epistles', 'General Epistles', 'Apocalyptic',
];

type Tab = 'books' | 'timeline' | 'people' | 'lists';

const TAB_OPTIONS: { label: string; value: Tab }[] =
  (Object.keys(copy.library.tabs) as Tab[]).map((value) => ({ label: copy.library.tabs[value], value }));

/** Everything about a book that search should reach — outline, events, and all. */
function haystack(bookId: string): string {
  const b = BOOKS.find((x) => x.id === bookId)!;
  const d = DETAIL_BY_BOOK.get(bookId);
  const parts: string[] = [
    b.name, b.abbr, b.author, b.division, b.era, b.oneLine, b.theme, b.hook ?? '',
    ...b.keyPeople, ...b.keyEvents, ...b.keyChapters.map((k) => `${k.ch} ${k.what}`),
    b.keyVerse?.text ?? '',
  ];
  if (d) {
    parts.push(
      d.audience, d.purpose, d.written, d.writtenFrom ?? '', d.christ, d.distinctive ?? '',
      ...d.outline.map((s) => `${s.ch} ${s.title}`),
      ...d.events.map((e) => `${e.ref} ${e.name} ${e.what} ${e.who.join(' ')} ${e.where ?? ''} ${e.detail ?? ''}`),
      ...d.figures.map((f) => `${f.name} ${f.did} ${f.ref ?? ''}`),
      ...(d.terms ?? []).map((t) => `${t.term} ${t.meaning}`),
      ...(d.numbers ?? []).map((n) => `${n.of} ${n.value}`),
      ...(d.verses ?? []).map((v) => `${v.ref} ${v.text}`),
    );
  }
  return parts.join(' ').toLowerCase();
}

const HAYSTACKS = new Map(BOOKS.map((b) => [b.id, haystack(b.id)]));

export default function Library() {
  const [tab, setTab] = useState<Tab>('books');
  const [q, setQ] = useState('');

  const needle = q.toLowerCase().trim();

  const filteredBooks = useMemo(() => {
    if (!needle) return BOOKS;
    return BOOKS.filter((b) => HAYSTACKS.get(b.id)!.includes(needle));
  }, [needle]);

  const filteredPeople = useMemo(() => {
    if (!needle) return PEOPLE;
    return PEOPLE.filter((p) =>
      [p.name, p.role, p.clue, p.tribe, p.father, p.mother, p.spouse, p.died, ...(p.alsoKnownAs ?? []), ...(p.children ?? [])]
        .filter(Boolean).join(' ').toLowerCase().includes(needle),
    );
  }, [needle]);

  // The must-know lists are the one place a search for "Babel" or "Jehu" should
  // land on the index rather than on a book, so match cue and content both.
  const filteredEssentials = useMemo(() => {
    if (!needle) return ESSENTIALS;
    return ESSENTIALS.filter((l) =>
      [l.title, l.source, ...l.entries.map((e) => `${e.cue} ${e.what} ${e.group ?? ''}`)]
        .join(' ').toLowerCase().includes(needle),
    );
  }, [needle]);

  const filteredPlaces = useMemo(() => {
    if (!needle) return PLACES;
    return PLACES.filter((p) => `${p.name} ${p.what}`.toLowerCase().includes(needle));
  }, [needle]);

  let bookIndex = 0;

  return (
    <div className="section">
      <div className="spread" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{copy.library.heading}</h2>
        <Field label={copy.library.searchLabel} htmlFor="library-search">
          <input
            id="library-search"
            className="ctl"
            placeholder={copy.library.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ minWidth: 260 }}
          />
        </Field>
      </div>

      <div className="counts">
        <span><b>{BOOKS.length}</b> books</span>
        <span><b>{DETAIL_TOTALS.sections}</b> outline sections</span>
        <span><b>{DETAIL_TOTALS.events}</b> events</span>
        <span><b>{PEOPLE.length}</b> people</span>
        <span><b>{PLACES.length}</b> places</span>
        <span><b>{DETAIL_TOTALS.terms}</b> terms</span>
        <span><b>{ERAS.length}</b> eras</span>
        <span><b>{LISTS.length + ESSENTIALS.length}</b> lists</span>
        <span><b>{ESSENTIAL_ENTRY_COUNT}</b> must-know pairs</span>
      </div>

      <div className="row" style={{ marginBottom: 20 }}>
        <Segmented ariaLabel={copy.library.tabsAria} options={TAB_OPTIONS} value={tab} onChange={setTab} />
      </div>

      {tab === 'books' && (
        <div className="screen">
          <p className="tiny muted">
            {copy.library.booksBlurb}
            {needle && ` — ${filteredBooks.length} book${filteredBooks.length === 1 ? '' : 's'} match “${q.trim()}”.`}
          </p>
          {DIVISION_ORDER.map((div) => {
            const group = filteredBooks.filter((b) => b.division === div);
            if (group.length === 0) return null;
            return (
              <div key={div} style={{ marginTop: 24 }}>
                <h3>
                  {div} <span className="pill">{group.length} book{group.length > 1 ? 's' : ''}</span>
                </h3>
                {group.map((b) => {
                  const detail = DETAIL_BY_BOOK.get(b.id);
                  return (
                    <details
                      className="book item-in"
                      key={b.id}
                      open={Boolean(needle) && filteredBooks.length <= 3}
                      style={sx({ '--stagger-i': bookIndex++ })}
                    >
                      <summary>
                        <span className="ord">{b.order}</span>
                        {b.name}
                        <span className="pill" style={{ marginLeft: 'auto' }}>{b.chapters} ch</span>
                      </summary>
                      <div className="body">
                        {detail
                          ? <BookDetailPanel book={b} detail={detail} highlight={needle} />
                          : <p className="small">{b.oneLine}</p>}
                      </div>
                    </details>
                  );
                })}
              </div>
            );
          })}
          {filteredBooks.length === 0 && (
            <p className="small muted">{copy.library.noBook(q.trim())}</p>
          )}
        </div>
      )}

      {tab === 'timeline' && (
        <div className="screen">
          <p className="tiny muted">
            Fourteen eras in order. If you can walk this spine out loud, every book and person has
            somewhere to attach.
          </p>
          {ERAS.map((e, i) => (
            <Card corners key={e.id} className="item-in" style={sx({ marginTop: 12, '--stagger-i': i })}>
              <div className="spread">
                <h3 style={{ margin: 0 }}>{e.seq}. {e.name}</h3>
                <span className="pill accent">{e.span}</span>
              </div>
              <p className="small" style={{ margin: '8px 0' }}>{e.summary}</p>
              <div className="row">
                {e.markers.map((m) => <span className="pill" key={m}>{m}</span>)}
              </div>
              {e.books.length > 0 && (
                <p className="tiny muted" style={{ marginTop: 10, marginBottom: 0 }}>
                  Books: {e.books.map((id) => BOOKS.find((b) => b.id === id)?.name).filter(Boolean).join(', ')}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === 'people' && (
        <div className="screen">
          <h3>{copy.library.peopleHeading} <span className="pill">{filteredPeople.length}</span></h3>
          <Card corners className="scroll-x">
            <table className="data">
              <thead><tr><th>{copy.library.peopleColumns.name}</th><th>{copy.library.peopleColumns.who}</th><th>{copy.library.peopleColumns.detail}</th><th>{copy.library.peopleColumns.family}</th></tr></thead>
              <tbody>
                {filteredPeople.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      {p.alsoKnownAs && <div className="tiny muted">aka {p.alsoKnownAs.join(', ')}</div>}
                      {p.tribe && <div className="tiny muted">tribe of {p.tribe}</div>}
                    </td>
                    <td>{p.role}</td>
                    <td className="muted">
                      {p.clue}
                      {p.died && <div className="tiny" style={{ marginTop: 3 }}>{copy.library.diedPrefix} {p.died}</div>}
                    </td>
                    <td className="tiny muted">
                      {p.father && <div>father: {p.father}</div>}
                      {p.mother && <div>mother: {p.mother}</div>}
                      {p.spouse && <div>spouse: {p.spouse}</div>}
                      {p.children && <div>children: {p.children.join(', ')}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <h3 style={{ marginTop: 28 }}>{copy.library.placesHeading} <span className="pill">{filteredPlaces.length}</span></h3>
          <Card corners className="scroll-x">
            <table className="data">
              <thead><tr><th>{copy.library.placesColumns.place}</th><th>{copy.library.placesColumns.knownFor}</th></tr></thead>
              <tbody>
                {filteredPlaces.map((p) => (
                  <tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.what}</td></tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === 'lists' && (
        <div className="screen">
          <div className="spread">
            <h3 style={{ margin: 0 }}>{copy.library.essentialsHeading}</h3>
            <span className="pill accent">{copy.library.essentialsKicker}</span>
          </div>
          <p className="tiny muted">
            {copy.library.essentialsBlurb}
            {needle && ` — ${filteredEssentials.length} list${filteredEssentials.length === 1 ? '' : 's'} match “${q.trim()}”.`}
          </p>
          <div className="grid two">
            {filteredEssentials.map((l, i) => (
              <Card corners key={l.id} title={l.title} className="item-in" style={sx({ '--stagger-i': i })}>
                <div className="spread" style={{ marginBottom: 6 }}>
                  <span className="tiny muted">{l.source}</span>
                  <span className="pill">{l.testament}</span>
                </div>
                <div className="scroll-x">
                  <table className="data">
                    <tbody>
                      {l.entries.map((e) => (
                        <tr key={e.cue}>
                          <td style={{ whiteSpace: 'nowrap' }}><strong>{e.cue}</strong></td>
                          <td>
                            {e.what}
                            {e.note && <div className="tiny muted">{e.note}</div>}
                          </td>
                          {l.groupAsk && <td className="tiny muted">{e.group}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))}
          </div>
          {filteredEssentials.length === 0 && (
            <p className="small muted">{copy.library.noList(q.trim())}</p>
          )}
          <p className="tiny muted" style={{ marginTop: 16 }}>
            {copy.library.aliasNote(ESSENTIAL_ALIASES.map((a) => a.title).join(', '))}
          </p>

          <h3 style={{ marginTop: 28 }}>{copy.library.standingHeading}</h3>
          <p className="tiny muted">{copy.library.standingBlurb}</p>
          <div className="grid two">
            {LISTS.map((l, i) => (
              <Card corners key={l.id} title={l.title} className="item-in" style={sx({ '--stagger-i': i })}>
                <div className="spread" style={{ marginBottom: 4 }}>
                  <span className="tiny muted">{l.note}</span>
                  {ESSENTIAL_ALIASES.some((a) => a.listId === l.id) && (
                    <span className="pill accent">{copy.library.knowThisCold}</span>
                  )}
                </div>
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: '0.9rem' }}>
                  {l.items.map((item) => <li key={item}>{item}</li>)}
                </ol>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
