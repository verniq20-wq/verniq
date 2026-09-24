/**
 * Starter glossary: Hindi ↔ English words a primary classroom uses every day,
 * with the students'-language word where one has been collected.
 *
 * IMPORTANT: every tribal-language word here is marked `unverified`. They are
 * starting points gathered from general Munda-language references and must be
 * checked by native speakers. Teachers correct and extend the glossary in the
 * app; their entries (status `teacher`) always take priority.
 */
import type { GlossaryCategory, GlossaryEntry, LanguageCode, PictureKey } from './types';

interface BaseWord {
  hi: string;
  en: string;
  cat: GlossaryCategory;
  pic?: PictureKey;
  value?: number;
  /** Ho word (Devanagari), when collected */
  ho?: string;
}

const BASE: BaseWord[] = [
  // Numbers
  { hi: 'एक', en: 'one', cat: 'number', value: 1, ho: 'मियद' },
  { hi: 'दो', en: 'two', cat: 'number', value: 2, ho: 'बरिया' },
  { hi: 'तीन', en: 'three', cat: 'number', value: 3, ho: 'आपिया' },
  { hi: 'चार', en: 'four', cat: 'number', value: 4, ho: 'उपुनिया' },
  { hi: 'पाँच', en: 'five', cat: 'number', value: 5, ho: 'मोंड़ेया' },
  { hi: 'छह', en: 'six', cat: 'number', value: 6, ho: 'तुरुइया' },
  { hi: 'सात', en: 'seven', cat: 'number', value: 7, ho: 'एया' },
  { hi: 'आठ', en: 'eight', cat: 'number', value: 8, ho: 'इरिलिया' },
  { hi: 'नौ', en: 'nine', cat: 'number', value: 9, ho: 'आरेया' },
  { hi: 'दस', en: 'ten', cat: 'number', value: 10, ho: 'गेलेया' },
  { hi: 'संख्या', en: 'number', cat: 'number' },
  { hi: 'गिनती', en: 'counting', cat: 'number' },

  // Animals
  { hi: 'कुत्ता', en: 'dog', cat: 'animal', pic: 'dog', ho: 'सेता' },
  { hi: 'बिल्ली', en: 'cat', cat: 'animal', pic: 'cat', ho: 'पुसि' },
  { hi: 'गाय', en: 'cow', cat: 'animal', pic: 'cow' },
  { hi: 'घोड़ा', en: 'horse', cat: 'animal', pic: 'horse', ho: 'सादोम' },
  { hi: 'बकरी', en: 'goat', cat: 'animal', ho: 'मेरोम' },
  { hi: 'मुर्गी', en: 'hen', cat: 'animal', ho: 'सिम' },
  { hi: 'चिड़िया', en: 'bird', cat: 'animal', pic: 'bird' },
  { hi: 'मछली', en: 'fish', cat: 'animal', pic: 'fish' },
  { hi: 'खरगोश', en: 'rabbit', cat: 'animal', pic: 'rabbit', ho: 'कुलै' },
  { hi: 'तितली', en: 'butterfly', cat: 'animal', pic: 'butterfly' },
  { hi: 'कीड़ा', en: 'insect', cat: 'animal', pic: 'beetle' },
  { hi: 'हाथी', en: 'elephant', cat: 'animal', ho: 'हाती' },
  { hi: 'बाघ', en: 'tiger', cat: 'animal', ho: 'कुला' },
  { hi: 'जानवर', en: 'animal', cat: 'animal' },

  // Nature
  { hi: 'पानी', en: 'water', cat: 'nature', pic: 'drop', ho: 'दाः' },
  { hi: 'सूरज', en: 'sun', cat: 'nature', pic: 'sun', ho: 'सिङगि' },
  { hi: 'चाँद', en: 'moon', cat: 'nature', pic: 'moon', ho: 'चांडु' },
  { hi: 'तारा', en: 'star', cat: 'nature', pic: 'star' },
  { hi: 'पेड़', en: 'tree', cat: 'nature', pic: 'tree', ho: 'दारु' },
  { hi: 'फूल', en: 'flower', cat: 'nature', pic: 'flower', ho: 'बा' },
  { hi: 'पत्ता', en: 'leaf', cat: 'nature', pic: 'leaf', ho: 'सकम' },
  { hi: 'पौधा', en: 'plant', cat: 'nature', pic: 'plant' },
  { hi: 'पत्थर', en: 'stone', cat: 'nature', ho: 'दिरि' },
  { hi: 'बादल', en: 'cloud', cat: 'nature', pic: 'cloud' },
  { hi: 'बारिश', en: 'rain', cat: 'nature', pic: 'rain' },
  { hi: 'पहाड़', en: 'hill', cat: 'nature', pic: 'mountain', ho: 'बुरु' },
  { hi: 'नदी', en: 'river', cat: 'nature' },
  { hi: 'मिट्टी', en: 'soil', cat: 'nature' },

  // Body
  { hi: 'हाथ', en: 'hand', cat: 'body', pic: 'hand', ho: 'ती' },
  { hi: 'आँख', en: 'eye', cat: 'body', pic: 'eye', ho: 'मेद' },
  { hi: 'कान', en: 'ear', cat: 'body', pic: 'ear', ho: 'लुतुर' },
  { hi: 'पैर', en: 'foot', cat: 'body', pic: 'foot', ho: 'काटा' },
  { hi: 'दाँत', en: 'tooth', cat: 'body', pic: 'tooth' },
  { hi: 'दिल', en: 'heart', cat: 'body', pic: 'heart' },
  { hi: 'सिर', en: 'head', cat: 'body', ho: 'बोः' },
  { hi: 'नाक', en: 'nose', cat: 'body' },
  { hi: 'मुँह', en: 'mouth', cat: 'body' },
  { hi: 'उँगली', en: 'finger', cat: 'body' },

  // Family & people
  { hi: 'माँ', en: 'mother', cat: 'family', ho: 'एंगा' },
  { hi: 'पिता', en: 'father', cat: 'family', ho: 'आपु' },
  { hi: 'भाई', en: 'brother', cat: 'family' },
  { hi: 'बहन', en: 'sister', cat: 'family' },
  { hi: 'दादी', en: 'grandmother', cat: 'family' },
  { hi: 'दादा', en: 'grandfather', cat: 'family' },
  { hi: 'बच्चा', en: 'child', cat: 'family', pic: 'baby' },
  { hi: 'परिवार', en: 'family', cat: 'family', pic: 'family' },
  { hi: 'दोस्त', en: 'friend', cat: 'family', pic: 'person' },
  { hi: 'घर', en: 'house', cat: 'place', pic: 'house', ho: 'ओड़ाः' },
  { hi: 'गाँव', en: 'village', cat: 'place' },
  { hi: 'विद्यालय', en: 'school', cat: 'place' },
  { hi: 'खेत', en: 'field', cat: 'place' },

  // Food
  { hi: 'भात', en: 'rice', cat: 'food', pic: 'rice', ho: 'मंडी' },
  { hi: 'रोटी', en: 'bread', cat: 'food', pic: 'bread' },
  { hi: 'अंडा', en: 'egg', cat: 'food', pic: 'egg' },
  { hi: 'संतरा', en: 'orange', cat: 'food', pic: 'orange' },
  { hi: 'गाजर', en: 'carrot', cat: 'food', pic: 'carrot' },
  { hi: 'दूध', en: 'milk', cat: 'food' },
  { hi: 'फल', en: 'fruit', cat: 'food' },
  { hi: 'सब्ज़ी', en: 'vegetable', cat: 'food' },
  { hi: 'खाना', en: 'food', cat: 'food' },

  // Classroom
  { hi: 'किताब', en: 'book', cat: 'classroom', pic: 'book' },
  { hi: 'पेंसिल', en: 'pencil', cat: 'classroom', pic: 'pencil' },
  { hi: 'गेंद', en: 'ball', cat: 'classroom', pic: 'ball' },
  { hi: 'स्लेट', en: 'slate', cat: 'classroom' },
  { hi: 'कक्षा', en: 'class', cat: 'classroom' },
  { hi: 'शिक्षक', en: 'teacher', cat: 'classroom', pic: 'person' },
  { hi: 'चित्र', en: 'picture', cat: 'classroom' },
  { hi: 'शब्द', en: 'word', cat: 'classroom' },
  { hi: 'अक्षर', en: 'letter', cat: 'classroom' },
  { hi: 'कहानी', en: 'story', cat: 'classroom' },
  { hi: 'बस', en: 'bus', cat: 'place', pic: 'bus' },
  { hi: 'साइकिल', en: 'bicycle', cat: 'place', pic: 'bicycle' },
  { hi: 'घड़ी', en: 'clock', cat: 'time', pic: 'clock' },
  { hi: 'सिक्के', en: 'coins', cat: 'classroom', pic: 'coins' },

  // Shapes & describing
  { hi: 'गोला', en: 'circle', cat: 'shape', pic: 'circle' },
  { hi: 'त्रिभुज', en: 'triangle', cat: 'shape', pic: 'triangle' },
  { hi: 'वर्ग', en: 'square', cat: 'shape', pic: 'square' },
  { hi: 'बड़ा', en: 'big', cat: 'describing' },
  { hi: 'छोटा', en: 'small', cat: 'describing' },
  { hi: 'ज़्यादा', en: 'more', cat: 'describing' },
  { hi: 'कम', en: 'less', cat: 'describing' },
  { hi: 'लंबा', en: 'long', cat: 'describing' },
  { hi: 'भारी', en: 'heavy', cat: 'describing' },

  // Colours
  { hi: 'लाल', en: 'red', cat: 'colour' },
  { hi: 'हरा', en: 'green', cat: 'colour' },
  { hi: 'पीला', en: 'yellow', cat: 'colour' },
  { hi: 'नीला', en: 'blue', cat: 'colour' },
  { hi: 'सफ़ेद', en: 'white', cat: 'colour' },
  { hi: 'काला', en: 'black', cat: 'colour' },

  // Time
  { hi: 'आज', en: 'today', cat: 'time' },
  { hi: 'कल', en: 'tomorrow', cat: 'time' },
  { hi: 'सुबह', en: 'morning', cat: 'time' },
  { hi: 'रात', en: 'night', cat: 'time' },
  { hi: 'दिन', en: 'day', cat: 'time', ho: 'सिङगि' },

  // Actions
  { hi: 'आओ', en: 'come', cat: 'action' },
  { hi: 'जाओ', en: 'go', cat: 'action' },
  { hi: 'देखो', en: 'look', cat: 'action' },
  { hi: 'सुनो', en: 'listen', cat: 'action' },
  { hi: 'बोलो', en: 'speak', cat: 'action' },
  { hi: 'गिनो', en: 'count', cat: 'action' },
  { hi: 'लिखो', en: 'write', cat: 'action' },
  { hi: 'पढ़ो', en: 'read', cat: 'action' },
  { hi: 'बैठो', en: 'sit', cat: 'action' },
  { hi: 'खड़े हो', en: 'stand up', cat: 'action' },
  { hi: 'दिखाओ', en: 'show', cat: 'action' },
  { hi: 'खेलो', en: 'play', cat: 'action' },
  { hi: 'मिलाओ', en: 'match', cat: 'action' },
  { hi: 'बनाओ', en: 'make', cat: 'action' },
  { hi: 'ताली बजाओ', en: 'clap', cat: 'action' },

  // Greetings & questions
  { hi: 'नमस्ते', en: 'hello', cat: 'greeting', ho: 'जोहार' },
  { hi: 'धन्यवाद', en: 'thank you', cat: 'greeting' },
  { hi: 'बहुत अच्छा', en: 'very good', cat: 'greeting' },
  { hi: 'हाँ', en: 'yes', cat: 'greeting' },
  { hi: 'नहीं', en: 'no', cat: 'greeting' },
  { hi: 'क्या', en: 'what', cat: 'question' },
  { hi: 'कितने', en: 'how many', cat: 'question' },
  { hi: 'कहाँ', en: 'where', cat: 'question' },
  { hi: 'कौन', en: 'who', cat: 'question' },
];

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/** Starter glossary for a language. Only Ho has collected words so far. */
export function seedGlossary(language: LanguageCode): GlossaryEntry[] {
  return BASE.map((w) => ({
    id: `seed-${language}-${slug(w.en)}`,
    language,
    hindi: w.hi,
    english: w.en,
    target: language === 'ho' ? (w.ho ?? '') : language === 'hi' ? w.hi : language === 'en' ? w.en : '',
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
