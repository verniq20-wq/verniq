/**
 * Starter glossary: Hindi ↔ English words a primary classroom uses every day,
 * with the students'-language word where one has been collected.
 *
 * IMPORTANT: every tribal-language word here is marked `unverified`. They are
 * starting points gathered from general Munda-language references and must be
 * checked by native speakers. Teachers correct and extend the glossary in the
 * app; their entries (status `teacher`) always take priority.
 *
 * Coverage today:
 *  - Ho: ~90 words gathered from general Munda-language references.
 *  - Mundari: ~97 words. The original ~40 came from general Munda-language
 *    references (close enough to Ho — both Kherwarian/North Munda — that a
 *    shared starting list was defensible); ~57 more were added afterwards
 *    from a real dictionary the user supplied, Manindra Bhusan Bhaduri's "A
 *    Mundari-English Dictionary" (Calcutta University Press, 1931), via its
 *    archive.org scan (archive.org/details/dli.calcutta.10338). Every added
 *    word was a standalone headword found in that OCR text, not recalled
 *    from memory. Two entries are inferred rather than directly defined:
 *    "big" (मरांग / Marang) and "look" (नेल / Nel) aren't given their own
 *    headword line, but both roots recur consistently across several
 *    compound entries with the same meaning (e.g. "Marang-o — to be great",
 *    "Marang-mocha — to make a big mouth"; "Nenel — reduplication of Nel; to
 *    look"), which is corroborating enough to include — flagged here so a
 *    reviewer knows which two rows to double-check first. Reassuringly, many
 *    of the newly-added words came out identical or near-identical to Ho's
 *    already-listed word for the same concept (तिसिंग/today, गापा/tomorrow,
 *    दुब/sit, ओल/write, चिकन/what, बानो/no, and others) — independent
 *    confirmation that both lists are on the right track.
 *  - Santali: numbers 1-10 and the greeting "Johar" only, in Ol Chiki, each
 *    cross-checked against Omniglot/Wikipedia/Glosbe rather than typed from
 *    memory. Santali has plenty of everyday-vocabulary references too, but
 *    this pass only had time to verify the numerals and one greeting against
 *    a real source — better a short, checked list than a longer guessed one.
 *  - Kurukh: ~50 words (numbers, family, body parts, animals, nature,
 *    colours, a few actions, "what"/"where", "small") drawn from Rev. Ferd.
 *    Hahn's "Kurukh-English Dictionary" (Bengal Secretariat Press, Calcutta,
 *    1903), a real reference the user supplied via its archive.org scan
 *    (archive.org/details/dli.ministry.03572). Every word below was located
 *    as a standalone headword in that dictionary's OCR text, not recalled
 *    from memory; a couple of clear OCR errors were corrected against
 *    corroborating context (e.g. "five" printed as "Paficé" is corrected to
 *    "Pancé" — the multiples-of-ten entry "Pandoy, fifty" confirms the root
 *    is "Pan-", and "fi" for a nasalized vowel is a common Tesseract
 *    misread). Where the source gave two forms for a numeral (Kurukh marks
 *    grammatical class — e.g. "Naib" for four men vs "Nakh" neutral), the
 *    neutral/general form was kept to match how every other language's
 *    numeral row here is a plain unmarked cardinal. "Johar" (hello) isn't in
 *    the 1903 dictionary; it's added on the same basis as Ho/Mundari/Santali
 *    because it's the common cross-community greeting used by Oraon (Kurukh)
 *    people too, per Wikipedia's "Kurukh people" article and other current
 *    sources on Jharkhand tribal greetings. IMPORTANT — script: Hahn's
 *    dictionary romanises Kurukh (Latin letters with diacritics). The app's
 *    language list notes Kurukh can be written in Devanagari, but turning
 *    this Roman source into Devanagari spelling correctly needs a native
 *    speaker's judgement calls this pass couldn't make responsibly, so these
 *    entries are stored in the source's Roman transliteration rather than a
 *    guessed Devanagari rendering — teachers can supply the Devanagari form
 *    from the Words screen when they review these.
 *
 * Gondi and Bhili have none yet. Gondi is Dravidian and Bhili is Indo-Aryan,
 * and a search for reliable open vocabulary lists for either came back with
 * only a handful of isolated words (not even enough to seed the number
 * category), so nothing was added rather than guess. Teachers (or a
 * community word-collection drive, see docs/HO-WORD-COLLECTION.md) build
 * those out from the Words screen instead — `seedGlossary` already supports
 * any language the moment it has an entry in the word maps below.
 */
