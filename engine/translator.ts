/**
 * Verniq translator — a transparent, offline, rule-based system.
 *
 * 1. Translation memory: sentences the teacher has confirmed are reused exactly.
 * 2. Close match: a confirmed sentence that differs by a word or two is offered
 *    with the differing words flagged.
 * 3. Keyword gloss: known words (numbers, nouns, key verbs) are rendered from
 *    the glossary; unknown words are kept and flagged.
 *
 * It never invents words. Coverage tells the teacher how much it could render,
 * and every correction the teacher saves becomes new memory.
 */
import { jaccard, normalize, tokens } from './text';
import type { GlossaryEntry, Phrase, TranslationResult, TranslationSegment } from './types';

/** Hindi function words that carry grammar rather than meaning in a keyword gloss. */
const HI_STOP = new Set(
  'है हैं था थे थी हो का की के को में से पर और या तो भी ही यह वह ये वो हम तुम आप मैं उस इस उन इन कि जो ने एक अब फिर बहुत सब कुछ कर करो करें करेंगे करते रहा रहे रही गया गए गई लिए साथ वाला वाली वाले'
    .split(' '),
);
const EN_STOP = new Set('the a an is are am was were to of in on at and or it this that we you i be do does for with'.split(' '));

type Direction = 'to-target' | 'to-hindi';

interface Index {
  map: Map<string, GlossaryEntry>;
  maxN: number;
}

const DIGITS = /^[0-9०-९]+$/;
const DEVANAGARI_DIGIT = '०१२३४५६७८९';
function digitValue(t: string): number | null {
  if (!DIGITS.test(t)) return null;
  return Number(
    t
      .split('')
      .map((c) => (DEVANAGARI_DIGIT.includes(c) ? DEVANAGARI_DIGIT.indexOf(c) : c))
      .join(''),
  );
}

function buildIndex(glossary: GlossaryEntry[], dir: Direction, sourceIsEnglish: boolean): Index {
  const map = new Map<string, GlossaryEntry>();
  let maxN = 1;
  // Teacher-confirmed entries win over starter entries
  const ordered = [...glossary].sort((a, b) => (a.status === 'unverified' ? 0 : 1) - (b.status === 'unverified' ? 0 : 1));
  for (const e of ordered) {
    const key = normalize(dir === 'to-hindi' ? e.target : sourceIsEnglish ? e.english : e.hindi);
    if (!key) continue;
    if (dir === 'to-target' && !e.target) continue;
    map.set(key, e);
    maxN = Math.max(maxN, key.split(' ').length);
  }
  return { map, maxN: Math.min(maxN, 4) };
}

export interface TranslateOptions {
  glossary: GlossaryEntry[];
  phrases: Phrase[];
  direction?: Direction;
  /** Source text is English rather than Hindi */
  sourceIsEnglish?: boolean;
}

export function translate(text: string, opts: TranslateOptions): TranslationResult {
  const dir = opts.direction ?? 'to-target';
  const src = text.trim();
  const norm = normalize(src);
  if (!norm) return { text: '', segments: [], coverage: 0, method: 'gloss' };

  // 1 · exact memory
  const phraseSource = (p: Phrase) => (dir === 'to-target' ? p.hindi : p.target);
  const phraseOutput = (p: Phrase) => (dir === 'to-target' ? p.target : p.hindi);
  const usable = opts.phrases.filter((p) => phraseSource(p) && phraseOutput(p));
  const exact = usable.find((p) => normalize(phraseSource(p)) === norm);
  if (exact) {
    return {
      text: phraseOutput(exact),
      segments: [{ source: src, output: phraseOutput(exact), known: true, via: 'phrase' }],
      coverage: 1,
      method: 'memory',
      matchedPhraseId: exact.id,
    };
  }

  // 2 · close memory match
  const toks = tokens(src);
  let best: { p: Phrase; score: number } | null = null;
  for (const p of usable) {
    const pt = tokens(phraseSource(p));
    if (Math.abs(pt.length - toks.length) > 2) continue;
    const score = jaccard(toks, pt);
    if (!best || score > best.score) best = { p, score };
  }
  if (best && best.score >= 0.72 && toks.length >= 3) {
    const pt = new Set(tokens(phraseSource(best.p)));
    const differing = toks.filter((t) => !pt.has(t));
    const out = phraseOutput(best.p);
    return {
      text: out,
      segments: [
        { source: src, output: out, known: true, via: 'phrase' },
        ...differing.map((d) => ({ source: d, output: d, known: false, via: 'unknown' as const })),
      ],
      coverage: best.score,
      method: 'close',
      matchedPhraseId: best.p.id,
    };
  }

  // 3 · keyword gloss
  const index = buildIndex(opts.glossary, dir, !!opts.sourceIsEnglish);
  const stop = opts.sourceIsEnglish ? EN_STOP : HI_STOP;
  const numbers = opts.glossary.filter((g) => g.category === 'number' && g.value !== undefined);
  const segments: TranslationSegment[] = [];
  let i = 0;
  while (i < toks.length) {
    let matched = false;
    for (let n = Math.min(index.maxN, toks.length - i); n >= 1; n--) {
      const key = toks.slice(i, i + n).join(' ');
      const hit = index.map.get(key);
      if (hit) {
        const out = dir === 'to-hindi' ? hit.hindi : hit.target;
        segments.push({ source: key, output: out, known: true, via: 'glossary' });
        i += n;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const t = toks[i];
    const num = digitValue(t);
    if (num !== null) {
      const word = numbers.find((g) => g.value === num);
      const out = word ? (dir === 'to-hindi' ? word.hindi : word.target) || t : t;
      segments.push({ source: t, output: out, known: true, via: 'number' });
    } else if (dir === 'to-target' && stop.has(t)) {
      segments.push({ source: t, output: '', known: true, via: 'stopword' });
    } else {
      segments.push({ source: t, output: t, known: false, via: 'unknown' });
    }
    i++;
  }

  const content = segments.filter((s) => s.via !== 'stopword');
  const known = content.filter((s) => s.known).length;
  const coverage = content.length ? known / content.length : 0;
  const out = segments
    .map((s) => s.output)
    .filter(Boolean)
    .join(' ');
  return { text: out, segments, coverage, method: 'gloss' };
}

/** Human description of a result, for the UI. */
export function describeResult(r: TranslationResult): string {
  if (r.method === 'memory') return 'Saved translation';
  if (r.method === 'close') return 'Similar saved sentence — check the highlighted words';
  const pct = Math.round(r.coverage * 100);
  return `Keyword guide · ${pct}% of words known`;
}
