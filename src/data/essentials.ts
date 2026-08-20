import type { Testament, Topic } from './types';

/**
 * The must-know lists.
 *
 * `extras.ts` holds the standing membership lists — the ten plagues, the twelve
 * apostles, the fruit of the Spirit — where the drill is "what belongs on this
 * list." These are different: every entry is a *pair*, a cue and the thing it
 * unlocks. Genesis 22 → the sacrifice of Isaac. Ehud → the left-handed judge.
 * ~1000 BC → David. The drill is the index itself: given the address, name the
 * content, and given the content, name the address.
 *
 * That is why these live apart from the book data even where they overlap it.
 * `books.ts` asks "what happens in Genesis 22?" against distractors drawn from
 * the whole canon — a test of whether you know the story. A chapter index asks
 * the same question against the other eleven Genesis headings, which is a test
 * of whether you know *where* it sits. Both are worth having; neither replaces
 * the other.
 *
 * Duplication is still the thing to watch, so two rules hold:
 *   1. Lists already carried by `extras.ts` are not repeated here — see
 *      `ESSENTIAL_ALIASES`, which points at them instead.
 *   2. Chapter-index lists are marked `chapterIndex`, and the generator drops
 *      the forward card for any chapter `books.ts` already names as a key
 *      chapter. The reverse card (heading → chapter) always stands, because
 *      nothing else in the bank drills it.
 */

/** One cue → content pair. */
export interface EssentialEntry {
  /** What you are given: a chapter, a name, a date, a reference. */
  cue: string;
  /** What you have to produce. */
  what: string;
  /** Grouping axis, when the list has one (which kingdom, which period). */
  group?: string;
  /** Book id, for lists that span books. Defaults to the list's `book`. */
  book?: string;
  /** Chapter within that book, when the cue is not itself the chapter. */
  ch?: string;
  /** Extra context shown after answering. */
  note?: string;
}

export interface EssentialList {
  id: string;
  title: string;
  /** Where it comes from — shown under the title and used in explanations. */
  source: string;
  testament: Testament;
  topic: Topic;
  /** Book id, when the whole list indexes a single book. */
  book?: string;
  /** Cue → content prompt. `{cue}` and `{what}` are substituted. */
  forward: string;
  /** Content → cue prompt. Omit when the cues are not distinctive enough. */
  back?: string;
  /** Prompt for the grouping card. Omit when the list has no groups. */
  groupAsk?: string;
  /** A wrong-but-plausible group, when the real ones are too few for four options. */
  groupDecoy?: string;
  /** The sequence is testable. Order cards are emitted per group. */
  ordered?: boolean;
  /** Prompt for the order card. `{group}` is substituted. */
  orderAsk?: string;
  /** Which side of the pair the order card sequences. Defaults to the cue. */
  orderBy?: 'cue' | 'what';
  /** The cue is a chapter of `book` — see rule 2 above. */
  chapterIndex?: boolean;
  entries: EssentialEntry[];
}

