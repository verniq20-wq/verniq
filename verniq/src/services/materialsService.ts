import { ANIMAL_FLASHCARDS, NUMBER_VOCAB } from '../data/demo';
import type { Difficulty, Flashcard, LanguageCode, Lesson, Worksheet, WorksheetItem } from '../types';
import { sleep, uid } from '../utils';
import { DEMO_LATENCY_MS } from './config';

export const WORKSHEET_STAGES = ['Reading lesson', 'Choosing activities', 'Writing both languages', 'Laying out the page'];

function itemsFor(difficulty: Difficulty): WorksheetItem[] {
  const max = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 10;
  const countA = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 6 : 9;
  const countB = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 8;
  const pickPairs = [...NUMBER_VOCAB.slice(0, max)].sort(() => Math.random() - 0.5).slice(0, 4);
  const start = difficulty === 'challenging' ? 5 : 1;
  const seq = Array.from({ length: 6 }, (_, i) => start + i);
  const blanks = difficulty === 'easy' ? [2] : difficulty === 'medium' ? [1, 4] : [1, 3, 5];

  return [
    { kind: 'count', prompt: 'गिनो और लिखो', promptTarget: 'लेखाय मे आर ओल मे', emoji: '🍎', count: countA },
    { kind: 'count', prompt: 'गिनो और लिखो', promptTarget: 'लेखाय मे आर ओल मे', emoji: '🐟', count: countB },
    {
      kind: 'match',
      prompt: 'संख्या को सही शब्द से मिलाओ',
      promptTarget: 'संख्या ओड़ो कजि मिलाव मे',
      pairs: pickPairs.map((v) => ({ left: String(NUMBER_VOCAB.indexOf(v) + 1), right: v.target })),
    },
    {
      kind: 'fill',
      prompt: 'छूटी हुई संख्या भरो',
      promptTarget: 'बाङ संख्या ओल मे',
      sequence: seq.map((n, i) => (blanks.includes(i) ? null : n)),
    },
    {
      kind: 'circle',
      prompt: 'पाँच पर गोला बनाओ',
      promptTarget: 'मोंड़ेया रे गोल ओल मे',
      options: ['3', '5', '8', '2'],
      answer: '5',
    },
  ];
}

export async function generateWorksheet(
  lesson: Lesson,
  language: LanguageCode,
  difficulty: Difficulty,
  onStage?: (index: number) => void,
): Promise<Worksheet> {
  for (let i = 0; i < WORKSHEET_STAGES.length; i++) {
    onStage?.(i);
    await sleep(DEMO_LATENCY_MS * 0.8);
  }
  return {
    id: uid('ws'),
    lessonId: lesson.id,
    title: lesson.topic,
    titleTarget: 'लेखा 1–10',
    classLevel: lesson.classLevel,
    subject: lesson.subject,
    language,
    difficulty,
    items: itemsFor(difficulty),
    createdAt: Date.now(),
  };
}

export async function generateFlashcards(topic: string, count: number): Promise<Flashcard[]> {
  await sleep(DEMO_LATENCY_MS * 2);
  const q = topic.toLowerCase();
  const pool: Flashcard[] = /number|गिनती|संख्या/.test(q)
    ? NUMBER_VOCAB.map((v, i) => ({ id: `n${i}`, emoji: v.emoji ?? '🔢', english: v.english, hindi: v.hindi, target: v.target, review: 'needs-review' as const }))
    : ANIMAL_FLASHCARDS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length)).map((c) => ({ ...c, id: uid('card') }));
}
