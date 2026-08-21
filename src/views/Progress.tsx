import { useMemo, useRef, useState } from 'react';
import { BOOKS } from '../data/books';
import { allItems } from '../lib/generate';
import { isLeech, strength } from '../lib/srs';
import { exportStore, importStore, todayISO } from '../lib/storage';
import type { StoreApi } from '../lib/useStore';
import { Card, CountUp, Meter, color, space, sx } from '../ui';

export default function Progress({ api }: { api: StoreApi }) {
  const { store, cards, replaceStore, reset, user } = api;
  const items = allItems();
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState('');

  const byBook = useMemo(() => {
    const acc: Record<string, { sum: number; total: number; seen: number }> = {};
    for (const it of items) {
      if (!it.book) continue;
      acc[it.book] ??= { sum: 0, total: 0, seen: 0 };
      acc[it.book].total++;
      const c = cards[it.id];
      acc[it.book].sum += strength(c);
      if (c && c.reps > 0) acc[it.book].seen++;
    }
    return BOOKS.map((b) => {
      const v = acc[b.id] ?? { sum: 0, total: 0, seen: 0 };
      return {
        book: b,
        pct: v.total ? Math.round((v.sum / v.total) * 100) : 0,
        seen: v.seen,
        total: v.total,
      };
    });
  }, [cards, items]);

  const leeches = useMemo(
    () => items.filter((i) => cards[i.id] && isLeech(cards[i.id])),
    [cards, items],
  );

  const last14 = useMemo(() => {
    const out: { date: string; reviewed: number; correct: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = todayISO(d);
      const entry = store.log.find((l) => l.date === iso);
      out.push(entry ?? { date: iso, reviewed: 0, correct: 0 });
    }
    return out;
  }, [store.log]);

  const maxReviewed = Math.max(10, ...last14.map((d) => d.reviewed));

  function doExport() {
    const blob = new Blob([exportStore(store)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scripture-mastery-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function doImport(file: File) {
    file.text().then((text) => {
      const parsed = importStore(text);
      if (parsed) {
        replaceStore(parsed);
        setNote('Progress restored.');
      } else {
        setNote('That file could not be read.');
      }
    });
  }

  return (
    <div className="stack-in">
      <div className="section">
        <h2>Last 14 days</h2>
        <Card corners>
          <div style={sx({ display: 'flex', alignItems: 'flex-end', gap: space[2], height: 90 })}>
            {last14.map((d, i) => (
              <div
                key={d.date}
                className="item-in"
                style={sx({ flex: 1, textAlign: 'center', '--stagger-i': i })}
                title={`${d.date}: ${d.reviewed} answered`}
              >
                <div
                  aria-hidden="true"
                  style={sx({
                    height: `${(d.reviewed / maxReviewed) * 72}px`,
                    background: d.reviewed ? color.accent : color.divider,
                    minHeight: 2,
                  })}
                />
                <div className="tiny muted" style={sx({ marginTop: space[1] })}>{d.date.slice(8)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="section">
        <h2>Mastery by book</h2>
        <p className="small muted">Anything under 50% is worth a targeted quiz. Sort your attention here.</p>
        <Card corners className="scroll-x">
          <table className="data">
            <thead>
              <tr><th>#</th><th>Book</th><th>Division</th><th style={{ width: 160 }}>Mastery</th><th>Seen</th></tr>
            </thead>
            <tbody>
              {byBook.map((r) => (
                <tr key={r.book.id}>
                  <td className="mono tiny muted">{r.book.order}</td>
                  <td><strong>{r.book.name}</strong></td>
                  <td className="tiny muted">{r.book.division}</td>
                  <td>
                    <Meter
                      value={r.pct}
                      className={r.pct >= 80 ? 'good' : ''}
                      label={`${r.book.name} mastery, ${r.pct}%`}
                    />
                  </td>
                  <td className="tiny muted mono">{r.seen}/{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {leeches.length > 0 && (
        <div className="section">
          <h2>Stuck items <span className="pill bad"><CountUp value={leeches.length} /></span></h2>
          <p className="small muted">
            You have missed these four or more times. Drilling them harder rarely works — go read the
            book’s entry in the reference, find the hook, then come back.
          </p>
          <Card corners className="scroll-x">
            <table className="data">
              <thead><tr><th>Question</th><th>Answer</th></tr></thead>
              <tbody>
                {leeches.slice(0, 25).map((leech) => (
                  <tr key={leech.id}>
                    <td>{leech.prompt}</td>
                    <td><strong>{leech.kind === 'order' ? (leech.sequence ?? []).join(' → ') : leech.answer}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* The quiz date and the session limits used to live here as a "Settings"
          section. They moved to the Settings panel (#36) so there is one place
          to look for a preference. */}

      <div className="section">
        <h2>Your data</h2>
        <Card corners>
          <p className="small muted">
            Progress syncs to Firestore under {user?.email ?? 'your account'} and follows you to any
            device you sign in on. Export still makes a local backup any time you want one.
          </p>
          <div className="row">
            <button className="btn" onClick={doExport}>Export progress</button>
            <button className="btn" onClick={() => fileRef.current?.click()}>Import progress</button>
            <input ref={fileRef} type="file" accept="application/json" hidden
              onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
            <button className="btn" onClick={() => {
              if (confirm('Erase all review history and start over? This cannot be undone.')) {
                reset();
                setNote('Progress cleared.');
              }
            }}>Reset progress</button>
          </div>
          {note && <p className="tiny" style={sx({ marginTop: space[3], marginBottom: 0 })}>{note}</p>}
        </Card>
      </div>
    </div>
  );
}
