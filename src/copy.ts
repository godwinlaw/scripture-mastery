/**
 * Every user-facing string the shell and set-pieces speak, in one place.
 *
 * The voice is the sibling app's: calm, plain, never gamified. We don't show a
 * number the reader can't act on, and we don't dress a study tool up as a game.
 * Views centralise their own copy here as they migrate; keeping it together is
 * what lets the tone stay one tone.
 */

/** Join a domain list into readable prose: ["a","b"] → "a or b". */
function orList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`;
}

export const copy = {
  appName: 'Scripture Mastery',

  /**
   * The motto verse (#22). The trainer's own charge: the work is handling the
   * text rightly, not merely admiring it. Quoted in full, as the issue gives it.
   *
   * Top-level rather than under `boot` because two screens speak it — the boot
   * splash and the sign-in (#23) — and a verse transcribed twice is a verse
   * that will eventually disagree with itself. `ref` travels with `text` so the
   * line is never shown anonymously; a verse without its citation reads as a
   * slogan.
   */
  motto: {
    text:
      '“Do your best to present yourself to God as one approved, a worker who has no need to be ashamed, rightly handling the word of truth.”',
    ref: '2 Timothy 2:15 ESV',
  },

  header: {
    /** e.g. "1,240 questions across 66 books" */
    tagline: (questionCount: number) =>
      `${questionCount.toLocaleString()} questions across 66 books`,
    /** e.g. "112 days until October 4" — the meaningful, actionable figure */
    countdown: (daysLeft: number, examDateLabel: string) =>
      `${daysLeft.toLocaleString()} day${daysLeft === 1 ? '' : 's'} until ${examDateLabel}`,
    signOut: 'Sign out',
  },

  theme: {
    /** accessible name for the Light/Dark/System switch (no visible caption) */
    label: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },

  boot: {
    steps: ['Indexing the canon', 'Restoring your progress', 'Queueing today’s review'],
  },

  mobileGate: {
    body:
      'This trainer is built for a full keyboard and a wide screen — and, honestly, for time set apart rather than time squeezed in. Come back from a computer when you can give it your attention.',
  },

  auth: {
    prompt: (domains: readonly string[]) =>
      `Sign in with your ${orList(domains)} account to begin.`,
    denied: (email: string | null | undefined, domains: readonly string[]) =>
      `${email ?? 'That account'} isn’t on an allowed domain. Sign in with ${orList(domains)} instead.`,
    signInButton: 'Sign in with Google',
    signOut: 'Sign out',
  },

  loading: 'Loading…',
} as const;
