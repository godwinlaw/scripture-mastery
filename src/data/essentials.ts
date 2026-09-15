import type { Testament, Topic } from './types';
import { DOCTRINE } from './doctrine';

/**
 * The must-know lists.
 *
 * `extras.ts` holds the standing membership lists, the ten plagues, the twelve
 * apostles, the fruit of the Spirit, where the drill is "what belongs on this
 * list." These are different: every entry is a *pair*, a cue and the thing it
 * unlocks. Genesis 22 → the sacrifice of Isaac. Ehud → the left-handed judge.
 * ~1000 BC → David. The drill is the index itself: given the address, name the
 * content, and given the content, name the address.
 *
 * That is why these live apart from the book data even where they overlap it.
 * `books.ts` asks "what happens in Genesis 22?" against distractors drawn from
 * the whole canon, a test of whether you know the story. A chapter index asks
 * the same question against the other eleven Genesis headings, which is a test
 * of whether you know *where* it sits. Both are worth having; neither replaces
 * the other.
 *
 * Duplication is still the thing to watch, so two rules hold:
 *   1. Lists already carried by `extras.ts` are not repeated here, see
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
  /** Where it comes from, shown under the title and used in explanations. */
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
  /** The cue is a chapter of `book`, see rule 2 above. */
  chapterIndex?: boolean;
  entries: EssentialEntry[];
}

