import type { Item, Topic } from './types';

/** Ordered lists worth knowing cold — these drive sequencing drills. */
export interface OrderedList {
  id: string;
  title: string;
  note: string;
  items: string[];
  /** True if the order itself is testable; false = membership only. */
  ordered: boolean;
  /**
   * Which strand these cards belong to. Defaults to `essentials` — every
   * standing list is a must-know list, and five of them are named outright in
   * the Basic Bible Literacy sheet the E strand is drawn from (#35). Before
   * that they were all hardcoded as `summaries`, which was never true of any
   * of them: the ten plagues are not a book summary.
   */
  topic?: Topic;
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
  // ---- Structure
  { id: 'a-silence', kind: 'mcq', topic: 'arc', tier: 2, prompt: 'About how many years passed between Malachi and the New Testament?', answer: 'About 400 years', distractors: ['About 100 years', 'About 700 years', 'About 40 years'], explain: 'Called the intertestamental period or the "400 silent years."' },

  // ---- Cross-book connections
  { id: 'a-no-god-named', kind: 'type', topic: 'oneline', tier: 2, prompt: 'Which book of the Bible never mentions God by name?', answer: 'Esther', accepts: ['esther'], explain: 'God is never named, yet His providence drives the entire plot.' },
  { id: 'a-joel-pentecost', kind: 'mcq', topic: 'arc', tier: 3, prompt: 'At Pentecost, Peter quoted which Old Testament prophet?', answer: 'Joel', distractors: ['Isaiah', 'Amos', 'Zechariah'], explain: 'Joel 2:28 — "I will pour out my Spirit on all flesh."' },
  { id: 'a-micah-bethlehem', kind: 'mcq', topic: 'arc', tier: 3, prompt: 'Which prophet foretold that the Messiah would be born in Bethlehem?', answer: 'Micah', distractors: ['Isaiah', 'Malachi', 'Hosea'], explain: 'Micah 5:2, quoted to Herod by the chief priests in Matthew 2.' },

  // ---- Events and people
  { id: 'a-first-king', kind: 'type', topic: 'names', tier: 1, prompt: 'Who was the first king of Israel?', answer: 'Saul', accepts: ['saul', 'king saul'] },
  { id: 'a-three-kings', kind: 'order', topic: 'arc', tier: 1, prompt: 'Put the three kings of the united kingdom in order.', answer: 'Saul, David, Solomon', sequence: ['Saul', 'David', 'Solomon'] },
  { id: 'a-split-order', kind: 'order', topic: 'arc', tier: 1, prompt: 'Put these four events in chronological order.', answer: 'Exodus → Conquest → United Kingdom → Exile', sequence: ['The Exodus from Egypt', 'Conquest of Canaan under Joshua', 'The united kingdom under David', 'Exile in Babylon'] },
  { id: 'a-two-falls', kind: 'mcq', topic: 'arc', tier: 1, prompt: 'Which empire conquered the northern kingdom of Israel in 722 BC?', answer: 'Assyria', distractors: ['Babylon', 'Persia', 'Egypt'], explain: 'Assyria took the north in 722 BC; Babylon took Judah in 586 BC.' },
  { id: 'a-judah-fall', kind: 'mcq', topic: 'arc', tier: 1, prompt: 'Which empire destroyed Jerusalem and the temple in 586 BC?', answer: 'Babylon', distractors: ['Assyria', 'Persia', 'Rome'], explain: 'Under Nebuchadnezzar. Rome destroyed the second temple much later, in AD 70.' },
  { id: 'a-north-south', kind: 'mcq', topic: 'cities', tier: 1, prompt: 'After the kingdom split, what were the two kingdoms and their capitals?', answer: 'Israel (north, capital Samaria) and Judah (south, capital Jerusalem)', distractors: ['Israel (north, capital Jerusalem) and Judah (south, capital Samaria)', 'Judah (north, capital Bethel) and Israel (south, capital Jerusalem)', 'Israel (north, capital Dan) and Judah (south, capital Hebron)'], explain: 'Ten tribes went north with Jeroboam; Judah and Benjamin stayed south with Rehoboam.' },
  { id: 'a-christians-first', kind: 'type', topic: 'cities', tier: 2, prompt: 'In what city were believers first called "Christians"?', answer: 'Antioch', accepts: ['antioch'], explain: 'Acts 11:26.' },
  { id: 'a-pentecost-count', kind: 'mcq', topic: 'arc', tier: 2, prompt: 'About how many people were added to the church on the day of Pentecost?', answer: 'About 3,000', distractors: ['About 120', 'About 500', 'About 5,000'], explain: '120 were gathered before Pentecost; 3,000 were added that day; the number reached about 5,000 in Acts 4.' },
  { id: 'a-jesus-days', kind: 'mcq', topic: 'arc', tier: 2, prompt: 'How long was Jesus tempted in the wilderness?', answer: '40 days and 40 nights', distractors: ['3 days', '7 days', '30 days'] },
  { id: 'a-flood-days', kind: 'mcq', topic: 'arc', tier: 3, prompt: 'How long did the rain fall during the Flood?', answer: '40 days and 40 nights', distractors: ['7 days', '150 days', '1 year'], explain: 'The rain fell 40 days; the waters prevailed on the earth 150 days.' },
  { id: 'a-wandering-years', kind: 'type', topic: 'arc', tier: 1, prompt: 'How many years did Israel wander in the wilderness?', answer: '40', accepts: ['forty', '40 years'], explain: 'One year for each day the spies explored the land (Numbers 14:34).' },
  { id: 'a-exile-years', kind: 'type', topic: 'arc', tier: 2, prompt: 'How many years did Jeremiah say the Babylonian exile would last?', answer: '70', accepts: ['seventy', '70 years'] },
  { id: 'a-wall-days', kind: 'type', topic: 'arc', tier: 2, prompt: 'In how many days did Nehemiah rebuild the wall of Jerusalem?', answer: '52', accepts: ['fifty-two', 'fifty two', '52 days'] },
  { id: 'a-goliath-killer', kind: 'type', topic: 'names', tier: 1, prompt: 'Who killed Goliath, and with what?', answer: 'David, with a sling and a stone', accepts: ['david', 'david sling stone'] },
  { id: 'a-oldest-man', kind: 'type', topic: 'names', tier: 3, prompt: 'Who is the oldest person recorded in the Bible?', answer: 'Methuselah', accepts: ['methuselah'], explain: 'He lived 969 years (Genesis 5:27).' },
  { id: 'a-wisest', kind: 'type', topic: 'names', tier: 1, prompt: 'Which king asked God for wisdom and became the wisest man?', answer: 'Solomon', accepts: ['solomon', 'king solomon'] },
  { id: 'a-fish-days', kind: 'type', topic: 'arc', tier: 1, prompt: 'How long was Jonah inside the great fish?', answer: 'Three days and three nights', accepts: ['3 days', 'three days', '3 days and 3 nights'] },
  { id: 'a-first-martyr', kind: 'type', topic: 'names', tier: 1, prompt: 'Who was the first Christian martyr?', answer: 'Stephen', accepts: ['stephen'], explain: 'Stoned in Acts 7 while Saul (later Paul) looked on approvingly.' },
  { id: 'a-first-gentile', kind: 'type', topic: 'names', tier: 2, prompt: 'Who was the first Gentile convert in Acts?', answer: 'Cornelius', accepts: ['cornelius'], explain: 'A Roman centurion; Peter was sent to him after the vision of the sheet (Acts 10).' },

