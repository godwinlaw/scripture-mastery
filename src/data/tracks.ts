/**
 * Focus tracks: a self-contained course over a handful of books, with its own
 * exam date, running *alongside* the whole-Bible survey rather than inside it.
 *
 * The survey answers "do I know the canon?" and its study plan answers "what
 * should I be looking at this week?". Neither can answer "I have a test on
 * 1 & 2 Samuel on the 30th." A plan phase is the wrong shape for that: phases
 * are sequential, they share one exam date, and the whole point of a focus
 * track is that it is *not* a stage of the survey — it starts when a test is
 * announced, it ends when the test is taken, and the survey carries on either
 * side of it untouched.
 *
 * What a track deliberately does **not** own:
 *
 * - **Cards.** A track scopes which items a session draws from; it does not
 *   copy them. A 1 Samuel card studied in the focus track is the same card as
 *   in Daily Review, with one history. Duplicating it would mean two schedules
 *   disagreeing about the same fact and a mastery figure that counted it twice.
 * - **Difficulty.** There is one difficulty setting in this app and the focus
 *   view writes to it. A per-track difficulty would mean a card graded under
 *   two different rules depending on which door you came in through.
 *
 * Adding a second track is meant to be data-only: everything downstream reads
 * this array — the nav, the routing, the view title, the exam lookup — so a new
 * entry here is a new tab, and nothing anywhere hardcodes an id.
 */
export interface FocusTrack {
  id: string;
  /** Shown in the nav and as the view title. */
  name: string;
  /** Book ids this track covers. */
  books: string[];
  /** ISO default exam date. */
  defaultExam: string;
  /** One or two sentences on what the track is for. */
  blurb: string;
}

export const TRACKS: FocusTrack[] = [
  {
    id: 'samuel',
    name: '1 & 2 Samuel',
    // Book ids as `data/books.ts` spells them — `trackItems` matches on
    // `Item.book`, so a typo here yields a silently empty track rather than an
    // error. `scripts/validate.ts` already proves every item's book exists.
    books: ['1-samuel', '2-samuel'],
    defaultExam: '2026-08-30',
    blurb:
      'The rise of the monarchy — Samuel, Saul and David, from Hannah’s prayer to the last of David’s reign. A short run at two books rather than a slow pass over sixty-six.',
  },
];

export function trackById(id: string): FocusTrack | undefined {
  return TRACKS.find((t) => t.id === id);
}
