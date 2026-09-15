/**
 * Every user-facing string in the app, in one file.
 *
 * The voice is calm, plain, never gamified. We don't show a number the reader
 * can't act on, and we don't dress a study tool up as a game. Keeping it
 * together is what lets the tone stay one tone, and it means the wording can
 * be edited without opening a component.
 *
 * **What is here and what is not.** Here: everything the app *says*, headings,
 * blurbs, button labels, table headers, empty states, the ANCHORED guide, the
 * study plan's phases and drills. Not here: the question bank. Those 6,305
 * questions are generated from structured content in `src/data/` (books,
 * people, essentials, doctrine) and belong with the facts they encode, not with
 * the interface. Editing a book's summary is editing content; editing "Take a
 * quiz" is editing copy.
 *
 * Anything keyed by a `Topic` or a phase id is read back by `src/data/`, see
 * `strands.labels`, `plan.phases`. The keys are the contract; the values are
 * yours.
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
   * Top-level rather than under `boot` because two screens speak it, the boot
   * splash and the sign-in (#23), and a verse transcribed twice is a verse
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
    /** e.g. "112 days until January 31", the meaningful, actionable figure */
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
   * the mechanism, and all three stay on screen at once, a reader choosing
   * between them needs to compare them, not discover them one at a time.
   *
   * Those notes were rewritten in #40 because they had gone stale: they still
   * described a setting that only moved wrong answers around, while the control
   * had quietly grown three more effects, how many options a question offers,
   * whether it asks for free recall first, and how new material is introduced.
   * Copy that promises less than the code does is the same defect as copy that
   * promises more; both leave the reader choosing blind. The figures below are
   * the ones in lib/difficulty.ts (`DIFFICULTY_SPEC`) and have to move with it.
   */
  settings: {
    display: {
      heading: 'Display',
      help: 'Kept on this device, not in your account, so a shared computer never changes how the app looks on your own.',
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
          note: 'Three options, with the wrong two drawn from anywhere in the canon, usually wrong on sight. References are never asked from memory, and the explanation is offered as a hint before you answer. New material walks the canon in order, a little at a time.',
        },
        medium: {
          label: 'Medium',
          note: 'Four options, with the wrong three drawn from books near the answer’s own and never across the Old/New Testament seam. A reference asks you to name it from memory before the choices appear. New material is interleaved. This is how the trainer has always worked.',
        },
        hard: {
          label: 'Hard',
          note: 'Six options, drawn as close to the answer as the question allows, the same book where there is one, canonical neighbours for book order, the same era or family for people. References are always named from memory first, with no hint. New material comes from anywhere in the current scope in an unpredictable order, half again as much of it, and a card you miss does not come back until tomorrow.',
        },
      },
    },

    /**
     * The follow-the-plan switch (#40).
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
      help: 'Your daily review draws from whichever phase the plan is currently in, rather than from the whole bank at once. Quizzes are unaffected, they still cover whatever you point them at.',
      options: { on: 'On', off: 'Off' },
      note: 'The plan works in order, the frame first, then the Old Testament, then the New, then the timeline and mixed review, and this keeps the daily queue inside it. When there is not enough left in the current phase to fill a session, the queue quietly widens to the rest of the bank rather than telling you there is nothing to study.',
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
      'This trainer is built for a full keyboard and a wide screen, and, honestly, for time set apart rather than time squeezed in. Come back from a computer when you can give it your attention.',
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

  /** The tab strip. `id` is routing, `label` is copy. */
  nav: {
    home: 'Dashboard',
    review: 'Daily Review',
    quiz: 'Quiz',
    library: 'Reference',
    plan: 'Study Plan',
    progress: 'Progress',
    settings: 'Settings',
  },

  /**
   * ANCHORED, the eight strands every question belongs to.
   *
   * `labels` is read back by `data/types.ts` as `TOPIC_LABELS`, so the keys are
   * the `Topic` union and every one must be present. The letter is part of the
   * label on purpose: it means the acronym shows up in the quiz filter, the
   * dashboard rows, the plan pills and the pill on every card without any of
   * those having to know about it.
   *
   * `guide` is the reader-facing explanation, shown on the Study Plan. `from`
   * marks where each letter comes from, and it is not decoration: six letters
   * are the podcast's and two are ours, and someone studying from this should
   * know which parts they can go and check against the source.
   */
  strands: {
    labels: {
      arc: 'A, The Arc',
      names: 'N, Names',
      cities: 'C, Cities & Geography',
      context: 'H, Historical Context',
      oneline: 'O, One Line per Book',
      rituals: 'R, Rituals & Festivals',
      essentials: 'E, Essentials',
      doctrine: 'D, Doctrine',
    },

    heading: 'ANCHORED: what the eight letters ask of you',
    kicker: 'the shape of the whole bank',

    provenance:
      'The first six letters are the framework as a college-ministry podcast gives it: ' +
      'the arc, names, cities, historical context, one word per book, rituals and festivals. ' +
      'The transcript stops there, so ANCHOR is the source’s complete acronym. Essentials and ' +
      'Doctrine are this app’s, added to finish the word the episode is named after and to cover ' +
      'two things the six letters leave out: the must-know lists, and where primary doctrine sits ' +
      'in the text.',

    fromFramework: 'the framework',
    fromApp: 'this app',

    guide: {
      arc: {
        letter: 'A',
        name: 'The Arc',
        from: 'framework',
        covers: 'The big-picture story, in order: creation, the patriarchs, Moses and the Exodus, the giving of the law, the conquest, the kings, the split between north and south, the exile, the return, Jesus, and the early church. Every other fact hangs off this.',
        example: 'Put these four eras in chronological order · In which book does the burning bush occur?',
      },
      names: {
        letter: 'N',
        name: 'Names',
        from: 'framework',
        covers: 'People, groups, rulers and genealogies, and, where there is one, the origin story. The Amalekites come from Edom, which is Esau. The Ammonites and Moabites come from Lot. Zadok descends from Eleazar and Abiathar from Ithamar.',
        example: 'Who was the father of Phinehas? · Which tribe did Achan belong to?',
      },
      cities: {
        letter: 'C',
        name: 'Cities & Geography',
        from: 'framework',
        covers: 'Revelation happened in a particular place, and a small one, the land is roughly 9,500 square miles, about the size of Vermont. The Sea of Galilee sits nearly 700 feet below sea level and the Dead Sea about 1,300, joined by the Jordan running down the great rift.',
        example: 'Which city is this? Where the Israelites set up twelve memorial stones',
      },
      context: {
        letter: 'H',
        name: 'Historical Context',
        from: 'framework',
        covers: 'The power houses of the ancient world, Assyria, Babylon, Persia, Greece, Rome, in the order they ruled and what each did to Israel and Judah. Then the four hundred years between the testaments, and the political landscape the Gospels assume.',
        example: 'Why was Judea governed by a Roman prefect rather than a king?',
      },
      oneline: {
        letter: 'O',
        name: 'One Line per Book',
        from: 'framework',
        covers: 'Capture each book in a word or a line. Ephesians: church. Galatians: legalism. Philippians: joy. Colossians: supremacy. Genesis: origin. Exodus: salvation. Leviticus: holiness. All 66, both directions.',
        example: 'Which book is this? "Rescue from Egypt, covenant at Sinai"',
      },
      rituals: {
        letter: 'R',
        name: 'Rituals & Festivals',
        from: 'framework',
        covers: 'The calendar and the system behind it. Leviticus 16 is the Day of Atonement: two goats, one killed and one driven out as the scapegoat. Then Booths, Unleavened Bread, Passover, and the offerings, vows and holy years that frame them.',
        example: 'On the Day of Atonement, what happened to the two goats?',
      },
      essentials: {
        letter: 'E',
        name: 'Essentials',
        from: 'app',
        covers: 'The standing lists a survey quiz assumes you know cold, each drilled in both directions: Genesis by chapter, the seven days, the ten plagues and commandments, the twelve tribes and disciples, the major judges, kings and prophets, the key psalms, John and Acts by chapter, the Romans Road, and the key epistle chapters.',
        example: 'Major kings, which kingdom did Jehu rule? · What is Acts 8?',
      },
      doctrine: {
        letter: 'D',
        name: 'Doctrine',
        from: 'app',
        covers: 'Primary doctrine and the address where it is found, one landmark reference each, asked both ways. Deliberately the doctrine Christians hold in common rather than what they divide over: no predestination, no millennium, no timing of the rapture.',
        example: 'Where do we find verses about God’s patience? · What does Romans 8:1 anchor?',
      },
    },
  },

  dashboard: {
    stats: {
      daysToQuiz: 'Days to quiz',
      cardsDue: 'Cards due',
      mastery: 'Overall mastery',
      streak: 'Consecutive days',
    },
    startReview: 'Start today’s review',
    reviewDue: (due: number) => `Review ${due} due card${due === 1 ? '' : 's'}`,
    takeQuiz: 'Take a quiz',
    openReference: 'Open reference',
    today: (reviewed: number, correct: number) =>
      `Today: ${reviewed} answered, ${correct} correct (${Math.round((correct / reviewed) * 100)}%).`,
    masteryHeading: 'Mastery across ANCHORED',
    masteryBlurb:
      'Every question in the bank sits under one of the eight strands. Read the letters straight down, that is the checklist.',
    masterySuffix: '% mastery',
  },

  review: {
    heading: 'Daily Review',
    blurb:
      'Spaced repetition over everything you have unlocked. Cards you miss come back sooner; cards you know get pushed out, but never past your exam date.',
    stats: { due: 'Due now', fresh: 'New today', seen: 'Seen so far' },
    start: 'Start review session',
    nothingDue:
      'Nothing is due right now. Take a mixed quiz instead, or raise your daily new-card limit in Settings.',
    /** Shown when the plan's current phase is exhausted and the session widens (#40). */
    widened:
      'Nothing is left waiting in this phase, so today’s session widens to the rest of the bank.',
    completeHeading: 'Session complete',
    completeBlurb:
      'That’s everything queued for today. Come back tomorrow, or start another session now.',
    completeStats: { answered: 'Answered', correct: 'Correct', accuracy: 'Accuracy' },
    again: 'Another session',
    done: 'Done',
    endSession: 'End session',
    tally: (right: number, wrong: number) => `${right} right · ${wrong} missed`,
  },

  quiz: {
    heading: 'Mixed Quiz',
    blurb:
      'Test yourself under quiz conditions. Interleaving topics is harder than drilling one at a time, and that difficulty is what makes it stick. Narrow to a single book when you are working through it; leave it on everything once you are consolidating.',
    setupKicker: 'Setup',
    setupTitle: 'Choose what to cover',
    topicLabel: 'Topic',
    allTopics: 'All topics',
    bookLabel: 'Book',
    allBooks: 'Every book',
    scopeLabel: 'Scope',
    // Key order is display order. `plan` (#40) leads because it is the answer
    // to "what should I be drilling right now?", the daily review already
    // follows the study plan, and this is the on-demand version of the same
    // question. Every other scope is untouched by it.
    scopes: {
      plan: 'This week’s plan',
      all: 'Everything',
      OT: 'Old Testament',
      NT: 'New Testament',
      essentials: 'Must-know lists',
      starred: 'Starred',
      weak: 'Weak spots',
    },
    lengthLabel: 'Questions',
    lengthAria: 'Number of questions',
    start: 'Start quiz',
    matching: (n: number) => `${n} question${n === 1 ? '' : 's'} match this filter`,
    resultsKicker: 'Results',
    resultsTitle: 'Quiz complete',
    correctOutOf: (total: number) => `correct out of ${total}`,
    percentCorrect: (pct: number) => `${pct}% correct`,
    missedHeading: 'What you missed',
    missedColumns: { question: 'Question', answer: 'Answer' },
    missedNote: 'These are scheduled to come back soon in your daily review.',
    retake: 'Retake',
    changeFilters: 'Change filters',
    quit: 'Quit quiz',
    runningTally: (right: number) => `${right} correct so far`,
  },

  /**
   * The question card.
   *
   * Most of this is accessible names for controls that show only a glyph, so
   * changing the wording here changes what a screen reader announces.
   */
  question: {
    star: 'Star for focused review',
    referencePlaceholder: 'Type the reference, e.g. Josh 6',
    answerPlaceholder: 'Type your answer, then press Enter',
    unstar: 'Unstar this question',
    referenceAria: 'Type the reference for a bonus',
    checkReference: 'Check reference',
    showChoices: 'Show me the choices',
    check: 'Check',
    orPressEnter: 'or press',
    moveUp: 'Move up',
    moveDown: 'Move down',
    checkOrder: 'Check order',
    correct: 'Correct',
    wrong: 'Not quite',
    answerPrefix: 'Answer:',
    hadItRight: 'I had it right',
    continue: 'Continue',
  },

  library: {
    heading: 'Reference',
    searchLabel: 'Search',
    searchPlaceholder: 'Search books, outlines, events, people…',
    tabs: {
      books: 'The 66 Books',
      timeline: 'Timeline',
      people: 'People & Places',
      lists: 'Lists to Know',
    },
    tabsAria: 'Reference section',
    booksBlurb:
      'Open a book and work the tabs: overview, outline, events, people, terms. Read a pane, close it, and say it back out loud. Recall beats re-reading.',
    noBook: (q: string) => `No book mentions “${q}”. Try the People tab.`,
    peopleHeading: 'People',
    peopleColumns: { name: 'Name', who: 'Who', detail: 'Identifying detail', family: 'Family' },
    diedPrefix: 'Died:',
    placesHeading: 'Places',
    placesColumns: { place: 'Place', knownFor: 'Known for' },
    essentialsHeading: 'Must-know lists',
    essentialsKicker: 'know these cold',
    essentialsBlurb:
      'Every row is a pair: the address on the left, what sits there on the right. Cover one column and work down the other, the quiz asks in both directions.',
    noList: (q: string) => `No must-know list mentions “${q}”.`,
    aliasNote: (titles: string) =>
      `Four more belong to this set and are already below, where the drill is membership rather than pairing: ${titles}.`,
    standingHeading: 'Standing lists',
    standingBlurb: 'Lists that show up on almost every Bible quiz.',
    knowThisCold: 'know this cold',
  },

  /** A book's five reference panes. */
  bookPanel: {
    panes: {
      overview: 'Overview',
      outline: 'Outline',
      events: 'Events',
      people: 'People',
      terms: 'Terms & Numbers',
    },
    fields: {
      author: 'Author',
      written: 'Written',
      audience: 'Audience',
      purpose: 'Purpose',
      era: 'Era',
      theme: 'Theme',
    },
    christ: (bookName: string) => `Christ in ${bookName}:`,
    distinctive: 'What makes it unlike any other:',
    hook: 'Remember it:',
    peopleColumns: { who: 'Who', what: 'What they do here', where: 'Where' },
  },

  /**
   * The study plan.
   *
   * `phases` is read back by `data/plan.ts`, which owns the structure, the
   * weight each phase carries, the strands it covers, the books in scope. The
   * name, the goal and the drills are copy and live here.
   */
  plan: {
    heading: 'Study Plan',
    examDateLabel: 'Quiz date',
    summary: (daysLeft: number, weeks: number) =>
      `${daysLeft} days left. The plan below runs ${weeks} weeks from the day you started, not from today, so it moves on as the weeks pass. The order matters: the frame first, then content, then connections, then mixed review. Detail learned before the frame has nothing to attach to.`,
    scheduleKicker: 'Schedule',
    datePassed:
      'No weeks to show, the quiz date above has already passed. Move it forward to rebuild the plan.',
    phasesHeading: 'What each phase actually asks of you',

    phases: {
      frame: {
        name: 'Phase 1, Build the Frame',
        goal: 'Know all 66 books cold, one line each, plus the must-know lists. Nothing else sticks without this.',
        drills: [
          'Say the one line for every book, front to back, out loud and daily',
          'Given a line, name the book; given a book, say the line',
          'Work the must-know lists in both directions: address to content, content to address',
        ],
      },
      'ot-sweep': {
        name: 'Phase 2, Old Testament Sweep',
        goal: 'Walk the OT storyline book by book: key chapters, people, places, and the feasts.',
        drills: [
          'For each book, say its key chapters and what happens in them',
          'Tell the OT story start to finish in five minutes, no notes',
          'Identify every major character from a one-line clue',
          'Name the father, mother, spouse, or tribe of any figure called out',
          'Name the feasts of Israel in calendar order and say what each one marks',
        ],
      },
      'nt-sweep': {
        name: 'Phase 3, New Testament Sweep',
        goal: 'Walk the NT: Gospels, Acts, the letters, audience and occasion, and Revelation.',
        drills: [
          'Name all 13 Pauline letters in order and their one-line point',
          'Trace Paul’s journeys through Acts, city by city',
          'Distinguish the four Gospels by audience and emphasis',
          'For each letter: to whom, from where, and why',
          'Place the Herods, the prefects and the Jewish parties on the map of Jesus’ world',
        ],
      },
      connections: {
        name: 'Phase 4, Context & Doctrine',
        goal: 'Set the story inside world history, and know where primary doctrine is found in the text.',
        drills: [
          'Put the 14 eras in order from memory, and every book on the timeline',
          'Put the world powers in order and say what each did to Israel or Judah',
          'Walk the four hundred silent years from Alexander to Herod',
          'Name the landmark reference for each primary doctrine, then say it the other way round',
          'Memorize the two fall dates: 722 BC and 586 BC',
        ],
      },
      consolidate: {
        name: 'Phase 5, Mixed Review & Mock Quizzes',
        goal: 'No new material. Mixed review, weak spots, and full-length practice under time.',
        drills: [
          'Take a 40-question mixed quiz every other day',
          'Drill only what you have missed twice or more',
          'Walk the eight strands out loud: A-N-C-H-O-R-E-D, one minute each',
        ],
      },
    },

    methodHeading: 'How to study this material',
    method: [
      {
        lead: 'Retrieve before you re-read.',
        body: 'Practice testing and spaced repetition are the two techniques a well-known review of ten study methods rated “high utility.” Re-reading a book summary feels productive and mostly is not. Close the page and say it out loud first; open it only to check.',
      },
      {
        lead: 'Short and often beats long and rare.',
        body: 'Bible quiz coaches say the same thing independently of the psychology literature: three 10-minute sessions in a day work better than one 2-hour block.',
      },
      {
        lead: 'Mix topics rather than blocking them.',
        body: 'Answering twenty Genesis questions in a row feels easier and teaches less than twenty questions drawn from everywhere. That is why the review queue interleaves by design.',
      },
      {
        lead: 'Review is the whole game.',
        body: 'New material every day without revisiting old material means you arrive at the quiz knowing the last two weeks well and everything else vaguely. The scheduler handles this for you, just clear your due cards.',
      },
      {
        lead: 'Say it out loud.',
        body: 'Reciting the books, the eras, and the standing lists aloud while walking or driving costs nothing and is one of the most-recommended habits among competitive quizzers.',
      },
    ],
  },

  progress: {
    recentHeading: 'Last 14 days',
    answeredOn: (date: string, reviewed: number) => `${date}: ${reviewed} answered`,
    byBookHeading: 'Mastery by book',
    byBookBlurb: 'Anything under 50% is worth a targeted quiz. Sort your attention here.',
    byBookColumns: { book: 'Book', division: 'Division', mastery: 'Mastery', seen: 'Seen' },
    stuckHeading: 'Stuck items',
    stuckColumns: { question: 'Question', answer: 'Answer' },
    dataHeading: 'Your data',
    dataBlurb: (who: string) =>
      `Progress syncs to Firestore under ${who} and follows you to any device you sign in on. Export still makes a local backup any time you want one.`,
    yourAccount: 'your account',
    exportButton: 'Export progress',
    importButton: 'Import progress',
    resetButton: 'Reset progress',
    resetConfirm: 'Erase all review history and start over? This cannot be undone.',
    restored: 'Progress restored.',
    unreadable: 'That file could not be read.',
    cleared: 'Progress cleared.',
  },
} as const;
