/**
 * The blueprint component kit.
 *
 * Small, unopinionated building blocks that render the class vocabulary defined
 * in styles.css. Views compose these instead of re-declaring corner marks,
 * meter markup, or count-up plumbing by hand. Each keeps the truthful-state
 * discipline of the sibling app: decoration is aria-hidden, real figures carry
 * an accessible name, and every motion has a reduced-motion resting state baked
 * into the stylesheet.
 */
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { sx } from './tokens';

/* The four registration ticks that turn a bordered box into a drafting plate.
   Purely decorative — the plate's meaning lives in its content, not its corners. */
export function Corners() {
  return (
    <>
      <span className="corner tl" aria-hidden="true" />
      <span className="corner tr" aria-hidden="true" />
      <span className="corner bl" aria-hidden="true" />
      <span className="corner br" aria-hidden="true" />
    </>
  );
}

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** draw the four corner registration marks */
  corners?: boolean;
  /** small uppercase accent label above the title */
  kicker?: ReactNode;
  title?: ReactNode;
  /** give the card a faint surface fill instead of a bare hairline border */
  filled?: boolean;
}

export function Card({ corners, kicker, title, filled, className = '', children, ...rest }: CardProps) {
  return (
    <div className={`card${filled ? ' filled' : ''}${className ? ` ${className}` : ''}`} {...rest}>
      {corners && <Corners />}
      {kicker != null && <div className="card-kicker">{kicker}</div>}
      {title != null && <div className="card-title">{title}</div>}
      {children}
    </div>
  );
}

/** A bordered plate with corner marks and nothing assumed about its content. */
export function Blueprint({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`blueprint${className ? ` ${className}` : ''}`} {...rest}>
      <Corners />
      {children}
    </div>
  );
}

interface CountUpProps {
  value: number;
  /** sweep from 0 → value on mount; false renders the figure statically */
  animate?: boolean;
  className?: string;
}

/**
 * A hero figure that counts up with zero JS: the browser interpolates the
 * registered `--count` integer and the stylesheet prints it via counter().
 * Marked role="img" with the final value as its name, so assistive tech is told
 * the destination immediately rather than watching the animation tick.
 */
export function CountUp({ value, animate = true, className = '' }: CountUpProps) {
  const n = Math.max(0, Math.round(value));
  return (
    <span
      className={`count-up${animate ? ' animate' : ''}${className ? ` ${className}` : ''}`}
      style={sx({ '--count': n })}
      role="img"
      aria-label={String(n)}
    />
  );
}

interface MeterProps {
  /** current value, in the same unit as `max` */
  value: number;
  max?: number;
  /** sweep the fill in on mount */
  animate?: boolean;
  className?: string;
  /** when set, the meter becomes an accessible progressbar with this name */
  label?: string;
}

export function Meter({ value, max = 100, animate = true, className = '', label }: MeterProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const rounded = Math.round(pct);
  return (
    <div
      className={`meter${animate ? ' animate' : ''}${className ? ` ${className}` : ''}`}
      role={label ? 'progressbar' : undefined}
      aria-label={label}
      aria-valuenow={label ? rounded : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
    >
      <i style={sx({ width: `${pct}%`, '--meter-to': `${pct}%` })} />
    </div>
  );
}

interface SegmentedProps<T extends string | number> {
  options: { label: ReactNode; value: T }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: SegmentedProps<T>) {
  const selectedIndex = options.findIndex((o) => o.value === value);
  // Native radios move selection with the arrow keys and expose one tab stop for
  // the whole group; mirror that so the segmented control keeps the keyboard
  // contract a <select> or radio set would have given us.
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const n = options.length;
    const from = selectedIndex < 0 ? 0 : selectedIndex;
    let next = from;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = from + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = from - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else return;
    e.preventDefault();
    const idx = ((next % n) + n) % n;
    onChange(options[idx].value);
    const radios = e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios[idx]?.focus();
  }
  return (
    <div
      className={`seg${className ? ` ${className}` : ''}`}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
    >
      {options.map((o, i) => {
        const checked = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            className="seg-opt"
            aria-checked={checked}
            // Roving tabindex: the selected option is the single tab stop; if
            // nothing is selected yet, the first option carries it so the group
            // is still reachable.
            tabIndex={checked || (selectedIndex < 0 && i === 0) ? 0 : -1}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

/** A caption-above-control form field. Children are the actual input/select. */
export function Field({ label, htmlFor, className = '', children }: FieldProps) {
  return (
    <div className={`field${className ? ` ${className}` : ''}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}