  // ---- Historical context (#35). The must-know lists carry the pairs; these
  // are the questions a survey exam asks that a cue/content pair cannot put.
  { id: 'a-empire-at-birth', kind: 'mcq', topic: 'context', tier: 1, prompt: 'Which empire ruled Judea when Jesus was born?', answer: 'Rome', distractors: ['Greece', 'Persia', 'Babylon'], explain: 'Rome had held Judea since Pompey took Jerusalem in 63 BC, and governed it through the client king Herod the Great.' },
  { id: 'a-prefect-not-king', kind: 'mcq', topic: 'context', tier: 3, prompt: 'Why was Judea governed by a Roman prefect like Pilate rather than by a king?', answer: 'Rome deposed Herod’s son Archelaus in AD 6 and took Judea over directly', distractors: ['Herod the Great died leaving no sons to succeed him', 'The Sanhedrin petitioned Rome to abolish the monarchy', 'Judea had never had a king of its own under Roman rule'], explain: 'Herod’s kingdom was split between three sons. Archelaus ruled Judea so badly that Rome removed him after ten years and sent prefects instead — Pilate was the fifth.' },
  { id: 'a-herod-three-sons', kind: 'mcq', topic: 'context', tier: 3, prompt: 'Herod the Great’s kingdom was divided among which three of his sons?', answer: 'Archelaus, Antipas and Philip', distractors: ['Antipas, Philip and Agrippa', 'Archelaus, Aristobulus and Antipater', 'Agrippa I, Agrippa II and Antipas'], explain: 'Archelaus took Judea, Antipas Galilee and Perea, Philip the northeast. Herod had executed his abler sons, which is why these three were left.' },
  { id: 'a-nineveh-capital', kind: 'mcq', topic: 'context', tier: 2, prompt: 'Nineveh was the capital of which empire?', answer: 'Assyria', distractors: ['Babylon', 'Persia', 'Egypt'], explain: 'The city Jonah was sent to. It fell to Babylon and the Medes in 612 BC — the fall Nahum foretells.' },
  { id: 'a-septuagint', kind: 'mcq', topic: 'context', tier: 2, prompt: 'What is the Septuagint?', answer: 'The Greek translation of the Old Testament', distractors: ['The Aramaic paraphrase read aloud in synagogues', 'The Hebrew text preserved by the Masoretes', 'The Latin Bible translated by Jerome'], explain: 'Made at Alexandria from about 250 BC and abbreviated LXX. It is usually the version the New Testament writers quote.' },
  { id: 'a-sadducees-deny', kind: 'mcq', topic: 'context', tier: 2, prompt: 'What did the Sadducees deny that the Pharisees affirmed?', answer: 'The resurrection, angels and spirits', distractors: ['The authority of the Law of Moses', 'The oneness of God', 'The rebuilding of the temple'], explain: 'Acts 23:8. Paul splits the council in two by naming the resurrection as the charge against him.' },
  { id: 'a-dead-sea-scrolls', kind: 'mcq', topic: 'context', tier: 3, prompt: 'The Dead Sea Scrolls are usually connected with which group?', answer: 'The Essenes at Qumran', distractors: ['The Pharisees at Jerusalem', 'The Zealots at Masada', 'The Samaritans at Mount Gerizim'], explain: 'Found from 1947 in caves near the Dead Sea; they include a copy of Isaiah a thousand years older than any then known.' },

