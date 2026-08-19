/**
 * The courteous mobile refusal.
 *
 * A dead end: nothing to press, nothing to wait for. It fires before the boot
 * splash — a member who won't get in shouldn't be made to watch the press warm
 * up. Its one job is to name itself while it declines, in the app's own voice.
 */
import { copy } from '../copy';
import { Corners } from './primitives';

export function MobileGate() {
  return (
    <div className="mobile-gate">
      <div className="plate">
        <Corners />
        <div className="wordmark">{copy.appName}</div>
        <p>{copy.mobileGate.body}</p>
      </div>
    </div>
  );
}