import type { GlossaryCategory, GlossaryEntry, LanguageCode, PictureKey } from './types';

/** Tribal languages with a starter word list today. Add a key here + fill in BASE to cover another one. */
type SeededTribalLanguage = 'ho' | 'mun' | 'sat' | 'kru';

interface BaseWord {
  hi: string;
  en: string;
  cat: GlossaryCategory;
  pic?: PictureKey;
  value?: number;
  /** Starter word per tribal language (Devanagari for Ho/Mundari, Ol Chiki for Santali, Roman transliteration for Kurukh — see file header), when collected. */
  words?: Partial<Record<SeededTribalLanguage, string>>;
}

const BASE: BaseWord[] = [
  // Numbers
  { hi: 'एक', en: 'one', cat: 'number', value: 1, words: { ho: 'मियद', mun: 'मिया', sat: 'ᱢᱤᱫ', kru: 'On' } },
  { hi: 'दो', en: 'two', cat: 'number', value: 2, words: { ho: 'बरिया', mun: 'बारिया', sat: 'ᱵᱟᱨ', kru: 'Jind' } },
  { hi: 'तीन', en: 'three', cat: 'number', value: 3, words: { ho: 'आपिया', mun: 'अपिया', sat: 'ᱯᱮ', kru: 'Mand' } },
  { hi: 'चार', en: 'four', cat: 'number', value: 4, words: { ho: 'उपुनिया', mun: 'उपुनिया', sat: 'ᱯᱩᱱ', kru: 'Nakh' } },
  { hi: 'पाँच', en: 'five', cat: 'number', value: 5, words: { ho: 'मोंड़ेया', mun: 'मोनेया', sat: 'ᱢᱚᱬᱮ', kru: 'Pancé' } },
  { hi: 'छह', en: 'six', cat: 'number', value: 6, words: { ho: 'तुरुइया', mun: 'तुरुइया', sat: 'ᱛᱩᱨᱩᱭ', kru: 'Soyé' } },
  { hi: 'सात', en: 'seven', cat: 'number', value: 7, words: { ho: 'एया', mun: 'एया', sat: 'ᱮᱭᱟᱭ', kru: 'Sayyé' } },
  { hi: 'आठ', en: 'eight', cat: 'number', value: 8, words: { ho: 'इरिलिया', mun: 'इरालिया', sat: 'ᱤᱨᱟᱹᱞ', kru: 'Akhé' } },
  { hi: 'नौ', en: 'nine', cat: 'number', value: 9, words: { ho: 'आरेया', mun: 'अरेया', sat: 'ᱟᱨᱮ', kru: 'Nayé' } },
  { hi: 'दस', en: 'ten', cat: 'number', value: 10, words: { ho: 'गेलेया', mun: 'गेलेया', sat: 'ᱜᱮᱞ', kru: 'Doy' } },
  { hi: 'संख्या', en: 'number', cat: 'number' },
  { hi: 'गिनती', en: 'counting', cat: 'number' },

  // Animals
  { hi: 'कुत्ता', en: 'dog', cat: 'animal', pic: 'dog', words: { ho: 'सेता', mun: 'सेता', kru: 'Alla' } },
  { hi: 'बिल्ली', en: 'cat', cat: 'animal', pic: 'cat', words: { ho: 'पुसि', mun: 'पुसी', kru: 'Berkha' } },
  { hi: 'गाय', en: 'cow', cat: 'animal', pic: 'cow', words: { mun: 'गाई' } },
  { hi: 'घोड़ा', en: 'horse', cat: 'animal', pic: 'horse', words: { ho: 'सादोम', mun: 'सादोम', kru: 'Ghoro' } },
  { hi: 'बकरी', en: 'goat', cat: 'animal', words: { ho: 'मेरोम', mun: 'मेरोम' } },
  { hi: 'मुर्गी', en: 'hen', cat: 'animal', words: { ho: 'सिम', mun: 'सिम' } },
  { hi: 'चिड़िया', en: 'bird', cat: 'animal', pic: 'bird', words: { ho: 'चेरेक', mun: 'चेरेक', kru: 'Ora' } },
  { hi: 'मछली', en: 'fish', cat: 'animal', pic: 'fish', words: { ho: 'हाकू', mun: 'हाकू' } },
  { hi: 'खरगोश', en: 'rabbit', cat: 'animal', pic: 'rabbit', words: { ho: 'कुलै', mun: 'कुलै', kru: 'Miia' } },
  { hi: 'तितली', en: 'butterfly', cat: 'animal', pic: 'butterfly' },
  { hi: 'कीड़ा', en: 'insect', cat: 'animal', pic: 'beetle' },
  { hi: 'हाथी', en: 'elephant', cat: 'animal', words: { ho: 'हाती', mun: 'हाती', kru: 'Foto' } },
  { hi: 'बाघ', en: 'tiger', cat: 'animal', words: { ho: 'कुला', mun: 'कुला', kru: 'Lakra' } },
  { hi: 'जानवर', en: 'animal', cat: 'animal', words: { ho: 'जानोर' } },

  // Nature
  { hi: 'पानी', en: 'water', cat: 'nature', pic: 'drop', words: { ho: 'दाः', mun: 'दा', kru: 'Amm' } },
  { hi: 'सूरज', en: 'sun', cat: 'nature', pic: 'sun', words: { ho: 'सिङगि', mun: 'सिंगी', kru: 'Biri' } },
  { hi: 'चाँद', en: 'moon', cat: 'nature', pic: 'moon', words: { ho: 'चांडु', mun: 'चांदो', kru: 'Candi' } },
  { hi: 'तारा', en: 'star', cat: 'nature', pic: 'star', words: { ho: 'इपिल', mun: 'इपिल', kru: 'Binks' } },
  { hi: 'पेड़', en: 'tree', cat: 'nature', pic: 'tree', words: { ho: 'दारु', mun: 'दारु', kru: 'Mann' } },
  { hi: 'फूल', en: 'flower', cat: 'nature', pic: 'flower', words: { ho: 'बा', mun: 'बा', kru: 'Pimp' } },
  { hi: 'पत्ता', en: 'leaf', cat: 'nature', pic: 'leaf', words: { ho: 'सकम', mun: 'सकम', kru: 'Atkha' } },
  { hi: 'पौधा', en: 'plant', cat: 'nature', pic: 'plant' },
  { hi: 'पत्थर', en: 'stone', cat: 'nature', words: { ho: 'दिरि', mun: 'दिरि', kru: 'Pakhna' } },
  { hi: 'बादल', en: 'cloud', cat: 'nature', pic: 'cloud', words: { kru: 'Badali' } },
  { hi: 'बारिश', en: 'rain', cat: 'nature', pic: 'rain', words: { ho: 'दाःसेनेम', mun: 'एसेल', kru: 'Thari' } },
  { hi: 'पहाड़', en: 'hill', cat: 'nature', pic: 'mountain', words: { ho: 'बुरु', mun: 'बुरु' } },
  { hi: 'नदी', en: 'river', cat: 'nature', words: { ho: 'गारा' } },
  { hi: 'मिट्टी', en: 'soil', cat: 'nature', words: { ho: 'हासा', mun: 'हासा' } },

  // Body
  { hi: 'हाथ', en: 'hand', cat: 'body', pic: 'hand', words: { ho: 'ती', mun: 'ती', kru: 'Khekkha' } },
  { hi: 'आँख', en: 'eye', cat: 'body', pic: 'eye', words: { ho: 'मेद', mun: 'मेद', kru: 'Khan' } },
  { hi: 'कान', en: 'ear', cat: 'body', pic: 'ear', words: { ho: 'लुतुर', mun: 'लुतुर', kru: 'Khebda' } },
  { hi: 'पैर', en: 'foot', cat: 'body', pic: 'foot', words: { ho: 'काटा', mun: 'जांग', kru: 'Khedd' } },
  { hi: 'दाँत', en: 'tooth', cat: 'body', pic: 'tooth', words: { ho: 'दाता', mun: 'दाता', kru: 'Pall' } },
  { hi: 'दिल', en: 'heart', cat: 'body', pic: 'heart', words: { ho: 'मोन', mun: 'बुका' } },
  { hi: 'सिर', en: 'head', cat: 'body', words: { ho: 'बोः', mun: 'बो', kru: 'Kukk' } },
  { hi: 'नाक', en: 'nose', cat: 'body', words: { ho: 'मूः', mun: 'मू', kru: 'Mui' } },
  { hi: 'मुँह', en: 'mouth', cat: 'body', words: { ho: 'मोचा', mun: 'थोतना' } },
  { hi: 'उँगली', en: 'finger', cat: 'body', words: { ho: 'तिकेद', mun: 'डाको' } },

  // Family & people
  { hi: 'माँ', en: 'mother', cat: 'family', words: { ho: 'एंगा', mun: 'एंगा', kru: 'Ayo' } },
  { hi: 'पिता', en: 'father', cat: 'family', words: { ho: 'आपु', mun: 'आपू', kru: 'Abbi' } },
  { hi: 'भाई', en: 'brother', cat: 'family', words: { ho: 'दादा', mun: 'हागा' } },
  { hi: 'बहन', en: 'sister', cat: 'family', words: { ho: 'मिसि', mun: 'मिसि' } },
  { hi: 'दादी', en: 'grandmother', cat: 'family', words: { mun: 'जिंग', kru: 'Aji' } },
  { hi: 'दादा', en: 'grandfather', cat: 'family', words: { kru: 'Aja' } },
  { hi: 'बच्चा', en: 'child', cat: 'family', pic: 'baby', words: { ho: 'होन', mun: 'होन' } },
  { hi: 'परिवार', en: 'family', cat: 'family', pic: 'family' },
  { hi: 'दोस्त', en: 'friend', cat: 'family', pic: 'person', words: { ho: 'गाती', mun: 'गाती', kru: 'Jiiri' } },
  { hi: 'घर', en: 'house', cat: 'place', pic: 'house', words: { ho: 'ओड़ाः', mun: 'ओड़ा' } },
  { hi: 'गाँव', en: 'village', cat: 'place', words: { ho: 'आतु', mun: 'हातु', kru: 'Padda' } },
  { hi: 'विद्यालय', en: 'school', cat: 'place', words: { mun: 'इस्कुल' } },
  { hi: 'खेत', en: 'field', cat: 'place', words: { ho: 'ओते', mun: 'ओते', kru: 'Khal' } },

  // Food
  { hi: 'भात', en: 'rice', cat: 'food', pic: 'rice', words: { ho: 'मंडी', mun: 'मांडी' } },
  { hi: 'रोटी', en: 'bread', cat: 'food', pic: 'bread', words: { mun: 'लाद' } },
  { hi: 'अंडा', en: 'egg', cat: 'food', pic: 'egg', words: { ho: 'बिलि' } },
  { hi: 'संतरा', en: 'orange', cat: 'food', pic: 'orange' },
  { hi: 'गाजर', en: 'carrot', cat: 'food', pic: 'carrot' },
  { hi: 'दूध', en: 'milk', cat: 'food', words: { ho: 'तित', mun: 'टोआ' } },
  { hi: 'फल', en: 'fruit', cat: 'food', words: { ho: 'जोम', mun: 'जो' } },
  { hi: 'सब्ज़ी', en: 'vegetable', cat: 'food', words: { mun: 'उतु' } },
  { hi: 'खाना', en: 'food', cat: 'food', words: { ho: 'जोमाक', mun: 'चारा' } },

  // Classroom
  { hi: 'किताब', en: 'book', cat: 'classroom', pic: 'book', words: { mun: 'पुथी' } },
  { hi: 'पेंसिल', en: 'pencil', cat: 'classroom', pic: 'pencil' },
  { hi: 'गेंद', en: 'ball', cat: 'classroom', pic: 'ball', words: { mun: 'गुली' } },
  { hi: 'स्लेट', en: 'slate', cat: 'classroom', words: { mun: 'सिलोट' } },
  { hi: 'कक्षा', en: 'class', cat: 'classroom' },
  { hi: 'शिक्षक', en: 'teacher', cat: 'classroom', pic: 'person', words: { mun: 'गुरु' } },
  { hi: 'चित्र', en: 'picture', cat: 'classroom' },
  { hi: 'शब्द', en: 'word', cat: 'classroom', words: { ho: 'जगर' } },
  { hi: 'अक्षर', en: 'letter', cat: 'classroom', words: { mun: 'हरोप' } },
  { hi: 'कहानी', en: 'story', cat: 'classroom', words: { ho: 'कथा', mun: 'काआनी' } },
  { hi: 'बस', en: 'bus', cat: 'place', pic: 'bus' },
  { hi: 'साइकिल', en: 'bicycle', cat: 'place', pic: 'bicycle' },
  { hi: 'घड़ी', en: 'clock', cat: 'time', pic: 'clock' },
  { hi: 'सिक्के', en: 'coins', cat: 'classroom', pic: 'coins' },

  // Shapes & describing
  { hi: 'गोला', en: 'circle', cat: 'shape', pic: 'circle' },
  { hi: 'त्रिभुज', en: 'triangle', cat: 'shape', pic: 'triangle' },
  { hi: 'वर्ग', en: 'square', cat: 'shape', pic: 'square' },
  { hi: 'बड़ा', en: 'big', cat: 'describing', words: { ho: 'महान', mun: 'मरांग' } },
  { hi: 'छोटा', en: 'small', cat: 'describing', words: { ho: 'हुडिंग', mun: 'हुरिंग', kru: 'Sanni' } },
  { hi: 'ज़्यादा', en: 'more', cat: 'describing' },
  { hi: 'कम', en: 'less', cat: 'describing' },
  { hi: 'लंबा', en: 'long', cat: 'describing', words: { mun: 'जिलिंग' } },
  { hi: 'भारी', en: 'heavy', cat: 'describing', words: { mun: 'हंबल' } },

  // Colours
  { hi: 'लाल', en: 'red', cat: 'colour', words: { ho: 'आराह', mun: 'आरा', kru: 'Kharua' } },
  { hi: 'हरा', en: 'green', cat: 'colour', words: { mun: 'बेरेल', kru: 'Tariyaz' } },
  { hi: 'पीला', en: 'yellow', cat: 'colour', words: { mun: 'ससांगरांग', kru: 'Balko' } },
  { hi: 'नीला', en: 'blue', cat: 'colour', words: { mun: 'लील' } },
  { hi: 'सफ़ेद', en: 'white', cat: 'colour', words: { ho: 'पुंडि', mun: 'पुंडी', kru: 'Pandrii' } },
  { hi: 'काला', en: 'black', cat: 'colour', words: { ho: 'हेंदे', mun: 'हेंदे' } },

  // Time
  { hi: 'आज', en: 'today', cat: 'time', words: { ho: 'तिसिंग', mun: 'तिसिंग' } },
  { hi: 'कल', en: 'tomorrow', cat: 'time', words: { ho: 'गापा', mun: 'गापा' } },
  { hi: 'सुबह', en: 'morning', cat: 'time', words: { ho: 'एतोहोब', mun: 'इदांग' } },
  { hi: 'रात', en: 'night', cat: 'time', words: { ho: 'निदा', mun: 'निदामेद्' } },
  { hi: 'दिन', en: 'day', cat: 'time', words: { ho: 'सिङगि', mun: 'सिंगी' } },

  // Actions
  { hi: 'आओ', en: 'come', cat: 'action', words: { ho: 'हिजू', kru: 'Barna' } },
  { hi: 'जाओ', en: 'go', cat: 'action', words: { ho: 'सेन', mun: 'सेन' } },
  { hi: 'देखो', en: 'look', cat: 'action', words: { ho: 'नेल', mun: 'नेल' } },
  { hi: 'सुनो', en: 'listen', cat: 'action', words: { ho: 'आयूम', mun: 'आयूम', kru: "Sarka'and" } },
  { hi: 'बोलो', en: 'speak', cat: 'action', words: { ho: 'काजी', mun: 'काजी' } },
  { hi: 'गिनो', en: 'count', cat: 'action', words: { ho: 'रेहोन', mun: 'लेका' } },
  { hi: 'लिखो', en: 'write', cat: 'action', words: { ho: 'ओल', mun: 'ओल', kru: 'Tiidna' } },
  { hi: 'पढ़ो', en: 'read', cat: 'action', words: { ho: 'पाढ़ाओ', mun: 'पढ़ाओ', kru: 'Parhna' } },
  { hi: 'बैठो', en: 'sit', cat: 'action', words: { ho: 'दुब', mun: 'दुब' } },
  { hi: 'खड़े हो', en: 'stand up', cat: 'action', words: { ho: 'तिंगु', mun: 'तिंगु-होपोर' } },
  { hi: 'दिखाओ', en: 'show', cat: 'action', words: { ho: 'उदुब', mun: 'उदुब' } },
  { hi: 'खेलो', en: 'play', cat: 'action', words: { ho: 'एने', mun: 'इनुंग' } },
  { hi: 'मिलाओ', en: 'match', cat: 'action' },
  { hi: 'बनाओ', en: 'make', cat: 'action', words: { ho: 'बना' } },
  { hi: 'ताली बजाओ', en: 'clap', cat: 'action' },

  // Greetings & questions
  { hi: 'नमस्ते', en: 'hello', cat: 'greeting', words: { ho: 'जोहार', mun: 'जोहार', sat: 'ᱡᱚᱦᱟᱨ', kru: 'Johar' } },
  { hi: 'धन्यवाद', en: 'thank you', cat: 'greeting' },
  { hi: 'बहुत अच्छा', en: 'very good', cat: 'greeting', words: { ho: 'बुगिन' } },
  { hi: 'हाँ', en: 'yes', cat: 'greeting', words: { ho: 'हे', mun: 'हे' } },
  { hi: 'नहीं', en: 'no', cat: 'greeting', words: { ho: 'बानो', mun: 'बानो' } },
  { hi: 'क्या', en: 'what', cat: 'question', words: { ho: 'चिकन', mun: 'चिकन', kru: 'Endra' } },
  { hi: 'कितने', en: 'how many', cat: 'question', words: { ho: 'चिमिन', mun: 'चिमिन' } },
  { hi: 'कहाँ', en: 'where', cat: 'question', words: { ho: 'कोड़ो', kru: 'Eksan' } },
  { hi: 'कौन', en: 'who', cat: 'question', words: { ho: 'ओकोए', mun: 'ओकोए' } },
];

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/** Starter glossary for a language. Only languages listed in SeededTribalLanguage (currently Ho, Mundari, Santali, Kurukh) have collected words so far. */
export function seedGlossary(language: LanguageCode): GlossaryEntry[] {
  const seeded = language as SeededTribalLanguage;
  return BASE.map((w) => ({
    id: `seed-${language}-${slug(w.en)}`,
    language,
    hindi: w.hi,
    english: w.en,
    target: language === 'hi' ? w.hi : language === 'en' ? w.en : (w.words?.[seeded] ?? ''),
    category: w.cat,
    picture: w.pic,
    value: w.value,
    status: 'unverified' as const,
  }));
}

/**
 * Merge the starter glossary with the teacher's own entries. Teacher entries
 * replace starter entries with the same Hindi word.
 */
export function mergeGlossary(language: LanguageCode, teacherEntries: GlossaryEntry[]): GlossaryEntry[] {
  const own = teacherEntries.filter((e) => e.language === language);
  const byHindi = new Map(own.map((e) => [e.hindi.trim(), e]));
  const merged = seedGlossary(language).map((s) => byHindi.get(s.hindi) ?? s);
  const seedHindi = new Set(merged.map((e) => e.hindi));
  return [...merged, ...own.filter((e) => !seedHindi.has(e.hindi.trim()))];
}
