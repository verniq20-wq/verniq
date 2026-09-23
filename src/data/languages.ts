import type { Language, LanguageCode } from '../types';

export const LANGUAGES: Language[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', packSizeMb: 48, downloaded: true },
  { code: 'ho', name: 'Ho', nativeName: 'हो', script: 'Warang Citi / Devanagari', packSizeMb: 36, downloaded: true },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', packSizeMb: 41, downloaded: true },
  { code: 'mun', name: 'Mundari', nativeName: 'मुंडारी', script: 'Devanagari', packSizeMb: 34, downloaded: false },
  { code: 'kru', name: 'Kurukh', nativeName: 'कुड़ुख़', script: 'Tolong Siki / Devanagari', packSizeMb: 33, downloaded: false },
  { code: 'gon', name: 'Gondi', nativeName: 'गोंडी', script: 'Devanagari', packSizeMb: 38, downloaded: false },
  { code: 'bhb', name: 'Bhili', nativeName: 'भीली', script: 'Devanagari', packSizeMb: 35, downloaded: false },
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', packSizeMb: 22, downloaded: true },
];

export const TRIBAL_LANGUAGES = LANGUAGES.filter((l) => !['hi', 'en'].includes(l.code));

export function getLanguage(code: LanguageCode): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

export function languageName(code: LanguageCode): string {
  return getLanguage(code).name;
}
