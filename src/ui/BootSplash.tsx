/**
 * The registration-mark boot screen.
 *
 * Stands in front of the app while it decides where to send you — signed in to
 * the board, or out to the sign-in prompt — so a returning member with restored
 * progress is never flashed the login for the length of the auth check. The
 * plate is "printed in reverse" (paper marks on an ink ground) to read as the
 * press warming up. Under reduced motion the sweep parks and one step label
 * stays lit: a screen that is waiting, not one that has finished.
 */
import { copy } from '../copy';
import { Corners } from './primitives';

export function BootSplash() {
  return (
    <div
      className="boot-splash"
      role="status"
      aria-live="polite"
      aria-label={`${copy.appName} — ${copy.loading}`}
    >
      <div className="scale">
        <Corners />
        <div className="wordmark">{copy.appName}</div>
        <div className="epigraph">{copy.boot.epigraph}</div>
        <div className="rule" aria-hidden="true">
          <i />
        </div>
        <div className="cycle" aria-hidden="true">
          {copy.boot.steps.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
