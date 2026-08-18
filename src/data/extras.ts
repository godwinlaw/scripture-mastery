import type { Item } from './types';

/** Ordered lists worth knowing cold — these drive sequencing drills. */
export interface OrderedList {
  id: string;
  title: string;
  note: string;
  items: string[];
  /** True if the order itself is testable; false = membership only. */
  ordered: boolean;
}

export const LISTS: OrderedList[] = [
  {
    id: 'plagues', title: 'The Ten Plagues of Egypt', note: 'Exodus 7–12, in order',
    ordered: true,
    items: ['Water to blood', 'Frogs', 'Gnats', 'Flies', 'Livestock die', 'Boils', 'Hail', 'Locusts', 'Darkness', 'Death of the firstborn'],
  },
  {
    id: 'commandments', title: 'The Ten Commandments', note: 'Exodus 20, in order',
    ordered: true,
    items: ['No other gods before me', 'No carved images', 'Do not take the LORD’s name in vain', 'Remember the Sabbath day', 'Honor your father and mother', 'You shall not murder', 'You shall not commit adultery', 'You shall not steal', 'You shall not bear false witness', 'You shall not covet'],
  },
  {
    id: 'tribes', title: 'The Twelve Tribes of Israel', note: 'Jacob’s sons',
    ordered: false,
    items: ['Reuben', 'Simeon', 'Levi', 'Judah', 'Dan', 'Naphtali', 'Gad', 'Asher', 'Issachar', 'Zebulun', 'Joseph', 'Benjamin'],
  },
  {
    id: 'apostles', title: 'The Twelve Apostles', note: 'Matthew 10:2–4',
    ordered: false,
    items: ['Simon Peter', 'Andrew', 'James son of Zebedee', 'John', 'Philip', 'Bartholomew', 'Thomas', 'Matthew', 'James son of Alphaeus', 'Thaddaeus', 'Simon the Zealot', 'Judas Iscariot'],
  },
  {
    id: 'fruit', title: 'The Fruit of the Spirit', note: 'Galatians 5:22–23, in order',
    ordered: true,
    items: ['Love', 'Joy', 'Peace', 'Patience', 'Kindness', 'Goodness', 'Faithfulness', 'Gentleness', 'Self-control'],
  },
  {
    id: 'armor', title: 'The Armor of God', note: 'Ephesians 6:14–17',
    ordered: false,
    items: ['Belt of truth', 'Breastplate of righteousness', 'Shoes of the gospel of peace', 'Shield of faith', 'Helmet of salvation', 'Sword of the Spirit'],
  },
  {
    id: 'seven-churches', title: 'The Seven Churches of Revelation', note: 'Revelation 2–3, in order',
    ordered: true,
    items: ['Ephesus', 'Smyrna', 'Pergamum', 'Thyatira', 'Sardis', 'Philadelphia', 'Laodicea'],
  },
  {
    id: 'beatitudes', title: 'The Beatitudes', note: 'Matthew 5:3–10 — "Blessed are…"',
    ordered: true,
    items: ['the poor in spirit', 'those who mourn', 'the meek', 'those who hunger and thirst for righteousness', 'the merciful', 'the pure in heart', 'the peacemakers', 'those who are persecuted for righteousness’ sake'],
  },
  {
    id: 'i-am', title: 'The Seven "I AM" Statements of John', note: 'The Gospel of John',
    ordered: false,
    items: ['I am the bread of life', 'I am the light of the world', 'I am the door', 'I am the good shepherd', 'I am the resurrection and the life', 'I am the way, the truth, and the life', 'I am the true vine'],
  },
  {
    id: 'signs', title: 'The Seven Signs in John', note: 'John 2–11',
    ordered: true,
    items: ['Water into wine at Cana', 'Healing the official’s son', 'Healing the paralytic at Bethesda', 'Feeding the five thousand', 'Walking on water', 'Healing the man born blind', 'Raising Lazarus'],
  },
  {
    id: 'divisions-ot', title: 'The Five Divisions of the Old Testament', note: 'In canonical order',
    ordered: true,
    items: ['Law (5 books)', 'History (12 books)', 'Wisdom/Poetry (5 books)', 'Major Prophets (5 books)', 'Minor Prophets (12 books)'],
  },
  {
    id: 'divisions-nt', title: 'The Five Divisions of the New Testament', note: 'In canonical order',
    ordered: true,
    items: ['Gospels (4 books)', 'History — Acts (1 book)', 'Pauline Epistles (13 books)', 'General Epistles (8 books)', 'Prophecy — Revelation (1 book)'],
  },
  {
    id: 'journeys', title: 'Paul’s Journeys in Acts', note: 'In order',
    ordered: true,
    items: ['First missionary journey (Acts 13–14)', 'Jerusalem Council (Acts 15)', 'Second missionary journey (Acts 15–18)', 'Third missionary journey (Acts 18–21)', 'Arrest in Jerusalem (Acts 21–23)', 'Voyage to Rome (Acts 27–28)'],
  },
];

