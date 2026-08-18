# Scripture Mastery

A whole-Bible survey trainer built for one job: walking into a quiz at the end of
October knowing the content of all 66 books.

**7,541 questions** generated from structured data: 66 books with a full outline
and episode list each, 595 dated events, 360 per-book figures, 232 people, 54
places, 246 key terms, 14 historical eras, and 13 standing lists.

Every book carries its own outline, its episodes chapter by chapter with the
people in them, the terms it runs on, the numbers it is known for, and a line on
how it points to Christ. That is where the depth lives — roughly a hundred
questions per book, rather than thirty.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/ — deployable anywhere
npm run validate # content-integrity checks over the whole item bank
```

Progress syncs to **Firestore**, keyed to a Google sign-in restricted to
`acts2.network` and `gpmail.org` accounts — see [Data & sync](#data--sync).

---

## Data & sync

Sign-in is Google only, gated to `acts2.network` and `gpmail.org` accounts. Each
user's `cards`/`settings`/`log`/`starred` blob lives in a single Firestore
document at `users/{uid}`, live-synced with `onSnapshot` so multiple tabs and
devices stay current, and cached locally (`persistentLocalCache`) so the app
still works offline and flushes pending writes when the connection returns.

The domain allowlist is enforced twice — once client-side for a fast UX bounce
(`src/lib/firebase.ts`), and once in `firestore.rules`, which is the copy that
actually matters since the client check can't be trusted on its own.

**First-time project setup**, beyond `npm install`:

1. In the Firebase console for the project, under **Authentication → Sign-in
   method**, enable the **Google** provider.
2. Deploy `firestore.rules` (`firebase deploy --only firestore:rules`, or paste
   its contents into **Firestore → Rules** in the console).
3. Copy `.env.example` to `.env.local` and fill in the web app config from
   **Project settings → General → Your apps**.

Export/import (**Progress → Your data**) still round-trips the whole store as a
JSON file — handy as a manual backup or for moving data outside the two
allowed domains.

---

## Why it works this way

Four findings drove the design. Sources are listed at the bottom.

**Retrieval beats re-reading.** Dunlosky et al.'s review of ten study techniques
rated only two as "high utility": practice testing and distributed practice.
Re-reading a book summary feels productive and mostly isn't. So the app is a
question engine first and a reference second.

**Spacing beats cramming.** Reviews are scheduled at expanding intervals — the
core of the Leitner system and SM-2. Miss a card and it comes back in a minute;
know it and it goes to the back of the line.

**Short and often beats long and rare.** Bible quiz coaches converge on this
independently of the psychology literature: "three 10-minute sessions during the
day work a lot better than" one long block. The dashboard prescribes a
three-session daily rhythm rather than a session count.

**Mixing beats blocking.** The review queue interleaves by topic, so you're not
answering six Genesis questions in a row. It feels harder and teaches more.

### The one deliberate deviation from SM-2

Standard SM-2 will happily schedule a well-known card 60 days out. If the quiz is
in 40 days, that card is now untested at exam time. So intervals are clamped to
half the time remaining:

```ts
const daysLeft = Math.max(0, Math.ceil((examDate - now) / DAY));
if (daysLeft > 0) interval = Math.min(interval, Math.max(1, Math.floor(daysLeft / 2)));
```

Every card gets at least one more look before the test. As October 31 approaches,
intervals compress automatically and the whole deck converges into daily review.
Change the date in **Progress → Settings** and the schedule re-plans itself.

---

## The five tabs

| Tab | What it's for |
|---|---|
| **Dashboard** | Countdown, cards due, mastery, streak, and the current phase of the plan |
| **Daily Review** | The spaced-repetition queue. This is the main event — clear it daily |
| **Quiz** | Mixed testing under quiz conditions. Filter by scope, topic, single book, or weak spots |
| **Reference** | Every book opened to five panes — overview, outline, events, people, terms — plus the timeline, 232 people, 54 places, and the standing lists |
| **Study Plan** | Week-by-week schedule from today to your quiz date |
| **Progress** | Mastery by book, stuck items, settings, export/import |

**Keyboard:** `1`–`4` pick an option · `Enter` submits or advances · `1`/`2`/`3`
grade Hard/Good/Easy after a correct answer.

---

## The study plan

Five phases, weighted and laid onto the actual calendar between today and your
quiz date. The order is the point — the frame comes first because every later
fact needs somewhere to attach.

1. **Build the Frame** — all 66 books: order, division, author, one-line summary, outline
2. **Old Testament Sweep** — outline, key chapters, people and their families, events,
   places, and the terms each book runs on, book by book
3. **New Testament Sweep** — Gospels, Acts, every letter's audience and occasion, Revelation
4. **Timeline & Connections** — the 14 eras, the standing lists, the two fall dates,
   and how each book points to Christ
5. **Mixed Review & Mock Quizzes** — no new material, weak spots only

---

## How the question bank is built

Questions are **generated from structured data**, not hand-written. Correcting a
fact corrects it everywhere at once, and adding a fact adds questions everywhere
at once.

The content sits in two layers.

**The frame** (`books.ts`) is what gets you through the first round of a survey
quiz: order, division, author, chapter count, one-line summary, theme, key
chapters, memory hook.

**The detail** (`details/`) is the second round. Each of the 66 books has its own
entry carrying:

| Field | What it holds | Questions it generates |
|---|---|---|
| `outline` | The book's movements by chapter range | What do chapters 12–25 cover · which chapters cover this · put the movements in order |
| `events` | Every episode with its reference, participants, place, and the detail that separates it from anything similar | What happens at Genesis 22 · where does this happen · who is involved · which book records it · put these in order |
| `figures` | Each person's role *in this book* | What does Joab do in 2 Samuel · who is this, in 2 Samuel |
| `terms` | The vocabulary the book runs on | What does "propitiation" mean · which term is this |
| `numbers` | The figures the book is known for | How many Assyrians died in one night |
| `audience`, `purpose`, `written`, `writtenFrom` | Occasion and setting | Why was Galatians written · who to · from where |
| `christ` | How the book points to Christ | One per book |
| `distinctive` | What makes it unlike any other book | Which book is this true of |

A book's `figures` list is deliberately separate from the global `PEOPLE` roster.
Peter appears in six books doing six different things; "what does Peter do in
Acts 12" is a real question and "which book is Peter in" is not.

```
src/
├── data/
│   ├── types.ts      Book, Item, Topic definitions — 14 topics
│   ├── books.ts      All 66 books — the frame
│   ├── details/      The detail layer, one file per division
│   │   ├── types.ts        BookDetail, Section, DetailEvent, Figure, Term
│   │   ├── law.ts          Genesis–Deuteronomy
│   │   ├── history.ts      Joshua–Esther
│   │   ├── wisdom.ts       Job–Song of Solomon
│   │   ├── major-prophets.ts / minor-prophets.ts
│   │   ├── gospels.ts      Matthew–Acts
│   │   ├── pauline.ts      Romans–Philemon
│   │   ├── general.ts      Hebrews–Revelation
│   │   └── index.ts        Combines them + coverage assertions
│   ├── people.ts     232 people (with family, tribe, and death) + 54 places
│   ├── timeline.ts   14 eras + 29 dated events
│   ├── extras.ts     13 standing lists + ~60 hand-authored questions
│   └── plan.ts       Phase definitions and calendar builder
├── lib/
│   ├── generate.ts         The frame, people, timeline, and list generators
│   ├── generate-detail.ts  The detail generators — ~4,900 of the 7,541 items
│   ├── srs.ts              Scheduler, queue building, mastery scoring
│   ├── storage.ts          Store shape, defaults, export/import
│   ├── firebase.ts         Firebase app/auth/Firestore init, domain allowlist
│   ├── useStore.ts         Auth state + live Firestore sync into the Store
│   └── rng.ts              Seeded PRNG so items stay stable
├── views/            One file per tab
└── components/
    └── BookDetailPanel.tsx  A book's five reference panes
