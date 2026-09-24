/**
 * Word list and phrasebook as a Hindi ↔ home-language parallel corpus (CSV),
 * so words collected with native speakers can be shared between teachers and
 * schools, and reused to build better translation later.
 */
import type { GlossaryCategory, GlossaryEntry, Phrase } from '../types';

const CATEGORIES: GlossaryCategory[] = ['number', 'colour', 'body', 'family', 'animal', 'nature', 'food', 'classroom', 'shape', 'action', 'time', 'place', 'greeting', 'question', 'describing'];

const cell = (v: string | number | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export function corpusCsv(words: GlossaryEntry[], phrases: Phrase[]): string {
  const rows: (string | number | undefined)[][] = [['type', 'hindi', 'english', 'target', 'category_or_speaker', 'status', 'language']];
  for (const w of words) if (w.target) rows.push(['word', w.hindi, w.english, w.target, w.category, w.status, w.language]);
  for (const p of phrases) rows.push(['phrase', p.hindi, p.english, p.target, p.speaker, 'teacher', p.language]);
  return '﻿' + rows.map((r) => r.map(cell).join(',')).join('\n');
}

/** Minimal CSV parser (quotes, escaped quotes, commas and newlines inside quotes). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim()));
}

export interface ImportedRow {
  kind: 'word' | 'phrase';
  hindi: string;
  english: string;
  target: string;
  category: GlossaryCategory;
  speaker: Phrase['speaker'];
}

/**
 * Accepts Verniq's own export, or a simple sheet with columns
 * hindi, english, target (header names are matched loosely).
 */
export function readCorpus(text: string): ImportedRow[] {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const has = (n: string) => head.findIndex((h) => h === n || h.includes(n));
  let iType = has('type');
  let iHi = has('hindi');
  let iEn = has('english');
  let iTarget = head.findIndex((h) => ['target', 'ho', 'mundari', 'santali', 'santhali', 'kurukh', 'gondi', 'bhili', 'home'].some((k) => h.includes(k)));
  let iCat = has('category');
  let body = rows.slice(1);
  if (iHi < 0) {
    // No header row: hindi, english, target
    [iType, iHi, iEn, iTarget, iCat] = [-1, 0, 1, 2, -1];
    body = rows;
  }
  return body
    .map((r) => {
      const kind = iType >= 0 && r[iType]?.trim().toLowerCase() === 'phrase' ? 'phrase' : 'word';
      const catRaw = (iCat >= 0 ? r[iCat] : r[4])?.trim().toLowerCase() ?? '';
      return {
        kind,
        hindi: (r[iHi] ?? '').trim(),
        english: iEn >= 0 ? (r[iEn] ?? '').trim() : '',
        target: iTarget >= 0 ? (r[iTarget] ?? '').trim() : '',
        category: (CATEGORIES as string[]).includes(catRaw) ? (catRaw as GlossaryCategory) : 'classroom',
        speaker: catRaw === 'student' ? 'student' : 'teacher',
      } satisfies ImportedRow;
    })
    .filter((r) => r.hindi && r.target && r.hindi.length <= (r.kind === 'word' ? 120 : 600) && r.target.length <= 600);
}
