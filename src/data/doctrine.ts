import type { EssentialList } from './essentials';

/**
 * The D of ANCHORED (#35): primary doctrine, and where it is found.
 *
 * The drill is the address: given a doctrine, name the landmark reference, and
 * given the reference, name what it anchors. Because every forward answer is a
 * place in scripture, all of these earn the typed bonus round automatically
 * (#14), you name it from memory before the four options appear.
 *
 * Two rules govern the content, and both exist to keep the multiple choice
 * sound. Distractors are drawn from the other references on this list, so:
 *
 *   1. **One landmark reference per doctrine.** Where several verses would do,
 *      the most-cited wins and the rest go in `note`, which is shown after
 *      answering. Nothing is lost; it just is not the answer.
 *   2. **No two entries a single verse could equally answer.** God's love is
 *      John 3:16 and 1 John 4:8-10 is a note, because two entries both "about
 *      God's love" would put one card's right answer among another's wrong
 *      options, the exact fault `validate` gates on. For the same reason the
 *      incarnation is Philippians 2:5-8 rather than John 1:14, which would
 *      collide with Jesus' claim to divinity; and the ascension keeps Acts
 *      1:9-11 while Christ's return takes Revelation 1:7.
 *
 * Scope is deliberately primary doctrine. Predestination and election, the
 * millennium, the timing of the rapture, and the mode or subject of baptism are
 * all left out: they divide Christians who agree on everything above, and a
 * four-option card is the wrong shape for a question the church answers more
 * than one way.
 */
