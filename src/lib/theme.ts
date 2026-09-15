/**
 * Theme choice, Light (default) · Dark · System.
 *
 * The mode is the user's *choice*; 'system' follows the OS, 'light'/'dark' pin
 * it. Light is the default when nothing is saved, so the app opens light even on
 * an OS set to dark, 'system' is the explicit opt-in back to following the OS.
 *
 * The choice lives in localStorage (a per-device display preference, not synced
 * account state), which lets it apply before React paints and before sign-in,
 * so the boot splash and sign-in screen are already in the right theme with no
 * flash of the wrong one.
 *
 * We resolve the choice to a concrete light|dark value and write it to
 * <html data-theme>. styles.css keeps :root as the light source of truth and
 * defines [data-theme='dark']; because 'system' is resolved *here* rather than
 * in a media query, the stylesheet needs only the two concrete themes, no
 * duplication.
 */
import { useSyncExternalStore } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'sm-theme';
export const DEFAULT_MODE: ThemeMode = 'light';

const DARK_QUERY = '(prefers-color-scheme: dark)';

const isMode = (v: unknown): v is ThemeMode =>
  v === 'light' || v === 'dark' || v === 'system';

function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(DARK_QUERY).matches
  );
}

/** The user's saved choice, or the Light default when unset/unreadable. */
export function getThemeMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isMode(saved)) return saved;
  } catch {
    /* localStorage can throw in private mode / sandboxed frames, fall back */
  }
  return DEFAULT_MODE;
}

/** Collapse a mode to the concrete theme the DOM should show right now. */
export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') return prefersDark() ? 'dark' : 'light';
  return mode;
}

/** Write the resolved theme onto <html> so the whole token cascade follows. */
function paint(mode: ThemeMode): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = resolveTheme(mode);
  }
}

const listeners = new Set<() => void>();

/** Persist the choice, repaint, and notify React subscribers. */
export function setThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* persistence can fail (private mode); still apply it for this session */
  }
  paint(mode);
  listeners.forEach((fn) => fn());
}

/**
 * Apply the saved theme and keep 'system' honest: when the OS flips light/dark,
 * repaint, but only while the user is still on 'system'. Call once, as early as
 * possible (before the first React render) so there's no flash.
 */
export function initTheme(): void {
  paint(getThemeMode());
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
  const mql = window.matchMedia(DARK_QUERY);
  const onSystemChange = () => {
    if (getThemeMode() === 'system') paint('system');
  };
  // addEventListener is the modern API; older Safari only has addListener.
  if (typeof mql.addEventListener === 'function') mql.addEventListener('change', onSystemChange);
  else if (typeof mql.addListener === 'function') mql.addListener(onSystemChange);
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/**
 * Read the current mode and a setter, re-rendering when the choice changes.
 * Returns a tuple mirroring useState's shape.
 */
export function useThemeMode(): [ThemeMode, (mode: ThemeMode) => void] {
  const mode = useSyncExternalStore(subscribe, getThemeMode, getThemeMode);
  return [mode, setThemeMode];
}
