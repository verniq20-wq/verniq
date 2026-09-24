/**
 * Worksheet and flashcard generators. Every item is built from the lesson's
 * vocabulary and the glossary, so answers are correct by construction.
 */
import { familyFor } from './activities';
import { matchOutcomes, type LessonRequest } from './composer';
import { hash, keyTokens, numberRange, pick, rng, shuffle } from './text';
import { translate } from './translator';
import type {
  Difficulty,
  FlashcardContent,
  GlossaryCategory,
  GlossaryEntry,
  Phrase,
  PictureKey,
  VocabularyItem,
  WorksheetContent,
  WorksheetItem,
} from './types';

const CATEGORY_HI: Partial<Record<GlossaryCategory, string>> = {
  animal: 'जानवर',
  food: 'खाना',
  nature: 'प्रकृति',
  body: 'शरीर के अंग',
  family: 'परिवार',
  place: 'जगह',
  classroom: 'कक्षा की चीज़ें',
  shape: 'आकृति',
  colour: 'रंग',
};

interface Ctx {
  glossary: GlossaryEntry[];
  phrases: Phrase[];
}

function prompt(hi: string, ctx: Ctx) {
  const t = translate(hi, { glossary: ctx.glossary, phrases: ctx.phrases });
  return { prompt: hi, promptTarget: t.coverage >= 0.5 ? t.text : '' };
}

const COUNTABLE: PictureKey[] = ['flower', 'fish', 'leaf', 'star', 'bird', 'orange', 'egg', 'ball'];

export interface WorksheetRequest extends LessonRequest {
  vocabulary: VocabularyItem[];
  difficulty: Difficulty;
  seed?: number;
}