export const ESSENTIALS: EssentialList[] = [
  // ------------------------------------------------------------ OLD TESTAMENT
  {
    id: 'genesis-index',
    title: 'Genesis by chapter',
    source: 'Genesis, the twelve landmarks',
    testament: 'OT',
    topic: 'essentials',
    book: 'genesis',
    chapterIndex: true,
    forward: 'Genesis by chapter, what is chapter {cue}?',
    back: 'Genesis by chapter, which chapter is this? "{what}"',
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
    topic: 'essentials',
    book: 'genesis',
    ordered: true,
    orderBy: 'what',
    orderAsk: 'Put the days of creation in order.',
    forward: 'The seven days of creation, what happened on day {cue}?',
    back: 'The seven days of creation, on which day? "{what}"',
    entries: [
      { cue: '1', what: 'Light, separated from darkness' },
      { cue: '2', what: 'The heavens, separated from the waters' },
      { cue: '3', what: 'Dry land and vegetation' },
      { cue: '4', what: 'Sun, moon, and stars' },
      { cue: '5', what: 'Sea creatures and birds' },
      { cue: '6', what: 'Land animals and man' },
      { cue: '7', what: 'Rest, the Sabbath, which God made holy' },
    ],
  },
  {
    id: 'judges-major',
    title: 'The major judges',
    source: 'Judges 3–16, in the order they appear',
    testament: 'OT',
    topic: 'essentials',
    book: 'judges',
    ordered: true,
    orderAsk: 'Put the major judges in the order they appear in Judges.',
    forward: 'The major judges, what is {cue} remembered for?',
    back: 'The major judges, which judge is this? "{what}"',
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
    topic: 'essentials',
    ordered: true,
    orderAsk: 'Put the kings of {group} in order.',
    groupAsk: 'The major kings, which kingdom did {cue} rule?',
    groupDecoy: 'The kingdom of Edom',
    forward: 'The major kings, what is {cue} remembered for?',
    back: 'The major kings, which king is this? "{what}"',
    entries: [
      { cue: 'Saul', what: 'Israel’s first king', group: 'The united kingdom', book: '1-samuel' },
      { cue: 'David', what: 'The second king, a man after God’s own heart', group: 'The united kingdom', book: '2-samuel' },
      { cue: 'Solomon', what: 'The third king, who built the temple, the kingdom split after him', group: 'The united kingdom', book: '1-kings' },

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
    topic: 'essentials',
    groupAsk: 'Key prophets, in which period did {cue} prophesy?',
    forward: 'Key prophets, who did {cue} prophesy to?',
    back: 'Key prophets, which prophet is this? "{what}"',
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
    topic: 'essentials',
    ordered: true,
    orderBy: 'what',
    orderAsk: 'Put these five anchors in chronological order.',
    forward: 'The five round numbers, who or what anchors {cue}?',
    back: 'The five round numbers, roughly when? "{what}"',
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
    source: 'Psalms, the ones quoted by number',
    testament: 'OT',
    topic: 'essentials',
    book: 'psalms',
    chapterIndex: true,
    forward: 'Key psalms, what is Psalm {cue}?',
    back: 'Key psalms, which psalm is this? "{what}"',
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
    source: 'Luke, the six a survey quiz expects',
    testament: 'NT',
    topic: 'essentials',
    book: 'luke',
    forward: 'Key parables in Luke, where is the parable of {cue}?',
    back: 'Key parables in Luke, which parable is here? "{what}"',
    entries: [
      { cue: 'the Four Soils', what: 'Luke 8', note: 'Also Mark 4 and Matthew 13, the sower.' },
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
    source: 'Matthew, the six a survey quiz expects',
    testament: 'NT',
    topic: 'essentials',
    book: 'matthew',
    forward: 'Key parables in Matthew, where is the parable of {cue}?',
    back: 'Key parables in Matthew, which parable is here? "{what}"',
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
    source: 'John, all twenty-one chapters',
    testament: 'NT',
    topic: 'essentials',
    book: 'john',
    chapterIndex: true,
    forward: 'John by chapter, what is chapter {cue}?',
    back: 'John by chapter, which chapter is this? "{what}"',
    entries: [
      { cue: '1', what: 'The Word became flesh; John baptizes' },
      { cue: '2', what: 'The wedding at Cana; cleansing the temple' },
      { cue: '3', what: 'Nicodemus, "For God so loved the world"' },
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
    source: 'Acts, the chapters that carry the story',
    testament: 'NT',
    topic: 'essentials',
    book: 'acts',
    chapterIndex: true,
    forward: 'Acts by chapter, what is chapter {cue}?',
    back: 'Acts by chapter, which chapter is this? "{what}"',
    entries: [
      { cue: '1', what: 'Jesus ascends' },
      { cue: '2', what: 'Pentecost, the church begins' },
      { cue: '3', what: 'The healing at the Beautiful Gate' },
      { cue: '5', what: 'Ananias and Sapphira' },
      { cue: '7', what: 'Stephen martyred' },
      { cue: '8', what: 'The Ethiopian eunuch' },
      { cue: '9', what: 'Saul’s conversion' },
      { cue: '11', what: 'The church at Antioch' },
      { cue: '13', what: 'The first missionary journey' },
      { cue: '16', what: 'The second missionary journey, Timothy joins' },
    ],
  },
  {
    id: 'romans-road',
    title: 'The Romans Road',
    source: 'Romans, in the order it is presented, not canonical order',
    testament: 'NT',
    topic: 'essentials',
    book: 'romans',
    ordered: true,
    orderAsk: 'Put the Romans Road verses in the order they are presented.',
    forward: 'The Romans Road, what is Romans {cue}?',
    back: 'The Romans Road, which verse is this? "{what}"',
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
    topic: 'essentials',
    chapterIndex: true,
    forward: 'Key epistle chapters, what is {cue} known for?',
    back: 'Key epistle chapters, which chapter is this? "{what}"',
    entries: [
      { cue: '1 Corinthians 1', what: 'The message of the cross is folly to those who are perishing', book: '1-corinthians', ch: '1' },
      { cue: '1 Corinthians 10', what: 'God provides a way of escape with every temptation', book: '1-corinthians', ch: '10' },
      { cue: '1 Corinthians 13', what: 'The love chapter', book: '1-corinthians', ch: '13' },
      { cue: '1 Corinthians 15', what: 'The resurrection, your labor is not in vain', book: '1-corinthians', ch: '15' },
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
  {
    id: 'major-figures',
    title: 'Other major figures',
    source: 'Basic Bible Literacy: the names grouped by where they stand in the story',
    testament: 'OT',
    topic: 'essentials',
    forward: 'Other major figures: who belongs to {cue}?',
    back: 'Other major figures: which group is this? "{what}"',
    entries: [
      { cue: 'The patriarchs', what: 'Abraham, Isaac, Jacob', book: 'genesis' },
      { cue: 'Exodus and conquest', what: 'Moses, then Joshua', book: 'exodus' },
      { cue: 'The return from exile', what: 'Ezra, Nehemiah, Zerubbabel', book: 'ezra' },
      { cue: 'Women to know', what: 'Ruth, Esther, Rahab', book: 'ruth', note: 'Ruth and Rahab both appear in Matthew’s genealogy of Jesus.' },
    ],
  },
  // ------------------------------------------------- HISTORICAL CONTEXT (#35)
  // The ANCHOR framework's H: "understand the big power houses of the ancient
  // world." Revelation happened in a particular time under particular powers,
  // and the bank had no topic for them: Assyria and Babylon appeared only as
  // the answer to two date questions, and the intertestamental period and the
  // Roman-era landscape were absent outright.
  {
    id: 'world-powers',
    title: 'The powers of the ancient world',
    source: 'The empires Israel and Judah lived under, in the order they ruled',
    testament: 'OT',
    topic: 'context',
    ordered: true,
    orderAsk: 'Put the world powers in the order they ruled over Israel and Judah.',
    forward: 'The world powers: what did {cue} do to Israel or Judah?',
    back: 'The world powers: which power is this? "{what}"',
    entries: [
      { cue: 'Egypt', what: 'Enslaved Israel until the Exodus under Moses', book: 'exodus', note: 'Never stopped being a temptation: Judah kept looking to Egypt for help against Assyria and Babylon, and the prophets kept calling it a broken reed.' },
      { cue: 'Assyria', what: 'Destroyed Samaria in 722 BC and deported the northern kingdom', book: '2-kings', note: 'Capital Nineveh. Sennacherib besieged Jerusalem in Hezekiah’s day and failed to take it.' },
      { cue: 'Babylon', what: 'Burned Jerusalem and the temple in 586 BC and carried Judah into exile', book: '2-kings', note: 'Nebuchadnezzar deported Judah in three waves: 605, 597 and 586 BC.' },
      { cue: 'Persia', what: 'Sent the exiles home: Cyrus’s decree of 538 BC paid for the second temple', book: 'ezra', note: 'Medo-Persia. Ezra, Nehemiah and Esther all happen under Persian kings.' },
      { cue: 'Greece', what: 'Alexander’s conquest in 332 BC made Greek the common language of the east', book: 'daniel', note: 'Daniel 8 sees it as a goat with one great horn, broken and replaced by four.' },
      { cue: 'Rome', what: 'Ruled Judea in Jesus’ day and destroyed the second temple in AD 70', book: 'luke', note: 'Roman roads and Roman peace, over a Greek-speaking world, are what carried the gospel.' },
    ],
  },
  {
    id: 'four-kingdoms',
    title: 'Daniel’s four kingdoms',
    source: 'Daniel 2 and 7: the statue and the four beasts',
    testament: 'OT',
    topic: 'context',
    book: 'daniel',
    ordered: true,
    orderAsk: 'Put Daniel’s four kingdoms in order.',
    // The empire is the cue and the imagery the content, not the other way
    // round: the drill is "Babylon, Medo-Persia, Greece, Rome" in order, and a
    // sixty-character picture clause makes an unreadable left-hand column and
    // an unwieldy sequencing card.
    forward: 'Daniel’s four kingdoms: how is {cue} pictured in Daniel 2 and 7?',
    back: 'Daniel’s four kingdoms: which empire is this? "{what}"',
    entries: [
      { cue: 'Babylon', what: 'Head of gold; a lion with eagle’s wings', note: 'Daniel reads the head of gold to Nebuchadnezzar’s face: "you are the head of gold" (Dan 2:38).' },
      { cue: 'Medo-Persia', what: 'Chest and arms of silver; a bear raised up on one side', note: 'The higher side is Persia, the later and stronger half of the pair.' },
      { cue: 'Greece', what: 'Belly and thighs of bronze; a leopard with four wings and four heads', note: 'The four heads are Alexander’s generals, who split the empire between them.' },
      { cue: 'Rome', what: 'Legs of iron; a terrifying beast with iron teeth', note: 'The traditional reading. Some take the fourth kingdom as Greece and split Medo-Persia in two.' },
    ],
  },
  {
    id: 'silent-years',
    title: 'The four hundred silent years',
    source: 'Between Malachi and Matthew: how the New Testament world was made',
    testament: 'NT',
    topic: 'context',
    ordered: true,
    orderAsk: 'Put the milestones of the silent years in order.',
    forward: 'The four hundred silent years, {cue}: when, and why does it matter?',
    back: 'The four hundred silent years: which milestone is this? "{what}"',
    entries: [
      { cue: 'Alexander', what: '332 BC: conquers Persia, and Greek becomes the common language of the east' },
      { cue: 'The Septuagint', what: 'c. 250 BC: the Old Testament put into Greek at Alexandria', note: 'Abbreviated LXX. It is the version the New Testament writers usually quote.' },
      { cue: 'Antiochus IV', what: '167 BC: outlaws the Law and offers a pig on the temple altar', note: 'Antiochus IV Epiphanes, of the Seleucid half of Alexander’s empire. Daniel 11 is read against these years.' },
      { cue: 'The Maccabees', what: '164 BC: Judas Maccabeus retakes Jerusalem and rededicates the temple', note: 'Remembered every year at the feast of Dedication.' },
      { cue: 'The Hasmoneans', what: '142–63 BC: eighty years of Jewish self-rule under priest-kings' },
      { cue: 'Pompey', what: '63 BC: Rome annexes Judea and he walks into the Most Holy Place' },
      { cue: 'Herod', what: '37 BC: Rome installs a client king who rebuilds the temple', book: 'matthew', note: 'Herod the Great. He was still reigning when Jesus was born.' },
    ],
  },
  {
    id: 'nt-rulers',
    title: 'Rulers of the New Testament world',
    source: 'Rome and the house of Herod, as the Gospels and Acts assume you know them',
    testament: 'NT',
    topic: 'context',
    forward: 'The rulers of the New Testament world, {cue}: who is this?',
    back: 'The rulers of the New Testament world: which ruler is this? "{what}"',
    entries: [
      { cue: 'Caesar Augustus', what: 'The emperor whose census brought Joseph and Mary to Bethlehem', book: 'luke' },
      { cue: 'Tiberius', what: 'The emperor reigning when John began to preach and Jesus was crucified', book: 'luke', note: 'Luke dates John’s ministry to his fifteenth year (Luke 3:1).' },
      { cue: 'Pontius Pilate', what: 'The prefect of Judea, AD 26–36, who washed his hands and handed Jesus over', book: 'matthew' },
      { cue: 'Nero', what: 'The emperor Paul appealed to, and under whom he and Peter were martyred', book: 'acts' },
      { cue: 'Herod the Great', what: 'The client king who rebuilt the temple and killed the boys of Bethlehem', book: 'matthew' },
      { cue: 'Archelaus', what: 'The son over Judea whose brutality sent Joseph to Nazareth instead', book: 'matthew', note: 'Rome deposed him in AD 6 and governed Judea by prefects from then on: which is how Pilate, and not a king, came to try Jesus.' },
      { cue: 'Herod Antipas', what: 'The tetrarch of Galilee who beheaded John and whom Jesus called “that fox”', book: 'mark' },
      { cue: 'Philip', what: 'The tetrarch of the northeast, where Caesarea Philippi carried his name', book: 'matthew', note: 'Not the apostle Philip, and not Philip the evangelist of Acts 8.' },
      { cue: 'Herod Agrippa I', what: 'The king who killed James, imprisoned Peter, and was struck down in Acts 12', book: 'acts' },
      { cue: 'Herod Agrippa II', what: 'The king who asked Paul, “In a short time would you persuade me to be a Christian?”', book: 'acts' },
    ],
  },
  {
    id: 'nt-parties',
    title: 'Parties and institutions of Jesus’ day',
    source: 'The groups and bodies the Gospels and Acts argue with, without introducing',
    testament: 'NT',
    topic: 'context',
    forward: 'Parties and institutions, {cue}: who or what is this?',
    back: 'Parties and institutions: which is this? "{what}"',
    entries: [
      { cue: 'The Pharisees', what: 'Lay teachers of the Law who kept the oral tradition and held to the resurrection', book: 'matthew' },
      { cue: 'The Sadducees', what: 'The priestly aristocracy who ran the temple and denied resurrection and angels', book: 'acts', note: 'Acts 23:8. Paul splits the council in two by naming the resurrection.' },
      { cue: 'The Essenes', what: 'A separatist community usually linked to Qumran and the Dead Sea Scrolls', note: 'Never named in the New Testament, but part of the same landscape.' },
      { cue: 'The Zealots', what: 'Nationalists who wanted Rome thrown out by force', book: 'luke', note: 'Simon the Zealot was one of the Twelve.' },
      { cue: 'The Samaritans', what: 'Northerners of mixed descent who worshipped on Mount Gerizim, not Jerusalem', book: 'john', note: 'The reason the woman at the well asks Jesus which mountain is the right one (John 4:20).' },
      { cue: 'The scribes', what: 'Copyists and professional experts in the Law, usually paired with the Pharisees', book: 'matthew' },
      { cue: 'The Sanhedrin', what: 'The council of seventy-one under the high priest that tried Jesus and the apostles', book: 'acts' },
      { cue: 'The synagogue', what: 'The local house of reading and prayer that grew up in exile', book: 'acts', note: 'Paul’s standing pattern: the synagogue first in every city he reaches.' },
      { cue: 'Annas and Caiaphas', what: 'Father-in-law and son-in-law who between them held the high priesthood at the trial', book: 'john' },
      { cue: 'Herod’s temple', what: 'The second temple rebuilt on a vast platform from 20 BC and razed by Rome in AD 70', book: 'mark', note: 'The stones the disciples point out in Mark 13:1.' },
    ],
  },

  // --------------------------------------------- RITUALS AND FESTIVALS (#35)
  // The ANCHOR framework's R. Passover, Booths and the Day of Atonement were
  // in the bank only as things that happen in a chapter of Leviticus or Exodus
  //: the calendar itself, and the system of offerings behind it, went untested.
  {
    id: 'feasts',
    title: 'The feasts of Israel',
    source: 'Leviticus 23 and after: the appointed times, in calendar order',
    testament: 'OT',
    topic: 'rituals',
    ordered: true,
    orderAsk: 'Put the feasts of Israel in order through the year.',
    forward: 'The feasts, {cue}: what does it mark?',
    back: 'The feasts: which feast is this? "{what}"',
    entries: [
      { cue: 'Passover', what: 'The night the destroyer passed over the blood-marked houses in Egypt', book: 'exodus', note: 'Nisan 14: Exodus 12; Leviticus 23:5. "Christ, our Passover lamb, has been sacrificed" (1 Cor 5:7).' },
      { cue: 'Unleavened Bread', what: 'Seven days with no leaven in the house, remembering the haste of leaving Egypt', book: 'leviticus', note: 'Nisan 15–21, running straight on from Passover.' },
      { cue: 'Firstfruits', what: 'The first sheaf of the barley harvest waved before the LORD', book: 'leviticus', note: 'The day after the Sabbath of Passover week. Paul calls the risen Christ the firstfruits (1 Cor 15:20).' },
      { cue: 'Weeks', what: 'The wheat harvest, fifty days on from Firstfruits', book: 'leviticus', note: 'Shavuot; Pentecost in Greek, for the fifty. The day the Spirit came in Acts 2.' },
      { cue: 'Trumpets', what: 'A day of trumpet blasts opening the seventh month', book: 'leviticus', note: 'Tishri 1: later kept as Rosh Hashanah, the civil new year.' },
      { cue: 'The Day of Atonement', what: 'The one day a year the high priest went behind the veil with blood', book: 'leviticus', note: 'Tishri 10: Leviticus 16, the hinge of the book. Two goats: one killed, one driven out.' },
      { cue: 'Booths', what: 'Seven days living in shelters, remembering the wilderness', book: 'leviticus', note: 'Tishri 15–21: Sukkot, or Tabernacles. The feast Jesus is at in John 7.' },
      { cue: 'Dedication', what: 'The rededication of the temple after Antiochus defiled it', book: 'john', note: 'Kislev 25: Hanukkah, not commanded in the Law. Jesus is at the temple for it in John 10:22.' },
      { cue: 'Purim', what: 'Deliverance from Haman’s decree in the days of Esther', book: 'esther', note: 'Adar 14–15: named for the pur, the lot Haman cast (Esther 9).' },
    ],
  },
  {
    id: 'rites',
    title: 'Offerings, rites and holy times',
    source: 'Leviticus and Numbers: the system the Law set up',
    testament: 'OT',
    topic: 'rituals',
    forward: 'The rites of the Law, {cue}: what is it for?',
    back: 'The rites of the Law: which rite is this? "{what}"',
    groupAsk: 'The rites of the Law, {cue}: which part of the system?',
    entries: [
      { cue: 'Burnt offering', what: 'Wholly consumed on the altar: atonement and total surrender', group: 'The five offerings', book: 'leviticus', note: 'Leviticus 1. The only offering where nothing is kept back.' },
      { cue: 'Grain offering', what: 'Flour, oil and frankincense with no leaven or honey: a gift of thanks', group: 'The five offerings', book: 'leviticus', note: 'Leviticus 2. A handful burned, the rest for the priests.' },
      { cue: 'Peace offering', what: 'The one offering the worshipper ate: fellowship shared at God’s table', group: 'The five offerings', book: 'leviticus', note: 'Leviticus 3. Also called the fellowship offering.' },
      { cue: 'Sin offering', what: 'For sin committed unintentionally: the blood cleansed the sanctuary itself', group: 'The five offerings', book: 'leviticus', note: 'Leviticus 4.' },
      { cue: 'Guilt offering', what: 'For wrongs needing restitution: repay in full and add a fifth', group: 'The five offerings', book: 'leviticus', note: 'Leviticus 5–6. Also called the trespass offering.' },
      { cue: 'Scapegoat', what: 'The goat for Azazel, driven into the wilderness carrying the people’s sins', group: 'Rites of cleansing', book: 'leviticus', note: 'Leviticus 16. Two goats, one lot each: one is killed, one is sent away alive.' },
      { cue: 'Red heifer', what: 'Burned outside the camp; its ashes made the water that cleansed a corpse’s touch', group: 'Rites of cleansing', book: 'numbers', note: 'Numbers 19. Hebrews 13 turns "outside the camp" into a call to go there with Christ.' },
      { cue: 'Cleansing a leper', what: 'Two birds: one killed over running water, one released alive', group: 'Rites of cleansing', book: 'leviticus', note: 'Leviticus 14. The rite Jesus tells healed lepers to go and keep.' },
      { cue: 'Circumcision', what: 'The sign of the covenant with Abraham, given on the eighth day', group: 'Vows and signs', book: 'genesis', note: 'Genesis 17. The question Acts 15 and Galatians are fought over.' },
      { cue: 'Nazirite vow', what: 'No wine, no razor, no touching a corpse: a season set apart', group: 'Vows and signs', book: 'numbers', note: 'Numbers 6. Samson, Samuel and John the Baptist were kept to it for life.' },
      { cue: 'Tithe', what: 'A tenth of the produce and the herd, set apart for the Levites', group: 'Vows and signs', book: 'leviticus', note: 'Leviticus 27; Numbers 18. The Levites had no land, so the tenth was their portion.' },
      { cue: 'Sabbath', what: 'Rest on the seventh day: the sign of the covenant at Sinai', group: 'Sabbaths and holy years', book: 'exodus', note: 'Exodus 20 and 31. Grounded in creation, not in the harvest calendar.' },
      { cue: 'Sabbath year', what: 'Every seventh year the land lies fallow and debts are released', group: 'Sabbaths and holy years', book: 'leviticus', note: 'Leviticus 25; Deuteronomy 15. The seventy years of exile are counted as the land taking its missed rests.' },
      { cue: 'Year of Jubilee', what: 'Every fiftieth year: land returns to its family and slaves go free', group: 'Sabbaths and holy years', book: 'leviticus', note: 'Leviticus 25. The text Jesus reads over himself in the synagogue at Nazareth.' },
    ],
  },
  DOCTRINE,
];

/**
 * Lists that belong with these but are already carried by `extras.ts`. Pointing
 * at them keeps the must-know set complete on the page without a second copy of
 * the data, and a second copy is exactly how two cards end up disagreeing.
 */
export const ESSENTIAL_ALIASES: { title: string; listId: string; why: string }[] = [
  { title: 'The Ten Commandments', listId: 'commandments', why: 'Exodus 20, in order' },
  { title: 'The Ten Plagues', listId: 'plagues', why: 'Exodus 7–12, in order' },
  { title: 'The Twelve Tribes of Israel', listId: 'tribes', why: 'Jacob’s sons' },
  { title: 'The Seven "I AM" Statements', listId: 'i-am', why: 'The Gospel of John' },
];

export const ESSENTIAL_ENTRY_COUNT = ESSENTIALS.reduce((n, l) => n + l.entries.length, 0);
