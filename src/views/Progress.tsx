import { useMemo, useRef, useState } from 'react';
import { BOOKS } from '../data/books';
import { allItems } from '../lib/generate';
import { isLeech, strength } from '../lib/srs';
import { exportStore, importStore, todayISO } from '../lib/storage';
import type { StoreApi } from '../lib/useStore';

export default function Progress({ api }: { api: StoreApi }) {
  const { store, cards, updateSettings, replaceStore, reset, user } = api;
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
    <div>
      <div className="section">
        <h2>Last 14 days</h2>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 90 }}>
            {last14.map((d) => (
              <div key={d.date} style={{ flex: 1, textAlign: 'center' }} title={`${d.date}: ${d.reviewed} answered`}>
                <div
                  style={{
                    height: `${(d.reviewed / maxReviewed) * 72}px`,
                    background: d.reviewed ? 'var(--accent)' : 'var(--border)',
                    borderRadius: 3,
                    minHeight: 2,
                  }}
                />
                <div className="tiny muted" style={{ marginTop: 4 }}>{d.date.slice(8)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Mastery by book</h2>
        <p className="small muted">Anything under 50% is worth a targeted quiz. Sort your attention here.</p>
        <div className="card scroll-x">
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
                    <div className={`bar${r.pct >= 80 ? ' good' : ''}`}><i style={{ width: `${r.pct}%` }} /></div>
                  </td>
                  <td className="tiny muted mono">{r.seen}/{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {leeches.length > 0 && (
        <div className="section">
          <h2>Stuck items <span className="pill bad">{leeches.length}</span></h2>
          <p className="small muted">
            You have missed these four or more times. Drilling them harder rarely works — go read the
            book’s entry in the reference, find the hook, then come back.
          </p>
          <div className="card scroll-x">
            <table className="data">
              <thead><tr><th>Question</th><th>Answer</th></tr></thead>
              <tbody>
                {leeches.slice(0, 25).map((i) => (
                  <tr key={i.id}>
                    <td>{i.prompt}</td>
                    <td><strong>{i.kind === 'order' ? (i.sequence ?? []).join(' → ') : i.answer}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="section">
        <h2>Settings</h2>
        <div className="card">
          <div className="grid three">
            <div>
              <label className="field" htmlFor="exam2">Quiz date</label>
              <input id="exam2" className="ctl" type="date" style={{ width: '100%' }}
                value={store.settings.examDate}
                onChange={(e) => updateSettings({ examDate: e.target.value })} />
            </div>
            <div>
              <label className="field" htmlFor="nl">New cards per session</label>
              <input id="nl" className="ctl" type="number" min={5} max={100} style={{ width: '100%' }}
                value={store.settings.newLimit}
                onChange={(e) => updateSettings({ newLimit: Number(e.target.value) })} />
            </div>
            <div>
              <label className="field" htmlFor="sl">Max cards per session</label>
              <input id="sl" className="ctl" type="number" min={10} max={300} style={{ width: '100%' }}
                value={store.settings.sessionLimit}
                onChange={(e) => updateSettings({ sessionLimit: Number(e.target.value) })} />
            </div>
          </div>
          <p className="tiny muted" style={{ marginTop: 14 }}>
            Review intervals are capped so no card is scheduled past your quiz date without one more
            look at it.
          </p>
        </div>
      </div>

      <div className="section">
        <h2>Your data</h2>
        <div className="card">
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
          {note && <p className="tiny" style={{ marginTop: 10, marginBottom: 0 }}>{note}</p>}
        </div>
      </div>
    </div>
  );
}
