export type LanguageCode = 'hi' | 'ho' | 'sat' | 'mun' | 'kru' | 'gon' | 'bhb' | 'en';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script: string;
  /** Size of the offline language pack in MB */
  packSizeMb: number;
  /** Whether the pack is downloaded to this device */
  downloaded: boolean;
}

export interface LanguagePair {
  source: LanguageCode;
  target: LanguageCode;
}

/** online · syncing · offline (fully functional) · sync required */
export type ConnectivityStatus = 'online' | 'syncing' | 'offline' | 'sync-required';

export type Subject = 'Mathematics' | 'Hindi' | 'EVS' | 'English';

export type LessonSectionKey = 'introduction' | 'explain' | 'activity' | 'practice' | 'assessment';

export interface LessonSection {
  key: LessonSectionKey;
  title: string;
  /** What the teacher says, in the classroom language */
  script: string;
  /** Same script in the tribal language (may be a demo sample) */
  scriptTarget?: string;
  steps?: string[];
  durationMin: number;
}

export interface VocabularyItem {
  hindi: string;
  target: string;
  english: string;
  emoji?: string;
}

export interface Lesson {
  id: string;
  classLevel: number;
  subject: Subject;
  topic: string;
  learningOutcome: string;
  outcomeCode?: string;
  language: LanguageCode;
  durationMin: number;
  sections: LessonSection[];
  vocabulary: VocabularyItem[];
  savedOffline: boolean;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number; // 0..1
  scheduledFor?: string; // ISO date
}

export interface LessonRequest {
  classLevel: number;
  subject: Subject;
  topic: string;
  learningOutcome: string;
  language: LanguageCode;
}

export type TranslationDirection = 'teacher-to-student' | 'student-to-teacher';

export interface TranslationTurn {
  id: string;
  direction: TranslationDirection;
  sourceText: string;
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  at: number;
}

export type VoicePhase = 'idle' | 'listening' | 'understanding' | 'translating' | 'speaking';

export type Difficulty = 'easy' | 'medium' | 'challenging';

export type WorksheetItem =
  | { kind: 'count'; prompt: string; promptTarget: string; emoji: string; count: number }
  | { kind: 'match'; prompt: string; promptTarget: string; pairs: { left: string; right: string }[] }
  | { kind: 'fill'; prompt: string; promptTarget: string; sequence: (number | null)[] }
  | { kind: 'circle'; prompt: string; promptTarget: string; options: string[]; answer: string };

export interface Worksheet {
  id: string;
  lessonId: string;
  title: string;
  titleTarget: string;
  classLevel: number;
  subject: Subject;
  language: LanguageCode;
  difficulty: Difficulty;
  items: WorksheetItem[];
  createdAt: number;
}

export interface Flashcard {
  id: string;
  emoji: string;
  english: string;
  hindi: string;
  target: string;
  /** Community review status for tribal-language vocabulary */
  review: 'verified' | 'needs-review';
}

export interface Student {
  id: string;
  name: string;
  progress: number; // 0..1
  attendance: number; // 0..1
  attention?: string;
}

export interface NotificationItem {
  id: string;
  kind: 'success' | 'sync' | 'voice' | 'lesson';
  title: string;
  detail?: string;
  at: number;
  read: boolean;
}

export interface Toast {
  id: string;
  tone: 'success' | 'info' | 'warning' | 'error';
  title: string;
  detail?: string;
}
