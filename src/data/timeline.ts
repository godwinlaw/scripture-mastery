/** Major eras of biblical history, in order. The spine everything else hangs on. */
export interface Era {
  id: string;
  name: string;
  span: string;
  /** Sort key for ordering drills. */
  seq: number;
  summary: string;
  books: string[];
  markers: string[];
}

export const ERAS: Era[] = [
  {
    id: 'creation', name: 'Creation & Early World', span: 'Beginning – c. 2100 BC', seq: 1,
    summary: 'Creation, the Fall, the Flood, and Babel, the world before Israel exists.',
    books: ['genesis'],
    markers: ['Creation', 'The Fall', 'Cain and Abel', 'The Flood', 'Tower of Babel'],
  },
  {
    id: 'patriarchs', name: 'The Patriarchs', span: 'c. 2100–1800 BC', seq: 2,
    summary: 'God calls Abraham and builds a family: Abraham, Isaac, Jacob, Joseph.',
    books: ['genesis', 'job'],
    markers: ['Call of Abraham', 'Covenant of circumcision', 'Binding of Isaac', 'Jacob renamed Israel', 'Joseph rules Egypt'],
  },
  {
    id: 'egypt-exodus', name: 'Egypt & the Exodus', span: 'c. 1800–1440 BC', seq: 3,
    summary: 'Israel multiplies in slavery; Moses leads them out and receives the Law at Sinai.',
    books: ['exodus', 'leviticus'],
    markers: ['Slavery in Egypt', 'Burning bush', 'Ten plagues', 'Passover', 'Red Sea crossing', 'Ten Commandments', 'Golden calf', 'Tabernacle built'],
  },
  {
    id: 'wilderness', name: 'Wilderness Wandering', span: 'c. 1440–1400 BC', seq: 4,
    summary: 'Forty years of wandering after the spies’ bad report; the first generation dies out.',
    books: ['numbers', 'deuteronomy'],
    markers: ['Twelve spies', 'Forty years of wandering', 'Korah’s rebellion', 'Bronze serpent', 'Death of Moses'],
  },
  {
    id: 'conquest', name: 'Conquest of Canaan', span: 'c. 1400–1375 BC', seq: 5,
    summary: 'Joshua leads Israel across the Jordan to take and divide the land.',
    books: ['joshua'],
    markers: ['Crossing the Jordan', 'Fall of Jericho', 'Achan’s sin', 'Sun stands still', 'Land divided among the tribes'],
  },
  {
    id: 'judges', name: 'The Judges', span: 'c. 1375–1050 BC', seq: 6,
    summary: 'A repeating cycle of apostasy, oppression, and rescue with no king in Israel.',
    books: ['judges', 'ruth'],
    markers: ['Deborah and Barak', 'Gideon’s 300', 'Samson and Delilah', 'Ruth and Boaz'],
  },
  {
    id: 'united-kingdom', name: 'The United Kingdom', span: 'c. 1050–931 BC', seq: 7,
    summary: 'Three kings rule all Israel: Saul, David, and Solomon. The temple is built.',
    books: ['1-samuel', '2-samuel', '1-kings', 'psalms', 'proverbs', 'ecclesiastes', 'song-of-solomon'],
    markers: ['Saul anointed', 'David kills Goliath', 'David captures Jerusalem', 'Davidic covenant', 'Solomon’s temple'],
  },
  {
    id: 'divided-kingdom', name: 'The Divided Kingdom', span: '931–722 BC', seq: 8,
    summary: 'The kingdom splits: Israel in the north, Judah in the south. Prophets confront both.',
    books: ['1-kings', '2-kings', 'hosea', 'joel', 'amos', 'jonah', 'micah', 'isaiah'],
    markers: ['Rehoboam and Jeroboam split the kingdom', 'Elijah on Mount Carmel', 'Elisha’s ministry', 'Jonah at Nineveh'],
  },
  {
    id: 'judah-alone', name: 'Judah Alone', span: '722–586 BC', seq: 9,
    summary: 'Assyria destroys the north; Judah survives another 136 years before Babylon takes it.',
    books: ['2-kings', '2-chronicles', 'isaiah', 'jeremiah', 'nahum', 'habakkuk', 'zephaniah'],
    markers: ['Fall of Samaria (722 BC)', 'Hezekiah delivered from Sennacherib', 'Josiah’s reforms', 'Fall of Jerusalem (586 BC)'],
  },
  {
    id: 'exile', name: 'The Babylonian Exile', span: '586–538 BC', seq: 10,
    summary: 'Judah lives in Babylon for seventy years; Ezekiel and Daniel prophesy there.',
    books: ['ezekiel', 'daniel', 'lamentations', 'obadiah'],
    markers: ['Temple destroyed', 'Daniel in Babylon', 'Fiery furnace', 'Lions’ den', 'Valley of dry bones'],
  },
  {
    id: 'return', name: 'The Return', span: '538–430 BC', seq: 11,
    summary: 'Cyrus lets the exiles go home; the temple and walls are rebuilt.',
    books: ['ezra', 'nehemiah', 'esther', 'haggai', 'zechariah', 'malachi'],
    markers: ['Decree of Cyrus (538 BC)', 'Second temple completed (516 BC)', 'Esther in Persia', 'Nehemiah’s wall (445 BC)'],
  },
  {
    id: 'silence', name: 'The Intertestamental Period', span: '430–5 BC', seq: 12,
    summary: 'Roughly 400 years with no canonical prophet, between Malachi and John the Baptist.',
    books: [],
    markers: ['Greek conquest', 'Maccabean revolt', 'Roman rule begins', 'Herod the Great'],
  },
  {
    id: 'jesus', name: 'The Life of Jesus', span: 'c. 5 BC – AD 30', seq: 13,
    summary: 'Birth, ministry, death, and resurrection of Jesus, recorded in four Gospels.',
    books: ['matthew', 'mark', 'luke', 'john'],
    markers: ['Birth in Bethlehem', 'Baptism by John', 'Sermon on the Mount', 'Transfiguration', 'Triumphal entry', 'Crucifixion', 'Resurrection'],
  },
  {
    id: 'church', name: 'The Early Church', span: 'AD 30–95', seq: 14,
    summary: 'Pentecost launches the church; Paul plants churches; letters shape them.',
    books: ['acts', 'romans', '1-corinthians', 'galatians', 'hebrews', 'james', '1-peter', 'revelation'],
    markers: ['Pentecost', 'Stephen martyred', 'Paul’s conversion', 'Jerusalem Council', 'Missionary journeys', 'Paul in Rome', 'John exiled to Patmos'],
  },
];

