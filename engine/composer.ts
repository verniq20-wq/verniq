/**
 * Lesson composer: builds a complete, curriculum-aligned lesson from a class,
 * subject, topic and outcome — entirely offline.
 *
 *  1. Match the request to the curriculum knowledge base (keyword similarity).
 *  2. Pick the activity family for the outcome and choose section variants.
 *  3. Choose vocabulary from the glossary that fits the topic.
 *  4. Fill the scripts and render them for the students' language with the translator.
 */
import { BANK, OBJECTS, familyFor, type Family } from './activities';
import { OUTCOMES } from './curriculum';
import { containment, fill, hash, keyTokens, numberRange, pick, rng } from './text';
import { translate } from './translator';
import type {
  ActivityTag,
  GlossaryCategory,
  GlossaryEntry,
  LessonContent,
  LessonSection,
  LessonSectionKey,
  Outcome,
  Phrase,
  Subject,
  VocabularyItem,
} from './types';

export interface LessonRequest {
  grade: number;
  subject: Subject;
  topic: string;
  learningOutcome?: string;
  /** Force a specific outcome code */
  outcomeCode?: string;
}

export interface ComposeContext {
  glossary: GlossaryEntry[];
  phrases: Phrase[];
}

export interface OutcomeMatch {
  outcome: Outcome;
  score: number;
}

const SECTION_TITLES: Record<LessonSectionKey, string> = {
  introduction: 'Introduction',
  explain: 'Explain',
  activity: 'Activity',
  practice: 'Practice',
  assessment: 'Assessment',
};
const ORDER: LessonSectionKey[] = ['introduction', 'explain', 'activity', 'practice', 'assessment'];

