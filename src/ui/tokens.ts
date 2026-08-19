/**
 * Typed handles onto the CSS custom properties declared in styles.css.
 *
 * These are the ONE source the TS side reaches for when it must set a colour,
 * a duration, or a spacing step inline — so a value like the steel-blue accent
 * is never re-typed as a hex literal in a component (which would silently drift
 * from the token and, worse, ignore the dark theme). Everything resolves to a
 * `var(--…)` string, so it still tracks the light/dark swap at the point of use.
 */
import type { CSSProperties } from 'react';

export const color = {
  bg: 'var(--color-bg)',
  surface: 'var(--color-surface)',
  text: 'var(--color-text)',
  accent: 'var(--color-accent)',
  accent2: 'var(--color-accent-2)',
  error: 'var(--color-error)',
  divider: 'var(--color-divider)',
  muted: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
  tintAccent: 'var(--tint-accent)',
  tintError: 'var(--tint-error)',
  tintSurface: 'var(--tint-surface)',
} as const;

export const space = {
  1: 'var(--space-1)',
  2: 'var(--space-2)',
  3: 'var(--space-3)',
  4: 'var(--space-4)',
  6: 'var(--space-6)',
  8: 'var(--space-8)',
} as const;

export const font = {
  heading: 'var(--font-heading)',
  body: 'var(--font-body)',
  mono: 'var(--font-mono)',
} as const;

export const dur = {
  tap: 'var(--dur-tap)',
  swap: 'var(--dur-swap)',
  tell: 'var(--dur-tell)',
} as const;

export const ease = 'var(--ease-out)';

/**
 * A CSSProperties that also permits `--custom` keys (React types reject them
 * by default). Lets a view write `style={sx({ '--stagger-i': i })}` to feed the
 * staggered-entrance motion, or set a width alongside a token, type-checked.
 */
export type Style = CSSProperties & Record<`--${string}`, string | number>;
export const sx = (s: Style): CSSProperties => s as CSSProperties;