export function generateWorksheet(req: WorksheetRequest, ctx: Ctx): WorksheetContent {
  const seed = req.seed ?? hash(`${req.topic}|${req.difficulty}|${Date.now()}`);
  const random = rng(seed);
  const outcome = matchOutcomes(req)[0]?.outcome;
  const family = outcome ? familyFor(outcome.tags) : 'language';
  const level = { easy: 0, medium: 1, challenging: 2 }[req.difficulty];
  const items: WorksheetItem[] = [];
  const pictured = req.vocabulary.filter((v) => v.picture);
  const named = req.vocabulary.filter((v) => v.target);

  if (family === 'number' || family === 'lifemath') {
    const range = numberRange(req.topic) ?? { from: 1, to: 10 };
    const max = Math.min(range.to, [5, 8, 10][level] + (range.to > 10 ? range.to - 10 : 0));
    const pics = shuffle(COUNTABLE, random);
    for (let k = 0; k < 2; k++) {
      items.push({ kind: 'count', ...prompt('गिनो और लिखो', ctx), picture: pics[k], count: 2 + Math.floor(random() * (Math.min(max, 10) - 1)) });
    }
    const start = Math.max(range.from, 1 + Math.floor(random() * Math.max(1, max - 5)));
    const len = 6;
    const blanks = shuffle([...Array(len).keys()].slice(1), random).slice(0, level + 1);
    items.push({ kind: 'fill', ...prompt('छूटी हुई संख्या भरो', ctx), sequence: [...Array(len).keys()].map((i) => (blanks.includes(i) ? null : start + i)) });
    const numberWords = ctx.glossary.filter((g) => g.category === 'number' && g.value && g.value <= max);
    if (numberWords.length >= 4) {
      const chosen = shuffle(numberWords, random).slice(0, 4);
      items.push({
        kind: 'match',
        ...prompt('संख्या को सही शब्द से मिलाओ', ctx),
        pairs: chosen.map((g) => ({ left: String(g.value), right: g.target || g.hindi })),
      });
    }
    const opts = shuffle([...Array(max).keys()].map((i) => i + 1), random).slice(0, 4);
    const biggest = Math.max(...opts);
    items.push({ kind: 'circle', ...prompt('सबसे बड़ी संख्या पर गोला बनाओ', ctx), options: opts.map(String), answer: String(biggest) });
  } else if (family === 'space') {
    const shapes = ctx.glossary.filter((g) => g.category === 'shape');
    const target = pick(shapes, random);
    items.push({
      kind: 'circle',
      ...prompt('चित्र का सही नाम पर गोला बनाओ', ctx),
      picture: target.picture,
      options: shuffle(shapes.map((s) => s.hindi), random),
      answer: target.hindi,
    });
    items.push({
      kind: 'tick',
      ...prompt('सही बात के आगे सही का निशान लगाओ, गलत के आगे क्रॉस', ctx),
      statements: shuffle(
        [
          { text: 'त्रिभुज के 3 कोने होते हैं।', answer: true },
          { text: 'वर्ग की 4 भुजाएँ होती हैं।', answer: true },
          { text: 'गोले के 4 कोने होते हैं।', answer: false },
          { text: 'हाथी चींटी से छोटा होता है।', answer: false },
          { text: 'पेड़ घास से लंबा होता है।', answer: true },
        ],
        random,
      ).slice(0, 3 + level),
    });
    items.push({ kind: 'write', ...prompt('चित्र देखकर नाम लिखो', ctx), words: shapes.slice(0, 3).map((s) => ({ picture: s.picture, hint: level === 2 ? '' : s.hindi[0] })) });
  } else {
    if (pictured.length >= 3) {
      items.push({
        kind: 'match',
        ...prompt('चित्र को सही शब्द से मिलाओ', ctx),
        pairs: shuffle(pictured, random)
          .slice(0, 3 + level)
          .map((v) => ({ left: v.hindi, right: v.target || v.english, picture: v.picture })),
      });
      const target = pick(pictured, random);
      const distractors = shuffle(
        req.vocabulary.filter((v) => v !== target),
        random,
      ).slice(0, 2 + level);
      items.push({
        kind: 'circle',
        ...prompt('चित्र का सही नाम पर गोला बनाओ', ctx),
        picture: target.picture,
        options: shuffle([target, ...distractors], random).map((v) => v.hindi),
        answer: target.hindi,
      });
      items.push({
        kind: 'write',
        ...prompt('चित्र देखकर नाम लिखो', ctx),
        words: shuffle(pictured, random)
          .slice(0, 2 + level)
          .map((v) => ({ picture: v.picture, hint: level === 0 ? v.hindi.slice(0, 1) : '' })),
      });
    }
    // Sort into two categories: this topic's category vs another
    const topicCats = new Set(req.vocabulary.map((v) => ctx.glossary.find((g) => g.hindi === v.hindi)?.category).filter(Boolean) as GlossaryCategory[]);
    const mainCat = [...topicCats].find((c) => CATEGORY_HI[c]);
    const otherCat = (['animal', 'food', 'body', 'nature', 'classroom'] as GlossaryCategory[]).find((c) => c !== mainCat && CATEGORY_HI[c]);
    if (mainCat && otherCat) {
      const a = shuffle(ctx.glossary.filter((g) => g.category === mainCat), random).slice(0, 3);
      const b = shuffle(ctx.glossary.filter((g) => g.category === otherCat), random).slice(0, 2 + level);
      items.push({
        kind: 'sort',
        ...prompt('शब्दों को सही समूह में लिखो', ctx),
        groups: [CATEGORY_HI[mainCat]!, CATEGORY_HI[otherCat]!],
        words: shuffle([...a, ...b], random).map((g) => g.hindi),
      });
      const t1 = a[0];
      const f1 = b[0];
      items.push({
        kind: 'tick',
        ...prompt('सही बात के आगे सही का निशान लगाओ, गलत के आगे क्रॉस', ctx),
        statements: shuffle(
          [
            t1 && { text: `${t1.hindi} — ${CATEGORY_HI[mainCat]}`, answer: true },
            f1 && { text: `${f1.hindi} — ${CATEGORY_HI[mainCat]}`, answer: false },
            f1 && { text: `${f1.hindi} — ${CATEGORY_HI[otherCat]}`, answer: true },
          ].filter(Boolean) as { text: string; answer: boolean }[],
          random,
        ),
      });
    }
    if (named.length >= 4 && items.length < 5) {
      items.push({
        kind: 'match',
        ...prompt('हिंदी शब्द को अपनी भाषा के शब्द से मिलाओ', ctx),
        pairs: shuffle(named, random)
          .slice(0, 4)
          .map((v) => ({ left: v.hindi, right: v.target })),
      });
    }
  }

  // Fallback so every lesson gets a usable worksheet
  if (items.length < 2 && req.vocabulary.length >= 3) {
    const lettered = req.vocabulary.filter((v) => v.hindi.includes(' — '));
    if (lettered.length >= 3) {
      const pairs = shuffle(lettered, random).slice(0, 4 + level);
      items.push({ kind: 'match', ...prompt('अक्षर को उसके शब्द से मिलाओ', ctx), pairs: pairs.map((v) => ({ left: v.hindi.split(' — ')[0], right: v.hindi.split(' — ')[1] })) });
      const target = pick(pairs, random);
      items.push({
        kind: 'circle',
        ...prompt(`"${target.hindi.split(' — ')[1]}" किस अक्षर से शुरू होता है? गोला बनाओ`, ctx),
        options: shuffle(pairs.slice(0, 4).map((v) => v.hindi.split(' — ')[0]), random),
        answer: target.hindi.split(' — ')[0],
      });
      items.push({ kind: 'write', ...prompt('अक्षर देखकर शब्द लिखो', ctx), words: pairs.slice(0, 3).map((v) => ({ hint: v.hindi.split(' — ')[0] })) });
    } else {
      const words = shuffle(req.vocabulary, random).slice(0, 4);
      items.push({ kind: 'match', ...prompt('हिंदी शब्द को सही अर्थ से मिलाओ', ctx), pairs: words.map((v) => ({ left: v.hindi, right: v.target || v.english })) });
      items.push({ kind: 'write', ...prompt('इन शब्दों को सुंदर लिखो', ctx), words: words.slice(0, 3).map((v) => ({ hint: v.hindi })) });
    }
  }

  const titleTarget = translate(req.topic, { glossary: ctx.glossary, phrases: ctx.phrases });
  return { titleTarget: titleTarget.coverage >= 0.5 ? titleTarget.text : '', difficulty: req.difficulty, items: items.slice(0, 6) };
}

