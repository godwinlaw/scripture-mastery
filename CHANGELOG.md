# Changelog

All notable changes to Scripture Mastery are recorded here, newest first.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Changed

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

- **Chapter-count questions** ([#8]). The 66 per-book "How many chapters are in
  X?" items are gone, along with "How many chapters are in the whole Bible?"
  (1,189) — the same species of question in the same topic. Their answer is a
  number you read off a contents page, which teaches nothing about the book.
  The Numbers & Counts topic keeps its other 256 items, including the questions
  where chapters are only incidental and the answer is a *name* ("What is the
  longest chapter in the Bible?" → Psalm 119). Bank is now 6,514 items and
  every book still clears the 20-question floor.

### Fixed

- **A race in the e2e ordering helper.** `arrangeInto` re-read the list
  immediately after clicking "Move up", so under load it could compute an index
  from the pre-click DOM and walk the wrong row. It now waits for each row to
  land before re-reading, and asserts the finished arrangement — one caller
  submitted an arrangement without ever checking it, turning the race into a
  confusing count mismatch three assertions later.

### Added

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

[#7]: https://github.com/godwinlaw/scripture-mastery/issues/7

[#8]: https://github.com/godwinlaw/scripture-mastery/issues/8

[#9]: https://github.com/godwinlaw/scripture-mastery/issues/9

[#10]: https://github.com/godwinlaw/scripture-mastery/issues/10