/**
 * Hand-authored items covering facts the generator cannot derive from book data:
 * counts, groupings, cross-book connections, and classic quiz staples.
 */
export const AUTHORED: Item[] = [
  // ---- Numbers and counts
  { id: 'a-count-total', kind: 'type', topic: 'numbers', tier: 1, prompt: 'How many books are in the Bible?', answer: '66', accepts: ['sixty-six', 'sixty six'], explain: '39 Old Testament + 27 New Testament = 66. (39 × 27 is a handy check: 3 × 9 = 27.)' },
  { id: 'a-count-ot', kind: 'type', topic: 'numbers', tier: 1, prompt: 'How many books are in the Old Testament?', answer: '39', accepts: ['thirty-nine', 'thirty nine'] },
  { id: 'a-count-nt', kind: 'type', topic: 'numbers', tier: 1, prompt: 'How many books are in the New Testament?', answer: '27', accepts: ['twenty-seven', 'twenty seven'] },
  { id: 'a-count-chapters', kind: 'mcq', topic: 'numbers', tier: 3, prompt: 'How many chapters are in the whole Bible?', answer: '1,189', distractors: ['929', '1,050', '1,260'], explain: '929 in the Old Testament plus 260 in the New Testament.' },
  { id: 'a-longest-chapter', kind: 'type', topic: 'numbers', tier: 2, prompt: 'What is the longest chapter in the Bible?', answer: 'Psalm 119', accepts: ['psalms 119', '119', 'ps 119'], explain: '176 verses, an acrostic where each stanza begins with a successive Hebrew letter.' },
  { id: 'a-shortest-chapter', kind: 'type', topic: 'numbers', tier: 3, prompt: 'What is the shortest chapter in the Bible?', answer: 'Psalm 117', accepts: ['psalms 117', '117', 'ps 117'], explain: 'Just two verses.' },
  { id: 'a-longest-book', kind: 'mcq', topic: 'numbers', tier: 2, prompt: 'Which book has the most chapters?', answer: 'Psalms', distractors: ['Isaiah', 'Genesis', 'Jeremiah'], explain: 'Psalms has 150; Isaiah is next at 66.' },
  { id: 'a-shortest-book', kind: 'mcq', topic: 'numbers', tier: 3, prompt: 'Which is the shortest book in the Bible by verse count?', answer: '3 John', distractors: ['2 John', 'Jude', 'Obadiah'], explain: '3 John has 14 verses; 2 John has 13 verses but slightly more words in Greek. Obadiah (21 verses) is the shortest OT book.' },
  { id: 'a-shortest-ot', kind: 'type', topic: 'numbers', tier: 2, prompt: 'What is the shortest book in the Old Testament?', answer: 'Obadiah', accepts: ['obadiah'], explain: 'One chapter, 21 verses.' },
  { id: 'a-paul-letters', kind: 'type', topic: 'numbers', tier: 1, prompt: 'How many New Testament letters are attributed to Paul?', answer: '13', accepts: ['thirteen'], explain: 'Romans through Philemon. Hebrews is anonymous and counted separately.' },
  { id: 'a-gospels-count', kind: 'type', topic: 'numbers', tier: 1, prompt: 'How many Gospels are there, and what are they?', answer: 'Four: Matthew, Mark, Luke, John', accepts: ['4', 'four', 'matthew mark luke john'] },

  // ---- Divisions and structure
  { id: 'a-pentateuch', kind: 'type', topic: 'divisions', tier: 1, prompt: 'What is the name for the first five books of the Bible?', answer: 'The Pentateuch', accepts: ['pentateuch', 'the law', 'torah'], explain: 'Also called the Torah or the Law — Genesis through Deuteronomy.' },
  { id: 'a-synoptics', kind: 'type', topic: 'divisions', tier: 1, prompt: 'Which three Gospels are called the Synoptic Gospels?', answer: 'Matthew, Mark, and Luke', accepts: ['matthew mark luke', 'matthew, mark, luke'], explain: '"Synoptic" means "seen together" — they share much of the same material. John stands apart.' },
  { id: 'a-major-minor', kind: 'mcq', topic: 'divisions', tier: 1, prompt: 'What distinguishes the Major Prophets from the Minor Prophets?', answer: 'The length of the books, not their importance', distractors: ['How accurate their prophecies were', 'Whether they prophesied before or after the exile', 'Whether they wrote to Israel or Judah'], explain: 'Major = longer (Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel). Minor = shorter, the twelve.' },
  { id: 'a-prison-epistles', kind: 'mcq', topic: 'divisions', tier: 2, prompt: 'Which four letters are known as the Prison Epistles?', answer: 'Ephesians, Philippians, Colossians, Philemon', distractors: ['Romans, Galatians, Ephesians, Philippians', '1 & 2 Timothy, Titus, Philemon', 'Colossians, 1 & 2 Thessalonians, Philemon'], explain: 'All four were written while Paul was imprisoned, most likely in Rome.' },
  { id: 'a-pastoral-epistles', kind: 'mcq', topic: 'divisions', tier: 2, prompt: 'Which letters are the Pastoral Epistles?', answer: '1 Timothy, 2 Timothy, and Titus', distractors: ['Ephesians, Philippians, and Colossians', 'James, 1 Peter, and 2 Peter', '1, 2, and 3 John'], explain: 'They were written to individual pastors rather than to congregations.' },
  { id: 'a-psalms-books', kind: 'mcq', topic: 'divisions', tier: 3, prompt: 'The book of Psalms is divided into how many "books"?', answer: 'Five', distractors: ['Three', 'Seven', 'Twelve'], explain: 'Psalms 1–41, 42–72, 73–89, 90–106, 107–150 — each closing with a doxology.' },
  { id: 'a-last-ot', kind: 'type', topic: 'divisions', tier: 1, prompt: 'What is the last book of the Old Testament?', answer: 'Malachi', accepts: ['malachi'] },
  { id: 'a-first-nt', kind: 'type', topic: 'divisions', tier: 1, prompt: 'What is the first book of the New Testament?', answer: 'Matthew', accepts: ['matthew'] },
  { id: 'a-silence', kind: 'mcq', topic: 'timeline', tier: 2, prompt: 'About how many years passed between Malachi and the New Testament?', answer: 'About 400 years', distractors: ['About 100 years', 'About 700 years', 'About 40 years'], explain: 'Called the intertestamental period or the "400 silent years."' },

  // ---- Cross-book connections
  { id: 'a-luke-acts', kind: 'mcq', topic: 'authorship', tier: 1, prompt: 'Which two New Testament books were written by the same author as a two-volume work?', answer: 'Luke and Acts', distractors: ['Matthew and Mark', 'John and Revelation', 'Hebrews and James'], explain: 'Both are addressed to Theophilus; Acts picks up where Luke ends.' },
  { id: 'a-gentile-author', kind: 'type', topic: 'authorship', tier: 2, prompt: 'Who is generally considered the only Gentile author in the Bible?', answer: 'Luke', accepts: ['luke'], explain: 'A physician and Paul’s travel companion; he wrote Luke and Acts.' },
  { id: 'a-hebrews-author', kind: 'mcq', topic: 'authorship', tier: 2, prompt: 'Who wrote the book of Hebrews?', answer: 'The author is unknown', distractors: ['Paul', 'Apollos', 'Barnabas'], explain: 'Hebrews is anonymous. Paul, Apollos, Barnabas, and Priscilla have all been proposed.' },
  { id: 'a-johns-books', kind: 'mcq', topic: 'authorship', tier: 2, prompt: 'How many New Testament books are traditionally attributed to the apostle John?', answer: 'Five', distractors: ['Three', 'Two', 'Four'], explain: 'The Gospel of John, 1–3 John, and Revelation.' },
  { id: 'a-moses-books', kind: 'type', topic: 'authorship', tier: 1, prompt: 'How many books of the Bible are traditionally attributed to Moses?', answer: 'Five', accepts: ['5', 'five'], explain: 'Genesis through Deuteronomy — the Pentateuch.' },
  { id: 'a-no-god-named', kind: 'type', topic: 'summaries', tier: 2, prompt: 'Which book of the Bible never mentions God by name?', answer: 'Esther', accepts: ['esther'], explain: 'God is never named, yet His providence drives the entire plot.' },
  { id: 'a-joel-pentecost', kind: 'mcq', topic: 'events', tier: 3, prompt: 'At Pentecost, Peter quoted which Old Testament prophet?', answer: 'Joel', distractors: ['Isaiah', 'Amos', 'Zechariah'], explain: 'Joel 2:28 — "I will pour out my Spirit on all flesh."' },
  { id: 'a-micah-bethlehem', kind: 'mcq', topic: 'events', tier: 3, prompt: 'Which prophet foretold that the Messiah would be born in Bethlehem?', answer: 'Micah', distractors: ['Isaiah', 'Malachi', 'Hosea'], explain: 'Micah 5:2, quoted to Herod by the chief priests in Matthew 2.' },

  // ---- Events and people
  { id: 'a-first-king', kind: 'type', topic: 'people', tier: 1, prompt: 'Who was the first king of Israel?', answer: 'Saul', accepts: ['saul', 'king saul'] },
  { id: 'a-three-kings', kind: 'order', topic: 'timeline', tier: 1, prompt: 'Put the three kings of the united kingdom in order.', answer: 'Saul, David, Solomon', sequence: ['Saul', 'David', 'Solomon'] },
  { id: 'a-split-order', kind: 'order', topic: 'timeline', tier: 1, prompt: 'Put these four events in chronological order.', answer: 'Exodus → Conquest → United Kingdom → Exile', sequence: ['The Exodus from Egypt', 'Conquest of Canaan under Joshua', 'The united kingdom under David', 'Exile in Babylon'] },
  { id: 'a-two-falls', kind: 'mcq', topic: 'timeline', tier: 1, prompt: 'Which empire conquered the northern kingdom of Israel in 722 BC?', answer: 'Assyria', distractors: ['Babylon', 'Persia', 'Egypt'], explain: 'Assyria took the north in 722 BC; Babylon took Judah in 586 BC.' },
  { id: 'a-judah-fall', kind: 'mcq', topic: 'timeline', tier: 1, prompt: 'Which empire destroyed Jerusalem and the temple in 586 BC?', answer: 'Babylon', distractors: ['Assyria', 'Persia', 'Rome'], explain: 'Under Nebuchadnezzar. Rome destroyed the second temple much later, in AD 70.' },
  { id: 'a-north-south', kind: 'mcq', topic: 'places', tier: 1, prompt: 'After the kingdom split, what were the two kingdoms and their capitals?', answer: 'Israel (north, capital Samaria) and Judah (south, capital Jerusalem)', distractors: ['Israel (north, capital Jerusalem) and Judah (south, capital Samaria)', 'Judah (north, capital Bethel) and Israel (south, capital Jerusalem)', 'Israel (north, capital Dan) and Judah (south, capital Hebron)'], explain: 'Ten tribes went north with Jeroboam; Judah and Benjamin stayed south with Rehoboam.' },
  { id: 'a-christians-first', kind: 'type', topic: 'places', tier: 2, prompt: 'In what city were believers first called "Christians"?', answer: 'Antioch', accepts: ['antioch'], explain: 'Acts 11:26.' },
  { id: 'a-pentecost-count', kind: 'mcq', topic: 'events', tier: 2, prompt: 'About how many people were added to the church on the day of Pentecost?', answer: 'About 3,000', distractors: ['About 120', 'About 500', 'About 5,000'], explain: '120 were gathered before Pentecost; 3,000 were added that day; the number reached about 5,000 in Acts 4.' },
  { id: 'a-jesus-days', kind: 'mcq', topic: 'events', tier: 2, prompt: 'How long was Jesus tempted in the wilderness?', answer: '40 days and 40 nights', distractors: ['3 days', '7 days', '30 days'] },
  { id: 'a-flood-days', kind: 'mcq', topic: 'events', tier: 3, prompt: 'How long did the rain fall during the Flood?', answer: '40 days and 40 nights', distractors: ['7 days', '150 days', '1 year'], explain: 'The rain fell 40 days; the waters prevailed on the earth 150 days.' },
  { id: 'a-wandering-years', kind: 'type', topic: 'events', tier: 1, prompt: 'How many years did Israel wander in the wilderness?', answer: '40', accepts: ['forty', '40 years'], explain: 'One year for each day the spies explored the land (Numbers 14:34).' },
  { id: 'a-exile-years', kind: 'type', topic: 'events', tier: 2, prompt: 'How many years did Jeremiah say the Babylonian exile would last?', answer: '70', accepts: ['seventy', '70 years'] },
  { id: 'a-wall-days', kind: 'type', topic: 'events', tier: 2, prompt: 'In how many days did Nehemiah rebuild the wall of Jerusalem?', answer: '52', accepts: ['fifty-two', 'fifty two', '52 days'] },
  { id: 'a-goliath-killer', kind: 'type', topic: 'people', tier: 1, prompt: 'Who killed Goliath, and with what?', answer: 'David, with a sling and a stone', accepts: ['david', 'david sling stone'] },
  { id: 'a-oldest-man', kind: 'type', topic: 'people', tier: 3, prompt: 'Who is the oldest person recorded in the Bible?', answer: 'Methuselah', accepts: ['methuselah'], explain: 'He lived 969 years (Genesis 5:27).' },
  { id: 'a-wisest', kind: 'type', topic: 'people', tier: 1, prompt: 'Which king asked God for wisdom and became the wisest man?', answer: 'Solomon', accepts: ['solomon', 'king solomon'] },
  { id: 'a-fish-days', kind: 'type', topic: 'events', tier: 1, prompt: 'How long was Jonah inside the great fish?', answer: 'Three days and three nights', accepts: ['3 days', 'three days', '3 days and 3 nights'] },
  { id: 'a-first-martyr', kind: 'type', topic: 'people', tier: 1, prompt: 'Who was the first Christian martyr?', answer: 'Stephen', accepts: ['stephen'], explain: 'Stoned in Acts 7 while Saul (later Paul) looked on approvingly.' },
  { id: 'a-first-gentile', kind: 'type', topic: 'people', tier: 2, prompt: 'Who was the first Gentile convert in Acts?', answer: 'Cornelius', accepts: ['cornelius'], explain: 'A Roman centurion; Peter was sent to him after the vision of the sheet (Acts 10).' },

  // ---- Order questions
  { id: 'a-order-pentateuch', kind: 'order', topic: 'book-order', tier: 1, prompt: 'Put the books of the Pentateuch in order.', answer: 'Genesis, Exodus, Leviticus, Numbers, Deuteronomy', sequence: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'] },
  { id: 'a-order-gospels', kind: 'order', topic: 'book-order', tier: 1, prompt: 'Put the four Gospels in canonical order.', answer: 'Matthew, Mark, Luke, John', sequence: ['Matthew', 'Mark', 'Luke', 'John'] },
  { id: 'a-order-major', kind: 'order', topic: 'book-order', tier: 1, prompt: 'Put the Major Prophets in canonical order.', answer: 'Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel', sequence: ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel'] },
  { id: 'a-order-lastfive-ot', kind: 'order', topic: 'book-order', tier: 2, prompt: 'Put the last five books of the Old Testament in order.', answer: 'Zephaniah, Haggai, Zechariah, Malachi', sequence: ['Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'] },
  { id: 'a-order-nt-end', kind: 'order', topic: 'book-order', tier: 2, prompt: 'Put the last five books of the New Testament in order.', answer: '1 John, 2 John, 3 John, Jude, Revelation', sequence: ['1 John', '2 John', '3 John', 'Jude', 'Revelation'] },
];

/**
 * Explicit wrong options for "which of these is NOT part of X" questions.
 * Drawing these from other lists automatically produced at least one broken
 * question (Levi is a tribe AND the apostle Matthew's other name), so they are
 * authored instead — plausible, but unambiguously not on the list.
 */
export const LIST_DECOYS: Record<string, string[]> = {
  plagues: ['Earthquake', 'Fire from heaven', 'Plague of serpents', 'Drought'],
  commandments: ['You shall not gossip', 'You shall tithe a tenth', 'Love your enemies', 'You shall not drink wine'],
  tribes: ['Caleb', 'Aaron', 'Esau', 'Ishmael'],
  apostles: ['Barnabas', 'Stephen', 'Timothy', 'Nicodemus'],
  fruit: ['Wisdom', 'Courage', 'Humility', 'Diligence'],
  armor: ['Spear of judgment', 'Cloak of humility', 'Gloves of service', 'Banner of victory'],
  'seven-churches': ['Corinth', 'Colossae', 'Antioch', 'Galatia'],
  beatitudes: ['the wealthy', 'the wise', 'the strong', 'the learned'],
  'i-am': ['I am the cornerstone', 'I am the rock of ages', 'I am the living water', 'I am the lamb of God'],
  signs: ['Calming the storm', 'Healing the ten lepers', 'Cursing the fig tree', 'Feeding the four thousand'],
  'divisions-ot': ['Gospels (4 books)', 'Epistles (21 books)', 'Apocalyptic (1 book)', 'Proverbs (1 book)'],
  'divisions-nt': ['Law (5 books)', 'Minor Prophets (12 books)', 'Wisdom (5 books)', 'History (12 books)'],
  journeys: ['Fourth missionary journey', 'Mission to Spain', 'Council of Antioch', 'Voyage to Alexandria'],
};