  // ---- Rituals and festivals (#35)
  { id: 'a-atonement-goats', kind: 'mcq', topic: 'rituals', tier: 1, prompt: 'On the Day of Atonement, what happened to the two goats?', answer: 'One was sacrificed; the other was sent alive into the wilderness', distractors: ['Both were sacrificed, one for the priests and one for the people', 'One was sacrificed; the other was given to the Levites', 'Both were released, one at the tabernacle and one outside the camp'], explain: 'Leviticus 16. Lots were cast over them: one lot for the LORD, one for Azazel.' },
  { id: 'a-azazel', kind: 'type', topic: 'rituals', tier: 2, prompt: 'What is the goat driven out on the Day of Atonement called?', answer: 'Azazel — the scapegoat', accepts: ['azazel', 'scapegoat', 'the scapegoat', 'azazel scapegoat'], explain: 'It carried the people’s sins away into a land cut off (Leviticus 16:21–22).' },
  { id: 'a-feast-count', kind: 'type', topic: 'rituals', tier: 2, prompt: 'How many appointed feasts does Leviticus 23 set out?', answer: '7', accepts: ['seven'], explain: 'Passover, Unleavened Bread, Firstfruits, Weeks, Trumpets, the Day of Atonement and Booths. The weekly Sabbath heads the chapter but is not counted among them.' },
  { id: 'a-pentecost-name', kind: 'mcq', topic: 'rituals', tier: 2, prompt: 'Why is the Feast of Weeks also called Pentecost?', answer: 'It falls fifty days after Firstfruits, and pentekostos is Greek for fiftieth', distractors: ['Fifty lambs were offered on the altar', 'The feast itself lasted fifty days', 'Fifty elders led the procession into the temple'], explain: 'Which is why the Spirit comes fifty days after the resurrection, at the wheat harvest (Acts 2).' },
  { id: 'a-dedication-feast', kind: 'mcq', topic: 'rituals', tier: 3, prompt: 'Which feast is not commanded in the Law of Moses, yet Jesus is at the temple for it?', answer: 'The Feast of Dedication', distractors: ['The Feast of Booths', 'The Day of Atonement', 'The Feast of Weeks'], explain: 'John 10:22 — Hanukkah, kept for the rededication of the temple after Antiochus IV defiled it in 167 BC.' },
  { id: 'a-jubilee-how-often', kind: 'mcq', topic: 'rituals', tier: 2, prompt: 'How often does the Year of Jubilee fall?', answer: 'Every fiftieth year', distractors: ['Every seventh year', 'Every fortieth year', 'Every hundredth year'], explain: 'Leviticus 25 — after seven sabbath years. Land goes back to the family that held it and slaves go free.' },
  { id: 'a-nazirite-vow', kind: 'mcq', topic: 'rituals', tier: 2, prompt: 'What three things did the Nazirite vow forbid?', answer: 'Wine, cutting the hair, and touching a dead body', distractors: ['Wine, meat, and marriage', 'Leaven, wine, and travel', 'Cutting the hair, wearing linen, and entering the temple'], explain: 'Numbers 6. Samson, Samuel and John the Baptist were held to it for life rather than for a season.' },
  { id: 'a-passover-lamb', kind: 'mcq', topic: 'rituals', tier: 1, prompt: 'What did the blood of the Passover lamb mark?', answer: 'The doorposts and lintel of every Israelite house', distractors: ['The horns of the altar', 'The threshold of the tabernacle', 'The forehead of the firstborn son'], explain: 'Exodus 12. The destroyer passed over the houses that carried the mark.' },

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
  journeys: ['Fourth missionary journey', 'Mission to Spain', 'Council of Antioch', 'Voyage to Alexandria'],
};