/** Individual dated events, for chronological ordering drills. */
export interface TimelineEvent {
  id: string;
  label: string;
  /** Approximate year; negative = BC. Used only for ordering, not for quizzing dates. */
  year: number;
  when: string;
  era: string;
  note?: string;
}

export const EVENTS: TimelineEvent[] = [
  { id: 'abraham-called', label: 'God calls Abram out of Ur', year: -2091, when: 'c. 2100 BC', era: 'patriarchs' },
  { id: 'joseph-egypt', label: 'Joseph sold into Egypt', year: -1898, when: 'c. 1900 BC', era: 'patriarchs' },
  { id: 'exodus-event', label: 'The Exodus from Egypt', year: -1446, when: 'c. 1446 BC', era: 'egypt-exodus' },
  { id: 'sinai', label: 'Law given at Mount Sinai', year: -1445, when: 'c. 1445 BC', era: 'egypt-exodus' },
  { id: 'jericho', label: 'The walls of Jericho fall', year: -1406, when: 'c. 1406 BC', era: 'conquest' },
  { id: 'judges-begin', label: 'The period of the judges begins', year: -1375, when: 'c. 1375 BC', era: 'judges' },
  { id: 'saul-king', label: 'Saul anointed as Israel’s first king', year: -1050, when: 'c. 1050 BC', era: 'united-kingdom' },
  { id: 'david-king', label: 'David becomes king', year: -1010, when: 'c. 1010 BC', era: 'united-kingdom' },
  { id: 'temple-built', label: 'Solomon’s temple completed', year: -959, when: 'c. 959 BC', era: 'united-kingdom' },
  { id: 'kingdom-split', label: 'The kingdom divides under Rehoboam', year: -931, when: '931 BC', era: 'divided-kingdom' },
  { id: 'carmel', label: 'Elijah versus the prophets of Baal on Carmel', year: -860, when: 'c. 860 BC', era: 'divided-kingdom' },
  { id: 'samaria-falls', label: 'Samaria falls; Israel exiled by Assyria', year: -722, when: '722 BC', era: 'divided-kingdom' },
  { id: 'josiah-reform', label: 'Josiah finds the Book of the Law', year: -622, when: '622 BC', era: 'judah-alone' },
  { id: 'jerusalem-falls', label: 'Jerusalem and the temple destroyed by Babylon', year: -586, when: '586 BC', era: 'judah-alone' },
  { id: 'cyrus-decree', label: 'Cyrus decrees the exiles may return', year: -538, when: '538 BC', era: 'return' },
  { id: 'second-temple', label: 'The second temple is completed', year: -516, when: '516 BC', era: 'return' },
  { id: 'esther-persia', label: 'Esther becomes queen of Persia', year: -479, when: 'c. 479 BC', era: 'return' },
  { id: 'nehemiah-wall', label: 'Nehemiah rebuilds Jerusalem’s wall', year: -445, when: '445 BC', era: 'return' },
  { id: 'malachi-last', label: 'Malachi prophesies, the last OT prophet', year: -430, when: 'c. 430 BC', era: 'return' },
  { id: 'jesus-born', label: 'Jesus is born in Bethlehem', year: -5, when: 'c. 5 BC', era: 'jesus' },
  { id: 'jesus-baptized', label: 'Jesus baptized; ministry begins', year: 27, when: 'c. AD 27', era: 'jesus' },
  { id: 'crucifixion', label: 'Crucifixion and resurrection', year: 30, when: 'c. AD 30', era: 'jesus' },
  { id: 'pentecost', label: 'Pentecost, the church begins', year: 30, when: 'c. AD 30', era: 'church' },
  { id: 'stephen', label: 'Stephen martyred', year: 34, when: 'c. AD 34', era: 'church' },
  { id: 'paul-converted', label: 'Saul converted on the Damascus road', year: 35, when: 'c. AD 35', era: 'church' },
  { id: 'jerusalem-council', label: 'The Jerusalem Council', year: 49, when: 'c. AD 49', era: 'church' },
  { id: 'paul-rome', label: 'Paul imprisoned in Rome', year: 60, when: 'c. AD 60', era: 'church' },
  { id: 'temple-destroyed-70', label: 'Rome destroys the second temple', year: 70, when: 'AD 70', era: 'church' },
  { id: 'patmos', label: 'John exiled to Patmos; Revelation written', year: 95, when: 'c. AD 95', era: 'church' },
];
