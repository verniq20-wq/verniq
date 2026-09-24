import type { Language, LanguageCode } from '../types';

export const LANGUAGES: Language[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari' },
  { code: 'ho', name: 'Ho', nativeName: 'हो', script: 'Devanagari (Warang Citi)' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki' },
  { code: 'mun', name: 'Mundari', nativeName: 'मुंडारी', script: 'Devanagari' },
  { code: 'kru', name: 'Kurukh', nativeName: 'कुड़ुख़', script: 'Tolong Siki / Devanagari' },
  { code: 'gon', name: 'Gondi', nativeName: 'गोंडी', script: 'Devanagari' },
  { code: 'bhb', name: 'Bhili', nativeName: 'भीली', script: 'Devanagari' },
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin' },
];

export const TRIBAL_LANGUAGES = LANGUAGES.filter((l) => !['hi', 'en'].includes(l.code));

export function getLanguage(code: LanguageCode): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

export function languageName(code: LanguageCode): string {
  return getLanguage(code).name;
}
