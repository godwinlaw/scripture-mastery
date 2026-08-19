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

  header: {
    /** e.g. "1,240 questions across 66 books" */
    tagline: (questionCount: number) =>
      `${questionCount.toLocaleString()} questions across 66 books`,
    /** e.g. "112 days until October 4" — the meaningful, actionable figure */
    countdown: (daysLeft: number, examDateLabel: string) =>
      `${daysLeft.toLocaleString()} day${daysLeft === 1 ? '' : 's'} until ${examDateLabel}`,
    signOut: 'Sign out',
  },

  boot: {
    // 2 Timothy 2:15 — the trainer's own charge, not a slogan.
    epigraph: '“Study to shew thyself approved.”',
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
