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
 *  - Ho and Mundari (both Kherwarian/North Munda languages, close enough in
 *    basic vocabulary — numerals, kinship terms, body parts, common nouns —
 *    that a shared starting list is defensible).
 *  - Santali: numbers 1-10 and the greeting "Johar" only, in Ol Chiki, each
 *    cross-checked against Omniglot/Wikipedia/Glosbe rather than typed from
 *    memory. Santali has plenty of everyday-vocabulary references too, but
 *    this pass only had time to verify the numerals and one greeting against
 *    a real source — better a short, checked list than a longer guessed one.
 *
 * Kurukh, Gondi and Bhili have none yet. Kurukh and Gondi are Dravidian and
 * Bhili is Indo-Aryan — different families from Ho/Mundari/Santali entirely
 * — and a search for reliable open vocabulary lists for them came back with
 * only a handful of isolated words (not even enough to seed the number
 * category), so nothing was added rather than guess. Teachers (or a
 * community word-collection drive, see docs/HO-WORD-COLLECTION.md) build
 * those out from the Words screen instead — `seedGlossary` already supports
 * any language the moment it has an entry in the word maps below.
 */
import type { GlossaryCategory, GlossaryEntry, LanguageCode, PictureKey } from './types';

/** Tribal languages with a starter word list today. Add a key here + fill in BASE to cover another one. */
type SeededTribalLanguage = 'ho' | 'mun' | 'sat';

interface BaseWord {
  hi: string;
  en: string;
  cat: GlossaryCategory;
  pic?: PictureKey;
  value?: number;
  /** Starter word per tribal language (Devanagari for Ho/Mundari, Ol Chiki for Santali), when collected. */
  words?: Partial<Record<SeededTribalLanguage, string>>;
}

