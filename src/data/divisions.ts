import type { Division } from './types';

/**
 * How to hold each division of the canon in memory: why its books sit in the
 * order they do, and a mnemonic for the run. Read by the book-order cards'
 * explanations (see `orderExplain` in lib/generate.ts), so a missed "Which
 * book precedes Daniel?" teaches the shelf the book sits on instead of just
 * naming the neighbour.
 *
 * `why` is the reasoning behind the order, `mnemonic` the handle for it. Both
 * are written to be read after answering, so they may name any book freely.
 */
export interface DivisionGuide {
  why: string;
  mnemonic: string;
}

export const DIVISION_GUIDES: Record<Division, DivisionGuide> = {
  Law: {
    why: 'The five books of Moses run as one story, from creation to the edge of Canaan: origins, the exit from Egypt, the priests’ handbook, the wilderness census years, and Moses’ farewell sermons.',
    mnemonic: '"General Electric Lights Never Dim": Genesis, Exodus, Leviticus, Numbers, Deuteronomy.',
  },
  History: {
    why: 'Twelve books in rough time order: conquest (Joshua), the settlement (Judges, with Ruth as a story from that time and David’s ancestry), the kingdom in two doubled sets (Samuel, Kings), the same span retold from the temple’s point of view (Chronicles), and the return from exile (Ezra, Nehemiah, Esther).',
    mnemonic: 'One conquest, two settlement books, three doubled pairs, three books of return. Ruth is the hinge between the judges and the kings.',
  },
  Wisdom: {
    why: 'Ordered by the lives behind them: Job’s setting is the oldest, Psalms belong to David, and the last three (Proverbs, Ecclesiastes, Song of Solomon) are all tied to Solomon.',
    mnemonic: 'One for Job, one for David, three for Solomon.',
  },
  'Major Prophets': {
    why: 'Roughly chronological. Isaiah spoke before the exile, Jeremiah through the fall of Jerusalem, and Lamentations rides behind him as his grief for the fallen city. Ezekiel and Daniel both prophesied from exile in Babylon.',
    mnemonic: '"I Just Like Eating Donuts": Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel.',
  },
  'Minor Prophets': {
    why: 'Not chronological. The first nine are pre-exile, mixed in order, and the last three (Haggai, Zechariah, Malachi) spoke after the return from Babylon, which is why Malachi closes the Old Testament looking forward.',
    mnemonic: 'Four runs of three: Hosea Joel Amos, Obadiah Jonah Micah, Nahum Habakkuk Zephaniah, Haggai Zechariah Malachi. The last run came home from exile.',
  },
  Gospels: {
    why: 'Matthew comes first as the bridge from the Old Testament, opening with a genealogy from Abraham. Mark and Luke follow as the other two synoptics, and John, written last and shaped differently, closes the four.',
    mnemonic: 'Three synoptics, then John. Matthew leads because it opens where the Old Testament left off.',
  },
  Acts: {
    why: 'Luke’s sequel stands alone between the Gospels and the letters because it tells how the churches the letters address were founded.',
    mnemonic: 'Gospels tell what Jesus did; Acts tells what the church did next; the letters tell the church what to do now.',
  },
  'Pauline Epistles': {
    why: 'Letters to churches come first (Romans through 2 Thessalonians), roughly longest to shortest, then letters to individuals (1 and 2 Timothy, Titus, Philemon), also longest to shortest.',
    mnemonic: 'Churches first, then people, each group long to short. The four in the middle are "Go Eat Pop Corn": Galatians, Ephesians, Philippians, Colossians.',
  },
  'General Epistles': {
    why: 'Hebrews leads as the longest and the only anonymous one. Then the writers: James (Jesus’ brother), Peter, John, and Jude (another brother of Jesus) closes.',
    mnemonic: 'Hebrews, then two brothers of Jesus bracketing two apostles: James, Peter, John, Jude.',
  },
  Apocalyptic: {
    why: 'Revelation stands alone at the end. It is the canon’s closing vision, and the last book John wrote.',
    mnemonic: 'The Bible opens with a garden and closes with a city. Revelation is the city.',
  },
};

/** The canon’s shelf plan, for the whole-Bible view a position question can give. */
export const CANON_SHAPE =
  'Old Testament, 39 books: 5 Law, 12 History, 5 Wisdom, 5 Major Prophets, 12 Minor Prophets. New Testament, 27 books: 4 Gospels, Acts, 13 letters of Paul, 8 general letters, Revelation.';
