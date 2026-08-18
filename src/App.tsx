import { useEffect, useState } from 'react';
import Dashboard from './views/Dashboard';
import Review from './views/Review';
import Quiz from './views/Quiz';
import Library from './views/Library';
import Plan from './views/Plan';
import Progress from './views/Progress';
import { useStore } from './lib/useStore';
import { allItems } from './lib/generate';
import { ALLOWED_DOMAINS, signIn, signOutUser } from './lib/firebase';

const TABS = [
  { id: 'home', label: 'Dashboard' },
  { id: 'review', label: 'Daily Review' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'library', label: 'Reference' },
  { id: 'plan', label: 'Study Plan' },
  { id: 'progress', label: 'Progress' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function currentHash(): TabId {
  const h = window.location.hash.replace('#', '') as TabId;
  return TABS.some((t) => t.id === h) ? h : 'home';
}

export default function App() {
  const api = useStore();
  const [tab, setTab] = useState<TabId>(currentHash);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const onHash = () => setTab(currentHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function go(next: string) {
    window.location.hash = next;
    setTab(next as TabId);
    window.scrollTo({ top: 0 });
  }

  const total = allItems().length;

  if (api.authStatus === 'loading' || (api.authStatus === 'ready' && !api.storeReady)) {
    return (
      <div className="app">
        <div className="empty">
          <h2>Scripture Mastery</h2>
          <p className="small muted">Loading…</p>
        </div>
      </div>
    );
  }

  if (api.authStatus !== 'ready') {
    const denied = api.authStatus === 'denied';
    return (
      <div className="app">
        <div className="empty">
          <h2>Scripture Mastery</h2>
          {denied ? (
            <p className="small muted">
              {api.user?.email} isn’t on an allowed domain. Sign in with an{' '}
              {ALLOWED_DOMAINS.join(' or ')} account instead.
            </p>
          ) : (
            <p className="small muted">
              Sign in with your {ALLOWED_DOMAINS.join(' or ')} account to study.
            </p>
          )}
          <div className="row" style={{ justifyContent: 'center' }}>
            {denied && (
              <button className="btn" onClick={() => signOutUser()}>
                Sign out
              </button>
            )}
            {!denied && (
              <button
                className="btn primary"
                onClick={() => {
                  setAuthError('');
                  signIn().catch((err) => setAuthError(err instanceof Error ? err.message : String(err)));
                }}
              >
                Sign in with Google
              </button>
            )}
          </div>
          {authError && (
            <p className="tiny" style={{ color: 'var(--bad)', marginTop: 10 }}>
              {authError}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          Scripture Mastery
          <span>{total.toLocaleString()} questions across 66 books</span>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="countdown">
            <strong>{api.daysLeft}</strong> days until {new Date(`${api.store.settings.examDate}T12:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
          </div>
          <button className="btn sm" title={api.user?.email ?? ''} onClick={() => signOutUser()}>
            Sign out
          </button>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} aria-current={tab === t.id} onClick={() => go(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'home' && <Dashboard api={api} go={go} />}
      {tab === 'review' && <Review api={api} />}
      {tab === 'quiz' && <Quiz api={api} />}
      {tab === 'library' && <Library />}
      {tab === 'plan' && <Plan api={api} />}
      {tab === 'progress' && <Progress api={api} />}
    </div>
  );
}