/** Rank curriculum outcomes for a request. */
export function matchOutcomes(req: LessonRequest, limit = 3): OutcomeMatch[] {
  if (req.outcomeCode) {
    const exact = OUTCOMES.find((o) => o.code === req.outcomeCode);
    if (exact) return [{ outcome: exact, score: 1 }];
  }
  const all = keyTokens(`${req.topic} ${req.learningOutcome ?? ''}`);
  // Numbers like "10" say little about the outcome when there are real words.
  const words = all.filter((t) => !/^\d+$/.test(t));
  const q = words.length ? words : all;
  return OUTCOMES.filter((o) => o.subject === req.subject)
    .map((o) => {
      const doc = keyTokens([o.statement, o.statementHi, ...o.topics, ...o.keywords].join(' '));
      const topicHit = o.topics.some((t) => t.toLowerCase() === req.topic.trim().toLowerCase()) ? 0.5 : 0;
      const gradeFit = o.grade === req.grade ? 0.6 : Math.abs(o.grade - req.grade) === 1 ? 0.25 : 0;
      return { outcome: o, score: containment(q, doc) + topicHit + gradeFit };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

const TAG_CATEGORIES: Partial<Record<ActivityTag, GlossaryCategory[]>> = {
  counting: ['number'],
  'number-sense': ['number'],
  operations: ['number'],
  patterns: ['number', 'shape'],
  shapes: ['shape'],
  measurement: ['describing'],
  money: ['number'],
  time: ['time'],
  data: ['number'],
  fractions: ['number'],
  body: ['body'],
  family: ['family'],
  plants: ['nature'],
  animals: ['animal'],
  water: ['nature'],
  food: ['food'],
  shelter: ['place'],
  travel: ['place'],
  health: ['body'],
  observation: ['nature'],
  speaking: ['greeting', 'family'],
  vocabulary: ['classroom'],
};

/** Choose the words a lesson teaches. */
export function chooseVocabulary(req: LessonRequest, outcome: Outcome, glossary: GlossaryEntry[], seed: number): VocabularyItem[] {
  const random = rng(seed);
  const size = req.grade <= 2 ? 8 : 10;
  const q = new Set(keyTokens(req.topic));
  const cats = new Set(outcome.tags.flatMap((t) => TAG_CATEGORIES[t] ?? []));

  const range = numberRange(req.topic);
  if (cats.has('number')) {
    const numbers = glossary
      .filter((g) => g.category === 'number' && g.value !== undefined)
      .filter((g) => !range || (g.value! >= range.from && g.value! <= range.to))
      .sort((a, b) => a.value! - b.value!);
    if (numbers.length) return numbers.slice(0, 10).map(toVocab);
  }

  // Hindi vowels and consonants get the classic primer words
  if (req.subject === 'Hindi' && /स्वर|vowel/i.test(req.topic)) return HINDI_VOWELS;

  // Words named in the topic first, then words from the outcome's categories in tag order
  const direct = glossary.filter((g) => q.has(g.english.toLowerCase()) || q.has(g.hindi));
  const ordered: GlossaryEntry[] = [];
  for (const cat of cats) {
    const inCat = glossary
      .filter((g) => g.category === cat && !direct.includes(g) && !ordered.includes(g))
      .sort((a, b) => Number(!!b.target) - Number(!!a.target) || Number(!!b.picture) - Number(!!a.picture) || random() - 0.5);
    ordered.push(...inCat);
    if (direct.length + ordered.length >= 3) break;
  }
  const chosen = [...direct, ...ordered].slice(0, size);
  return (chosen.length ? chosen : glossary.filter((g) => g.category === 'classroom').slice(0, size)).map(toVocab);
}

const HINDI_VOWELS: VocabularyItem[] = [
  ['अ', 'अनार', 'pomegranate'],
  ['आ', 'आम', 'mango'],
  ['इ', 'इमली', 'tamarind'],
  ['ई', 'ईख', 'sugarcane'],
  ['उ', 'उल्लू', 'owl'],
  ['ऊ', 'ऊन', 'wool'],
  ['ए', 'एड़ी', 'heel'],
  ['ऐ', 'ऐनक', 'spectacles'],
  ['ओ', 'ओखली', 'mortar'],
  ['औ', 'औरत', 'woman'],
].map(([letter, word, en]) => ({ hindi: `${letter} — ${word}`, target: '', english: en }));

function toVocab(g: GlossaryEntry): VocabularyItem {
  return { hindi: g.hindi, target: g.target, english: g.english, picture: g.picture, value: g.value };
}

function slotsFor(req: LessonRequest, family: Family, vocab: VocabularyItem[], random: () => number) {
  const words = vocab.map((v) => v.hindi);
  const range = numberRange(req.topic);
  const n = String(range ? Math.min(range.to, 10) : Math.min(vocab.length || 5, 10));
  return {
    topic: req.topic.trim() || 'आज का विषय',
    w1: words[0] ?? '',
    w2: words[1] ?? words[0] ?? '',
    w3: words[2] ?? words[1] ?? '',
    n: family === 'number' ? n : String(3 + Math.floor(random() * 3)),
    obj: pick(OBJECTS[family], random),
  };
}

function buildSection(
  key: LessonSectionKey,
  family: Family,
  variantIndex: number,
  slots: Record<string, string>,
  grade: number,
  ctx: ComposeContext,
): LessonSection {
  const variants = BANK[family][key];
  const v = variants[((variantIndex % variants.length) + variants.length) % variants.length];
  const script = fill(v.script, slots);
  const tr = translate(script, { glossary: ctx.glossary, phrases: ctx.phrases });
  const keywords = uniqueKeywords(tr.segments);
  const total = grade <= 2 ? 30 : 40;
  const share: Record<LessonSectionKey, number> = { introduction: 0.15, explain: 0.25, activity: 0.3, practice: 0.15, assessment: 0.15 };
  return {
    key,
    title: SECTION_TITLES[key],
    script,
    scriptTarget: tr.text || undefined,
    targetCoverage: tr.coverage,
    keywords,
    steps: v.steps.map((s) => fill(s, slots)),
    materials: v.materials?.map((m) => fill(m, slots)),
    durationMin: Math.max(3, Math.round(total * share[key])),
    variant: ((variantIndex % variants.length) + variants.length) % variants.length,
  };
}

export interface ComposedLesson {
  outcome: Outcome;
  alternatives: Outcome[];
  learningOutcome: string;
  durationMin: number;
  content: LessonContent;
}

/** Compose a complete lesson. `seed` makes results reproducible. */
export function composeLesson(req: LessonRequest, ctx: ComposeContext, seed = hash(`${req.subject}|${req.grade}|${req.topic}`)): ComposedLesson {
  const matches = matchOutcomes(req);
  const outcome = matches[0]?.outcome ?? OUTCOMES.find((o) => o.subject === req.subject)!;
  const family = familyFor(outcome.tags);
  const random = rng(seed);
  const vocabulary = chooseVocabulary(req, outcome, ctx.glossary, seed);
  const slots = slotsFor(req, family, vocabulary, random);
  const sections = ORDER.map((key) => buildSection(key, family, Math.floor(random() * 10), slots, req.grade, ctx));
  return {
    outcome,
    alternatives: matches.slice(1).map((m) => m.outcome),
    learningOutcome: req.learningOutcome?.trim() || outcome.statement,
    durationMin: sections.reduce((s, x) => s + x.durationMin, 0),
    content: { sections, vocabulary, seed },
  };
}

/** Rebuild one section with the next variant, keeping everything else. */
export function regenerateSection(
  req: LessonRequest,
  content: LessonContent,
  key: LessonSectionKey,
  ctx: ComposeContext,
): LessonSection {
  const outcome = matchOutcomes(req)[0]?.outcome ?? OUTCOMES[0];
  const family = familyFor(outcome.tags);
  const current = content.sections.find((s) => s.key === key);
  const random = rng(content.seed);
  const slots = slotsFor(req, family, content.vocabulary, random);
  return buildSection(key, family, (current?.variant ?? 0) + 1, slots, req.grade, ctx);
}

function uniqueKeywords(segments: { source: string; output: string; known: boolean; via: string }[]) {
  const seen = new Set<string>();
  return segments
    .filter((s) => (s.via === 'glossary' || s.via === 'number') && s.output && s.output !== s.source)
    .filter((s) => !seen.has(s.source) && seen.add(s.source))
    .map((s) => ({ hindi: s.source, target: s.output }));
}

/** Re-render all target-language scripts, e.g. after the glossary changed. */
export function retranslateLesson(content: LessonContent, ctx: ComposeContext): LessonContent {
  return {
    ...content,
    sections: content.sections.map((s) => {
      const tr = translate(s.script, { glossary: ctx.glossary, phrases: ctx.phrases });
      return { ...s, scriptTarget: tr.text || undefined, targetCoverage: tr.coverage, keywords: uniqueKeywords(tr.segments) };
    }),
    vocabulary: content.vocabulary.map((v) => {
      const g = ctx.glossary.find((e) => e.hindi === v.hindi);
      return g ? { ...v, target: g.target } : v;
    }),
  };
}
