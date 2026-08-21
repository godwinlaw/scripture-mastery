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
import { DIFFICULTIES, type Difficulty } from '../data/types';
import { useThemeMode, type ThemeMode } from '../lib/theme';
import type { StoreApi } from '../lib/useStore';
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

export default function Settings({ api }: { api: StoreApi }) {
  const { store, updateSettings } = api;
  const [themeMode, setTheme] = useThemeMode();
  const { display, difficulty, study } = copy.settings;

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
                value={store.settings.examDate}
                onChange={(e) => updateSettings({ examDate: e.target.value })}
              />
            </Field>
            <Field label={study.newLimit} htmlFor="nl">
              <input
                id="nl"
                className="ctl"
                type="number"
                min={5}
                max={100}
                style={{ width: '100%' }}
                value={store.settings.newLimit}
                onChange={(e) => updateSettings({ newLimit: Number(e.target.value) })}
              />
            </Field>
            <Field label={study.sessionLimit} htmlFor="sl">
              <input
                id="sl"
                className="ctl"
                type="number"
                min={10}
                max={300}
                style={{ width: '100%' }}
                value={store.settings.sessionLimit}
                onChange={(e) => updateSettings({ sessionLimit: Number(e.target.value) })}
              />
            </Field>
          </div>
          <p className="tiny muted" style={sx({ marginTop: space[4], marginBottom: 0 })}>
            {study.clampNote}
          </p>
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
