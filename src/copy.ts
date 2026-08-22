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
   * says nothing about *what* changes. So every level carries a note describing
   * the mechanism, and all three stay on screen at once — a reader choosing
   * between them needs to compare them, not discover them one at a time.
   *
   * Those notes were rewritten in #38 because they had gone stale: they still
   * described a setting that only moved wrong answers around, while the control
   * had quietly grown three more effects — how many options a question offers,
   * whether it asks for free recall first, and how new material is introduced.
   * Copy that promises less than the code does is the same defect as copy that
   * promises more; both leave the reader choosing blind. The figures below are
   * the ones in lib/difficulty.ts (`DIFFICULTY_SPEC`) and have to move with it.
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
      help: 'Difficulty changes four things: where a question’s wrong answers come from, how many options you are offered, whether a reference has to be named from memory first, and how new material is introduced. It takes effect on the next question you see.',
      options: {
        easy: {
          label: 'Easy',
          note: 'Three options, with the wrong two drawn from anywhere in the canon — usually wrong on sight. References are never asked from memory, and the explanation is offered as a hint before you answer. New material walks the canon in order, a little at a time.',
        },
        medium: {
          label: 'Medium',
          note: 'Four options, with the wrong three drawn from books near the answer’s own and never across the Old/New Testament seam. A reference asks you to name it from memory before the choices appear. New material is interleaved. This is how the trainer has always worked.',
        },
        hard: {
          label: 'Hard',
          note: 'Six options, drawn as close to the answer as the question allows — the same book where there is one, canonical neighbours for book order, the same era or family for people. References are always named from memory first, with no hint. New material comes from anywhere in the current scope in an unpredictable order, half again as much of it, and a card you miss does not come back until tomorrow.',
        },
      },
    },

    /**
     * The follow-the-plan switch (#38).
     *
     * The note has one job the help line cannot do: say what happens when the
     * phase runs dry. A reader who thinks a calendar can lock them out of
     * studying will turn this off and never turn it back on, so the widening
     * has to be stated up front rather than discovered.
     */
    followPlan: {
      heading: 'Follow the study plan',
      /** accessible name for the On/Off switch */
      label: 'Follow the study plan',
      help: 'Your daily review draws from whichever phase the plan is currently in, rather than from the whole bank at once. Quizzes are unaffected — they still cover whatever you point them at.',
      options: { on: 'On', off: 'Off' },
      note: 'The plan works in order — the frame first, then the Old Testament, then the New, then the timeline and mixed review — and this keeps the daily queue inside it. When there is not enough left in the current phase to fill a session, the queue quietly widens to the rest of the bank rather than telling you there is nothing to study.',
      /** Names the phase the queue is currently drawn from, on the review screen. */
      activeOn: (phaseName: string) => `Following the study plan: ${phaseName}.`,
      studyEverything: 'Study everything instead',
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
