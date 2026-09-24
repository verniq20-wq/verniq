/** App-wide types: domain types come from the engine and shared records; UI-only types live here. */
export * from '../../engine/types';
export type * from '../../shared/records';

import type { LanguageCode, TranslationSegment } from '../../engine/types';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script: string;
}

export interface LanguagePair {
  source: LanguageCode;
  target: LanguageCode;
}

/** online · syncing · offline (fully functional) · sync required */
export type ConnectivityStatus = 'online' | 'syncing' | 'offline' | 'sync-required';

export type TranslationDirection = 'teacher-to-student' | 'student-to-teacher';

export interface TranslationTurn {
  id: string;
  direction: TranslationDirection;
  sourceText: string;
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  /** How the translation was produced */
  method: 'memory' | 'close' | 'gloss' | 'typed';
  coverage: number;
  phraseId?: string;
  segments?: TranslationSegment[];
  at: number;
}

export type VoicePhase = 'idle' | 'listening' | 'understanding' | 'translating' | 'speaking';

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
