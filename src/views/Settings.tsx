/**
 * The settings panel (#36).
 *
 * One place for everything the reader can tune, gathered from where these
 * controls used to be scattered: the theme switch was header chrome, and the
 * session limits were a section buried under the Progress charts. A setting the
 * user has to go hunting for may as well not exist.
 *
 * Two stores meet here on purpose and stay separate. Difficulty and the study
 * limits are account state and go through `updateSettings` to Firestore, so they
 * follow you to any device. Theme does not: it lives in localStorage (see
 * lib/theme.ts) because it must apply before React paints and before sign-in, or
 * the boot splash flashes the wrong theme. The panel is a shared surface for the
 * two, not a merge of them.
 */
import { useState } from 'react';
import { DIFFICULTIES, type Difficulty } from '../data/types';
import { useThemeMode, type ThemeMode } from '../lib/theme';
import type { StoreApi } from '../lib/useStore';
import { isUsableExamDate } from '../lib/store-ops';
import { copy } from '../copy';
import { Card, Field, Segmented, space, sx } from '../ui';

/** Light default, then Dark, then follow-the-OS System. */
const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: copy.theme.light, value: 'light' },
  { label: copy.theme.dark, value: 'dark' },
  { label: copy.theme.system, value: 'system' },
];

const DIFFICULTY_OPTIONS = DIFFICULTIES.map((value) => ({
  label: copy.settings.difficulty.options[value].label,
  value,
}));

/**
 * The follow-the-plan switch is a boolean, but it is rendered as the same
 * two-option Segmented the rest of this panel uses (#40) rather than a
 * checkbox: a checkbox states one side and leaves the other implied, and the
 * choice here is genuinely between two study strategies, not between a
 * behaviour and its absence.
 */
const FOLLOW_PLAN_OPTIONS = [
  { label: copy.settings.followPlan.options.on, value: 'on' },
  { label: copy.settings.followPlan.options.off, value: 'off' },
] as const;

/**
 * The bounds the two number fields already advertise through `min`/`max` (#40).
 *
 * They live here rather than inline on the inputs alone because until now they
 * were decorative: a `min` attribute stops the spinner and the browser's own
 * validity check, and stops nothing at all about what `onChange` writes to the
 * store. One constant feeds both the attribute and the clamp so the promise the
 * control makes and the rule it enforces cannot drift apart.
 */
const LIMITS = {
  newLimit: { min: 5, max: 100 },
  sessionLimit: { min: 10, max: 300 },
} as const;

/**
 * The value to commit for a limit field, or null for "do not commit anything".
 *
 * `Number('')` is 0 and `Number('-')` is NaN, and both used to go straight into
 * the store (#40). A committed `sessionLimit: 0` makes `buildQueue` return an
 * empty array, so "Start review session" jumped to "Session complete, 0
 * answered"; and select-all-then-retype produces exactly that empty string as
 * an intermediate, so it took no misuse at all to hit it.
 */
function limitToCommit(raw: string, bounds: { min: number; max: number }): number | null {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.min(bounds.max, Math.max(bounds.min, Math.round(n)));
}

/**
 * Whether a date string is one the rest of the app can do arithmetic on.
 *
 * An empty `examDate` is the dangerous one, and quietly so: `examTimeOf` builds
 * `new Date('T23:59:59')` from it, which is NaN, and in `srs.grade` the exam
 * clamp is written `daysLeft = Math.max(0, Math.ceil((examTime - now) / DAY))`
 * followed by `daysLeft > 0`. NaN fails that comparison silently, so the clamp,
 * the one place this app deliberately departs from SM-2, guaranteeing every
 * card is seen at least once more before the quiz, simply stops applying, and
 * cards start scheduling past the exam date never to return. Nothing on screen
 * says so beyond a "NaN days until Invalid Date" in the header (#40).
 */