scripts/
└── validate.ts       21 content-integrity checks — `npm run validate`
```

### Item ids are stable on purpose

Every generated item has a deterministic id (`gen-author-genesis`,
`gen-chapter-exodus-20`). Distractors are picked with a seeded PRNG keyed to that
id. **Editing a book's summary does not reset your review history** for unrelated
questions, and distractors don't reshuffle between sessions.

### Adding content

Add a `DetailEvent` and you get up to five questions: what happens there, where
it happens, who is involved, which book records it, and which detail belongs to
it. Add a `Figure` and you get two. Add a `Person` with a `father` and `tribe`
and you get five. Add an entry to `LISTS` plus matching `LIST_DECOYS` and you get
ordering, positional, and membership questions.

Roughly a hundred questions per book, without hand-writing any of them.

### Content-quality guards

`npm run validate` runs 21 checks over the generated bank and exits non-zero on
failure. Four of them exist because they caught real bugs.

**Distractors near the answer.** Chapter-count questions draw wrong options from
numerically adjacent books. Offering 50 against 3, 5, and 7 tests nothing;
offering 50 against 66, 36, and 40 tests something. Book-scoped questions draw
distractors from the same book first — knowing the cast of 2 Samuel is not the
same as knowing which of them killed Abner.

**No question with two right answers, across books.** The Transfiguration appears
in three Gospels, the Davidic covenant in both 2 Samuel and 1 Chronicles.
Generating "in which book does this occur?" naively produced 27 prompts where a
correct answer would have been marked wrong. The generator detects related event
phrasings by token overlap, emits one item per event, and excludes *every* book
recording it from the distractor pool.

**No question with two right answers, within a book.** Exodus 2 holds both the
basket in the Nile and the flight to Midian. "What happens in Exodus 2?" had two
correct answers, and because same-book distractors are drawn from the book's own
episodes, each was offered as a wrong option against the other. Prompts for a
shared chapter reference now name the episode.

**Hand-authored decoys where automatic ones lie.** Auto-drawing "which is NOT
part of X" decoys from other lists offered *Levi* as not-an-apostle — but Levi is
Matthew's other name. Those decoys live in `LIST_DECOYS` instead.

The ambiguity check itself needed care. Several cards legitimately share a prompt:
the four "which is NOT one of the Twelve Apostles" cards each pair a different
decoy with three real apostles, and every one of them has exactly one right
answer. Flagging shared prompts would have flagged those. The check that actually
means something is narrower — **one card's correct answer appearing as a wrong
option on another card asking the same question** — plus identical prompt *and*
identical option set with different answers. Both currently report zero.

---

## Content notes

- Authors follow the **traditional attribution** a survey quiz expects. Where
  scholarship differs, `authorNote` carries the nuance and surfaces in the
  explanation after you answer.
- Verse quotations are **ESV**, kept short and used for identification rather
  than memorization.
- Dates are approximate and follow common conservative dating. Chapter counts
  follow the English canon and total 1,189 (929 OT + 260 NT) — checked against
  those literal figures in `npm run validate`, not against themselves.
- **Composition dates and authorship** in the detail layer follow what a survey
  course teaches. Where the date is genuinely contested (Joel, Obadiah, Job) the
  entry says so rather than picking one silently.
- **Where a book's reading is disputed**, both readings are given as terms rather
  than one being asserted — Song of Solomon carries `Allegorical reading` and
  `Literal reading`; Revelation carries `Millennium` with the note that it is
  read three main ways.
- **The "Christ in this book" line** is one per book and is what a survey quiz
  asks for. It is a summary of the standard answer, not an argument for it.

---

## Sources

- [Dunlosky et al. via *The Evidence for Active Recall and Spaced Repetition*](https://recallify.ai/evidence-for-active-recall-and-spaced-repetition/) — practice testing and distributed practice as the two "high utility" techniques
- [The Leitner System](https://activerecalling.com/blog/leitner-system-flashcards) — expanding-interval review
- [Spaced Repetition Algorithms: From SM-2 to FSRS](https://www.mindomax.com/spaced-repetition-algorithms) — ease factors and interval computation
- [CMD Bible Quizzing — Studying Tips](https://cmdbiblequizzing.org/studying-tips/) — short sessions, daily review, recitation aloud
- [National Bible Bee — Winning Study Habits](https://biblebee.org/wshaft2cw/) — habits of competition winners
- [Bible quiz (Wikipedia)](https://en.wikipedia.org/wiki/Bible_quiz) — competition formats and question types
- [OverviewBible — All 66 Books](https://overviewbible.com/books-of-the-bible/) — cross-check on book summaries and groupings
