import type { Book, Division, Testament } from './types';

/**
 * All 66 books, structured so questions can be generated rather than hand-written.
 * Authors follow the traditional attribution a survey quiz expects; `authorNote`
 * carries the scholarly nuance where the two diverge.
 */
export const BOOKS: Book[] = [
  // ---------------------------------------------------------------- LAW (5)
  {
    id: 'genesis', name: 'Genesis', abbr: 'Gen', order: 1, testament: 'OT', division: 'Law',
    author: 'Moses', chapters: 50, era: 'Creation – c. 1800 BC',
    oneLine: 'God creates the world, humanity falls, and God begins His rescue plan through one family.',
    theme: 'Beginnings, of creation, sin, nations, and covenant.',
    keyPeople: ['Adam', 'Eve', 'Noah', 'Abraham', 'Sarah', 'Isaac', 'Jacob', 'Joseph'],
    keyEvents: ['Creation', 'The Fall', 'Cain kills Abel', 'The Flood', 'Tower of Babel', 'Abrahamic covenant', 'Binding of Isaac', 'Jacob wrestles God', 'Joseph sold into Egypt'],
    keyChapters: [
      { ch: '1-2', what: 'Creation in six days; God rests on the seventh' },
      { ch: '3', what: 'The Fall, the serpent, the fruit, and the curse' },
      { ch: '6-9', what: 'The Flood and God’s covenant with Noah (the rainbow)' },
      { ch: '11', what: 'The Tower of Babel and the scattering of languages' },
      { ch: '12', what: 'God calls Abram and promises to bless all nations through him' },
      { ch: '22', what: 'Abraham told to sacrifice Isaac; God provides a ram' },
      { ch: '37', what: 'Joseph’s coat and his brothers selling him into slavery' },
      { ch: '50', what: '"You meant evil against me, but God meant it for good"' },
    ],
    keyVerse: { ref: 'Genesis 1:1', text: 'In the beginning, God created the heavens and the earth.' },
    hook: 'Genesis = "genes" = origins. Four events (Creation, Fall, Flood, Babel), then four people (Abraham, Isaac, Jacob, Joseph).',
  },
  {
    id: 'exodus', name: 'Exodus', abbr: 'Ex', order: 2, testament: 'OT', division: 'Law',
    author: 'Moses', chapters: 40, era: 'c. 1500–1440 BC',
    oneLine: 'God rescues Israel from slavery in Egypt and binds them to Himself by covenant at Sinai.',
    theme: 'Redemption, God delivers a people to dwell among them.',
    keyPeople: ['Moses', 'Aaron', 'Pharaoh', 'Miriam', 'Jethro', 'Joshua', 'Bezalel'],
    keyEvents: ['Burning bush', 'Ten plagues', 'First Passover', 'Crossing the Red Sea', 'Manna and quail', 'Ten Commandments at Sinai', 'Golden calf', 'Building the tabernacle'],
    keyChapters: [
      { ch: '3', what: 'The burning bush; God reveals His name "I AM"' },
      { ch: '7-11', what: 'The ten plagues on Egypt' },
      { ch: '12', what: 'The first Passover and the death of the firstborn' },
      { ch: '14', what: 'Crossing the Red Sea on dry ground' },
      { ch: '20', what: 'The Ten Commandments given at Mount Sinai' },
      { ch: '32', what: 'The golden calf while Moses is on the mountain' },
      { ch: '40', what: 'The tabernacle completed; God’s glory fills it' },
    ],
    keyVerse: { ref: 'Exodus 20:2', text: 'I am the LORD your God, who brought you out of the land of Egypt, out of the house of slavery.' },
    hook: 'Exodus = "exit." Out of Egypt (1–18), then up to Sinai (19–40).',
  },
  {
    id: 'leviticus', name: 'Leviticus', abbr: 'Lev', order: 3, testament: 'OT', division: 'Law',
    author: 'Moses', chapters: 27, era: 'c. 1440 BC',
    oneLine: 'God gives Israel the sacrificial and purity laws that let a sinful people live near a holy God.',
    theme: 'Holiness, "Be holy, for I am holy."',
    keyPeople: ['Moses', 'Aaron', 'Nadab', 'Abihu', 'Eleazar', 'Ithamar'],
    keyEvents: ['The five offerings', 'Ordination of Aaron’s priesthood', 'Nadab and Abihu struck down', 'Day of Atonement instituted', 'The feasts and the Jubilee'],
    keyChapters: [
      { ch: '1-7', what: 'The five offerings: burnt, grain, peace, sin, guilt' },
      { ch: '10', what: 'Nadab and Abihu offer unauthorized fire and die' },
      { ch: '16', what: 'The Day of Atonement and the scapegoat' },
      { ch: '19', what: '"Love your neighbor as yourself"' },
      { ch: '23', what: 'The appointed feasts of Israel' },
      { ch: '25', what: 'Sabbath year and the Year of Jubilee' },
    ],
    keyVerse: { ref: 'Leviticus 19:2', text: 'You shall be holy, for I the LORD your God am holy.' },
    hook: 'Leviticus = the Levites’ handbook. Chapter 16 (Atonement) is the hinge of the book.',
  },
  {
    id: 'numbers', name: 'Numbers', abbr: 'Num', order: 4, testament: 'OT', division: 'Law',
    author: 'Moses', chapters: 36, era: 'c. 1440–1400 BC',
    oneLine: 'Israel refuses to trust God at the border of Canaan and wanders forty years until that generation dies.',
    theme: 'Unbelief and wandering, the cost of not trusting God.',
    keyPeople: ['Moses', 'Aaron', 'Miriam', 'Joshua', 'Caleb', 'Korah', 'Balaam', 'Balak', 'Phinehas'],
    keyEvents: ['Two censuses', 'The twelve spies', 'Forty years of wandering', 'Korah’s rebellion', 'Water from the rock at Meribah', 'The bronze serpent', 'Balaam’s donkey speaks'],
    keyChapters: [
      { ch: '1', what: 'The first census of Israel’s fighting men' },
      { ch: '13-14', what: 'The twelve spies; only Joshua and Caleb give a good report' },
      { ch: '16', what: 'Korah’s rebellion; the ground swallows the rebels' },
      { ch: '20', what: 'Moses strikes the rock instead of speaking to it' },
      { ch: '21', what: 'The bronze serpent lifted up to heal snakebite' },
      { ch: '22-24', what: 'Balaam, his talking donkey, and his blessings on Israel' },
      { ch: '26', what: 'The second census of the new generation' },
    ],
    keyVerse: { ref: 'Numbers 6:24', text: 'The LORD bless you and keep you.' },
    hook: 'Numbers is named for its two censuses, one for the generation that dies, one for the generation that enters.',
  },
  {
    id: 'deuteronomy', name: 'Deuteronomy', abbr: 'Deut', order: 5, testament: 'OT', division: 'Law',
    author: 'Moses', chapters: 34, era: 'c. 1400 BC',
    oneLine: 'On the edge of the Promised Land, Moses restates the law and calls the new generation to choose life.',
    theme: 'Covenant renewal, remember, obey, and live.',
    keyPeople: ['Moses', 'Joshua'],
    keyEvents: ['Restating the Ten Commandments', 'The Shema', 'Blessings and curses on Ebal and Gerizim', 'Joshua commissioned', 'Death of Moses on Mount Nebo'],
    keyChapters: [
      { ch: '5', what: 'The Ten Commandments restated for the new generation' },
      { ch: '6', what: 'The Shema, "Hear, O Israel: the LORD our God, the LORD is one"' },
      { ch: '28', what: 'Blessings for obedience and curses for disobedience' },
      { ch: '30', what: '"Choose life", the covenant decision set before Israel' },
      { ch: '34', what: 'Moses views Canaan from Mount Nebo and dies' },
    ],
    keyVerse: { ref: 'Deuteronomy 6:4-5', text: 'Hear, O Israel: The LORD our God, the LORD is one. You shall love the LORD your God with all your heart and with all your soul and with all your might.' },
    hook: 'Deutero-nomy = "second law." Moses’ farewell sermons; he dies in the last chapter without entering.',
  },

  // ------------------------------------------------------------ HISTORY (12)
  {
    id: 'joshua', name: 'Joshua', abbr: 'Josh', order: 6, testament: 'OT', division: 'History',
    author: 'Joshua', authorNote: 'Traditionally Joshua, with the account of his death added later.',
    chapters: 24, era: 'c. 1400–1375 BC',
    oneLine: 'Israel crosses the Jordan, conquers Canaan, and divides the land among the twelve tribes.',
    theme: 'Possession, God keeps His land promise.',
    keyPeople: ['Joshua', 'Rahab', 'Achan', 'Caleb', 'Eleazar'],
    keyEvents: ['Crossing the Jordan', 'Fall of Jericho', 'Achan’s sin and defeat at Ai', 'Gibeonite deception', 'Sun stands still', 'Land divided by lot', 'Joshua’s farewell at Shechem'],
    keyChapters: [
      { ch: '1', what: '"Be strong and courageous", Joshua commissioned' },
      { ch: '2', what: 'Rahab hides the spies in Jericho' },
      { ch: '3-4', what: 'Crossing the Jordan; twelve memorial stones' },
      { ch: '6', what: 'The walls of Jericho fall after seven days of marching' },
      { ch: '7', what: 'Achan’s hidden plunder causes defeat at Ai' },
      { ch: '10', what: 'The sun stands still over Gibeon' },
      { ch: '24', what: '"As for me and my house, we will serve the LORD"' },
    ],
    keyVerse: { ref: 'Joshua 24:15', text: 'As for me and my house, we will serve the LORD.' },
    hook: 'Joshua = conquest (1–12) then allotment (13–24).',
  },
  {
    id: 'judges', name: 'Judges', abbr: 'Judg', order: 7, testament: 'OT', division: 'History',
    author: 'Samuel', authorNote: 'Traditionally Samuel; the text itself is anonymous.',
    chapters: 21, era: 'c. 1375–1050 BC',
    oneLine: 'Israel repeats a downward cycle of sin, oppression, crying out, and rescue by a judge.',
    theme: 'The cycle, "everyone did what was right in his own eyes."',
    keyPeople: ['Othniel', 'Ehud', 'Deborah', 'Barak', 'Gideon', 'Jephthah', 'Samson', 'Delilah', 'Jael'],
    keyEvents: ['The recurring sin cycle', 'Ehud kills Eglon', 'Deborah and Barak defeat Sisera', 'Gideon’s fleece and 300 men', 'Jephthah’s vow', 'Samson and Delilah'],
    keyChapters: [
      { ch: '2', what: 'The cycle of the judges laid out as a pattern' },
      { ch: '4-5', what: 'Deborah and Barak defeat Sisera; Jael drives the tent peg' },
      { ch: '6-8', what: 'Gideon’s fleece and his army cut to 300 men' },
      { ch: '11', what: 'Jephthah’s rash vow' },
      { ch: '13-16', what: 'Samson: his strength, Delilah, and the temple of Dagon' },
      { ch: '21', what: '"Everyone did what was right in his own eyes"' },
    ],
    keyVerse: { ref: 'Judges 21:25', text: 'In those days there was no king in Israel. Everyone did what was right in his own eyes.' },
    hook: 'The cycle: Sin → Servitude → Supplication → Salvation → Silence → repeat.',
  },
  {
    id: 'ruth', name: 'Ruth', abbr: 'Ruth', order: 8, testament: 'OT', division: 'History',
    author: 'Samuel', authorNote: 'Traditionally Samuel; formally anonymous.',
    chapters: 4, era: 'c. 1100 BC (during the judges)',
    oneLine: 'A Moabite widow’s loyalty leads to redemption and places her in the family line of King David.',
    theme: 'Loyal love (hesed) and redemption in an ordinary life.',
    keyPeople: ['Ruth', 'Naomi', 'Boaz', 'Orpah', 'Obed', 'Elimelech'],
    keyEvents: ['Famine drives Naomi to Moab', 'Ruth’s pledge to Naomi', 'Gleaning in Boaz’s field', 'The threshing floor', 'Boaz redeems Ruth', 'Obed born, grandfather of David'],
    keyChapters: [
      { ch: '1', what: '"Where you go I will go", Ruth clings to Naomi' },
      { ch: '2', what: 'Ruth gleans in the field of Boaz' },
      { ch: '3', what: 'Ruth at the threshing floor asks Boaz to redeem her' },
      { ch: '4', what: 'Boaz redeems; Obed is born, father of Jesse, father of David' },
    ],
    keyVerse: { ref: 'Ruth 1:16', text: 'Where you go I will go, and where you lodge I will lodge. Your people shall be my people, and your God my God.' },
    hook: 'Set "in the days when the judges ruled", a bright story inside a dark book. Ends with David’s genealogy.',
  },
  {
    id: '1-samuel', name: '1 Samuel', abbr: '1 Sam', order: 9, testament: 'OT', division: 'History',
    author: 'Samuel, Nathan, and Gad', authorNote: 'Compiled; 1 Chronicles 29:29 names these three as sources.',
    chapters: 31, era: 'c. 1100–1010 BC',
    oneLine: 'Israel demands a king, gets Saul, and watches him fail while God quietly anoints David.',
    theme: 'Kingship, God’s choice versus the people’s choice.',
    keyPeople: ['Samuel', 'Hannah', 'Eli', 'Saul', 'David', 'Jonathan', 'Goliath', 'Witch of Endor'],
    keyEvents: ['Hannah’s prayer and Samuel’s birth', 'God calls the boy Samuel', 'Ark captured by the Philistines', 'Saul anointed king', 'David anointed', 'David kills Goliath', 'Saul pursues David', 'Saul consults the medium at Endor and dies at Gilboa'],
    keyChapters: [
      { ch: '1-2', what: 'Hannah’s prayer for a son and her song of praise' },
      { ch: '3', what: '"Speak, LORD, for your servant hears", God calls Samuel' },
      { ch: '8', what: 'Israel demands a king "like all the nations"' },
      { ch: '10', what: 'Saul anointed as Israel’s first king' },
      { ch: '16', what: 'Samuel anoints David, "man looks on the outward appearance"' },
      { ch: '17', what: 'David kills Goliath with a sling and a stone' },
      { ch: '28', what: 'Saul consults the medium at Endor' },
      { ch: '31', what: 'Saul and Jonathan die at Mount Gilboa' },
    ],
    keyVerse: { ref: '1 Samuel 16:7', text: 'Man looks on the outward appearance, but the LORD looks on the heart.' },
    hook: 'Three lives, overlapping: Samuel → Saul → David.',
  },
  {
    id: '2-samuel', name: '2 Samuel', abbr: '2 Sam', order: 10, testament: 'OT', division: 'History',
    author: 'Nathan and Gad', authorNote: 'Compiled from prophetic records; Samuel has died by this book.',
    chapters: 24, era: 'c. 1010–970 BC',
    oneLine: 'David reigns over a united Israel, sins with Bathsheba, and lives with the consequences.',
    theme: 'The Davidic covenant, an everlasting throne, and a king who still falls.',
    keyPeople: ['David', 'Bathsheba', 'Uriah', 'Nathan', 'Absalom', 'Joab', 'Mephibosheth', 'Solomon'],
    keyEvents: ['David crowned over all Israel', 'Jerusalem captured', 'Ark brought to Jerusalem; Uzzah struck down', 'Davidic covenant', 'Adultery with Bathsheba and murder of Uriah', 'Nathan’s rebuke', 'Absalom’s revolt', 'David’s census and the plague'],
    keyChapters: [
      { ch: '5', what: 'David made king over all Israel; captures Jerusalem' },
      { ch: '6', what: 'The ark brought to Jerusalem; Uzzah struck down; David dances' },
      { ch: '7', what: 'The Davidic covenant, God promises David an eternal throne' },
      { ch: '11', what: 'David and Bathsheba; Uriah sent to die' },
      { ch: '12', what: 'Nathan’s parable, "You are the man!"' },
      { ch: '15-18', what: 'Absalom’s rebellion and death in the oak tree' },
      { ch: '24', what: 'David’s census brings a plague; he buys the threshing floor' },
    ],
    keyVerse: { ref: '2 Samuel 7:16', text: 'Your throne shall be established forever.' },
    hook: 'Chapters 1–10 David rises; 11 is the turn; 12–24 the fallout.',
  },
  {
    id: '1-kings', name: '1 Kings', abbr: '1 Kgs', order: 11, testament: 'OT', division: 'History',
    author: 'Jeremiah', authorNote: 'Traditionally Jeremiah; the book is anonymous.',
    chapters: 22, era: 'c. 970–850 BC',
    oneLine: 'Solomon builds the temple in glory, then the kingdom splits in two and slides toward idolatry.',
    theme: 'Division, wisdom squandered, a kingdom torn.',
    keyPeople: ['Solomon', 'Rehoboam', 'Jeroboam', 'Ahab', 'Jezebel', 'Elijah', 'Queen of Sheba'],
    keyEvents: ['Solomon asks for wisdom', 'The temple built and dedicated', 'Queen of Sheba visits', 'Kingdom splits under Rehoboam', 'Jeroboam’s golden calves', 'Elijah and the ravens', 'Contest on Mount Carmel', 'Still small voice at Horeb'],
    keyChapters: [
      { ch: '3', what: 'Solomon asks for wisdom; judges between two mothers' },
      { ch: '6-8', what: 'The temple is built and dedicated' },
      { ch: '11', what: 'Solomon’s foreign wives turn his heart away' },
      { ch: '12', what: 'Rehoboam’s harshness splits the kingdom; Jeroboam leads the north' },
      { ch: '17', what: 'Elijah fed by ravens; the widow of Zarephath' },
      { ch: '18', what: 'Elijah versus the prophets of Baal on Mount Carmel' },
      { ch: '19', what: 'Elijah at Horeb hears the low whisper' },
    ],
    keyVerse: { ref: '1 Kings 18:21', text: 'How long will you go limping between two different opinions?' },
    hook: 'One kingdom (1–11) becomes two (12–22). North = Israel, capital Samaria. South = Judah, capital Jerusalem.',
  },
  {
    id: '2-kings', name: '2 Kings', abbr: '2 Kgs', order: 12, testament: 'OT', division: 'History',
    author: 'Jeremiah', authorNote: 'Traditionally Jeremiah; the book is anonymous.',
    chapters: 25, era: 'c. 850–586 BC',
    oneLine: 'Both kingdoms persist in idolatry until Israel falls to Assyria and Judah falls to Babylon.',
    theme: 'Exile, the covenant curses arrive.',
    keyPeople: ['Elisha', 'Elijah', 'Naaman', 'Jehu', 'Hezekiah', 'Josiah', 'Sennacherib', 'Nebuchadnezzar'],
    keyEvents: ['Elijah taken up in a whirlwind', 'Elisha’s double portion and miracles', 'Naaman healed of leprosy', 'Jehu’s purge', 'Samaria falls to Assyria (722 BC)', 'Hezekiah’s deliverance', 'Josiah finds the Book of the Law', 'Jerusalem falls to Babylon (586 BC)'],
    keyChapters: [
      { ch: '2', what: 'Elijah taken up in a whirlwind; Elisha receives a double portion' },
      { ch: '5', what: 'Naaman the Syrian healed by washing seven times in the Jordan' },
      { ch: '17', what: 'Samaria falls; the northern kingdom exiled by Assyria' },
      { ch: '18-19', what: 'Sennacherib besieges Jerusalem; Hezekiah prays and is delivered' },
      { ch: '22-23', what: 'Josiah finds the Book of the Law and reforms Judah' },
      { ch: '25', what: 'Jerusalem and the temple destroyed by Babylon' },
    ],
    keyVerse: { ref: '2 Kings 17:23', text: 'The LORD removed Israel out of his sight, as he had spoken by all his servants the prophets.' },
    hook: 'Two falls to memorize: Israel to Assyria 722 BC, Judah to Babylon 586 BC.',
  },
  {
    id: '1-chronicles', name: '1 Chronicles', abbr: '1 Chr', order: 13, testament: 'OT', division: 'History',
    author: 'Ezra', authorNote: 'Traditionally Ezra; the book is anonymous.',
    chapters: 29, era: 'Written c. 450–425 BC about c. 1010–970 BC',
    oneLine: 'Israel’s story retold from Adam to David for the returning exiles, centered on temple worship.',
    theme: 'Continuity, you are still God’s people, and worship is your center.',
    keyPeople: ['Adam', 'David', 'Solomon', 'Jabez'],
    keyEvents: ['Genealogies from Adam onward', 'David made king', 'Ark brought to Jerusalem', 'Davidic covenant', 'Preparations for the temple'],
    keyChapters: [
      { ch: '1-9', what: 'Genealogies from Adam through the returned exiles' },
      { ch: '11', what: 'David made king over all Israel; his mighty men' },
      { ch: '17', what: 'The Davidic covenant restated' },
      { ch: '22', what: 'David prepares materials for the temple Solomon will build' },
      { ch: '29', what: 'David’s final prayer and Solomon’s accession' },
    ],
    hook: 'Chronicles retells Samuel–Kings from the priestly angle: David’s sins are omitted, the temple is foregrounded.',
  },
  {
    id: '2-chronicles', name: '2 Chronicles', abbr: '2 Chr', order: 14, testament: 'OT', division: 'History',
    author: 'Ezra', authorNote: 'Traditionally Ezra; the book is anonymous.',
    chapters: 36, era: 'Written c. 450–425 BC about c. 970–538 BC',
    oneLine: 'From Solomon’s temple to its destruction, judged by whether each king of Judah sought the LORD.',
    theme: 'The temple and reform, revival is always possible.',
    keyPeople: ['Solomon', 'Rehoboam', 'Jehoshaphat', 'Hezekiah', 'Manasseh', 'Josiah', 'Cyrus'],
    keyEvents: ['Temple built and dedicated', 'Queen of Sheba visits', 'Kingdom divides', 'Hezekiah’s and Josiah’s reforms', 'Fall of Jerusalem', 'Decree of Cyrus'],
    keyChapters: [
      { ch: '5-7', what: 'The temple dedicated; "If my people who are called by my name humble themselves"' },
      { ch: '20', what: 'Jehoshaphat sends singers ahead of the army' },
      { ch: '29-31', what: 'Hezekiah cleanses the temple and restores Passover' },
      { ch: '34-35', what: 'Josiah’s reforms and the great Passover' },
      { ch: '36', what: 'Jerusalem falls; the book ends with Cyrus’s decree to return' },
    ],
    keyVerse: { ref: '2 Chronicles 7:14', text: 'If my people who are called by my name humble themselves, and pray and seek my face and turn from their wicked ways, then I will hear from heaven.' },
    hook: 'Ends mid-hope: the last verses of the Hebrew Bible order point home from exile.',
  },
  {
    id: 'ezra', name: 'Ezra', abbr: 'Ezra', order: 15, testament: 'OT', division: 'History',
    author: 'Ezra', chapters: 10, era: 'c. 538–457 BC',
    oneLine: 'Exiles return from Babylon, rebuild the temple, and Ezra calls the people back to the Law.',
    theme: 'Return and restoration of worship.',
    keyPeople: ['Ezra', 'Zerubbabel', 'Jeshua', 'Cyrus', 'Darius', 'Artaxerxes', 'Haggai', 'Zechariah'],
    keyEvents: ['Decree of Cyrus (538 BC)', 'First return under Zerubbabel', 'Altar and foundation laid', 'Opposition halts the work', 'Temple completed (516 BC)', 'Ezra’s return and reform of mixed marriages'],
    keyChapters: [
      { ch: '1', what: 'Cyrus decrees that the exiles may return and rebuild' },
      { ch: '3', what: 'The temple foundation laid, weeping mixed with shouting' },
      { ch: '4', what: 'Opposition stops construction' },
      { ch: '6', what: 'The second temple is completed and dedicated' },
      { ch: '7', what: 'Ezra the scribe comes to teach the Law' },
      { ch: '9-10', what: 'Ezra’s prayer of confession over intermarriage' },
    ],
    hook: 'Ezra rebuilds the temple (the worship). Nehemiah rebuilds the wall (the city). Same era.',
  },
  {
    id: 'nehemiah', name: 'Nehemiah', abbr: 'Neh', order: 16, testament: 'OT', division: 'History',
    author: 'Nehemiah', chapters: 13, era: 'c. 445–425 BC',
    oneLine: 'Nehemiah leaves the Persian court to rebuild Jerusalem’s wall in fifty-two days despite opposition.',
    theme: 'Rebuilding, prayer plus planning plus perseverance.',
    keyPeople: ['Nehemiah', 'Ezra', 'Sanballat', 'Tobiah', 'Artaxerxes'],
    keyEvents: ['Nehemiah hears of the broken wall and prays', 'Night inspection of the ruins', 'Wall rebuilt in 52 days', 'Opposition and threats', 'Ezra reads the Law aloud', 'Covenant renewal'],
    keyChapters: [
      { ch: '1', what: 'Nehemiah hears of Jerusalem’s ruin and prays' },
      { ch: '2', what: 'Artaxerxes sends him; he inspects the wall by night' },
      { ch: '4', what: 'Building with a tool in one hand and a weapon in the other' },
      { ch: '6', what: 'The wall finished in fifty-two days' },
      { ch: '8', what: 'Ezra reads the Law; the people weep, then rejoice' },
      { ch: '9', what: 'A long national confession retelling Israel’s history' },
    ],
    keyVerse: { ref: 'Nehemiah 6:15', text: 'So the wall was finished... in fifty-two days.' },
    hook: 'Fifty-two days for the wall. Nehemiah was the king’s cupbearer.',
  },
  {
    id: 'esther', name: 'Esther', abbr: 'Esth', order: 17, testament: 'OT', division: 'History',
    author: 'Unknown', authorNote: 'Anonymous; sometimes attributed to Mordecai.',
    chapters: 10, era: 'c. 483–473 BC',
    oneLine: 'A Jewish queen in Persia risks her life to stop a plot to exterminate her people.',
    theme: 'Providence, God is never named, yet He is everywhere in the plot.',
    keyPeople: ['Esther', 'Mordecai', 'Haman', 'King Ahasuerus (Xerxes)', 'Vashti'],
    keyEvents: ['Vashti deposed', 'Esther becomes queen', 'Mordecai uncovers a plot', 'Haman’s decree and the casting of lots (Pur)', '"For such a time as this"', 'Haman hanged on his own gallows', 'Feast of Purim established'],
    keyChapters: [
      { ch: '2', what: 'Esther becomes queen; Mordecai foils an assassination plot' },
      { ch: '3', what: 'Haman casts lots and plots genocide against the Jews' },
      { ch: '4', what: '"Who knows whether you have not come to the kingdom for such a time as this?"' },
      { ch: '6', what: 'The king’s sleepless night; Haman forced to honor Mordecai' },
      { ch: '7', what: 'Haman hanged on the gallows he built for Mordecai' },
      { ch: '9', what: 'The Jews defend themselves; the Feast of Purim established' },
    ],
    keyVerse: { ref: 'Esther 4:14', text: 'And who knows whether you have not come to the kingdom for such a time as this?' },
    hook: 'God is not mentioned once in Esther. Purim = "lots," the dice Haman cast.',
  },

  // ------------------------------------------------------------- WISDOM (5)
  {
    id: 'job', name: 'Job', abbr: 'Job', order: 18, testament: 'OT', division: 'Wisdom',
    author: 'Unknown', authorNote: 'Anonymous; possibly the oldest book in the Bible by setting.',
    chapters: 42, era: 'Possibly patriarchal era, c. 2000–1800 BC',
    oneLine: 'A righteous man loses everything, argues with his friends about why, and meets God instead of an answer.',
    theme: 'Undeserved suffering and the sovereignty of God.',
    keyPeople: ['Job', 'Satan', 'Eliphaz', 'Bildad', 'Zophar', 'Elihu'],
    keyEvents: ['Satan permitted to test Job', 'Loss of children, wealth, and health', 'Three friends’ speeches', 'Elihu’s rebuke', 'God speaks from the whirlwind', 'Job restored double'],
    keyChapters: [
      { ch: '1-2', what: 'The heavenly wager; Job loses everything but does not curse God' },
      { ch: '3', what: 'Job curses the day of his birth' },
      { ch: '19', what: '"I know that my Redeemer lives"' },
      { ch: '38-41', what: 'God answers from the whirlwind with questions, not explanations' },
      { ch: '42', what: 'Job repents; God restores him twofold' },
    ],
    keyVerse: { ref: 'Job 19:25', text: 'For I know that my Redeemer lives, and at the last he will stand upon the earth.' },
    hook: 'Three friends give bad comfort, Elihu speaks fourth, and God never explains why.',
  },
  {
    id: 'psalms', name: 'Psalms', abbr: 'Ps', order: 19, testament: 'OT', division: 'Wisdom',
    author: 'David and others', authorNote: 'David wrote about half; also Asaph, sons of Korah, Solomon, Moses (Ps 90), and anonymous.',
    chapters: 150, era: 'c. 1440–430 BC',
    oneLine: 'Israel’s songbook, 150 prayers and songs covering the full range of human experience before God.',
    theme: 'Worship in every emotional key: praise, lament, thanks, trust.',
    keyPeople: ['David', 'Asaph', 'Sons of Korah', 'Moses', 'Solomon'],
    keyEvents: ['Five books of psalms', 'Messianic psalms', 'Psalms of lament and ascent'],
    keyChapters: [
      { ch: '1', what: 'The blessed man is like a tree planted by streams of water' },
      { ch: '19', what: '"The heavens declare the glory of God"' },
      { ch: '22', what: 'The suffering psalm, "My God, my God, why have you forsaken me?"' },
      { ch: '23', what: '"The LORD is my shepherd", the most famous psalm' },
      { ch: '51', what: 'David’s repentance after Bathsheba' },
      { ch: '119', what: 'The longest chapter in the Bible, an acrostic on God’s word' },
      { ch: '150', what: 'The final psalm, "Let everything that has breath praise the LORD"' },
    ],
    keyVerse: { ref: 'Psalm 23:1', text: 'The LORD is my shepherd; I shall not want.' },
    hook: '150 psalms in 5 books (1–41, 42–72, 73–89, 90–106, 107–150), each ending in a doxology. Psalm 119 is the longest chapter, Psalm 117 the shortest.',
  },
  {
    id: 'proverbs', name: 'Proverbs', abbr: 'Prov', order: 20, testament: 'OT', division: 'Wisdom',
    author: 'Solomon', authorNote: 'Mostly Solomon; also Agur (ch. 30) and Lemuel (ch. 31).',
    chapters: 31, era: 'c. 950–700 BC',
    oneLine: 'Short sayings that teach skillful, God-fearing living in everyday decisions.',
    theme: 'The fear of the LORD is the beginning of wisdom.',
    keyPeople: ['Solomon', 'Agur', 'King Lemuel', 'Lady Wisdom', 'Lady Folly'],
    keyEvents: ['Lady Wisdom calls in the street', 'Warnings against the adulteress', 'The excellent wife'],
    keyChapters: [
      { ch: '1', what: '"The fear of the LORD is the beginning of knowledge"' },
      { ch: '3', what: '"Trust in the LORD with all your heart"' },
      { ch: '8', what: 'Wisdom personified, present at creation' },
      { ch: '31', what: 'The excellent wife, an acrostic poem' },
    ],
    keyVerse: { ref: 'Proverbs 3:5-6', text: 'Trust in the LORD with all your heart, and do not lean on your own understanding.' },
    hook: '31 chapters, one per day of the month. Chapters 1–9 are speeches; 10–31 are the short sayings.',
  },
  {
    id: 'ecclesiastes', name: 'Ecclesiastes', abbr: 'Eccl', order: 21, testament: 'OT', division: 'Wisdom',
    author: 'Solomon', authorNote: 'Written by "the Preacher" (Qoheleth), son of David.',
    chapters: 12, era: 'c. 935 BC',
    oneLine: 'The Preacher tests every pleasure and achievement under the sun and finds them all fleeting.',
    theme: 'Vanity, life without God is vapor; fear God and enjoy His gifts.',
    keyPeople: ['The Preacher (Qoheleth)'],
    keyEvents: ['The search for meaning in pleasure, work, and wisdom', 'A time for everything', 'Final conclusion'],
    keyChapters: [
      { ch: '1', what: '"Vanity of vanities! All is vanity"' },
      { ch: '3', what: '"For everything there is a season"' },
      { ch: '12', what: '"Fear God and keep his commandments", the whole duty of man' },
    ],
    keyVerse: { ref: 'Ecclesiastes 12:13', text: 'Fear God and keep his commandments, for this is the whole duty of man.' },
    hook: '"Under the sun" appears ~29 times, the book’s view from ground level.',
  },
  {
    id: 'song-of-solomon', name: 'Song of Solomon', abbr: 'Song', order: 22, testament: 'OT', division: 'Wisdom',
    author: 'Solomon', chapters: 8, era: 'c. 960 BC',
    oneLine: 'A love poem celebrating desire, courtship, and marriage between a bride and her beloved.',
    theme: 'Love, passionate, exclusive, and good.',
    keyPeople: ['The Beloved (Solomon)', 'The Shulammite bride', 'Daughters of Jerusalem'],
    keyEvents: ['Courtship', 'Wedding', 'Longing and reunion'],
    keyChapters: [
      { ch: '2', what: '"I am a rose of Sharon, a lily of the valleys"' },
      { ch: '8', what: '"Love is strong as death", the seal upon the heart' },
    ],
    keyVerse: { ref: 'Song of Solomon 8:6', text: 'Set me as a seal upon your heart... for love is strong as death.' },
    hook: 'Also called Song of Songs, a Hebrew superlative meaning "the greatest song."',
  },

  // ----------------------------------------------------- MAJOR PROPHETS (5)
  {
    id: 'isaiah', name: 'Isaiah', abbr: 'Isa', order: 23, testament: 'OT', division: 'Major Prophets',
    author: 'Isaiah', chapters: 66, era: 'c. 740–680 BC',
    oneLine: 'Judgment on Judah and the nations gives way to comfort and the promise of a suffering Servant.',
    theme: 'Salvation belongs to the LORD, "The Holy One of Israel."',
    keyPeople: ['Isaiah', 'Uzziah', 'Ahaz', 'Hezekiah', 'Sennacherib', 'The Suffering Servant'],
    keyEvents: ['Isaiah’s temple vision and call', 'Immanuel prophecy', 'Assyrian threat', 'Hezekiah’s illness and extended life', 'Servant Songs', 'New heavens and new earth'],
    keyChapters: [
      { ch: '6', what: 'Isaiah’s vision in the temple, "Here I am! Send me"' },
      { ch: '7', what: 'The Immanuel sign, "the virgin shall conceive"' },
      { ch: '9', what: '"For to us a child is born", the government on his shoulder' },
      { ch: '40', what: '"Comfort, comfort my people", the turn from judgment to hope' },
      { ch: '53', what: 'The Suffering Servant, pierced for our transgressions' },
      { ch: '65-66', what: 'New heavens and a new earth' },
    ],
    keyVerse: { ref: 'Isaiah 53:5', text: 'But he was pierced for our transgressions; he was crushed for our iniquities.' },
    hook: '66 chapters like 66 books: chapters 1–39 (judgment, like the OT), 40–66 (comfort, like the NT).',
  },
  {
    id: 'jeremiah', name: 'Jeremiah', abbr: 'Jer', order: 24, testament: 'OT', division: 'Major Prophets',
    author: 'Jeremiah', authorNote: 'Dictated to his scribe Baruch.',
    chapters: 52, era: 'c. 627–580 BC',
    oneLine: 'The weeping prophet warns Judah for forty years that Babylon is coming, and watches it happen.',
    theme: 'Judgment is certain, but a new covenant is coming.',
    keyPeople: ['Jeremiah', 'Baruch', 'Josiah', 'Jehoiakim', 'Zedekiah', 'Nebuchadnezzar', 'Hananiah'],
    keyEvents: ['Jeremiah’s call as a youth', 'The potter’s house', 'The scroll burned by Jehoiakim', 'Jeremiah in the cistern', 'Seventy years of exile foretold', 'New covenant promised', 'Fall of Jerusalem'],
    keyChapters: [
      { ch: '1', what: '"Before I formed you in the womb I knew you", Jeremiah’s call' },
      { ch: '18', what: 'The potter and the clay' },
      { ch: '29', what: 'Letter to the exiles, "plans for welfare and not for evil"; seventy years' },
      { ch: '31', what: 'The new covenant written on hearts' },
      { ch: '36', what: 'Jehoiakim cuts up and burns the scroll' },
      { ch: '38', what: 'Jeremiah thrown into a muddy cistern' },
      { ch: '52', what: 'The fall of Jerusalem recounted' },
    ],
    keyVerse: { ref: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the LORD, plans for welfare and not for evil.' },
    hook: 'The "weeping prophet." Seventy years of exile is his signature number.',
  },
  {
    id: 'lamentations', name: 'Lamentations', abbr: 'Lam', order: 25, testament: 'OT', division: 'Major Prophets',
    author: 'Jeremiah', authorNote: 'Traditionally Jeremiah; the book is formally anonymous.',
    chapters: 5, era: 'c. 586 BC',
    oneLine: 'Five funeral poems mourning the destruction of Jerusalem, with one burst of hope at the center.',
    theme: 'Grief held together with faithfulness.',
    keyPeople: ['Jeremiah', 'Daughter Zion'],
    keyEvents: ['Jerusalem destroyed', 'Famine in the siege', 'Confession and plea for restoration'],
    keyChapters: [
      { ch: '1', what: '"How lonely sits the city that was full of people"' },
      { ch: '3', what: '"His mercies never come to an end; they are new every morning"' },
      { ch: '5', what: '"Restore us to yourself, O LORD", the closing plea' },
    ],
    keyVerse: { ref: 'Lamentations 3:22-23', text: 'The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning.' },
    hook: 'Five chapters, four of them acrostics. The hope sits dead center, in chapter 3.',
  },
  {
    id: 'ezekiel', name: 'Ezekiel', abbr: 'Ezek', order: 26, testament: 'OT', division: 'Major Prophets',
    author: 'Ezekiel', chapters: 48, era: 'c. 593–571 BC',
    oneLine: 'A priest-prophet in Babylon sees God’s glory leave the temple, and, at the end, return.',
    theme: 'God’s glory and the promise "you shall know that I am the LORD."',
    keyPeople: ['Ezekiel', 'Nebuchadnezzar', 'Gog'],
    keyEvents: ['Vision of the wheels and living creatures', 'Sign-acts of the siege', 'Glory departs the temple', 'Valley of dry bones', 'New heart and new spirit', 'Vision of the new temple'],
    keyChapters: [
      { ch: '1', what: 'The vision of wheels within wheels and the throne of God' },
      { ch: '10', what: 'God’s glory departs from the temple' },
      { ch: '36', what: '"A new heart I will give you, and a new spirit"' },
      { ch: '37', what: 'The valley of dry bones coming to life' },
      { ch: '40-48', what: 'Vision of a new temple; the city named "The LORD Is There"' },
    ],
    keyVerse: { ref: 'Ezekiel 37:5', text: 'Behold, I will cause breath to enter you, and you shall live.' },
    hook: 'Ezekiel prophesied in exile, by the Chebar canal. Dry bones (37) is his most famous vision.',
  },
  {
    id: 'daniel', name: 'Daniel', abbr: 'Dan', order: 27, testament: 'OT', division: 'Major Prophets',
    author: 'Daniel', chapters: 12, era: 'c. 605–530 BC',
    oneLine: 'Faithful exiles hold their ground in Babylon while visions reveal the rise and fall of world empires.',
    theme: 'God rules over kingdoms, and His kingdom will not pass away.',
    keyPeople: ['Daniel', 'Shadrach', 'Meshach', 'Abednego', 'Nebuchadnezzar', 'Belshazzar', 'Darius', 'Gabriel', 'Michael'],
    keyEvents: ['Refusing the king’s food', 'The statue dream', 'The fiery furnace', 'Nebuchadnezzar’s madness', 'Writing on the wall', 'The lions’ den', 'Vision of four beasts', 'Seventy weeks'],
    keyChapters: [
      { ch: '1', what: 'Daniel and friends refuse the king’s food and thrive on vegetables' },
      { ch: '2', what: 'Nebuchadnezzar’s dream of a statue of four kingdoms' },
      { ch: '3', what: 'The fiery furnace and the fourth man in the fire' },
      { ch: '5', what: 'Belshazzar’s feast and the writing on the wall' },
      { ch: '6', what: 'Daniel in the lions’ den' },
      { ch: '7', what: 'Vision of four beasts and the Son of Man' },
      { ch: '9', what: 'The prophecy of seventy weeks' },
    ],
    keyVerse: { ref: 'Daniel 2:21', text: 'He changes times and seasons; he removes kings and sets up kings.' },
    hook: 'Chapters 1–6 are stories, 7–12 are visions. Four kingdoms: Babylon, Medo-Persia, Greece, Rome.',
  },

  // ----------------------------------------------------- MINOR PROPHETS (12)
  {
    id: 'hosea', name: 'Hosea', abbr: 'Hos', order: 28, testament: 'OT', division: 'Minor Prophets',
    author: 'Hosea', chapters: 14, era: 'c. 750–715 BC',
    oneLine: 'God tells the prophet to marry an unfaithful wife as a living picture of Israel’s spiritual adultery.',
    theme: 'Covenant love that pursues the unfaithful.',
    keyPeople: ['Hosea', 'Gomer', 'Jezreel', 'Lo-ruhamah', 'Lo-ammi'],
    keyEvents: ['Marriage to Gomer', 'Children with symbolic names', 'Buying Gomer back', 'Call to return to the LORD'],
    keyChapters: [
      { ch: '1', what: 'Hosea marries Gomer; children named as signs of judgment' },
      { ch: '3', what: 'Hosea buys his wife back out of slavery' },
      { ch: '6', what: '"I desire steadfast love and not sacrifice"' },
      { ch: '14', what: 'A call to return; God promises to heal their apostasy' },
    ],
    keyVerse: { ref: 'Hosea 6:6', text: 'For I desire steadfast love and not sacrifice.' },
    hook: 'Hosea prophesied to the NORTHERN kingdom. His marriage IS the message.',
  },
  {
    id: 'joel', name: 'Joel', abbr: 'Joel', order: 29, testament: 'OT', division: 'Minor Prophets',
    author: 'Joel', chapters: 3, era: 'Uncertain; c. 835 or c. 500 BC',
    oneLine: 'A locust plague becomes a warning of the coming Day of the LORD and a promise of the outpoured Spirit.',
    theme: 'The Day of the LORD.',
    keyPeople: ['Joel'],
    keyEvents: ['Locust plague', 'Call to repentance', 'Promise of the Spirit poured out on all flesh', 'Judgment in the Valley of Jehoshaphat'],
    keyChapters: [
      { ch: '1', what: 'The devastating locust plague' },
      { ch: '2', what: '"Rend your hearts and not your garments"; the Spirit poured out on all flesh' },
      { ch: '3', what: 'Judgment of the nations in the Valley of Jehoshaphat' },
    ],
    keyVerse: { ref: 'Joel 2:28', text: 'I will pour out my Spirit on all flesh.' },
    hook: 'Peter quotes Joel 2 at Pentecost (Acts 2). Locusts → the Day of the LORD.',
  },
  {
    id: 'amos', name: 'Amos', abbr: 'Amos', order: 30, testament: 'OT', division: 'Minor Prophets',
    author: 'Amos', chapters: 9, era: 'c. 760–750 BC',
    oneLine: 'A shepherd from Judah confronts the prosperous northern kingdom for trampling the poor.',
    theme: 'Social justice, worship without righteousness is offensive to God.',
    keyPeople: ['Amos', 'Amaziah the priest', 'Jeroboam II'],
    keyEvents: ['Oracles against the nations', 'Condemnation of Israel’s luxury and injustice', 'Five visions', 'Promise to restore David’s fallen tent'],
    keyChapters: [
      { ch: '1-2', what: 'Judgment circles the nations, then lands on Israel' },
      { ch: '5', what: '"Let justice roll down like waters"' },
      { ch: '7', what: 'The plumb line vision; Amaziah tells Amos to go home' },
      { ch: '9', what: 'Restoration of the booth of David' },
    ],
    keyVerse: { ref: 'Amos 5:24', text: 'But let justice roll down like waters, and righteousness like an ever-flowing stream.' },
    hook: 'Amos was a shepherd and fig farmer, not a professional prophet. Justice is his one note.',
  },
  {
    id: 'obadiah', name: 'Obadiah', abbr: 'Obad', order: 31, testament: 'OT', division: 'Minor Prophets',
    author: 'Obadiah', chapters: 1, era: 'c. 586 BC',
    oneLine: 'The shortest book in the Old Testament: judgment on Edom for gloating over Jerusalem’s fall.',
    theme: 'Pride goes before destruction; Edom will reap what it sowed.',
    keyPeople: ['Obadiah', 'Edom (descendants of Esau)'],
    keyEvents: ['Edom’s pride condemned', 'Edom’s violence against Jacob', 'The Day of the LORD on the nations'],
    keyChapters: [
      { ch: '1', what: 'The whole book, Edom’s pride, betrayal, and coming judgment' },
    ],
    keyVerse: { ref: 'Obadiah 1:3', text: 'The pride of your heart has deceived you.' },
    hook: 'Shortest book in the OT, 21 verses, 1 chapter. Edom = Esau’s descendants, Jacob’s old rival.',
  },
  {
    id: 'jonah', name: 'Jonah', abbr: 'Jonah', order: 32, testament: 'OT', division: 'Minor Prophets',
    author: 'Jonah', chapters: 4, era: 'c. 780 BC',
    oneLine: 'A prophet runs from God rather than preach to enemies, and sulks when they repent.',
    theme: 'God’s mercy extends beyond Israel, and it offends the self-righteous.',
    keyPeople: ['Jonah', 'The sailors', 'The king of Nineveh'],
    keyEvents: ['Fleeing to Tarshish', 'The storm and being thrown overboard', 'Three days in the great fish', 'Nineveh repents', 'The plant and the worm'],
    keyChapters: [
      { ch: '1', what: 'Jonah flees to Tarshish; the storm; swallowed by a great fish' },
      { ch: '2', what: 'Jonah’s prayer from inside the fish' },
      { ch: '3', what: 'Nineveh repents from the king down to the animals' },
      { ch: '4', what: 'Jonah is angry; God appoints a plant, a worm, and a wind' },
    ],
    keyVerse: { ref: 'Jonah 4:2', text: 'I knew that you are a gracious God and merciful, slow to anger and abounding in steadfast love.' },
    hook: 'The only prophet whose sermon works, and he hates it. Nineveh = capital of Assyria.',
  },
  {
    id: 'micah', name: 'Micah', abbr: 'Mic', order: 33, testament: 'OT', division: 'Minor Prophets',
    author: 'Micah', chapters: 7, era: 'c. 735–700 BC',
    oneLine: 'Judgment on both kingdoms for corrupt leadership, with the promise of a ruler from Bethlehem.',
    theme: 'What the LORD requires: justice, mercy, humility.',
    keyPeople: ['Micah', 'Rulers and false prophets'],
    keyEvents: ['Judgment on Samaria and Jerusalem', 'Bethlehem prophecy', 'God’s courtroom case against Israel'],
    keyChapters: [
      { ch: '4', what: 'Swords beaten into plowshares' },
      { ch: '5', what: '"But you, O Bethlehem Ephrathah", the ruler’s birthplace foretold' },
      { ch: '6', what: '"Do justice, love kindness, walk humbly with your God"' },
    ],
    keyVerse: { ref: 'Micah 6:8', text: 'What does the LORD require of you but to do justice, and to love kindness, and to walk humbly with your God?' },
    hook: 'Micah 5:2 is the verse the chief priests quote to Herod about Bethlehem.',
  },
  {
    id: 'nahum', name: 'Nahum', abbr: 'Nah', order: 34, testament: 'OT', division: 'Minor Prophets',
    author: 'Nahum', chapters: 3, era: 'c. 660–630 BC',
    oneLine: 'Nineveh, spared in Jonah’s day, is now pronounced doomed for its cruelty.',
    theme: 'God is slow to anger but will not clear the guilty.',
    keyPeople: ['Nahum'],
    keyEvents: ['Oracle against Nineveh', 'The siege described', 'Assyria’s fall foretold'],
    keyChapters: [
      { ch: '1', what: 'The LORD is slow to anger but great in power' },
      { ch: '3', what: 'Woe to the bloody city, Nineveh’s destruction' },
    ],
    keyVerse: { ref: 'Nahum 1:7', text: 'The LORD is good, a stronghold in the day of trouble.' },
    hook: 'Nahum is the sequel to Jonah, same city, opposite outcome, about 150 years later.',
  },
  {
    id: 'habakkuk', name: 'Habakkuk', abbr: 'Hab', order: 35, testament: 'OT', division: 'Minor Prophets',
    author: 'Habakkuk', chapters: 3, era: 'c. 610–600 BC',
    oneLine: 'A prophet argues with God about injustice and is told the righteous will live by faith.',
    theme: 'Faith when God’s answer is harder than the question.',
    keyPeople: ['Habakkuk', 'The Chaldeans (Babylonians)'],
    keyEvents: ['Habakkuk’s two complaints', 'God’s answer: Babylon is coming', 'The prophet’s closing psalm of trust'],
    keyChapters: [
      { ch: '1', what: '"O LORD, how long shall I cry for help?", the first complaint' },
      { ch: '2', what: '"The righteous shall live by his faith"' },
      { ch: '3', what: '"Yet I will rejoice in the LORD", trust without the harvest' },
    ],
    keyVerse: { ref: 'Habakkuk 2:4', text: 'But the righteous shall live by his faith.' },
    hook: 'Habakkuk 2:4 is quoted in Romans, Galatians, and Hebrews, the verse behind the Reformation.',
  },
  {
    id: 'zephaniah', name: 'Zephaniah', abbr: 'Zeph', order: 36, testament: 'OT', division: 'Minor Prophets',
    author: 'Zephaniah', chapters: 3, era: 'c. 640–620 BC',
    oneLine: 'The Day of the LORD sweeps over Judah and the nations, then gives way to God singing over a saved remnant.',
    theme: 'The Day of the LORD, judgment then joy.',
    keyPeople: ['Zephaniah', 'Josiah'],
    keyEvents: ['Judgment on Judah', 'Judgment on the nations', 'Restoration of a humble remnant'],
    keyChapters: [
      { ch: '1', what: '"The great day of the LORD is near"' },
      { ch: '3', what: '"He will rejoice over you with gladness... he will exult over you with loud singing"' },
    ],
    keyVerse: { ref: 'Zephaniah 3:17', text: 'The LORD your God is in your midst, a mighty one who will save.' },
    hook: 'Zephaniah preached under Josiah, likely fuel for Josiah’s reforms.',
  },
  {
    id: 'haggai', name: 'Haggai', abbr: 'Hag', order: 37, testament: 'OT', division: 'Minor Prophets',
    author: 'Haggai', chapters: 2, era: '520 BC',
    oneLine: 'A prophet shames the returned exiles into finishing the temple they abandoned for their own houses.',
    theme: 'Priorities, "Consider your ways."',
    keyPeople: ['Haggai', 'Zerubbabel', 'Joshua the high priest', 'Darius'],
    keyEvents: ['Rebuke for paneled houses while the temple lies in ruins', 'Work on the temple resumes', 'Promise of greater glory'],
    keyChapters: [
      { ch: '1', what: '"Consider your ways", the temple lies in ruins while they build their own homes' },
      { ch: '2', what: '"The latter glory of this house shall be greater than the former"' },
    ],
    keyVerse: { ref: 'Haggai 1:7', text: 'Thus says the LORD of hosts: Consider your ways.' },
    hook: 'Only 2 chapters, and every message is dated to the day. Works alongside Zechariah in 520 BC.',
  },
  {
    id: 'zechariah', name: 'Zechariah', abbr: 'Zech', order: 38, testament: 'OT', division: 'Minor Prophets',
    author: 'Zechariah', chapters: 14, era: 'c. 520–480 BC',
    oneLine: 'Visions and oracles urging the returned exiles to rebuild, packed with prophecies of the coming King.',
    theme: 'Return to me, and I will return to you, with a Messianic horizon.',
    keyPeople: ['Zechariah', 'Zerubbabel', 'Joshua the high priest'],
    keyEvents: ['Eight night visions', 'The lampstand and olive trees', 'The Branch', 'The king on a donkey', 'Thirty pieces of silver', 'The pierced one'],
    keyChapters: [
      { ch: '4', what: '"Not by might, nor by power, but by my Spirit"' },
      { ch: '9', what: 'Your king comes "humble and mounted on a donkey"' },
      { ch: '11', what: 'The thirty pieces of silver' },
      { ch: '14', what: 'The LORD will be king over all the earth' },
    ],
    keyVerse: { ref: 'Zechariah 4:6', text: 'Not by might, nor by power, but by my Spirit, says the LORD of hosts.' },
    hook: 'The longest Minor Prophet (14 chapters) and the most quoted in the Passion narratives.',
  },
  {
    id: 'malachi', name: 'Malachi', abbr: 'Mal', order: 39, testament: 'OT', division: 'Minor Prophets',
    author: 'Malachi', chapters: 4, era: 'c. 430 BC',
    oneLine: 'God confronts half-hearted priests and people, then promises a messenger before the great day.',
    theme: 'Half-hearted worship, and the messenger who prepares the way.',
    keyPeople: ['Malachi', 'The priests', 'Elijah the messenger'],
    keyEvents: ['Blemished sacrifices condemned', 'Rebuke for divorce and faithlessness', 'Robbing God in tithes', 'Promise of Elijah’s return'],
    keyChapters: [
      { ch: '1', what: 'Polluted offerings, blind and lame animals brought to the altar' },
      { ch: '3', what: '"Bring the full tithe into the storehouse" and test me' },
      { ch: '4', what: '"I will send you Elijah the prophet", the last words of the OT' },
    ],
    keyVerse: { ref: 'Malachi 3:10', text: 'Bring the full tithe into the storehouse... and thereby put me to the test.' },
    hook: 'The last book of the OT. Then 400 silent years until John the Baptist, the promised "Elijah."',
  },

  // ------------------------------------------------------------ GOSPELS (4)
  {
    id: 'matthew', name: 'Matthew', abbr: 'Matt', order: 40, testament: 'NT', division: 'Gospels',
    author: 'Matthew', authorNote: 'Matthew (Levi), a tax collector and one of the Twelve.',
    chapters: 28, era: 'c. AD 50–70',
    oneLine: 'Jesus presented to a Jewish audience as the promised Messiah and King who fulfills the Old Testament.',
    theme: 'Fulfillment, "this took place to fulfill what was spoken."',
    keyPeople: ['Jesus', 'Mary', 'Joseph', 'John the Baptist', 'Herod the Great', 'Peter', 'Judas', 'Pilate'],
    keyEvents: ['Genealogy from Abraham', 'Visit of the wise men', 'Flight to Egypt', 'Sermon on the Mount', 'Parables of the kingdom', 'Peter’s confession', 'Transfiguration', 'Triumphal entry', 'Crucifixion and resurrection', 'Great Commission'],
    keyChapters: [
      { ch: '1-2', what: 'Genealogy, virgin birth, wise men, and the flight to Egypt' },
      { ch: '5-7', what: 'The Sermon on the Mount, Beatitudes, Lord’s Prayer, Golden Rule' },
      { ch: '13', what: 'Seven parables of the kingdom of heaven' },
      { ch: '16', what: 'Peter’s confession, "You are the Christ, the Son of the living God"' },
      { ch: '24-25', what: 'The Olivet Discourse on the end of the age' },
      { ch: '28', what: 'Resurrection and the Great Commission' },
    ],
    keyVerse: { ref: 'Matthew 28:19', text: 'Go therefore and make disciples of all nations.' },
    hook: 'Written for Jews: genealogy starts at Abraham, "kingdom of heaven" ~32 times, five big discourses.',
  },
  {
    id: 'mark', name: 'Mark', abbr: 'Mark', order: 41, testament: 'NT', division: 'Gospels',
    author: 'John Mark', authorNote: 'Companion of Peter and Paul; traditionally recording Peter’s preaching.',
    chapters: 16, era: 'c. AD 50–65',
    oneLine: 'The shortest, fastest Gospel, Jesus as the Servant who acts, suffers, and rises.',
    theme: 'The Son of Man came to serve and to give His life as a ransom.',
    keyPeople: ['Jesus', 'Peter', 'John the Baptist', 'Bartimaeus', 'Pilate', 'Simon of Cyrene'],
    keyEvents: ['Baptism and temptation', 'Calling the disciples', 'Calming the storm', 'Feeding the 5,000', 'Peter’s confession', 'Transfiguration', 'Triumphal entry', 'Crucifixion and empty tomb'],
    keyChapters: [
      { ch: '1', what: 'John the Baptist, Jesus’ baptism, temptation, and first disciples, all at speed' },
      { ch: '4', what: 'Parable of the sower; Jesus calms the storm' },
      { ch: '8', what: 'Peter’s confession; "take up his cross and follow me"' },
      { ch: '10', what: 'The rich young ruler; "the Son of Man came... to give his life as a ransom for many"' },
      { ch: '15-16', what: 'Crucifixion, burial, and the empty tomb' },
    ],
    keyVerse: { ref: 'Mark 10:45', text: 'For even the Son of Man came not to be served but to serve, and to give his life as a ransom for many.' },
    hook: 'Watch for "immediately" (~40 times). Shortest Gospel, written for a Roman audience.',
  },
  {
    id: 'luke', name: 'Luke', abbr: 'Luke', order: 42, testament: 'NT', division: 'Gospels',
    author: 'Luke', authorNote: 'A physician and Paul’s companion; the only Gentile author in the NT.',
    chapters: 24, era: 'c. AD 60–62',
    oneLine: 'An orderly, researched account presenting Jesus as the Son of Man who seeks the lost and the outsider.',
    theme: 'Salvation for everyone, the poor, the outcast, the Gentile, the woman, the sinner.',
    keyPeople: ['Jesus', 'Mary', 'Elizabeth', 'Zechariah', 'John the Baptist', 'Simeon', 'Anna', 'Zacchaeus', 'Theophilus'],
    keyEvents: ['Annunciation and Magnificat', 'Birth in Bethlehem with shepherds', 'Boy Jesus in the temple', 'Sermon on the Plain', 'Good Samaritan', 'Prodigal Son', 'Zacchaeus', 'Road to Emmaus', 'Ascension'],
    keyChapters: [
      { ch: '1-2', what: 'Annunciation, Magnificat, nativity with shepherds, Simeon and Anna' },
      { ch: '10', what: 'The parable of the Good Samaritan' },
      { ch: '15', what: 'Lost sheep, lost coin, and the Prodigal Son' },
      { ch: '19', what: 'Zacchaeus, "the Son of Man came to seek and to save the lost"' },
      { ch: '24', what: 'The road to Emmaus and the ascension' },
    ],
    keyVerse: { ref: 'Luke 19:10', text: 'For the Son of Man came to seek and to save the lost.' },
    hook: 'Longest NT book by word count. Volume one of two, Acts is the sequel, both addressed to Theophilus.',
  },
  {
    id: 'john', name: 'John', abbr: 'John', order: 43, testament: 'NT', division: 'Gospels',
    author: 'John', authorNote: 'The apostle John, "the disciple whom Jesus loved."',
    chapters: 21, era: 'c. AD 85–95',
    oneLine: 'Seven signs and seven "I AM" sayings written so that you may believe Jesus is the Son of God.',
    theme: 'Believe and have life, Jesus is God in the flesh.',
    keyPeople: ['Jesus', 'John the Baptist', 'Nicodemus', 'The Samaritan woman', 'Lazarus', 'Mary', 'Martha', 'Thomas', 'Pilate'],
    keyEvents: ['The Word became flesh', 'Water into wine at Cana', 'Nicodemus at night', 'Woman at the well', 'Feeding the 5,000', 'Raising Lazarus', 'Foot washing', 'Farewell discourse', 'Crucifixion and resurrection appearances'],
    keyChapters: [
      { ch: '1', what: '"In the beginning was the Word", the prologue' },
      { ch: '3', what: 'Nicodemus and "you must be born again"; John 3:16' },
      { ch: '4', what: 'The Samaritan woman at the well' },
      { ch: '11', what: 'Lazarus raised, "I am the resurrection and the life"' },
      { ch: '13-17', what: 'Upper Room: foot washing, the Helper promised, the High Priestly Prayer' },
      { ch: '20', what: 'Resurrection appearances and doubting Thomas; the purpose statement' },
    ],
    keyVerse: { ref: 'John 20:31', text: 'These are written so that you may believe that Jesus is the Christ, the Son of God.' },
    hook: '7 signs, 7 "I AM" statements, no parables, ~90% unique material. The one non-synoptic Gospel.',
  },

  // --------------------------------------------------------------- ACTS (1)
  {
    id: 'acts', name: 'Acts', abbr: 'Acts', order: 44, testament: 'NT', division: 'Acts',
    author: 'Luke', chapters: 28, era: 'c. AD 30–62',
    oneLine: 'The Spirit launches the church at Pentecost and drives the gospel from Jerusalem to Rome.',
    theme: 'Witness, "you will be my witnesses... to the end of the earth."',
    keyPeople: ['Peter', 'Paul', 'Stephen', 'Philip', 'Barnabas', 'Cornelius', 'Ananias', 'Sapphira', 'Silas', 'Timothy', 'Lydia', 'James'],
    keyEvents: ['Ascension', 'Pentecost', 'Stephen martyred', 'Saul’s conversion on the Damascus road', 'Cornelius and the Gentile Pentecost', 'Three missionary journeys', 'Jerusalem Council', 'Shipwreck on Malta', 'Paul under house arrest in Rome'],
    keyChapters: [
      { ch: '1', what: 'Ascension and the promise: witnesses in Jerusalem, Judea, Samaria, the end of the earth' },
      { ch: '2', what: 'Pentecost, tongues of fire and about 3,000 saved' },
      { ch: '7', what: 'Stephen’s speech and martyrdom; Saul approves' },
      { ch: '9', what: 'Saul converted on the road to Damascus' },
      { ch: '10', what: 'Cornelius, the gospel opens to the Gentiles' },
      { ch: '15', what: 'The Jerusalem Council settles the Gentile question' },
      { ch: '27-28', what: 'Shipwreck on Malta; Paul preaching in Rome' },
    ],
    keyVerse: { ref: 'Acts 1:8', text: 'You will be my witnesses in Jerusalem and in all Judea and Samaria, and to the end of the earth.' },
    hook: 'Acts 1:8 is the book’s outline. Chapters 1–12 follow Peter; 13–28 follow Paul.',
  },

  // --------------------------------------------------- PAULINE EPISTLES (13)
  {
    id: 'romans', name: 'Romans', abbr: 'Rom', order: 45, testament: 'NT', division: 'Pauline Epistles',
    author: 'Paul', chapters: 16, era: 'c. AD 57, from Corinth',
    oneLine: 'Paul’s fullest explanation of the gospel: all have sinned, all are justified by faith, so live accordingly.',
    theme: 'Justification by faith, the righteousness of God revealed.',
    keyPeople: ['Paul', 'Phoebe', 'Priscilla', 'Aquila', 'Tertius'],
    keyEvents: ['Universal guilt of humanity', 'Justification by faith', 'Life in the Spirit', 'Israel’s place in God’s plan', 'Practical Christian living'],
    keyChapters: [
      { ch: '1', what: 'The gospel is the power of God; humanity’s suppression of truth' },
      { ch: '3', what: '"All have sinned and fall short of the glory of God"' },
      { ch: '5', what: 'Adam and Christ; peace with God through justification' },
      { ch: '8', what: 'No condemnation; life in the Spirit; nothing can separate us from God’s love' },
      { ch: '9-11', what: 'God’s plan for Israel and the grafted-in Gentiles' },
      { ch: '12', what: '"Present your bodies as a living sacrifice"' },
    ],
    keyVerse: { ref: 'Romans 3:23-24', text: 'For all have sinned and fall short of the glory of God, and are justified by his grace as a gift.' },
    hook: 'Longest and most systematic letter. 1–11 doctrine, 12–16 duty. Written to a church Paul had not yet visited.',
  },
  {
    id: '1-corinthians', name: '1 Corinthians', abbr: '1 Cor', order: 46, testament: 'NT', division: 'Pauline Epistles',
    author: 'Paul', chapters: 16, era: 'c. AD 55, from Ephesus',
    oneLine: 'Paul troubleshoots a divided, immoral, chaotic church, one problem at a time.',
    theme: 'The cross reorders everything, unity, purity, and love in the body.',
    keyPeople: ['Paul', 'Apollos', 'Cephas (Peter)', 'Chloe’s people', 'Sosthenes'],
    keyEvents: ['Divisions over leaders', 'Church discipline case', 'Lawsuits and sexual immorality', 'Food offered to idols', 'Lord’s Supper abuses', 'Spiritual gifts', 'The love chapter', 'Resurrection defended'],
    keyChapters: [
      { ch: '1', what: 'Divisions in the church; the foolishness of the cross' },
      { ch: '11', what: 'Instructions for the Lord’s Supper' },
      { ch: '12', what: 'Spiritual gifts and the body with many members' },
      { ch: '13', what: 'The love chapter, "the greatest of these is love"' },
      { ch: '15', what: 'The resurrection chapter, "if Christ has not been raised..."' },
    ],
    keyVerse: { ref: '1 Corinthians 13:13', text: 'So now faith, hope, and love abide, these three; but the greatest of these is love.' },
    hook: 'A problem-by-problem letter. Chapter 13 (love) sits deliberately between two chapters on gifts.',
  },
  {
    id: '2-corinthians', name: '2 Corinthians', abbr: '2 Cor', order: 47, testament: 'NT', division: 'Pauline Epistles',
    author: 'Paul', chapters: 13, era: 'c. AD 56, from Macedonia',
    oneLine: 'Paul defends his apostleship and boasts only in weakness through which Christ’s power shows.',
    theme: 'Strength in weakness; the ministry of reconciliation.',
    keyPeople: ['Paul', 'Titus', 'The "super-apostles"'],
    keyEvents: ['Comfort in affliction', 'Ministry of the new covenant', 'The collection for Jerusalem', 'Paul’s hardship list', 'The thorn in the flesh'],
    keyChapters: [
      { ch: '4', what: '"We have this treasure in jars of clay"' },
      { ch: '5', what: 'New creation and the ministry of reconciliation' },
      { ch: '8-9', what: 'The collection for Jerusalem, "God loves a cheerful giver"' },
      { ch: '11', what: 'Paul’s catalogue of sufferings' },
      { ch: '12', what: 'The thorn in the flesh, "my power is made perfect in weakness"' },
    ],
    keyVerse: { ref: '2 Corinthians 12:9', text: 'My grace is sufficient for you, for my power is made perfect in weakness.' },
    hook: 'The most personal and emotional of Paul’s letters. Weakness is the through-line.',
  },
  {
    id: 'galatians', name: 'Galatians', abbr: 'Gal', order: 48, testament: 'NT', division: 'Pauline Epistles',
    author: 'Paul', chapters: 6, era: 'c. AD 48–55',
    oneLine: 'Paul attacks the idea that Gentile Christians must keep the law to be saved.',
    theme: 'Freedom, justified by faith, not works of the law.',
    keyPeople: ['Paul', 'Peter', 'Barnabas', 'The Judaizers', 'Abraham', 'Hagar', 'Sarah'],
    keyEvents: ['Paul rebukes Peter at Antioch', 'Argument from Abraham’s faith', 'Law as guardian', 'Fruit of the Spirit'],
    keyChapters: [
      { ch: '2', what: 'Paul opposes Peter to his face; "I have been crucified with Christ"' },
      { ch: '3', what: 'Abraham believed God, justified by faith, not law' },
      { ch: '5', what: 'Freedom in Christ; the fruit of the Spirit' },
    ],
    keyVerse: { ref: 'Galatians 2:20', text: 'I have been crucified with Christ. It is no longer I who live, but Christ who lives in me.' },
    hook: 'The angriest letter, no thanksgiving section. Think of it as short-form Romans.',
  },
  {
    id: 'ephesians', name: 'Ephesians', abbr: 'Eph', order: 49, testament: 'NT', division: 'Pauline Epistles',
    author: 'Paul', authorNote: 'A "Prison Epistle," written from Rome.',
    chapters: 6, era: 'c. AD 60–62',
    oneLine: 'Who you are in Christ (1–3) and how to walk accordingly (4–6), ending with the armor of God.',
    theme: 'Unity in Christ, one new humanity, Jew and Gentile together.',
    keyPeople: ['Paul', 'Tychicus'],
    keyEvents: ['Spiritual blessings in Christ', 'Saved by grace through faith', 'Dividing wall broken down', 'Unity of the body', 'Household instructions', 'Armor of God'],
    keyChapters: [
      { ch: '1', what: 'Every spiritual blessing; chosen before the foundation of the world' },
      { ch: '2', what: '"By grace you have been saved through faith"; the dividing wall broken' },
      { ch: '4', what: 'One body, one Spirit, one Lord, one faith, one baptism' },
      { ch: '6', what: 'The whole armor of God' },
    ],
    keyVerse: { ref: 'Ephesians 2:8-9', text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God.' },
    hook: 'One of four Prison Epistles (Eph, Phil, Col, Phlm). Perfectly split: 3 chapters doctrine, 3 chapters practice.',
  },
  {
    id: 'philippians', name: 'Philippians', abbr: 'Phil', order: 50, testament: 'NT', division: 'Pauline Epistles',
    author: 'Paul', authorNote: 'A "Prison Epistle."',
    chapters: 4, era: 'c. AD 61–62',
    oneLine: 'A thank-you letter from prison that keeps returning to joy and humility.',
    theme: 'Joy in Christ regardless of circumstance.',
    keyPeople: ['Paul', 'Timothy', 'Epaphroditus', 'Euodia', 'Syntyche'],
    keyEvents: ['Paul’s imprisonment advancing the gospel', 'The Christ hymn', 'Pressing toward the goal', 'Contentment in all circumstances'],
    keyChapters: [
      { ch: '1', what: '"To live is Christ, and to die is gain"' },
      { ch: '2', what: 'The Christ hymn, he emptied himself, taking the form of a servant' },
      { ch: '3', what: 'Counting everything as loss; pressing on toward the goal' },
      { ch: '4', what: '"Rejoice in the Lord always"; contentment and "I can do all things"' },
    ],
    keyVerse: { ref: 'Philippians 4:13', text: 'I can do all things through him who strengthens me.' },
    hook: 'Joy/rejoice appears ~16 times in 4 chapters, from a prison cell.',
  },
  {
    id: 'colossians', name: 'Colossians', abbr: 'Col', order: 51, testament: 'NT', division: 'Pauline Epistles',
    author: 'Paul', authorNote: 'A "Prison Epistle."',
    chapters: 4, era: 'c. AD 60–62',
    oneLine: 'Christ is supreme over everything, so no philosophy or ritual can be added to Him.',
    theme: 'The supremacy and sufficiency of Christ.',
    keyPeople: ['Paul', 'Epaphras', 'Tychicus', 'Onesimus', 'Archippus'],
    keyEvents: ['The preeminence of Christ', 'Warning against false teaching', 'Put off the old self, put on the new', 'Household instructions'],
    keyChapters: [
      { ch: '1', what: 'The supremacy of Christ, image of the invisible God, firstborn of all creation' },
      { ch: '2', what: 'Warning against empty philosophy and human tradition' },
      { ch: '3', what: '"Set your minds on things that are above"' },
    ],
    keyVerse: { ref: 'Colossians 1:15-16', text: 'He is the image of the invisible God, the firstborn of all creation. For by him all things were created.' },
    hook: 'Colossians and Ephesians are twins, similar structure, sent by the same messenger (Tychicus).',
  },
  {
    id: '1-thessalonians', name: '1 Thessalonians', abbr: '1 Thess', order: 52, testament: 'NT', division: 'Pauline Epistles',
    author: 'Paul', chapters: 5, era: 'c. AD 50–51, from Corinth',
    oneLine: 'Encouragement to a young church, with the clearest teaching on Christ’s return and the dead in Christ.',
    theme: 'Live holy and hopeful until Jesus returns.',
    keyPeople: ['Paul', 'Silvanus (Silas)', 'Timothy'],
    keyEvents: ['Report of their faith', 'Paul’s defense of his ministry', 'Call to sexual purity', 'The Lord’s return and the dead in Christ', 'The day of the Lord like a thief'],
    keyChapters: [
      { ch: '4', what: 'The dead in Christ will rise first; caught up to meet the Lord' },
      { ch: '5', what: '"The day of the Lord will come like a thief in the night"; rejoice, pray, give thanks' },
    ],
    keyVerse: { ref: '1 Thessalonians 4:16-17', text: 'The dead in Christ will rise first. Then we who are alive... will be caught up together with them.' },
    hook: 'Probably Paul’s earliest surviving letter. Every chapter mentions Christ’s return.',
  },
  {
    id: '2-thessalonians', name: '2 Thessalonians', abbr: '2 Thess', order: 53, testament: 'NT', division: 'Pauline Epistles',
    author: 'Paul', chapters: 3, era: 'c. AD 51–52',
    oneLine: 'A follow-up correcting panic that the day of the Lord had already come, and telling idlers to work.',
    theme: 'Stand firm; the man of lawlessness comes first.',
    keyPeople: ['Paul', 'Silvanus', 'Timothy', 'The man of lawlessness'],
    keyEvents: ['Comfort under persecution', 'The man of lawlessness revealed first', 'Warning against idleness'],
    keyChapters: [
      { ch: '2', what: 'The man of lawlessness must be revealed before the day of the Lord' },
      { ch: '3', what: '"If anyone is not willing to work, let him not eat"' },
    ],
    keyVerse: { ref: '2 Thessalonians 3:10', text: 'If anyone is not willing to work, let him not eat.' },
    hook: 'The correction letter: they overcorrected on the return of Christ and quit their jobs.',
  },
  {
    id: '1-timothy', name: '1 Timothy', abbr: '1 Tim', order: 54, testament: 'NT', division: 'Pauline Epistles',
    author: 'Paul', authorNote: 'A "Pastoral Epistle."',
    chapters: 6, era: 'c. AD 62–64',
    oneLine: 'Instructions to a young pastor in Ephesus on sound doctrine, church order, and leadership.',
    theme: 'How to behave in the household of God.',
    keyPeople: ['Paul', 'Timothy', 'Hymenaeus', 'Alexander'],
    keyEvents: ['Warning against false teachers', 'Instructions on prayer and worship', 'Qualifications for overseers and deacons', 'Care for widows', 'Fight the good fight'],
    keyChapters: [
      { ch: '2', what: 'Prayer for all people; one mediator between God and men' },
      { ch: '3', what: 'Qualifications for overseers and deacons' },
      { ch: '6', what: '"The love of money is a root of all kinds of evils"' },
    ],
    keyVerse: { ref: '1 Timothy 6:10', text: 'For the love of money is a root of all kinds of evils.' },
    hook: 'Pastoral Epistles = 1 Timothy, 2 Timothy, Titus. Written to individuals, not churches.',
  },
  {
    id: '2-timothy', name: '2 Timothy', abbr: '2 Tim', order: 55, testament: 'NT', division: 'Pauline Epistles',
    author: 'Paul', authorNote: 'A "Pastoral Epistle", Paul’s last letter.',
    chapters: 4, era: 'c. AD 66–67, from a Roman prison',
    oneLine: 'Paul’s farewell: guard the deposit, preach the word, endure suffering, I have finished the race.',
    theme: 'Faithfulness to the end.',
    keyPeople: ['Paul', 'Timothy', 'Lois', 'Eunice', 'Demas', 'Luke', 'Mark'],
    keyEvents: ['Fan into flame the gift of God', 'Endure as a good soldier', 'All Scripture is breathed out by God', 'Paul’s final charge and departure'],
    keyChapters: [
      { ch: '2', what: '"Share in suffering as a good soldier of Christ Jesus"' },
      { ch: '3', what: '"All Scripture is breathed out by God and profitable"' },
      { ch: '4', what: '"I have fought the good fight, I have finished the race"' },
    ],
    keyVerse: { ref: '2 Timothy 3:16', text: 'All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness.' },
    hook: 'Paul’s last written words before execution. "Demas... has deserted me" is in chapter 4.',
  },
  {
    id: 'titus', name: 'Titus', abbr: 'Titus', order: 56, testament: 'NT', division: 'Pauline Epistles',
    author: 'Paul', authorNote: 'A "Pastoral Epistle."',
    chapters: 3, era: 'c. AD 62–64',
    oneLine: 'Appoint qualified elders in every town on Crete and let sound doctrine produce good works.',
    theme: 'Doctrine that produces good works.',
    keyPeople: ['Paul', 'Titus', 'Zenas', 'Apollos'],
    keyEvents: ['Appointing elders in Crete', 'Rebuking the Cretan false teachers', 'Instructions by age and station', 'Grace training us to live godly lives'],
    keyChapters: [
      { ch: '1', what: 'Qualifications for elders; the reputation of the Cretans' },
      { ch: '2', what: 'The grace of God trains us to renounce ungodliness' },
      { ch: '3', what: 'Saved by the washing of regeneration, not by works done in righteousness' },
    ],
    keyVerse: { ref: 'Titus 3:5', text: 'He saved us, not because of works done by us in righteousness, but according to his own mercy.' },
    hook: 'Set on the island of Crete. Only 3 chapters, the shortest Pastoral.',
  },
  {
    id: 'philemon', name: 'Philemon', abbr: 'Phlm', order: 57, testament: 'NT', division: 'Pauline Epistles',
    author: 'Paul', authorNote: 'A "Prison Epistle."',
    chapters: 1, era: 'c. AD 60–62',
    oneLine: 'Paul asks a slave owner to receive his runaway slave back as a beloved brother.',
    theme: 'The gospel rewrites social relationships.',
    keyPeople: ['Paul', 'Philemon', 'Onesimus', 'Apphia', 'Archippus'],
    keyEvents: ['Onesimus runs away and meets Paul', 'Paul appeals rather than commands', 'Paul offers to pay Onesimus’s debt'],
    keyChapters: [
      { ch: '1', what: 'The whole letter, an appeal to receive Onesimus "no longer as a slave but as a beloved brother"' },
    ],
    keyVerse: { ref: 'Philemon 1:16', text: 'No longer as a bondservant but more than a bondservant, as a beloved brother.' },
    hook: 'Shortest of Paul’s letters, one chapter, 25 verses. Onesimus means "useful," and Paul plays on it.',
  },

  // --------------------------------------------------- GENERAL EPISTLES (8)
  {
    id: 'hebrews', name: 'Hebrews', abbr: 'Heb', order: 58, testament: 'NT', division: 'General Epistles',
    author: 'Unknown', authorNote: 'Anonymous; proposals include Paul, Apollos, Barnabas, and Priscilla.',
    chapters: 13, era: 'c. AD 60–70',
    oneLine: 'Jesus is better than angels, Moses, the priesthood, and the sacrifices, so do not drift back.',
    theme: 'Better, the superiority and finality of Christ.',
    keyPeople: ['Jesus', 'Melchizedek', 'Moses', 'Abraham', 'The heroes of faith'],
    keyEvents: ['Christ superior to angels and Moses', 'Melchizedek priesthood', 'The once-for-all sacrifice', 'The hall of faith', 'Warning passages'],
    keyChapters: [
      { ch: '1', what: 'God has spoken by His Son, superior to angels' },
      { ch: '4', what: 'The word of God is living and active, sharper than a two-edged sword' },
      { ch: '7', what: 'Christ as high priest in the order of Melchizedek' },
      { ch: '11', what: 'The hall of faith, Abel through the prophets' },
      { ch: '12', what: '"Run with endurance the race that is set before us"' },
    ],
    keyVerse: { ref: 'Hebrews 11:1', text: 'Now faith is the assurance of things hoped for, the conviction of things not seen.' },
    hook: 'Author unknown. Key word: "better" (~13 times). Chapter 11 is the "hall of faith."',
  },
  {
    id: 'james', name: 'James', abbr: 'Jas', order: 59, testament: 'NT', division: 'General Epistles',
    author: 'James', authorNote: 'James the half-brother of Jesus, leader of the Jerusalem church.',
    chapters: 5, era: 'c. AD 45–50 (possibly the earliest NT book)',
    oneLine: 'Real faith shows up in action, in speech, in generosity, and under trial.',
    theme: 'Faith without works is dead.',
    keyPeople: ['James', 'Abraham', 'Rahab', 'Job', 'Elijah'],
    keyEvents: ['Trials producing steadfastness', 'Hearing versus doing', 'Partiality toward the rich condemned', 'Taming the tongue', 'Prayer of faith for the sick'],
    keyChapters: [
      { ch: '1', what: '"Count it all joy" in trials; be doers of the word, not hearers only' },
      { ch: '2', what: '"Faith apart from works is dead"; no partiality' },
      { ch: '3', what: 'The tongue as a small rudder and a fire' },
      { ch: '5', what: 'The prayer of faith and the example of Elijah' },
    ],
    keyVerse: { ref: 'James 2:26', text: 'For as the body apart from the spirit is dead, so also faith apart from works is dead.' },
    hook: 'The "Proverbs of the NT", practical, blunt, command-dense. Written by Jesus’ half-brother.',
  },
  {
    id: '1-peter', name: '1 Peter', abbr: '1 Pet', order: 60, testament: 'NT', division: 'General Epistles',
    author: 'Peter', chapters: 5, era: 'c. AD 62–64',
    oneLine: 'How to live as exiles under hostile pressure: with hope, holiness, and a ready answer.',
    theme: 'Suffering with hope, a living hope through the resurrection.',
    keyPeople: ['Peter', 'Silvanus', 'Mark'],
    keyEvents: ['Born again to a living hope', 'A chosen race, a royal priesthood', 'Submission and suffering', 'Shepherd the flock', 'Resist the devil'],
    keyChapters: [
      { ch: '1', what: 'Born again to a living hope; "be holy, for I am holy"' },
      { ch: '2', what: '"A chosen race, a royal priesthood, a holy nation"' },
      { ch: '3', what: '"Always being prepared to make a defense" for your hope' },
      { ch: '5', what: '"Cast all your anxieties on him"; the devil prowls like a roaring lion' },
    ],
    keyVerse: { ref: '1 Peter 3:15', text: 'Always being prepared to make a defense to anyone who asks you for a reason for the hope that is in you.' },
    hook: 'Written to "elect exiles" scattered across Asia Minor. Suffering appears in every chapter.',
  },
  {
    id: '2-peter', name: '2 Peter', abbr: '2 Pet', order: 61, testament: 'NT', division: 'General Epistles',
    author: 'Peter', chapters: 3, era: 'c. AD 65–68',
    oneLine: 'Grow in the knowledge of Christ, because false teachers and scoffers are already here.',
    theme: 'Guard the truth; the Lord is not slow about His promise.',
    keyPeople: ['Peter', 'Paul', 'Balaam', 'Noah', 'Lot'],
    keyEvents: ['Qualities to add to faith', 'Eyewitness of the Transfiguration', 'Condemnation of false teachers', 'Scoffers in the last days', 'The day of the Lord like a thief'],
    keyChapters: [
      { ch: '1', what: 'Prophecy did not come by the will of man; men spoke from God carried by the Spirit' },
      { ch: '2', what: 'False teachers and their destruction' },
      { ch: '3', what: '"With the Lord one day is as a thousand years"; the heavens will pass away' },
    ],
    keyVerse: { ref: '2 Peter 3:9', text: 'The Lord is not slow to fulfill his promise... but is patient toward you.' },
    hook: 'Peter’s farewell letter (he knows he will die soon). Chapter 2 closely parallels Jude.',
  },
  {
    id: '1-john', name: '1 John', abbr: '1 Jn', order: 62, testament: 'NT', division: 'General Epistles',
    author: 'John', chapters: 5, era: 'c. AD 85–95',
    oneLine: 'Tests of genuine faith, belief, obedience, and love, so that you may know you have eternal life.',
    theme: 'Assurance: God is light, God is love.',
    keyPeople: ['John', 'The antichrists'],
    keyEvents: ['Walking in the light', 'Confession and forgiveness', 'Warning about antichrists', 'God is love', 'Assurance of eternal life'],
    keyChapters: [
      { ch: '1', what: '"If we confess our sins, he is faithful and just to forgive us"' },
      { ch: '3', what: '"See what kind of love the Father has given to us"' },
      { ch: '4', what: '"God is love", and perfect love casts out fear' },
      { ch: '5', what: '"That you may know that you have eternal life"' },
    ],
    keyVerse: { ref: '1 John 1:9', text: 'If we confess our sins, he is faithful and just to forgive us our sins.' },
    hook: 'No greeting, no named recipients, more sermon than letter. "Know" appears ~35 times.',
  },
  {
    id: '2-john', name: '2 John', abbr: '2 Jn', order: 63, testament: 'NT', division: 'General Epistles',
    author: 'John', authorNote: 'Written by "the elder."',
    chapters: 1, era: 'c. AD 85–95',
    oneLine: 'Walk in truth and love, and do not welcome those who deny that Jesus came in the flesh.',
    theme: 'Truth and love held together.',
    keyPeople: ['The elder (John)', 'The elect lady', 'The deceivers'],
    keyEvents: ['Command to love one another', 'Warning against deceivers and false hospitality'],
    keyChapters: [
      { ch: '1', what: 'The whole letter, walk in truth, love one another, do not receive false teachers' },
    ],
    keyVerse: { ref: '2 John 1:6', text: 'And this is love, that we walk according to his commandments.' },
    hook: 'One chapter, 13 verses, the shortest book in the Bible by verse count. Addressed to "the elect lady."',
  },
  {
    id: '3-john', name: '3 John', abbr: '3 Jn', order: 64, testament: 'NT', division: 'General Epistles',
    author: 'John', authorNote: 'Written by "the elder."',
    chapters: 1, era: 'c. AD 85–95',
    oneLine: 'Commendation of Gaius for hospitality, rebuke of Diotrephes for arrogance.',
    theme: 'Support faithful workers; refuse self-promoting leaders.',
    keyPeople: ['The elder (John)', 'Gaius', 'Diotrephes', 'Demetrius'],
    keyEvents: ['Gaius praised for hospitality', 'Diotrephes rebuked for putting himself first', 'Demetrius commended'],
    keyChapters: [
      { ch: '1', what: 'The whole letter, Gaius commended, Diotrephes rebuked, Demetrius well spoken of' },
    ],
    keyVerse: { ref: '3 John 1:4', text: 'I have no greater joy than to hear that my children are walking in the truth.' },
    hook: 'Three names to know: Gaius (good), Diotrephes (bad), Demetrius (good). 14 verses.',
  },
  {
    id: 'jude', name: 'Jude', abbr: 'Jude', order: 65, testament: 'NT', division: 'General Epistles',
    author: 'Jude', authorNote: 'Jude, brother of James and half-brother of Jesus.',
    chapters: 1, era: 'c. AD 65–80',
    oneLine: 'An urgent call to contend for the faith against teachers who twist grace into license.',
    theme: 'Contend for the faith once for all delivered to the saints.',
    keyPeople: ['Jude', 'James', 'Michael the archangel', 'Cain', 'Balaam', 'Korah', 'Enoch'],
    keyEvents: ['Warning about infiltrators', 'Examples of past judgment', 'Michael disputing over Moses’ body', 'The closing doxology'],
    keyChapters: [
      { ch: '1', what: 'The whole letter, contend for the faith; the doxology "to him who is able to keep you from stumbling"' },
    ],
    keyVerse: { ref: 'Jude 1:3', text: 'Contend for the faith that was once for all delivered to the saints.' },
    hook: 'One chapter, 25 verses. Written by Jesus’ half-brother; overlaps heavily with 2 Peter 2.',
  },

  // -------------------------------------------------------- APOCALYPTIC (1)
  {
    id: 'revelation', name: 'Revelation', abbr: 'Rev', order: 66, testament: 'NT', division: 'Apocalyptic',
    author: 'John', authorNote: 'Written from exile on the island of Patmos.',
    chapters: 22, era: 'c. AD 95',
    oneLine: 'Visions of judgment and triumph assuring persecuted churches that the Lamb wins.',
    theme: 'The Lamb reigns, history ends with God dwelling among His people.',
    keyPeople: ['John', 'Jesus the Lamb', 'The seven churches', 'The dragon', 'The beast', 'The false prophet', 'Babylon the great'],
    keyEvents: ['Vision of the glorified Christ', 'Letters to seven churches', 'The throne room', 'Seven seals, trumpets, and bowls', 'The woman and the dragon', 'Fall of Babylon', 'Millennium and final judgment', 'New heaven and new earth'],
    keyChapters: [
      { ch: '1', what: 'John on Patmos sees the glorified Christ among the lampstands' },
      { ch: '2-3', what: 'Letters to the seven churches of Asia' },
      { ch: '4-5', what: 'The throne room and the Lamb who is worthy to open the scroll' },
      { ch: '12', what: 'The woman, the child, and the dragon' },
      { ch: '20', what: 'The thousand years and the great white throne judgment' },
      { ch: '21-22', what: 'New heaven, new earth, and the New Jerusalem' },
    ],
    keyVerse: { ref: 'Revelation 21:4', text: 'He will wipe away every tear from their eyes, and death shall be no more.' },
    hook: 'Seven everywhere: churches, seals, trumpets, bowls. The seven churches are Ephesus, Smyrna, Pergamum, Thyatira, Sardis, Philadelphia, Laodicea.',
  },
];

export const BOOKS_BY_ID: Record<string, Book> = Object.fromEntries(
  BOOKS.map((b) => [b.id, b]),
);

export const OT = BOOKS.filter((b) => b.testament === 'OT');
export const NT = BOOKS.filter((b) => b.testament === 'NT');

/**
 * The divisions in canonical order, kept as two lists so that widening a
 * distractor pool can never step across the Testament seam. Offering Colossians
 * against "What happens in Leviticus 10?" is not a hard question, it is a
 * different subject, the wrong options have to be plausible neighbours to test
 * anything (#10, #12).
 */
const DIVISIONS_BY_TESTAMENT: Record<Testament, readonly Division[]> = {
  OT: ['Law', 'History', 'Wisdom', 'Major Prophets', 'Minor Prophets'],
  NT: ['Gospels', 'Acts', 'Pauline Epistles', 'General Epistles', 'Apocalyptic'],
};

/**
 * Books near `bookId`: its own division at `rings = 0`, then one division
 * further out in each direction per ring, never leaving the Testament.
 *
 * Callers widen a ring at a time only when the tighter pool cannot fill the
 * options, so a question drawn from a one-book division (Acts, Revelation)
 * still gets four choices without silently reaching across the canon.
 */
export function booksNear(bookId: string, rings = 0): Book[] {
  const book = BOOKS_BY_ID[bookId];
  if (!book) return [];
  const order = DIVISIONS_BY_TESTAMENT[book.testament];
  const at = order.indexOf(book.division);
  if (at === -1) return BOOKS.filter((b) => b.testament === book.testament);

  const lo = Math.max(0, at - rings);
  const hi = Math.min(order.length - 1, at + rings);
  const wanted = new Set(order.slice(lo, hi + 1));
  return BOOKS.filter((b) => b.testament === book.testament && wanted.has(b.division));
}

/**
 * The tightest pool around `bookId` that can still supply `n` distinct options
 * other than `answer`, widening a division at a time and stopping at the
 * Testament boundary.
 *
 * `extract` pulls the candidate strings out of each book, so the same widening
 * rule serves chapter summaries, references, and book names alike.
 */
export function nearbyPool(
  bookId: string,
  extract: (b: Book) => string[],
  answer: string,
  n = 3,
): string[] {
  const widest = DIVISIONS_BY_TESTAMENT[BOOKS_BY_ID[bookId]?.testament ?? 'OT'].length;
  let pool: string[] = [];
  for (let rings = 0; rings <= widest; rings++) {
    pool = [...new Set(booksNear(bookId, rings).flatMap(extract))].filter((s) => s !== answer);
    if (pool.length >= n) return pool;
  }
  // Whole Testament still too thin: return what there is rather than reaching
  // across the seam. pickDistractors will simply yield fewer options.
  return pool;
}

/**
 * Every candidate in the canon, both Testaments, with no regard for where the
 * question came from, the one pool that is allowed to cross the seam.
 *
 * This exists for the `easy` setting alone (#36). Offering a Pauline epistle
 * against a question about Leviticus is precisely the mismatch the widening
 * rule above was written to prevent, and precisely what makes an easy card
 * easy: the wrong options are wrong on sight.
 */
export function canonPool(extract: (b: Book) => string[], answer: string): string[] {
  return [...new Set(BOOKS.flatMap(extract))].filter((s) => s !== answer);
}

/**
 * The prophets are the one stretch of the canon where a book's summary is the
 * thing worth knowing: seventeen books with overlapping vocabulary, and no
 * narrative spine to hang them on, so "which book is this?" is a real question
 * rather than a recital. Everywhere else the summary questions were noise, and
 * #9 stopped generating them.
 */
export function isPropheticBook(bookId: string): boolean {
  const division = BOOKS_BY_ID[bookId]?.division;
  return division === 'Major Prophets' || division === 'Minor Prophets';
}

/** Chapter totals, useful as a self-check that the data stayed intact. */
export const TOTAL_CHAPTERS = BOOKS.reduce((n, b) => n + b.chapters, 0); // 1189

/**
 * Books within `span` canonical positions of `bookId`, excluding it.
 *
 * Book-order questions are the one place the Testament seam is not the right
 * fence. "Which book immediately follows Malachi?" has a New Testament answer
 * to an Old Testament question, so scoping those options by Testament would
 * make the correct one identifiable without knowing the canon at all. What
 * makes a book-order question hard is *canonical distance*: Ezra against
 * Nehemiah, Esther and Chronicles is a real question; Ezra against Matthew is
 * a free point. So this pool crosses the seam on purpose, and tightens by
 * position instead (#40).
 */
export function neighborBooks(bookId: string, span: number): Book[] {
  const book = BOOKS_BY_ID[bookId];
  if (!book) return [];
  return BOOKS.filter(
    (b) => b.id !== bookId && Math.abs(b.order - book.order) <= span,
  );
}

/**
 * Books at least `span` canonical positions away from `bookId`, the mirror of
 * `neighborBooks`, and what makes an easy book-order question easy: every wrong
 * option sits in a different stretch of the canon entirely.
 */
export function distantBooks(bookId: string, span: number): Book[] {
  const book = BOOKS_BY_ID[bookId];
  if (!book) return BOOKS;
  return BOOKS.filter((b) => b.id !== bookId && Math.abs(b.order - book.order) > span);
}

/** Every book in the same Testament as `bookId`, excluding it. */
export function sameTestamentBooks(bookId: string): Book[] {
  const book = BOOKS_BY_ID[bookId];
  if (!book) return BOOKS;
  return BOOKS.filter((b) => b.id !== bookId && b.testament === book.testament);
}