export default function Settings({ api }: { api: StoreApi }) {
  const { store, updateSettings } = api;
  const [themeMode, setTheme] = useThemeMode();
  const { display, difficulty, followPlan, study } = copy.settings;

  /**
   * What the three inputs *show*, which is deliberately not the same thing as
   * what the store holds (#40).
   *
   * Clamping the rendered value instead would make the fields miserable to
   * edit: clear "60" to type "120" and a store-driven value snaps you back to
   * "10" mid-keystroke. So the draft is free, empty, half-typed, out of range,
   * and only the *commit* is guarded. The draft seeds from the store on mount
   * and re-syncs on blur, which is where an ignored or clamped entry visibly
   * settles onto the value that was actually saved. Mount is enough of a seed
   * because App unmounts each view on tab switch, so re-entering Settings
   * always reads fresh state.
   */
  const [draft, setDraft] = useState({
    examDate: store.settings.examDate,
    newLimit: String(store.settings.newLimit),
    sessionLimit: String(store.settings.sessionLimit),
  });

  function editLimit(key: 'newLimit' | 'sessionLimit', raw: string) {
    setDraft((d) => ({ ...d, [key]: raw }));
    const next = limitToCommit(raw, LIMITS[key]);
    if (next !== null) updateSettings({ [key]: next });
  }

  /** Show what was saved, once the field is no longer being typed into. */
  function settle(key: 'examDate' | 'newLimit' | 'sessionLimit') {
    setDraft((d) => ({ ...d, [key]: String(store.settings[key]) }));
  }

  return (
    <div className="stack-in">
      <div className="section">
        <h2>{study.heading}</h2>
        <p className="small muted">{study.help}</p>
        <Card corners>
          <div className="grid three">
            {/* Ids kept from the Progress section this moved out of, so the
                quiz date the Study Plan writes and the one here stay one field
                under two names. */}
            <Field label={study.examDate} htmlFor="exam2">
              <input
                id="exam2"
                className="ctl"
                type="date"
                style={{ width: '100%' }}
                value={draft.examDate}
                onChange={(e) => {
                  const raw = e.target.value;
                  setDraft((d) => ({ ...d, examDate: raw }));
                  // A cleared or half-entered date is a state of the input, not
                  // an instruction to un-set the quiz date; the field keeps it
                  // on screen and the store keeps the last usable one.
                  if (isUsableExamDate(raw)) updateSettings({ examDate: raw });
                }}
                onBlur={() => settle('examDate')}
              />
            </Field>
            <Field label={study.newLimit} htmlFor="nl">
              <input
                id="nl"
                className="ctl"
                type="number"
                min={LIMITS.newLimit.min}
                max={LIMITS.newLimit.max}
                style={{ width: '100%' }}
                value={draft.newLimit}
                onChange={(e) => editLimit('newLimit', e.target.value)}
                onBlur={() => settle('newLimit')}
              />
            </Field>
            <Field label={study.sessionLimit} htmlFor="sl">
              <input
                id="sl"
                className="ctl"
                type="number"
                min={LIMITS.sessionLimit.min}
                max={LIMITS.sessionLimit.max}
                style={{ width: '100%' }}
                value={draft.sessionLimit}
                onChange={(e) => editLimit('sessionLimit', e.target.value)}
                onBlur={() => settle('sessionLimit')}
              />
            </Field>
          </div>
          <p className="tiny muted" style={sx({ marginTop: space[4], marginBottom: 0 })}>
            {study.clampNote}
          </p>
          {/* Sits with the limits rather than in a section of its own (#40):
              this is the fourth answer to "how much, and which part, does the
              trainer put in front of me today?" and reads as a stranger
              anywhere else. */}
          <div
            className="spread"
            style={sx({
              marginTop: space[6],
              paddingTop: space[6],
              borderTop: '1px solid var(--color-divider)',
            })}
          >
            <div>
              <strong className="small">{followPlan.heading}</strong>
              <p className="tiny muted" style={sx({ margin: `${space[1]} 0 0`, maxWidth: '62ch' })}>
                {followPlan.note}
              </p>
            </div>
            <Segmented
              ariaLabel={followPlan.label}
              options={[...FOLLOW_PLAN_OPTIONS]}
              value={store.settings.followPlan ? 'on' : 'off'}
              onChange={(next) => updateSettings({ followPlan: next === 'on' })}
            />
          </div>
        </Card>
      </div>

      <div className="section">
        <h2>{difficulty.heading}</h2>
        <p className="small muted">{difficulty.help}</p>
        <Card corners>
          <Segmented
            ariaLabel={difficulty.label}
            options={DIFFICULTY_OPTIONS}
            value={store.settings.difficulty}
            onChange={(next: Difficulty) => updateSettings({ difficulty: next })}
          />
          {/* All three notes stay visible: the choice is between mechanisms, and
              you cannot compare mechanisms you can only see one at a time. */}
          <dl className="choice-notes">
            {DIFFICULTIES.map((d) => (
              <div key={d} className={d === store.settings.difficulty ? 'is-current' : undefined}>
                <dt>{difficulty.options[d].label}</dt>
                <dd>{difficulty.options[d].note}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <div className="section">
        <h2>{display.heading}</h2>
        <p className="small muted">{display.help}</p>
        <Card corners>
          <div className="spread">
            <div>
              <strong className="small">{display.themeCaption}</strong>
              <p className="tiny muted" style={sx({ margin: `${space[1]} 0 0`, maxWidth: '46ch' })}>
                {display.themeNote}
              </p>
            </div>
            <Segmented
              ariaLabel={copy.theme.label}
              options={THEME_OPTIONS}
              value={themeMode}
              onChange={setTheme}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