export const DOCTRINE: EssentialList = {
  id: 'doctrine',
  title: 'Primary doctrine, and where to find it',
  source: 'One landmark reference per doctrine, secondary references are in the notes',
  testament: 'NT',
  topic: 'doctrine',
  forward: 'Where do we find verses about {cue}?',
  back: 'Doctrine, what does {what} anchor?',
  groupAsk: 'Doctrine, {cue} belongs under which heading?',
  entries: [
    // ------------------------------------------------ the character of God
    { cue: 'God’s love', what: 'John 3:16', book: 'john', group: 'The character of God', note: 'Also 1 John 4:8-10 ("God is love") and Romans 5:8.' },
    { cue: 'God’s justice', what: 'Deuteronomy 32:4', book: 'deuteronomy', group: 'The character of God', note: '"All his ways are justice." Also Psalm 89:14.' },
    { cue: 'God’s patience', what: '2 Peter 3:9', book: '2-peter', group: 'The character of God', note: 'Not wishing that any should perish. Also Romans 2:4.' },
    { cue: 'God’s holiness', what: 'Isaiah 6:1-5', book: 'isaiah', group: 'The character of God', note: '"Holy, holy, holy." Also Leviticus 19:2; Revelation 4:8.' },
    { cue: 'God’s mercy and compassion', what: 'Psalm 103:8-14', book: 'psalms', group: 'The character of God', note: '"As far as the east is from the west."' },
    { cue: 'God’s faithfulness', what: 'Lamentations 3:22-23', book: 'lamentations', group: 'The character of God', note: 'New every morning; great is your faithfulness.' },
    { cue: 'God’s sovereignty', what: 'Isaiah 46:9-10', book: 'isaiah', group: 'The character of God', note: 'Declaring the end from the beginning. Also Daniel 4:34-35.' },
    { cue: 'God’s omniscience and omnipresence', what: 'Psalm 139:1-12', book: 'psalms', group: 'The character of God' },
    { cue: 'God’s unchangeableness', what: 'Malachi 3:6', book: 'malachi', group: 'The character of God', note: '"I the LORD do not change." Also James 1:17.' },
    { cue: 'God’s wrath against sin', what: 'Romans 1:18', book: 'romans', group: 'The character of God' },
    { cue: 'God’s goodness', what: 'Psalm 34:8', book: 'psalms', group: 'The character of God', note: '"Taste and see that the LORD is good."' },
    { cue: 'God’s jealousy', what: 'Exodus 34:14', book: 'exodus', group: 'The character of God', note: '"The LORD, whose name is Jealous, is a jealous God."' },
    { cue: 'The Trinity', what: '2 Corinthians 13:14', book: '2-corinthians', group: 'The character of God', note: 'Grace, love and fellowship named together. Also Matthew 28:19.' },
    { cue: 'God as Creator', what: 'Genesis 1:1', book: 'genesis', group: 'The character of God', note: 'Also John 1:3 and Colossians 1:16, creation through the Son.' },
    { cue: 'The name I AM', what: 'Exodus 3:14', book: 'exodus', group: 'The character of God', note: 'The name Jesus takes for himself in John 8:58.' },

    // ------------------------------------------------------------ Scripture
    { cue: 'The inspiration of Scripture', what: '2 Timothy 3:16-17', book: '2-timothy', group: 'Scripture', note: 'Breathed out by God and profitable, the classic proof text.' },
    { cue: 'Scripture carried along by the Spirit', what: '2 Peter 1:20-21', book: '2-peter', group: 'Scripture', note: 'No prophecy ever came by the will of man.' },
    { cue: 'The word living and active', what: 'Hebrews 4:12', book: 'hebrews', group: 'Scripture' },
    { cue: 'Scripture as light for the path', what: 'Psalm 119:105', book: 'psalms', group: 'Scripture' },
    { cue: 'Adding nothing and taking nothing away', what: 'Revelation 22:18-19', book: 'revelation', group: 'Scripture', note: 'Also Deuteronomy 4:2.' },

    // --------------------------------------------------------- humanity and sin
    { cue: 'Humanity made in God’s image', what: 'Genesis 1:27', book: 'genesis', group: 'Humanity and sin' },
    { cue: 'The fall', what: 'Genesis 3:1-7', book: 'genesis', group: 'Humanity and sin' },
    { cue: 'All have sinned', what: 'Romans 3:23', book: 'romans', group: 'Humanity and sin' },
    { cue: 'The wages of sin', what: 'Romans 6:23', book: 'romans', group: 'Humanity and sin', note: '"…but the free gift of God is eternal life in Christ Jesus our Lord."' },
    { cue: 'The deceitful heart', what: 'Jeremiah 17:9', book: 'jeremiah', group: 'Humanity and sin' },
    { cue: 'Dead in trespasses', what: 'Ephesians 2:1-3', book: 'ephesians', group: 'Humanity and sin' },
    { cue: 'Sin entering through one man', what: 'Romans 5:12', book: 'romans', group: 'Humanity and sin' },

    // ------------------------------------------------------ the person of Christ
    { cue: 'Jesus’ claim to divinity', what: 'John 8:58', book: 'john', group: 'The person of Christ', note: '"Before Abraham was, I am", they picked up stones. Also John 10:30; 14:9.' },
    { cue: 'The incarnation', what: 'Philippians 2:5-8', book: 'philippians', group: 'The person of Christ', note: 'Emptied himself, taking the form of a servant. Also John 1:14.' },
    { cue: 'The virgin birth', what: 'Isaiah 7:14', book: 'isaiah', group: 'The person of Christ', note: 'Quoted at Matthew 1:22-23; see also Luke 1:35.' },
    { cue: 'Christ’s sinlessness', what: 'Hebrews 4:15', book: 'hebrews', group: 'The person of Christ', note: 'Tempted as we are, yet without sin.' },
    { cue: 'Christ the only way to the Father', what: 'John 14:6', book: 'john', group: 'The person of Christ' },
    { cue: 'Christ’s supremacy over all things', what: 'Colossians 1:15-20', book: 'colossians', group: 'The person of Christ' },

    // -------------------------------------------------------- the work of Christ
    { cue: 'Substitutionary atonement', what: 'Isaiah 53:4-6', book: 'isaiah', group: 'The work of Christ', note: 'Pierced for our transgressions; the LORD laid on him the iniquity of us all.' },
    { cue: 'The great exchange', what: '2 Corinthians 5:21', book: '2-corinthians', group: 'The work of Christ', note: 'He became sin, that we might become the righteousness of God.' },
    { cue: 'Propitiation', what: 'Romans 3:24-26', book: 'romans', group: 'The work of Christ', note: 'Also 1 John 2:2. God is both just and the justifier.' },
    { cue: 'Redemption through his blood', what: 'Ephesians 1:7', book: 'ephesians', group: 'The work of Christ' },
    { cue: 'A ransom for many', what: 'Mark 10:45', book: 'mark', group: 'The work of Christ', note: 'The Son of Man came not to be served but to serve.' },
    { cue: 'The resurrection', what: '1 Corinthians 15:3-8', book: '1-corinthians', group: 'The work of Christ', note: 'The earliest summary of the gospel, with the list of witnesses.' },
    { cue: 'The ascension', what: 'Acts 1:9-11', book: 'acts', group: 'The work of Christ' },
    { cue: 'Christ’s intercession', what: 'Hebrews 7:25', book: 'hebrews', group: 'The work of Christ', note: 'He always lives to make intercession for them.' },

    // ---------------------------------------------------------------- salvation
    { cue: 'Salvation by grace through faith', what: 'Ephesians 2:8-9', book: 'ephesians', group: 'Salvation' },
    { cue: 'Justification by faith', what: 'Romans 5:1', book: 'romans', group: 'Salvation', note: 'Also Romans 3:28 and Galatians 2:16.' },
    { cue: 'The new birth', what: 'John 3:3-7', book: 'john', group: 'Salvation', note: 'Told to Nicodemus at night: "you must be born again."' },
    { cue: 'Repentance', what: 'Acts 3:19', book: 'acts', group: 'Salvation', note: 'Also 2 Corinthians 7:10, godly grief produces repentance.' },
    { cue: 'Confessing and believing', what: 'Romans 10:9-10', book: 'romans', group: 'Salvation' },
    { cue: 'Adoption as sons', what: 'Romans 8:14-17', book: 'romans', group: 'Salvation', note: 'The Spirit of adoption, by whom we cry "Abba! Father!" Also Galatians 4:4-7.' },
    { cue: 'No condemnation', what: 'Romans 8:1', book: 'romans', group: 'Salvation' },
    { cue: 'Nothing can separate us', what: 'Romans 8:38-39', book: 'romans', group: 'Salvation' },
    { cue: 'Kept by the Father’s hand', what: 'John 10:28-29', book: 'john', group: 'Salvation' },
    { cue: 'Faith defined', what: 'Hebrews 11:1', book: 'hebrews', group: 'Salvation', note: 'The assurance of things hoped for, the conviction of things not seen.' },
    { cue: 'Faith without works is dead', what: 'James 2:14-17', book: 'james', group: 'Salvation' },
    { cue: 'Forgiveness on confession', what: '1 John 1:9', book: '1-john', group: 'Salvation' },
    { cue: 'Not by works of righteousness', what: 'Titus 3:5', book: 'titus', group: 'Salvation', note: 'He saved us by the washing of regeneration and renewal of the Holy Spirit.' },

    // ----------------------------------------------------------- the Holy Spirit
    { cue: 'The Spirit’s indwelling', what: '1 Corinthians 6:19-20', book: '1-corinthians', group: 'The Holy Spirit', note: 'Your body is a temple. Also Romans 8:9.' },
    { cue: 'The Helper who teaches and reminds', what: 'John 14:26', book: 'john', group: 'The Holy Spirit', note: 'Also John 16:13, he will guide you into all the truth.' },
    { cue: 'The Spirit convicting the world', what: 'John 16:8', book: 'john', group: 'The Holy Spirit', note: 'Concerning sin, righteousness and judgment.' },
    { cue: 'Being filled with the Spirit', what: 'Ephesians 5:18', book: 'ephesians', group: 'The Holy Spirit' },
    { cue: 'Sealed with the Spirit', what: 'Ephesians 1:13-14', book: 'ephesians', group: 'The Holy Spirit', note: 'The guarantee of our inheritance.' },
    { cue: 'The fruit of the Spirit', what: 'Galatians 5:22-23', book: 'galatians', group: 'The Holy Spirit' },
    { cue: 'Spiritual gifts', what: '1 Corinthians 12:4-11', book: '1-corinthians', group: 'The Holy Spirit', note: 'Also Romans 12:6-8 and Ephesians 4:11.' },
    { cue: 'The Spirit interceding for us', what: 'Romans 8:26-27', book: 'romans', group: 'The Holy Spirit', note: 'With groanings too deep for words.' },

    // --------------------------------------------------------------- the church
    { cue: 'The body of Christ', what: 'Romans 12:4-5', book: 'romans', group: 'The church', note: 'Also 1 Corinthians 12:12-27.' },
    { cue: 'Gifts given to build the body', what: 'Ephesians 4:11-16', book: 'ephesians', group: 'The church', note: 'To equip the saints for the work of ministry.' },
    { cue: 'Baptism into Christ’s death', what: 'Romans 6:3-4', book: 'romans', group: 'The church', note: 'Buried with him, raised to walk in newness of life.' },
    { cue: 'The Lord’s Supper', what: '1 Corinthians 11:23-26', book: '1-corinthians', group: 'The church', note: 'You proclaim the Lord’s death until he comes.' },
    { cue: 'Qualifications for overseers', what: '1 Timothy 3:1-7', book: '1-timothy', group: 'The church' },
    { cue: 'Not neglecting to meet together', what: 'Hebrews 10:24-25', book: 'hebrews', group: 'The church' },
    { cue: 'A royal priesthood', what: '1 Peter 2:9', book: '1-peter', group: 'The church' },
    { cue: 'Church discipline', what: 'Matthew 18:15-17', book: 'matthew', group: 'The church' },

    // -------------------------------------------------------- the Christian life
    { cue: 'Sanctification', what: '1 Thessalonians 4:3-7', book: '1-thessalonians', group: 'The Christian life', note: 'Also Hebrews 12:14 and 2 Corinthians 3:18, from one degree of glory to another.' },
    { cue: 'The will of God', what: 'Romans 12:1-2', book: 'romans', group: 'The Christian life', note: 'Renewed minds that discern it. Also 1 Thessalonians 5:16-18.' },
    { cue: 'Taking up your cross daily', what: 'Luke 9:23', book: 'luke', group: 'The Christian life' },
    { cue: 'The greatest commandment', what: 'Matthew 22:37-39', book: 'matthew', group: 'The Christian life' },
    { cue: 'Loving one another', what: 'John 13:34-35', book: 'john', group: 'The Christian life', note: 'By this all people will know you are my disciples.' },
    { cue: 'Prayer and the peace of God', what: 'Philippians 4:6-7', book: 'philippians', group: 'The Christian life' },
    { cue: 'The Lord’s Prayer', what: 'Matthew 6:9-13', book: 'matthew', group: 'The Christian life' },
    { cue: 'Suffering producing character', what: 'Romans 5:3-5', book: 'romans', group: 'The Christian life', note: 'Also James 1:2-4.' },
    { cue: 'The way of escape in temptation', what: '1 Corinthians 10:13', book: '1-corinthians', group: 'The Christian life' },
    { cue: 'The armor of God', what: 'Ephesians 6:10-18', book: 'ephesians', group: 'The Christian life' },
    { cue: 'Humility toward others', what: 'Philippians 2:3-4', book: 'philippians', group: 'The Christian life' },
    { cue: 'Contentment and strength', what: 'Philippians 4:11-13', book: 'philippians', group: 'The Christian life', note: 'The "all things" of verse 13 is contentment in plenty and want.' },
    { cue: 'Working as for the Lord', what: 'Colossians 3:23-24', book: 'colossians', group: 'The Christian life' },
    { cue: 'Generosity', what: '2 Corinthians 9:6-8', book: '2-corinthians', group: 'The Christian life', note: 'God loves a cheerful giver.' },
    { cue: 'Taming the tongue', what: 'James 3:5-10', book: 'james', group: 'The Christian life' },
    { cue: 'Marriage', what: 'Ephesians 5:22-33', book: 'ephesians', group: 'The Christian life', note: 'Also Genesis 2:24, which Paul is quoting.' },

    // --------------------------------------------------- God’s heart for the lost
    { cue: 'God’s heart toward the lost', what: 'Luke 15:4-7', book: 'luke', group: 'God’s heart for the lost', note: 'The lost sheep, opening the chapter that ends with the prodigal. Also Ezekiel 33:11 and 1 Timothy 2:3-4.' },
    { cue: 'Compassion on the crowds', what: 'Matthew 9:36-38', book: 'matthew', group: 'God’s heart for the lost', note: 'Harassed and helpless, like sheep without a shepherd.' },
    { cue: 'Coming to seek and save the lost', what: 'Luke 19:10', book: 'luke', group: 'God’s heart for the lost', note: 'Said over Zacchaeus.' },
    { cue: 'The Great Commission', what: 'Matthew 28:18-20', book: 'matthew', group: 'God’s heart for the lost' },
    { cue: 'Witnesses to the ends of the earth', what: 'Acts 1:8', book: 'acts', group: 'God’s heart for the lost', note: 'Jerusalem, Judea, Samaria, the end of the earth, the outline of Acts.' },
    { cue: 'The power of the gospel', what: 'Romans 1:16-17', book: 'romans', group: 'God’s heart for the lost' },
    { cue: 'How will they hear', what: 'Romans 10:14-15', book: 'romans', group: 'God’s heart for the lost' },
    { cue: 'Ambassadors of reconciliation', what: '2 Corinthians 5:18-20', book: '2-corinthians', group: 'God’s heart for the lost' },
    { cue: 'Always ready to give a defense', what: '1 Peter 3:15', book: '1-peter', group: 'God’s heart for the lost' },

    // -------------------------------------------------------------- last things
    { cue: 'Christ’s bodily return', what: 'Revelation 1:7', book: 'revelation', group: 'Last things', note: 'Also Titus 2:13 and Acts 1:11.' },
    { cue: 'The resurrection of believers', what: '1 Thessalonians 4:16-17', book: '1-thessalonians', group: 'Last things' },
    { cue: 'Raised imperishable', what: '1 Corinthians 15:51-52', book: '1-corinthians', group: 'Last things', note: 'In a moment, in the twinkling of an eye.' },
    { cue: 'Appointed once to die, then judgment', what: 'Hebrews 9:27', book: 'hebrews', group: 'Last things' },
    { cue: 'The judgment seat of Christ', what: '2 Corinthians 5:10', book: '2-corinthians', group: 'Last things' },
    { cue: 'The great white throne', what: 'Revelation 20:11-15', book: 'revelation', group: 'Last things' },
    { cue: 'A new heaven and a new earth', what: 'Revelation 21:1-4', book: 'revelation', group: 'Last things', note: 'He will wipe away every tear.' },
  ],
};