const TOPIC_CATEGORY: [RegExp, GlossaryCategory][] = [
  [/number|count|गिनती|संख्या|अंक/i, 'number'],
  [/animal|जानवर|पशु|pet|wild/i, 'animal'],
  [/body|शरीर|अंग/i, 'body'],
  [/family|परिवार/i, 'family'],
  [/food|fruit|vegetable|खाना|भोजन|फल/i, 'food'],
  [/nature|plant|tree|sky|water|पेड़|पौध|प्रकृति|पानी/i, 'nature'],
  [/colou?r|रंग/i, 'colour'],
  [/shape|आकृति|आकार/i, 'shape'],
  [/school|class|कक्षा|विद्यालय/i, 'classroom'],
];

export function generateFlashcards(topic: string, count: number, glossary: GlossaryEntry[], seed = hash(topic + Date.now())): FlashcardContent {
  const random = rng(seed);
  const cat = TOPIC_CATEGORY.find(([re]) => re.test(topic))?.[1];
  const q = new Set(keyTokens(topic));
  let pool = cat ? glossary.filter((g) => g.category === cat) : glossary.filter((g) => q.has(g.english) || q.has(g.hindi));
  if (pool.length < 3) pool = glossary.filter((g) => g.picture);
  const ordered = cat === 'number' ? [...pool].filter((g) => g.value).sort((a, b) => a.value! - b.value!) : shuffle(pool, random).sort((a, b) => Number(!!b.target) - Number(!!a.target) || Number(!!b.picture) - Number(!!a.picture));
  return {
    cards: ordered.slice(0, count).map((g, i) => ({
      id: `${g.id}-${i}`,
      visual: g.value ? { type: 'number' as const, value: g.value } : g.picture ? { type: 'picture' as const, picture: g.picture } : { type: 'letter' as const, letter: g.hindi.slice(0, 1) },
      english: g.english.charAt(0).toUpperCase() + g.english.slice(1),
      hindi: g.hindi,
      target: g.target,
      review: g.status,
    })),
  };
}