export const ESSENTIALS: EssentialList[] = [
  // ------------------------------------------------------------ OLD TESTAMENT
  {
    id: 'genesis-index',
    title: 'Genesis by chapter',
    source: 'Genesis — the twelve landmarks',
    testament: 'OT',
    topic: 'chapters',
    book: 'genesis',
    chapterIndex: true,
    forward: 'Genesis by chapter — what is chapter {cue}?',
    back: 'Genesis by chapter — which chapter is this? "{what}"',
    entries: [
      { cue: '1', what: 'The creation account' },
      { cue: '2', what: 'The creation of man' },
      { cue: '3', what: 'The Fall' },
      { cue: '4', what: 'Cain and Abel' },
      { cue: '5', what: 'The genealogy of Adam' },
      { cue: '6-9', what: 'Noah and the Flood' },
      { cue: '11', what: 'The Tower of Babel' },
      { cue: '12', what: 'The call of Abram' },
      { cue: '15', what: 'God’s covenant with Abram' },
      { cue: '22', what: 'The sacrifice of Isaac' },
      { cue: '25', what: 'Jacob is born' },
      { cue: '37', what: 'The Joseph story begins' },
    ],
  },
  {
    id: 'creation-days',
    title: 'The seven days of creation',
    source: 'Genesis 1:1–2:3, in order',
    testament: 'OT',
    topic: 'events',
    book: 'genesis',
    ordered: true,
    orderBy: 'what',
    orderAsk: 'Put the days of creation in order.',
    forward: 'The seven days of creation — what happened on day {cue}?',
    back: 'The seven days of creation — on which day? "{what}"',
    entries: [
      { cue: '1', what: 'Light, separated from darkness' },
      { cue: '2', what: 'The heavens, separated from the waters' },
      { cue: '3', what: 'Dry land and vegetation' },
      { cue: '4', what: 'Sun, moon, and stars' },
      { cue: '5', what: 'Sea creatures and birds' },
      { cue: '6', what: 'Land animals and man' },
      { cue: '7', what: 'Rest — the Sabbath, which God made holy' },
    ],
  },
  {
    id: 'judges-major',
    title: 'The major judges',
    source: 'Judges 3–16, in the order they appear',
    testament: 'OT',
    topic: 'people',
    book: 'judges',
    ordered: true,
    orderAsk: 'Put the major judges in the order they appear in Judges.',
    forward: 'The major judges — what is {cue} remembered for?',
    back: 'The major judges — which judge is this? "{what}"',
    entries: [
      { cue: 'Othniel', what: 'The first judge', note: 'Caleb’s younger relative (Judges 3).' },
      { cue: 'Ehud', what: 'The left-handed judge who killed the very fat King Eglon' },
      { cue: 'Deborah', what: 'The prophetess who went to battle with Barak' },
      { cue: 'Gideon', what: 'Tested God with a fleece and won with 300 men' },
      { cue: 'Jephthah', what: 'Made a rash vow' },
      { cue: 'Samson', what: 'His strength was in his hair; betrayed by Delilah' },
    ],
  },
  {
    id: 'kings-major',
    title: 'The major kings',
    source: '1–2 Samuel, 1–2 Kings. The kingdom splits after Solomon.',
    testament: 'OT',
    topic: 'people',
    ordered: true,
    orderAsk: 'Put the kings of {group} in order.',
    groupAsk: 'The major kings — which kingdom did {cue} rule?',
    groupDecoy: 'The kingdom of Edom',
    forward: 'The major kings — what is {cue} remembered for?',
    back: 'The major kings — which king is this? "{what}"',
    entries: [
      { cue: 'Saul', what: 'Israel’s first king', group: 'The united kingdom', book: '1-samuel' },
      { cue: 'David', what: 'The second king, a man after God’s own heart', group: 'The united kingdom', book: '2-samuel' },
      { cue: 'Solomon', what: 'The third king, who built the temple — the kingdom split after him', group: 'The united kingdom', book: '1-kings' },

      { cue: 'Jeroboam', what: 'The first king of the north, after the rebellion', group: 'The northern kingdom of Israel', book: '1-kings' },
      { cue: 'Ahab', what: 'The king married to Jezebel', group: 'The northern kingdom of Israel', book: '1-kings' },
      { cue: 'Jehu', what: 'The king who wiped out Ahab’s line', group: 'The northern kingdom of Israel', book: '2-kings' },
      { cue: 'Hoshea', what: 'The final king of the north, before Samaria fell', group: 'The northern kingdom of Israel', book: '2-kings', note: 'Assyria took Samaria in 722 BC.' },

      { cue: 'Rehoboam', what: 'Solomon’s son, king when the kingdom split', group: 'The southern kingdom of Judah', book: '1-kings' },
      { cue: 'Hezekiah', what: 'A good king, who followed Ahaz', group: 'The southern kingdom of Judah', book: '2-kings' },
      { cue: 'Josiah', what: 'A good king, who found the scroll of the Law', group: 'The southern kingdom of Judah', book: '2-kings' },
      { cue: 'Zedekiah', what: 'The final king of Judah', group: 'The southern kingdom of Judah', book: '2-kings', note: 'Jerusalem fell to Babylon in 586 BC.' },
    ],
  },
  {
    id: 'prophets-by-period',
    title: 'Key prophets by period',
    source: 'Who prophesied when, and to whom',
    testament: 'OT',
    topic: 'people',
    groupAsk: 'Key prophets — in which period did {cue} prophesy?',
    forward: 'Key prophets — who did {cue} prophesy to?',
    back: 'Key prophets — which prophet is this? "{what}"',
    entries: [
      { cue: 'Samuel', what: 'Saul and David', group: 'The united kingdom', book: '1-samuel' },
      { cue: 'Nathan', what: 'David', group: 'The united kingdom', book: '2-samuel' },
      { cue: 'Elijah', what: 'Ahab and the northern kingdom', group: 'The northern kingdom', book: '1-kings' },
      { cue: 'Elisha', what: 'The northern kingdom, after Elijah', group: 'The northern kingdom', book: '2-kings' },
      { cue: 'Isaiah', what: 'Judah, under the Assyrian siege', group: 'The southern kingdom', book: 'isaiah' },
      { cue: 'Jeremiah', what: 'Judah, under the Babylonian siege', group: 'The southern kingdom', book: 'jeremiah' },
      { cue: 'Ezekiel', what: 'The exiles in Babylon', group: 'The Babylonian exile', book: 'ezekiel' },
      { cue: 'Daniel', what: 'The court of Babylon', group: 'The Babylonian exile', book: 'daniel' },
    ],
  },
  {
    id: 'timeline-anchors',
    title: 'The five round numbers',
    source: 'The rough dates that hold the whole timeline together',
    testament: 'OT',
    topic: 'timeline',
    ordered: true,
    orderBy: 'what',
    orderAsk: 'Put these five anchors in chronological order.',
    forward: 'The five round numbers — who or what anchors {cue}?',
    back: 'The five round numbers — roughly when? "{what}"',
    entries: [
      { cue: '~2000 BC', what: 'Abraham' },
      { cue: '~1500 BC', what: 'Moses' },
      { cue: '~1000 BC', what: 'David' },
      { cue: '~500 BC', what: 'The exile' },
      { cue: '~AD 0', what: 'Jesus' },
    ],
  },
  {
    id: 'psalms-key',
    title: 'Key psalms',
    source: 'Psalms — the ones quoted by number',
    testament: 'OT',
    topic: 'chapters',
    book: 'psalms',
    chapterIndex: true,
    forward: 'Key psalms — what is Psalm {cue}?',
    back: 'Key psalms — which psalm is this? "{what}"',
    entries: [
      { cue: '1', what: 'Blessed is the man' },
      { cue: '23', what: 'The LORD is my shepherd' },
      { cue: '40', what: 'I waited patiently for the LORD' },
      { cue: '46', what: 'God is our refuge and strength' },
      { cue: '51', what: 'Create in me a clean heart' },
      { cue: '73', what: 'My feet had almost slipped' },
      { cue: '90', what: 'Teach us to number our days' },
      { cue: '103', what: 'Bless the LORD, O my soul' },
      { cue: '110', what: 'The LORD said to my Lord' },
      { cue: '119', what: 'Your word is a lamp to my feet' },
      { cue: '139', what: 'You have searched me and known me' },
    ],
  },

  // ------------------------------------------------------------ NEW TESTAMENT
  {
    id: 'parables-luke',
    title: 'Key parables in Luke',
    source: 'Luke — the six a survey quiz expects',
    testament: 'NT',
    topic: 'chapters',
    book: 'luke',
    forward: 'Key parables in Luke — where is the parable of {cue}?',
    back: 'Key parables in Luke — which parable is here? "{what}"',
    entries: [
      { cue: 'the Four Soils', what: 'Luke 8', note: 'Also Mark 4 and Matthew 13 — the sower.' },
      { cue: 'the Good Samaritan', what: 'Luke 10' },
      { cue: 'the Rich Fool', what: 'Luke 12' },
      { cue: 'the Great Banquet', what: 'Luke 14' },
      { cue: 'the Prodigal Son', what: 'Luke 15' },
      { cue: 'the Pharisee and the Tax Collector', what: 'Luke 18' },
    ],
  },
  {
    id: 'parables-matthew',
    title: 'Key parables in Matthew',
    source: 'Matthew — the six a survey quiz expects',
    testament: 'NT',
    topic: 'chapters',
    book: 'matthew',
    forward: 'Key parables in Matthew — where is the parable of {cue}?',
    back: 'Key parables in Matthew — which parable is here? "{what}"',
    entries: [
      { cue: 'the Wise and Foolish Builders', what: 'Matthew 7' },
      { cue: 'the Treasure in a Field', what: 'Matthew 13' },
      { cue: 'the Unmerciful Servant', what: 'Matthew 18' },
      { cue: 'the Tenants', what: 'Matthew 21' },
      { cue: 'the Wedding Feast', what: 'Matthew 22', note: 'Matthew’s great banquet; Luke 14 tells a parallel version.' },
      { cue: 'the Talents', what: 'Matthew 25' },
    ],
  },
  {
    id: 'john-index',
    title: 'John by chapter',
    source: 'John — all twenty-one chapters',
    testament: 'NT',
    topic: 'chapters',
    book: 'john',
    chapterIndex: true,
    forward: 'John by chapter — what is chapter {cue}?',
    back: 'John by chapter — which chapter is this? "{what}"',
    entries: [
      { cue: '1', what: 'The Word became flesh; John baptizes' },
      { cue: '2', what: 'The wedding at Cana; cleansing the temple' },
      { cue: '3', what: 'Nicodemus — "For God so loved the world"' },
      { cue: '4', what: 'The Samaritan woman at the well' },
      { cue: '5', what: 'The healing at Bethesda' },
      { cue: '6', what: 'Feeding the five thousand' },
      { cue: '7', what: 'The Feast of Tabernacles' },
      { cue: '8', what: 'The woman caught in adultery' },
      { cue: '9', what: 'The man born blind' },
      { cue: '10', what: 'The Good Shepherd' },
      { cue: '11', what: 'Lazarus raised from the dead' },
      { cue: '12', what: 'Mary anoints Jesus; he predicts his death' },
      { cue: '13', what: 'Washing the disciples’ feet; the new commandment' },
      { cue: '14', what: 'The way, the truth, and the life' },
      { cue: '15', what: 'I am the true vine' },
      { cue: '16-17', what: 'The Spirit’s work; the High Priestly Prayer' },
      { cue: '18-20', what: 'Arrest, crucifixion, resurrection' },
      { cue: '21', what: 'The restoration of Peter' },
    ],
  },
  {
    id: 'acts-index',
    title: 'Acts by chapter',
    source: 'Acts — the chapters that carry the story',
    testament: 'NT',
    topic: 'chapters',
    book: 'acts',
    chapterIndex: true,
    forward: 'Acts by chapter — what is chapter {cue}?',
    back: 'Acts by chapter — which chapter is this? "{what}"',
    entries: [
      { cue: '1', what: 'Jesus ascends' },
      { cue: '2', what: 'Pentecost — the church begins' },
      { cue: '3', what: 'The healing at the Beautiful Gate' },
      { cue: '5', what: 'Ananias and Sapphira' },
      { cue: '7', what: 'Stephen martyred' },
      { cue: '8', what: 'The Ethiopian eunuch' },
      { cue: '9', what: 'Saul’s conversion' },
      { cue: '11', what: 'The church at Antioch' },
      { cue: '13', what: 'The first missionary journey' },
      { cue: '16', what: 'The second missionary journey — Timothy joins' },
    ],
  },
  {
    id: 'romans-road',
    title: 'The Romans Road',
    source: 'Romans — in the order it is presented, not canonical order',
    testament: 'NT',
    topic: 'chapters',
    book: 'romans',
    ordered: true,
    orderAsk: 'Put the Romans Road verses in the order they are presented.',
    forward: 'The Romans Road — what is Romans {cue}?',
    back: 'The Romans Road — which verse is this? "{what}"',
    entries: [
      { cue: '3:23', what: 'For all have sinned and fall short of the glory of God' },
      { cue: '6:23', what: 'The wages of sin is death' },
      { cue: '5:8', what: 'But God shows his love for us in that while we were still sinners, Christ died for us' },
      { cue: '10:9', what: 'Confess with your mouth and believe in your heart, and you will be saved' },
      { cue: '10:13', what: 'Everyone who calls on the name of the Lord will be saved' },
    ],
  },
  {
    id: 'epistle-chapters',
    title: 'Key epistle chapters',
    source: 'The chapters known by their number across the letters',
    testament: 'NT',
    topic: 'chapters',
    chapterIndex: true,
    forward: 'Key epistle chapters — what is {cue} known for?',
    back: 'Key epistle chapters — which chapter is this? "{what}"',
    entries: [
      { cue: '1 Corinthians 1', what: 'The message of the cross is folly to those who are perishing', book: '1-corinthians', ch: '1' },
      { cue: '1 Corinthians 10', what: 'God provides a way of escape with every temptation', book: '1-corinthians', ch: '10' },
      { cue: '1 Corinthians 13', what: 'The love chapter', book: '1-corinthians', ch: '13' },
      { cue: '1 Corinthians 15', what: 'The resurrection — your labor is not in vain', book: '1-corinthians', ch: '15' },
      { cue: '2 Corinthians 4', what: 'Treasure in jars of clay', book: '2-corinthians', ch: '4' },
      { cue: '2 Corinthians 5', what: 'A new creation; ambassadors for Christ', book: '2-corinthians', ch: '5' },
      { cue: '2 Corinthians 12', what: 'Power made perfect in weakness', book: '2-corinthians', ch: '12' },
      { cue: 'Galatians 2', what: '"I have been crucified with Christ" (2:20)', book: 'galatians', ch: '2' },
      { cue: 'Galatians 5', what: 'The fruit of the Spirit', book: 'galatians', ch: '5' },
      { cue: 'Galatians 6', what: 'You reap what you sow', book: 'galatians', ch: '6' },
      { cue: 'Ephesians 2', what: 'Saved by grace, for good works', book: 'ephesians', ch: '2' },
      { cue: 'Ephesians 4', what: 'The fivefold gifts; speaking the truth in love', book: 'ephesians', ch: '4' },
      { cue: 'Ephesians 6', what: 'The armor of God', book: 'ephesians', ch: '6' },
      { cue: 'Philippians 1', what: 'God completes what he began; to live is Christ, to die is gain', book: 'philippians', ch: '1' },
      { cue: 'Philippians 2', what: 'Imitate Christ’s humility', book: 'philippians', ch: '2' },
      { cue: 'Philippians 3', what: 'Count it all rubbish; press on', book: 'philippians', ch: '3' },
      { cue: 'Philippians 4', what: 'Whatever is true, honorable, just, pure, lovely, commendable', book: 'philippians', ch: '4' },
      { cue: 'Colossians 1', what: 'The preeminence of Christ', book: 'colossians', ch: '1' },
      { cue: 'Colossians 3', what: 'Work heartily, as for the Lord', book: 'colossians', ch: '3' },
      { cue: '1 Thessalonians 4', what: 'God’s will is your sanctification', book: '1-thessalonians', ch: '4' },
      { cue: '1 Thessalonians 5', what: 'Rejoice always, pray without ceasing, give thanks', book: '1-thessalonians', ch: '5' },
      { cue: '1 Timothy 1', what: 'Christ came to save sinners, of whom I am the foremost', book: '1-timothy', ch: '1' },
      { cue: '1 Timothy 3', what: 'Qualifications for overseers', book: '1-timothy', ch: '3' },
      { cue: '1 Timothy 6', what: 'The love of money is a root of all kinds of evil', book: '1-timothy', ch: '6' },
      { cue: '2 Timothy 1', what: 'A spirit of power, love, and self-control; fan into flame', book: '2-timothy', ch: '1' },
      { cue: '2 Timothy 2', what: 'Entrust it to faithful men', book: '2-timothy', ch: '2' },
      { cue: '2 Timothy 3', what: 'All Scripture is breathed out by God', book: '2-timothy', ch: '3' },
      { cue: '2 Timothy 4', what: 'Finish the race', book: '2-timothy', ch: '4' },
      { cue: 'Hebrews 3', what: 'Take care lest there be in any of you an evil, unbelieving heart', book: 'hebrews', ch: '3' },
      { cue: 'Hebrews 4', what: 'The word of God is living and active', book: 'hebrews', ch: '4' },
      { cue: 'Hebrews 11', what: 'The hall of faith', book: 'hebrews', ch: '11' },
      { cue: 'Hebrews 12', what: 'Let us run with endurance the race set before us', book: 'hebrews', ch: '12' },
      { cue: 'James 1', what: 'Trials; be a doer of the word', book: 'james', ch: '1' },
      { cue: 'James 2', what: 'Faith without works is dead', book: 'james', ch: '2' },
      { cue: 'James 3', what: 'The power of the tongue', book: 'james', ch: '3' },
      { cue: 'James 4', what: 'Submit to God, draw near to him', book: 'james', ch: '4' },
      { cue: '1 Peter 2', what: 'A chosen race, a royal priesthood', book: '1-peter', ch: '2' },
      { cue: '1 Peter 5', what: 'Be sober-minded; be watchful', book: '1-peter', ch: '5' },
      { cue: '1 John 1', what: 'Walk in the light; confession and cleansing', book: '1-john', ch: '1' },
      { cue: '1 John 2', what: 'Do not love the world', book: '1-john', ch: '2' },
    ],
  },
];

/**
 * Lists that belong with these but are already carried by `extras.ts`. Pointing
 * at them keeps the must-know set complete on the page without a second copy of
 * the data — and a second copy is exactly how two cards end up disagreeing.
 */
export const ESSENTIAL_ALIASES: { title: string; listId: string; why: string }[] = [
  { title: 'The Ten Commandments', listId: 'commandments', why: 'Exodus 20, in order' },
  { title: 'The Ten Plagues', listId: 'plagues', why: 'Exodus 7–12, in order' },
  { title: 'The Twelve Tribes of Israel', listId: 'tribes', why: 'Jacob’s sons' },
  { title: 'The Seven "I AM" Statements', listId: 'i-am', why: 'The Gospel of John' },
];

export const ESSENTIAL_ENTRY_COUNT = ESSENTIALS.reduce((n, l) => n + l.entries.length, 0);
