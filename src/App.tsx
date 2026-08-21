import { useEffect, useState } from 'react';
import Dashboard from './views/Dashboard';
import Review from './views/Review';
import Quiz from './views/Quiz';
import Library from './views/Library';
import Plan from './views/Plan';
import Progress from './views/Progress';
import Settings from './views/Settings';
import { useStore } from './lib/useStore';
import { allItems } from './lib/generate';
import { ALLOWED_DOMAINS, signIn, signOutUser } from './lib/firebase';
import GoogleMark from './ui/GoogleMark';
import { BootSplash, MobileGate, Corners, useIsMobile } from './ui';
import { copy } from './copy';

const TABS = [
  { id: 'home', label: 'Dashboard' },
  { id: 'review', label: 'Daily Review' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'library', label: 'Reference' },
  { id: 'plan', label: 'Study Plan' },
  { id: 'progress', label: 'Progress' },
  { id: 'settings', label: 'Settings' },
] as const;

type TabId = (typeof TABS)[number]['id'];

/** How long the boot mark stays up at minimum, so it reads as a screen and not
 *  a flicker. Never blocks past a genuine load that outlasts it. */
const SPLASH_MIN_MS = 1100;

function currentHash(): TabId {
  const h = window.location.hash.replace('#', '') as TabId;
  return TABS.some((t) => t.id === h) ? h : 'home';
}

export default function App() {
  const api = useStore();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<TabId>(currentHash);
  const [authError, setAuthError] = useState('');
  const [splashHeld, setSplashHeld] = useState(true);

  useEffect(() => {
    const onHash = () => setTab(currentHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setSplashHeld(false), SPLASH_MIN_MS);
    return () => window.clearTimeout(t);
  }, []);

  function go(next: string) {
    window.location.hash = next;
    setTab(next as TabId);
    window.scrollTo({ top: 0 });
  }

  const total = allItems().length;

  // A member who can't get in shouldn't watch the press warm up: refuse first.
  if (isMobile) {
    return <MobileGate />;
  }

  // Decide behind the splash — don't flash the sign-in to a returning member
  // while auth is still resolving.
  const booting =
    api.authStatus === 'loading' || (api.authStatus === 'ready' && !api.storeReady);
  if (booting || splashHeld) {
    return <BootSplash />;
  }

  if (api.authStatus !== 'ready') {
    const denied = api.authStatus === 'denied';
    return (
      <div className="app">
        <div className="empty screen">
          <div className="blueprint" style={{ maxWidth: 360, margin: '0 auto', padding: '40px 32px' }}>
            <Corners />
            {/* The mark, at a size that reads as the app's face rather than a
                favicon. Sourced from the same file the browser tab uses, so
                the two cannot drift; BASE_URL keeps it correct under vite's
                relative `base`. */}
            <img
              className="signin-mark"
              src={`${import.meta.env.BASE_URL}icon.svg`}
              alt=""
              width={88}
              height={88}
            />
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                fontSize: 18,
                marginBottom: 16,
              }}
            >
              {copy.appName}
            </div>
            <blockquote className="signin-motto">
              {copy.motto.text}
              <cite>{copy.motto.ref}</cite>
            </blockquote>
            <p className="small muted">
              {denied
                ? copy.auth.denied(api.user?.email, ALLOWED_DOMAINS)
                : copy.auth.prompt(ALLOWED_DOMAINS)}
            </p>
            <div className="row" style={{ justifyContent: 'center', marginTop: 6 }}>
              {denied ? (
                <button className="btn" onClick={() => signOutUser()}>
                  {copy.auth.signOut}
                </button>
              ) : (
                <button
                  className="btn primary"
                  onClick={() => {
                    setAuthError('');
                    signIn().catch((err) =>
                      setAuthError(err instanceof Error ? err.message : String(err)),
                    );
                  }}
                >
                  <GoogleMark />
                  {copy.auth.signInButton}
                </button>
              )}
            </div>
            {authError && (
              <p className="tiny" style={{ color: 'var(--color-error)', marginTop: 10 }}>
                {authError}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const examDateLabel = new Date(`${api.store.settings.examDate}T12:00`).toLocaleDateString(
    undefined,
    { month: 'long', day: 'numeric' },
  );

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          {/* favicon.svg, not the icon.svg the sign-in screen uses: this is the
              mark's small-size cut, drawn for exactly this range. BASE_URL for
              the same reason as there — vite's base is relative. */}
          <img
            className="brand-mark"
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
            width={22}
            height={22}
          />
          {copy.appName}
          <span>{copy.header.tagline(total)}</span>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="countdown">
            <strong>{api.daysLeft.toLocaleString()}</strong> day{api.daysLeft === 1 ? '' : 's'} until{' '}
            {examDateLabel}
          </div>
          {/* The theme switch used to sit here; it moved into the Settings
              panel with the rest of the preferences (#36). */}
          <button className="btn sm" title={api.user?.email ?? ''} onClick={() => signOutUser()}>
            {copy.header.signOut}
          </button>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => go(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main key={tab} className="screen">
        {tab === 'home' && <Dashboard api={api} go={go} />}
        {tab === 'review' && <Review api={api} />}
        {tab === 'quiz' && <Quiz api={api} />}
        {tab === 'library' && <Library />}
        {tab === 'plan' && <Plan api={api} />}
        {tab === 'progress' && <Progress api={api} />}
        {tab === 'settings' && <Settings api={api} />}
      </main>
    </div>
  );
}
