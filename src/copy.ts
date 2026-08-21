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

  /**
   * The settings panel (#36).
   *
   * Difficulty is the reason this copy has to work hard: "Easy / Medium / Hard"
   * says nothing about *what* changes, and what changes here is where a
   * question's wrong options are drawn from. So every level carries a sentence
   * describing the mechanism, and all three stay on screen at once — a reader
   * choosing between them needs to compare them, not discover them one at a
   * time.
   */
  settings: {
    display: {
      heading: 'Display',
      help: 'Kept on this device, not in your account — so a shared computer never changes how the app looks on your own.',
      themeCaption: 'Theme',
      themeNote: 'Light by default. System follows whatever your computer is set to.',
    },

    difficulty: {
      heading: 'Difficulty',
      /** accessible name for the Easy/Medium/Hard switch */
      label: 'Default difficulty',
      help: 'Difficulty decides where a question’s wrong answers come from, and which cards the review queue puts in front of you. It takes effect on the next question you see.',
      options: {
        easy: {
          label: 'Easy',
          note: 'Wrong answers can be drawn from anywhere in the canon, so the right one usually stands out on sight. The queue keeps bringing back the cards you already answer well.',
        },
        medium: {
          label: 'Medium',
          note: 'Wrong answers come from books near the answer’s own, and never cross between the Old and New Testaments. This is how the trainer has always worked.',
        },
        hard: {
          label: 'Hard',
          note: 'Wrong answers come only from the same book, so nothing is given away by context. The queue spends most of its time on whatever you keep missing.',
        },
      },
    },

    study: {
      heading: 'Study',
      help: 'The date everything is scheduled against, and how much the trainer puts in front of you in one sitting.',
      examDate: 'Quiz date',
      newLimit: 'New cards per session',
      sessionLimit: 'Max cards per session',
      clampNote:
        'Review intervals are capped so no card is scheduled past your quiz date without one more look at it.',
    },
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
