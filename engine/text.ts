/** Small text utilities shared by the engine: normalisation, tokens, similarity, seeded randomness. */

/** Normalise Devanagari/Latin text for matching. */
export function normalize(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[।॥.,!?;:"“”'‘’()[\]{}—–\-…/\\|]+/g, ' ') // danda, punctuation
    .replace(/़/g, '') // nukta: ज़ → ज
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokens(text: string): string[] {
  const n = normalize(text);
  return n ? n.split(' ') : [];
}

const EN_STOP = new Set(['the', 'a', 'an', 'of', 'to', 'and', 'in', 'on', 'for', 'with', 'is', 'are', 'from', 'up', 'by', 'at', 'their', 'its', 'as', 'into', 'about']);

/** Very light English stemmer so "animals" matches "animal", "counting" matches "count". */
function stem(w: string): string {
  if (/^[a-z]+$/.test(w)) {
    if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
    if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith('s')) return w.slice(0, -1);
  }
  return w;
}

export function keyTokens(text: string): string[] {
  return tokens(text)
    .filter((t) => !EN_STOP.has(t) && t.length > 1)
    .map(stem);
}

/** Jaccard similarity of two token sets. */
export function jaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

/** Share of `query` tokens found in `doc`. */
export function containment(query: string[], doc: string[]): number {
  if (!query.length) return 0;
  const D = new Set(doc);
  return query.filter((q) => D.has(q)).length / query.length;
}

/** Deterministic pseudo-random generator (mulberry32). */
export function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length) % items.length];
}

export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Fill {slot} placeholders. Unknown slots are left empty. */
export function fill(template: string, slots: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => slots[k] ?? '').replace(/\s+([,.।?!])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}

/** Parse "1–10", "1-20", "numbers up to 50" into a range. */
export function numberRange(text: string): { from: number; to: number } | null {
  const m = text.match(/(\d+)\s*(?:–|-|to|से)\s*(\d+)/i);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (b > a && b - a <= 1000) return { from: a, to: b };
  }
  const up = text.match(/(?:up to|upto|till|तक)\s*(\d+)|(\d+)\s*तक/i);
  if (up) return { from: 1, to: Number(up[1] ?? up[2]) };
  return null;
}