const BASE: BaseWord[] = [
  // Numbers
  { hi: 'एक', en: 'one', cat: 'number', value: 1, words: { ho: 'मियद', mun: 'मिया', sat: 'ᱢᱤᱫ' } },
  { hi: 'दो', en: 'two', cat: 'number', value: 2, words: { ho: 'बरिया', mun: 'बारिया', sat: 'ᱵᱟᱨ' } },
  { hi: 'तीन', en: 'three', cat: 'number', value: 3, words: { ho: 'आपिया', mun: 'अपिया', sat: 'ᱯᱮ' } },
  { hi: 'चार', en: 'four', cat: 'number', value: 4, words: { ho: 'उपुनिया', mun: 'उपुनिया', sat: 'ᱯᱩᱱ' } },
  { hi: 'पाँच', en: 'five', cat: 'number', value: 5, words: { ho: 'मोंड़ेया', mun: 'मोनेया', sat: 'ᱢᱚᱬᱮ' } },
  { hi: 'छह', en: 'six', cat: 'number', value: 6, words: { ho: 'तुरुइया', mun: 'तुरुइया', sat: 'ᱛᱩᱨᱩᱭ' } },
  { hi: 'सात', en: 'seven', cat: 'number', value: 7, words: { ho: 'एया', mun: 'एया', sat: 'ᱮᱭᱟᱭ' } },
  { hi: 'आठ', en: 'eight', cat: 'number', value: 8, words: { ho: 'इरिलिया', mun: 'इरालिया', sat: 'ᱤᱨᱟᱹᱞ' } },
  { hi: 'नौ', en: 'nine', cat: 'number', value: 9, words: { ho: 'आरेया', mun: 'अरेया', sat: 'ᱟᱨᱮ' } },
  { hi: 'दस', en: 'ten', cat: 'number', value: 10, words: { ho: 'गेलेया', mun: 'गेलेया', sat: 'ᱜᱮᱞ' } },
  { hi: 'संख्या', en: 'number', cat: 'number' },
  { hi: 'गिनती', en: 'counting', cat: 'number' },

  // Animals
  { hi: 'कुत्ता', en: 'dog', cat: 'animal', pic: 'dog', words: { ho: 'सेता', mun: 'सेता' } },
  { hi: 'बिल्ली', en: 'cat', cat: 'animal', pic: 'cat', words: { ho: 'पुसि', mun: 'पुसी' } },
  { hi: 'गाय', en: 'cow', cat: 'animal', pic: 'cow', words: { mun: 'गाई' } },
  { hi: 'घोड़ा', en: 'horse', cat: 'animal', pic: 'horse', words: { ho: 'सादोम', mun: 'सादोम' } },
  { hi: 'बकरी', en: 'goat', cat: 'animal', words: { ho: 'मेरोम', mun: 'मेरोम' } },
  { hi: 'मुर्गी', en: 'hen', cat: 'animal', words: { ho: 'सिम', mun: 'सिम' } },
  { hi: 'चिड़िया', en: 'bird', cat: 'animal', pic: 'bird', words: { ho: 'चेरेक', mun: 'चेरेक' } },
  { hi: 'मछली', en: 'fish', cat: 'animal', pic: 'fish', words: { ho: 'हाकू', mun: 'हाकू' } },
  { hi: 'खरगोश', en: 'rabbit', cat: 'animal', pic: 'rabbit', words: { ho: 'कुलै' } },
  { hi: 'तितली', en: 'butterfly', cat: 'animal', pic: 'butterfly' },
  { hi: 'कीड़ा', en: 'insect', cat: 'animal', pic: 'beetle' },
  { hi: 'हाथी', en: 'elephant', cat: 'animal', words: { ho: 'हाती', mun: 'हाती' } },
  { hi: 'बाघ', en: 'tiger', cat: 'animal', words: { ho: 'कुला', mun: 'कुला' } },
  { hi: 'जानवर', en: 'animal', cat: 'animal', words: { ho: 'जानोर' } },

  // Nature
  { hi: 'पानी', en: 'water', cat: 'nature', pic: 'drop', words: { ho: 'दाः', mun: 'दा' } },
  { hi: 'सूरज', en: 'sun', cat: 'nature', pic: 'sun', words: { ho: 'सिङगि', mun: 'सिंगी' } },
  { hi: 'चाँद', en: 'moon', cat: 'nature', pic: 'moon', words: { ho: 'चांडु', mun: 'चांदो' } },
  { hi: 'तारा', en: 'star', cat: 'nature', pic: 'star', words: { ho: 'इपिल' } },
  { hi: 'पेड़', en: 'tree', cat: 'nature', pic: 'tree', words: { ho: 'दारु', mun: 'दारु' } },
  { hi: 'फूल', en: 'flower', cat: 'nature', pic: 'flower', words: { ho: 'बा', mun: 'बा' } },
  { hi: 'पत्ता', en: 'leaf', cat: 'nature', pic: 'leaf', words: { ho: 'सकम', mun: 'सकम' } },
  { hi: 'पौधा', en: 'plant', cat: 'nature', pic: 'plant' },
  { hi: 'पत्थर', en: 'stone', cat: 'nature', words: { ho: 'दिरि', mun: 'दिरि' } },
  { hi: 'बादल', en: 'cloud', cat: 'nature', pic: 'cloud' },
  { hi: 'बारिश', en: 'rain', cat: 'nature', pic: 'rain', words: { ho: 'दाःसेनेम' } },
  { hi: 'पहाड़', en: 'hill', cat: 'nature', pic: 'mountain', words: { ho: 'बुरु', mun: 'बुरु' } },
  { hi: 'नदी', en: 'river', cat: 'nature', words: { ho: 'गारा' } },
  { hi: 'मिट्टी', en: 'soil', cat: 'nature', words: { ho: 'हासा' } },

  // Body
  { hi: 'हाथ', en: 'hand', cat: 'body', pic: 'hand', words: { ho: 'ती', mun: 'ती' } },
  { hi: 'आँख', en: 'eye', cat: 'body', pic: 'eye', words: { ho: 'मेद', mun: 'मेद' } },
  { hi: 'कान', en: 'ear', cat: 'body', pic: 'ear', words: { ho: 'लुतुर', mun: 'लुतुर' } },
  { hi: 'पैर', en: 'foot', cat: 'body', pic: 'foot', words: { ho: 'काटा', mun: 'जांग' } },
  { hi: 'दाँत', en: 'tooth', cat: 'body', pic: 'tooth', words: { ho: 'दाता' } },
  { hi: 'दिल', en: 'heart', cat: 'body', pic: 'heart', words: { ho: 'मोन' } },
  { hi: 'सिर', en: 'head', cat: 'body', words: { ho: 'बोः', mun: 'बो' } },
  { hi: 'नाक', en: 'nose', cat: 'body', words: { ho: 'मूः' } },
  { hi: 'मुँह', en: 'mouth', cat: 'body', words: { ho: 'मोचा' } },
  { hi: 'उँगली', en: 'finger', cat: 'body', words: { ho: 'तिकेद' } },

  // Family & people
  { hi: 'माँ', en: 'mother', cat: 'family', words: { ho: 'एंगा', mun: 'एंगा' } },
  { hi: 'पिता', en: 'father', cat: 'family', words: { ho: 'आपु', mun: 'आपू' } },
  { hi: 'भाई', en: 'brother', cat: 'family', words: { ho: 'दादा' } },
  { hi: 'बहन', en: 'sister', cat: 'family', words: { ho: 'मिसि' } },
  { hi: 'दादी', en: 'grandmother', cat: 'family' },
  { hi: 'दादा', en: 'grandfather', cat: 'family' },
  { hi: 'बच्चा', en: 'child', cat: 'family', pic: 'baby', words: { ho: 'होन', mun: 'होन' } },
  { hi: 'परिवार', en: 'family', cat: 'family', pic: 'family' },
  { hi: 'दोस्त', en: 'friend', cat: 'family', pic: 'person', words: { ho: 'गाती' } },
  { hi: 'घर', en: 'house', cat: 'place', pic: 'house', words: { ho: 'ओड़ाः', mun: 'ओड़ा' } },
  { hi: 'गाँव', en: 'village', cat: 'place', words: { ho: 'आतु' } },
  { hi: 'विद्यालय', en: 'school', cat: 'place' },
  { hi: 'खेत', en: 'field', cat: 'place', words: { ho: 'ओते' } },

  // Food
  { hi: 'भात', en: 'rice', cat: 'food', pic: 'rice', words: { ho: 'मंडी', mun: 'मांडी' } },
  { hi: 'रोटी', en: 'bread', cat: 'food', pic: 'bread' },
  { hi: 'अंडा', en: 'egg', cat: 'food', pic: 'egg', words: { ho: 'बिलि' } },
  { hi: 'संतरा', en: 'orange', cat: 'food', pic: 'orange' },
  { hi: 'गाजर', en: 'carrot', cat: 'food', pic: 'carrot' },
  { hi: 'दूध', en: 'milk', cat: 'food', words: { ho: 'तित' } },
  { hi: 'फल', en: 'fruit', cat: 'food', words: { ho: 'जोम' } },
  { hi: 'सब्ज़ी', en: 'vegetable', cat: 'food' },
  { hi: 'खाना', en: 'food', cat: 'food', words: { ho: 'जोमाक' } },

  // Classroom
  { hi: 'किताब', en: 'book', cat: 'classroom', pic: 'book' },
  { hi: 'पेंसिल', en: 'pencil', cat: 'classroom', pic: 'pencil' },
  { hi: 'गेंद', en: 'ball', cat: 'classroom', pic: 'ball' },
  { hi: 'स्लेट', en: 'slate', cat: 'classroom' },
  { hi: 'कक्षा', en: 'class', cat: 'classroom' },
  { hi: 'शिक्षक', en: 'teacher', cat: 'classroom', pic: 'person' },
  { hi: 'चित्र', en: 'picture', cat: 'classroom' },
  { hi: 'शब्द', en: 'word', cat: 'classroom', words: { ho: 'जगर' } },
  { hi: 'अक्षर', en: 'letter', cat: 'classroom' },
  { hi: 'कहानी', en: 'story', cat: 'classroom', words: { ho: 'कथा' } },
  { hi: 'बस', en: 'bus', cat: 'place', pic: 'bus' },
  { hi: 'साइकिल', en: 'bicycle', cat: 'place', pic: 'bicycle' },
  { hi: 'घड़ी', en: 'clock', cat: 'time', pic: 'clock' },
  { hi: 'सिक्के', en: 'coins', cat: 'classroom', pic: 'coins' },

  // Shapes & describing
  { hi: 'गोला', en: 'circle', cat: 'shape', pic: 'circle' },
  { hi: 'त्रिभुज', en: 'triangle', cat: 'shape', pic: 'triangle' },
  { hi: 'वर्ग', en: 'square', cat: 'shape', pic: 'square' },
  { hi: 'बड़ा', en: 'big', cat: 'describing', words: { ho: 'महान' } },
  { hi: 'छोटा', en: 'small', cat: 'describing', words: { ho: 'हुडिंग' } },
  { hi: 'ज़्यादा', en: 'more', cat: 'describing' },
  { hi: 'कम', en: 'less', cat: 'describing' },
  { hi: 'लंबा', en: 'long', cat: 'describing' },
  { hi: 'भारी', en: 'heavy', cat: 'describing' },

  // Colours
  { hi: 'लाल', en: 'red', cat: 'colour', words: { ho: 'आराह' } },
  { hi: 'हरा', en: 'green', cat: 'colour' },
  { hi: 'पीला', en: 'yellow', cat: 'colour' },
  { hi: 'नीला', en: 'blue', cat: 'colour' },
  { hi: 'सफ़ेद', en: 'white', cat: 'colour', words: { ho: 'पुंडि' } },
  { hi: 'काला', en: 'black', cat: 'colour', words: { ho: 'हेंदे' } },

  // Time
  { hi: 'आज', en: 'today', cat: 'time', words: { ho: 'तिसिंग' } },
  { hi: 'कल', en: 'tomorrow', cat: 'time', words: { ho: 'गापा' } },
  { hi: 'सुबह', en: 'morning', cat: 'time', words: { ho: 'एतोहोब' } },
  { hi: 'रात', en: 'night', cat: 'time', words: { ho: 'निदा' } },
  { hi: 'दिन', en: 'day', cat: 'time', words: { ho: 'सिङगि', mun: 'सिंगी' } },

  // Actions
  { hi: 'आओ', en: 'come', cat: 'action', words: { ho: 'हिजू' } },
  { hi: 'जाओ', en: 'go', cat: 'action', words: { ho: 'सेन' } },
  { hi: 'देखो', en: 'look', cat: 'action', words: { ho: 'नेल' } },
  { hi: 'सुनो', en: 'listen', cat: 'action', words: { ho: 'आयूम' } },
  { hi: 'बोलो', en: 'speak', cat: 'action', words: { ho: 'काजी' } },
  { hi: 'गिनो', en: 'count', cat: 'action', words: { ho: 'रेहोन' } },
  { hi: 'लिखो', en: 'write', cat: 'action', words: { ho: 'ओल' } },
  { hi: 'पढ़ो', en: 'read', cat: 'action', words: { ho: 'पाढ़ाओ' } },
  { hi: 'बैठो', en: 'sit', cat: 'action', words: { ho: 'दुब' } },
  { hi: 'खड़े हो', en: 'stand up', cat: 'action', words: { ho: 'तिंगु' } },
  { hi: 'दिखाओ', en: 'show', cat: 'action', words: { ho: 'उदुब' } },
  { hi: 'खेलो', en: 'play', cat: 'action', words: { ho: 'एने' } },
  { hi: 'मिलाओ', en: 'match', cat: 'action' },
  { hi: 'बनाओ', en: 'make', cat: 'action', words: { ho: 'बना' } },
  { hi: 'ताली बजाओ', en: 'clap', cat: 'action' },

  // Greetings & questions
  { hi: 'नमस्ते', en: 'hello', cat: 'greeting', words: { ho: 'जोहार', mun: 'जोहार', sat: 'ᱡᱚᱦᱟᱨ' } },
  { hi: 'धन्यवाद', en: 'thank you', cat: 'greeting' },
  { hi: 'बहुत अच्छा', en: 'very good', cat: 'greeting', words: { ho: 'बुगिन' } },
  { hi: 'हाँ', en: 'yes', cat: 'greeting', words: { ho: 'हे' } },
  { hi: 'नहीं', en: 'no', cat: 'greeting', words: { ho: 'बानो' } },
  { hi: 'क्या', en: 'what', cat: 'question', words: { ho: 'चिकन' } },
  { hi: 'कितने', en: 'how many', cat: 'question', words: { ho: 'चिमिन' } },
  { hi: 'कहाँ', en: 'where', cat: 'question', words: { ho: 'कोड़ो' } },
  { hi: 'कौन', en: 'who', cat: 'question', words: { ho: 'ओकोए' } },
];

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/** Starter glossary for a language. Only languages listed in TRIBAL_WORDS (currently Ho and Mundari) have collected words so far. */
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
