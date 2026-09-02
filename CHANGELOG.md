# Changelog

All notable changes to Scripture Mastery are recorded here, newest first.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Added

- **Difficulty became a real setting, and the study plan started driving what
  you study** ([#40]).

  **The setting was doing almost nothing.** It swapped a question's wrong
  options and leaned the review queue by ease — and only on the third of the
  bank that carried alternate option sets at all. Every People, Places, Family,
  Book Order, Numbers, Timeline and Book Summaries question had none, so it
  fell back to its medium set, and plenty of those pools were canon-wide. The
  result: *hard* went on offering New Testament options against Old Testament
  questions. Measured across the bank, **637 of them**. Every question now
  carries all three sets — 5,915 of 5,926, the remainder being hand-written
  items that draw their options from outside the canon — and hard's
  cross-Testament count is **zero**.

  Each family is scoped as tightly as its own question allows, widening only
  when the tight pool cannot fill the card. People are drawn from the same
  book, then the same era; family facts from the same household; eras from
  adjacent ones. **Book Order is deliberately exempt from the seam rule**:
  "which book immediately follows Malachi?" has a New Testament answer, so
  fencing it by Testament would identify the answer without knowing the canon
  at all. It is scoped by *canonical distance* instead — neighbours within four
  positions on hard, and books a dozen positions away on easy.

  **Difficulty now changes four things, not one.** How many options you are
  offered — three, four, or six, which is the dial you feel on every single
  card. Where the wrong ones come from. Whether a reference has to be named
  from memory before the choices appear, and whether the explanation is offered
  as a hint first. And how new material is introduced.

  **New material is no longer introduced in canonical order at every setting.**
  It always had been: unseen cards arrive in the bank's generation order, the
  queue took the first *n*, and the within-session shuffle ([#11]) never
  touched that because it only reorders cards already chosen. So Build the
  Frame marched Genesis-first no matter what you set — fine on *easy*, where
  building the frame front to back is the whole pedagogy, and far too
  predictable on *hard*. Easy still walks the canon from Genesis. Hard now
  draws from anywhere in the current scope, spanning **27 books where easy
  spans 3**, with only **2 of 10** cards repeating the following day. The draw
  is seeded per day rather than random, so a reload does not deal a new hand
  mid-session. Hard also introduces half again as much new material, reaches
  for fine detail first, and does not hand a missed card back inside the same
  session — you meet it again tomorrow, cold.

- **The study plan now decides what your daily review asks you** ([#40]). The
  five phases have always been rendered on the Plan tab, and the Dashboard has
  always named the current one, but nothing filtered the queue by them, so
  following the plan was left entirely to your own discipline. The daily review
  is now drawn from whichever phase you are in, the Quiz offers **This week's
  plan** as a scope, and the review screen names the phase before you start
  rather than letting you discover a short session and read it as a bug. When a
  phase runs dry the queue quietly widens to the rest of the bank instead of
  claiming there is nothing to study, and **Study everything instead** sets the
  plan aside for one session without changing the setting. It can be turned off
  entirely, and defaults to on.

  Making the plan real exposed why it had been safe to leave decorative:
  `buildSchedule` anchored its start date to *today* on every call, so today was
  always inside week 1 and the current phase was always Phase 1. Harmless while
  nothing consumed it — it is why the Dashboard always read "Week 1" — but as a
  filter it would have pinned every member to Book Order and Book Summaries,
  330 of 6,098 questions, until the exam date passed. The schedule is now
  anchored to a persisted plan start, derived from your earliest recorded
  session so a returning member is not sent back to the beginning, and a member
  who has run out of runway lands in Phase 5's mixed review rather than nowhere.


- **A Settings panel, and a difficulty you can choose** ([#36]). Settings had
  been scattered — the study fields inside Progress, the theme switch in the
  header, the quiz date in two places — so there was no one screen to go to.
  There is now: a **Settings** tab holding Study, Difficulty and Display.

  **Difficulty decides where a question's wrong answers come from.** *Medium*
  is what the trainer has always done and remains the default, so nothing
  changes unless you ask it to: options are drawn from books near the answer's
  own, never crossing the Old/New Testament seam ([#10], [#12]). *Easy* draws
  from anywhere in the canon — a Colossians verse against a Leviticus question
  is not a hard choice, which is the point. *Hard* draws Chapter Content
  options from the answer's **own book** only, so nothing is given away by
  context, and Events options from its own division.

  Where a strict pool cannot fill four options it widens a division at a time
  rather than offering three, because a three-choice question is *easier* than
  a four-choice one — falling short would invert the setting instead of
  sharpening it. All three option sets are generated up front and stored on the
  item, rather than rebuilding the bank when the setting changes: item ids are
  what SRS history is keyed on, so a bank that regenerated per difficulty would
  detach every card you have ever reviewed the moment you touched the control.

  Difficulty also leans the review queue, using the per-card ease the scheduler
  already tracks — *hard* spends its time on what you keep missing, *easy* on
  what you answer well. The lean shifts a card's effective due date by at most
  a few days, so it reorders cards of similar urgency without ever letting a
  badly overdue one slip. Selection still runs before the session cut, and the
  order questions are asked in is still random ([#11]).

  Verified across the whole bank: of the Chapter Content and Events questions,
  **zero** medium or hard options cross the Testament seam, easy ones
  deliberately do, and no alternate set is thinner than the medium one. The
  content-integrity checks now cover the easy and hard sets too — previously
  they only ever inspected the default one, so a leaked answer would have
  shipped invisibly to anyone who had moved off it.

- **The app mark now sits in the top bar** ([#34]). The header carried the
  wordmark alone, so the mark that identifies the app on the browser tab, on
  the sign-in screen and on an installed tile was missing from the one surface
  you look at all day. It uses `favicon.svg` rather than the `icon.svg` the
  sign-in screen shows: that is the mark's small-size cut, with the blade
  widened and the passage rules dropped, drawn for exactly this 16–24px range
  — `icon.svg`'s fine detail would turn to mush at 22px. Referenced through
  `import.meta.env.BASE_URL`, as the sign-in mark already is, because vite's
  `base` is relative and a root-absolute path would break anywhere the app is
  not served from `/`. The image is decorative (`alt=""`): the wordmark sits
  immediately beside it, so naming it would only make a screen reader say
  "Scripture Mastery" twice.

- **Type the reference for a bonus** ([#14]). Questions whose answer is a place
  in scripture — 1,067 of them, about 17% of the bank — now ask you to name it
  before showing any options at all. *Where does this happen? "The walls of
  Jericho fall after seven days of marching"* opens on a text box, not four
  choices. Name it and the card files itself as **Easy** without asking you to
  grade it; naming a reference is a strictly harder thing than recognising one.
  Abbreviations are fine ("Josh 6" = "Joshua 6"), and so is extra precision —
  "Genesis 3:15" answers a question about Genesis 3, because more knowledge
  should never score worse. One attempt: a wrong guess costs the bonus but not
  the question, dropping you to the ordinary multiple choice, and
  "Show me the choices" declines the bonus outright for a normal score.
  References are parsed structurally rather than compared as text, so "Genesis
  3" cannot answer "Genesis 30" and the colon in "1 Cor 15:1-8" survives.

- **App icon** ([#7]). The "Blade on the page" mark (design 2a) — a paper ribbon
  marker on a steel field with the sword of Hebrews 4:12 struck through it.
  Shipped in two cuts, since the design gives small sizes their own treatment:
  `favicon.svg` widens the blade and drops the passage rules that turn to mush
  in a browser tab, while `icon.svg` keeps the full detail for app tiles.
  Adds `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, and a web
  manifest, so the app installs with a real icon rather than a blank tile.
  Colours are the app's existing tokens (`--color-accent-900` steel,
  `--color-bg` paper, `--color-accent` rules), written as literals because an
  SVG loaded as a favicon never sees the document's custom properties.

### Fixed

- **The Study Plan page no longer assumes an October quiz.** The advice
  card said you would "arrive in October"; it now says "arrive on quiz day",
  since the date is a setting and the schedule above it is built from
  whatever date is set.

- **Three "Which book is this?" cards named their own answer.** Hosea's and
  Haggai's one-line summaries and Malachi's distinctive fact each carried the
  book's name inside the quoted line, so the card was a label rather than a
  question. The three lines now say "the prophet" or "this book" instead,
  and `npm run validate` gains a hard check that fails whenever a quoting
  book prompt (summary, key verse or distinctive fact) contains the bare
  title of its answer. "Which book immediately follows 1 Samuel?" is not a
  quoting prompt and is left alone.

- **Missing the last card of a review session graded it three times** ([#40]).
  A missed card is requeued to the end of the session; when it *was* the end,
  the next card had the same id, the card component was never remounted, and
  its reset never ran. The card came back already answered — no retrieval,
  which is the entire point of requeueing it — and the only way forward was
  Continue, which graded the same miss again. One genuine miss recorded three
  reviews and **three lapses**, one short of the threshold that marks a card a
  leech, and skewed the accuracy on your Progress tab. The session card is now
  keyed on its position in the queue rather than on the item.

- **Six questions offered the book they were asking about** ([#40]). "Which
  book immediately precedes Leviticus?" listed Leviticus among the choices.
  Distractor selection excluded the *answer* but had never been told about the
  book named in the prompt.

- **Clearing a field in Settings wrote a broken value** ([#40]). The number
  inputs committed `0` for an emptied field, so a moment's editing of Max cards
  per session could commit `0` and send "Start review session" straight to a
  finished session. Worse, clearing the quiz date committed an empty string:
  the header rendered "NaN days until Invalid Date", and inside the scheduler
  the exam clamp — the app's one deliberate deviation from SM-2, which
  guarantees every card is seen at least once more before the test — silently
  stopped applying, letting cards schedule past the exam and never come back.
  The fields are now clamped on commit rather than on screen, so they are still
  comfortable to edit.

- **A wrong option could be a second correct answer** ([#40]). Event questions
  excluded the people who took part from their wrong options, but only from the
  medium pool. Tightening the hard pool to the same book would have started
  offering genuine participants as wrong answers — a defect no content check
  can catch, since the checks compare options against *the* answer.

- **The app icon never actually rendered** (found while doing [#23]). Both
  `icon.svg` and `favicon.svg` shipped malformed in [#7]: an XML comment cannot
  contain a literal double hyphen, and the comment documenting the colour
  tokens spelled them `--color-accent-900`. A standalone SVG is parsed as XML,
  so every browser drew a broken image — while the files returned 200 with the
  right content-type, which is why serving them looked fine. The comments now
  name the tokens without their leading dashes and say why, and both files
  gained intrinsic `width`/`height`. `tests/e2e/icons.spec.ts` now decodes each
  icon and parses it as XML, because checking that an asset is *served* proves
  nothing about whether it *renders*.

- **A race in the e2e ordering helper.** `arrangeInto` re-read the list
  immediately after clicking "Move up", so under load it could compute an index
  from the pre-click DOM and walk the wrong row. It now waits for each row to
  land before re-reading, and asserts the finished arrangement — one caller
  submitted an arrangement without ever checking it, turning the race into a
  confusing count mismatch three assertions later.

### Changed

- **Phase 1 of the study plan now includes chapter content.** Following the
  plan restricted the daily review to book order and summaries, 330 cards,
  so a 60-card session was nearly all "which book follows". Key chapters
  (what happens in 2 Samuel 7, where a given episode is found) are part of
  the frame too, and the part that takes the whole phase to learn, so the
  phase asks for them from day one. Phases 2 and 3 still sweep chapters
  testament by testament.

- **The default quiz date moved to 31 January 2027** (was 31 October 2026).
  A fresh install starts with the new date. An existing account whose saved
  date is still the old default, never changed by hand, is moved to the new
  one on load, so its Dashboard countdown and Study Plan follow the new
  timeline without a visit to Settings. A date the member chose deliberately
  is left alone. The exact January date is still to be confirmed and may
  change again.

- **Accessibility** ([#40]). The app had no `<h1>` and never moved focus when
  you changed tabs, so a screen-reader user activating Quiz heard nothing and
  was left in the navigation. Ordering questions signalled a correctly placed
  row by border colour alone, the ordering buttons dropped focus at the ends of
  the list, and the Correct / Not quite verdict was never announced. All four
  are fixed.

- **Exporting your progress** no longer risks a silent no-op in Firefox and
  Safari ([#40]): the download link is placed in the document before it is
  clicked, and its blob is released a tick later rather than immediately.

- **The sign-in screen shows the mark, the verse, and Google's own glyph**
  ([#23]). The app icon appears at 88px as the app's face rather than a
  favicon; the motto verse is quoted beneath the wordmark with its citation;
  and the sign-in button carries the official four-colour Google "G", as
  Google's branding guidelines require for a "Sign in with Google" control.
  The verse moved to a top-level `copy.motto` so the splash and the sign-in
  speak from one source — a verse transcribed twice is one that will eventually
  disagree with itself.

- **The motto verse is 2 Timothy 2:15 ESV** ([#22]). The boot splash now reads
  *"Do your best to present yourself to God as one approved, a worker who has
  no need to be ashamed, rightly handling the word of truth."*, quoted in full
  as the issue gives it, with the citation shown beneath it so the line is
  never quoted anonymously. Replaces the Hebrews 4:12 epigraph.
  Worth noting for the record: this is the same verse as the original
  "Study to shew thyself approved" line that [#5] asked to remove — that was
  the KJV rendering. The verse is back, in ESV.

- **Question cues name their subject instead of opening on a bare pronoun**
  ([#13]). *Where does this happen? "He reopens and cleanses the temple…"* gave
  you nothing to grip; it now reads *"Hezekiah reopens and cleanses the
  temple…"*. Twenty-five episode summaries and detail lines were rewritten
  across all seven detail files.
  Two kinds of pronoun are deliberately left alone: **verbatim scripture**
  ("He is the image of the invisible God" — you identify a quotation by its
  words, and editing it to insert a name would falsify it), and **riddle cues
  whose answer is the person** ("Who is this? *Her household reported the
  quarrels to Paul*" → Chloe), where naming them would hand over the answer.
  Naming the subject created a new hazard for "Who is involved in this?", which
  quotes the same summary — so that generator now skips any candidate the cue
  already names. That also retired **105 pre-existing questions that printed
  their own answer** ("Who is involved in this? *God creates the heavens and
  earth…*" → God). Bank drops from 6,203 to 6,098; every book still clears the
  20-question floor.

- **The middle grade button reads "Ok" rather than "Good"** ([#15]). Its keyboard
  shortcut, scheduling behaviour, and "normal pace" hint are unchanged — this is
  the label only. "Good" sat oddly next to "Hard", reading as a judgement on the
  answer rather than on how easily it came back.

- **Events options now come from the same division** ([#12]). "In which book do
  we read about this: Miriam's leprosy?" now offers Genesis, Exodus and
  Leviticus against Numbers — the books of Moses — instead of anything in the
  canon. Reuses the `nearbyPool` widening added in [#10], so short divisions
  reach into adjacent ones and nothing ever crosses the Old/New Testament seam.
  Applies to all four Events generators: the two whose answer is a book name,
  and the two whose options are event text. Verified against the bank: across
  932 book-answered Events questions, zero options cross the Testament boundary
  and zero fall outside the neighbourhood, with every question still offering
  four choices.

- **Daily review questions are shuffled** ([#11]). The queue was fully
  deterministic, so the same cards arrived in the same order every day and you
  could start recalling the sequence instead of the answer. `buildQueue` now
  shuffles what it presents. Selection is deliberately left alone and still
  runs first — sort by how overdue a card is, interleave the books, *then* cut
  to the session limit — so a truncated session still takes the most urgent
  cards and a spread of books. Only the order they are asked in is random.
  Covered by a new `tests/e2e/queue.spec.ts`, which pins both halves: that the
  order varies between sessions, and that a truncated session still keeps the
  most overdue cards.

- **Chapter Content options now come from nearby books** ([#10]). "What happens
  in Leviticus 10?" used to draw its wrong options from anywhere in the canon,
  so it could offer a verse from Colossians — not a hard question, just a
  different subject. All five Chapter Content generators now build their pool
  from the answer's own division, widening one division at a time only when the
  tighter pool cannot fill four options, and **never crossing the Old/New
  Testament seam**. Verified against the generated bank: of 3,193 attributable
  distractors across 1,528 questions, zero cross the Testament boundary and
  zero fall outside the neighbourhood, with every question still offering four
  options. One-book divisions widen as intended — Acts reaches into the Pauline
  Epistles, Revelation into the General Epistles.

- **Book-summary questions are now prophets-only** ([#9]). The five per-book
  summary generators — "Which book is this?", "What is the central theme of X?",
  "Why was X written?", "Who was X written to?", and the distinctive-trait
  question — now fire only for the seventeen Major and Minor Prophets. They are
  the one stretch of canon where a summary is the thing worth knowing:
  overlapping vocabulary and no narrative spine, so "which book is this?" is a
  real question rather than a recital. Bank drops from 6,514 to 6,269 items;
  the Book Summaries topic keeps 194 items (85 across the prophets, plus 109
  must-know-list and trivia questions that are not about a book's summary at
  all). Every book still clears the 20-question floor — the leanest, 2 John,
  sits at 23.

### Removed

- **Eighteen book-order cards answered by the name in their own prompt.**
  "Which book immediately precedes 2 Samuel?" and "Which book immediately
  follows 1 Samuel?" test reading, not the canon, and the same goes for
  every numbered pair (Kings, Chronicles, Corinthians, Thessalonians,
  Timothy, Peter) and the run of 1, 2 and 3 John. The generator now skips a
  follows/precedes card whenever the answer is the numbered sibling of the
  book asked; the outer edges of each pair ("precedes 1 Samuel", "follows
  2 Samuel") stay. `npm run validate` gains a hard check so they cannot come
  back. Bank drops from 6,098 to 6,080.

- **"Christ in Scripture" is no longer a study category** ([#16]). The topic is
  gone from the `Topic` union, the topic labels, both study-plan phases that
  listed it, and the 66 "How does X point to Christ?" questions it generated.
  The answers there are interpretive rather than recall, which made a
  four-option quiz the wrong shape for them.
  **The content itself is kept.** Every book's `christ` line still appears in
  the Library's book panel and is still searchable — it is reference material
  now rather than a question.

- **Chapter-count questions** ([#8]). The 66 per-book "How many chapters are in
  X?" items are gone, along with "How many chapters are in the whole Bible?"
  (1,189) — the same species of question in the same topic. Their answer is a
  number you read off a contents page, which teaches nothing about the book.
  The Numbers & Counts topic keeps its other 256 items, including the questions
  where chapters are only incidental and the answer is a *name* ("What is the
  longest chapter in the Bible?" → Psalm 119). Bank is now 6,514 items and
  every book still clears the 20-question floor.

[#5]: https://github.com/godwinlaw/scripture-mastery/issues/5

[#7]: https://github.com/godwinlaw/scripture-mastery/issues/7

[#8]: https://github.com/godwinlaw/scripture-mastery/issues/8

[#9]: https://github.com/godwinlaw/scripture-mastery/issues/9

[#10]: https://github.com/godwinlaw/scripture-mastery/issues/10

[#11]: https://github.com/godwinlaw/scripture-mastery/issues/11

[#12]: https://github.com/godwinlaw/scripture-mastery/issues/12

[#13]: https://github.com/godwinlaw/scripture-mastery/issues/13

[#14]: https://github.com/godwinlaw/scripture-mastery/issues/14

[#15]: https://github.com/godwinlaw/scripture-mastery/issues/15

[#16]: https://github.com/godwinlaw/scripture-mastery/issues/16

[#22]: https://github.com/godwinlaw/scripture-mastery/issues/22


[#23]: https://github.com/godwinlaw/scripture-mastery/issues/23

[#34]: https://github.com/godwinlaw/scripture-mastery/issues/34

[#36]: https://github.com/godwinlaw/scripture-mastery/issues/36
[#40]: https://github.com/godwinlaw/scripture-mastery/pull/40
