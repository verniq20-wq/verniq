/**
 * Shared domain types for the Verniq engine, server and app.
 */

export type LanguageCode = 'hi' | 'ho' | 'sat' | 'mun' | 'kru' | 'gon' | 'bhb' | 'en';
export type Subject = 'Mathematics' | 'Hindi' | 'EVS' | 'English';
export const SUBJECTS: Subject[] = ['Mathematics', 'Hindi', 'EVS', 'English'];

/** Illustration keys rendered as duotone icons by the app. */
export type PictureKey =
  | 'dog' | 'cat' | 'cow' | 'horse' | 'bird' | 'fish' | 'rabbit' | 'butterfly' | 'beetle'
  | 'sun' | 'moon' | 'tree' | 'flower' | 'leaf' | 'star' | 'cloud' | 'rain' | 'mountain' | 'drop' | 'plant'
  | 'orange' | 'carrot' | 'egg' | 'bread' | 'rice'
  | 'house' | 'book' | 'pencil' | 'ball' | 'bus' | 'bicycle' | 'clock' | 'coins'
  | 'hand' | 'eye' | 'ear' | 'foot' | 'heart' | 'tooth' | 'baby' | 'person' | 'family'
  | 'triangle' | 'circle' | 'square';

/** Kinds of classroom work an outcome calls for; drives which activities the composer picks. */
export type ActivityTag =
  | 'counting' | 'number-sense' | 'operations' | 'shapes' | 'patterns' | 'measurement' | 'money' | 'time' | 'data' | 'fractions'
  | 'vocabulary' | 'phonics' | 'reading' | 'writing' | 'speaking' | 'story'
  | 'observation' | 'classification' | 'body' | 'family' | 'plants' | 'animals' | 'water' | 'food' | 'shelter' | 'travel' | 'health';

export interface Outcome {
  /** Verniq outcome code, e.g. "M1.02" (subject letter, grade, number) */
  code: string;
  grade: number;
  subject: Subject;
  statement: string;
  statementHi: string;
  topics: string[];
  keywords: string[];
  tags: ActivityTag[];
  /** Matching NIPUN Bharat Lakshya (foundational target), where one applies */
  nipun?: NipunTarget;
}

/** A NIPUN Bharat Lakshya — Classes 1–3 foundational literacy and numeracy targets. */
export interface NipunTarget {
  grade: 1 | 2 | 3;
  area: 'Literacy' | 'Numeracy';
  target: string;
}

export type GlossaryCategory =
  | 'number' | 'colour' | 'body' | 'family' | 'animal' | 'nature' | 'food' | 'classroom' | 'shape'
  | 'action' | 'time' | 'place' | 'greeting' | 'question' | 'describing';

export type ReviewStatus = 'unverified' | 'teacher' | 'verified';

export interface GlossaryEntry {
  id: string;
  language: LanguageCode;
  hindi: string;
  english: string;
  /** Word in the students' language; empty when not collected yet */
  target: string;
  category: GlossaryCategory;
  picture?: PictureKey;
  /** Numeric value for number words */
  value?: number;
  status: ReviewStatus;
  /** Teacher's recording of the word, as a data URL */
  audio?: string;
}

/** A sentence the teacher has confirmed — the translation memory. */
export interface Phrase {
  id: string;
  language: LanguageCode;
  hindi: string;
  target: string;
  english?: string;
  /** Who usually says it */
  speaker: 'teacher' | 'student';
  /** Recorded pronunciation as a data URL (optional) */
  audio?: string;
  uses: number;
  updatedAt: number;
}

export type LessonSectionKey = 'introduction' | 'explain' | 'activity' | 'practice' | 'assessment';

export interface LessonSection {
  key: LessonSectionKey;
  title: string;
  /** Teacher script in Hindi */
  script: string;
  /** Script rendered in the students' language (keyword gloss unless a phrase matched) */
  scriptTarget?: string;
  /** Share of content words the engine could render in the students' language, 0..1 */
  targetCoverage?: number;
  /** Words in this script that have a students'-language word */
  keywords?: { hindi: string; target: string }[];
  steps: string[];
  materials?: string[];
  durationMin: number;
  /** Which activity-bank variant produced it (for regeneration) */
  variant?: number;
}

export interface VocabularyItem {
  hindi: string;
  target: string;
  english: string;
  picture?: PictureKey;
  value?: number;
}

export interface LessonContent {
  sections: LessonSection[];
  vocabulary: VocabularyItem[];
  /** Seed used to compose it, so a section can be regenerated deterministically */
  seed: number;
}

export type Difficulty = 'easy' | 'medium' | 'challenging';

export type WorksheetItem =
  | { kind: 'count'; prompt: string; promptTarget: string; picture: PictureKey; count: number }
  | { kind: 'match'; prompt: string; promptTarget: string; pairs: { left: string; right: string; picture?: PictureKey }[] }
  | { kind: 'fill'; prompt: string; promptTarget: string; sequence: (number | null)[] }
  | { kind: 'circle'; prompt: string; promptTarget: string; options: string[]; answer: string; picture?: PictureKey }
  | { kind: 'write'; prompt: string; promptTarget: string; words: { picture?: PictureKey; hint: string }[] }
  | { kind: 'sort'; prompt: string; promptTarget: string; groups: [string, string]; words: string[] }
  | { kind: 'tick'; prompt: string; promptTarget: string; statements: { text: string; answer: boolean }[] };

export interface WorksheetContent {
  titleTarget: string;
  difficulty: Difficulty;
  items: WorksheetItem[];
}

export type FlashcardVisual =
  | { type: 'picture'; picture: PictureKey }
  | { type: 'number'; value: number }
  | { type: 'letter'; letter: string };

export interface FlashcardContent {
  cards: {
    id: string;
    visual: FlashcardVisual;
    english: string;
    hindi: string;
    target: string;
    review: ReviewStatus;
  }[];
}

/** Rubric used when recording how a student did on an outcome. */
export type Rubric = 0 | 1 | 2 | 3; // not yet · emerging · developing · proficient
export const RUBRIC_LABELS: Record<Rubric, string> = { 0: 'Not yet', 1: 'Emerging', 2: 'Developing', 3: 'Proficient' };

export interface TranslationSegment {
  source: string;
  output: string;
  known: boolean;
  via: 'phrase' | 'glossary' | 'number' | 'stopword' | 'unknown';
}

export interface TranslationResult {
  text: string;
  segments: TranslationSegment[];
  /** Share of content words that were rendered, 0..1 */
  coverage: number;
  /** memory = a confirmed phrase; close = a similar confirmed phrase; gloss = word-by-word keywords */
  method: 'memory' | 'close' | 'gloss';
  matchedPhraseId?: string;
}
