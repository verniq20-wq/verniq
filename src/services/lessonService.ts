import { DEMO_LESSONS, NUMBER_VOCAB } from '../data/demo';
import type { Lesson, LessonRequest, LessonSection, LessonSectionKey } from '../types';
import { sleep, uid } from '../utils';
import { DEMO_LATENCY_MS } from './config';

export const LESSON_STAGES = [
  { id: 'curriculum', label: 'Understanding curriculum', icon: '✨' },
  { id: 'structure', label: 'Structuring lesson', icon: '📚' },
  { id: 'language', label: 'Preparing language content', icon: '🌐' },
  { id: 'activities', label: 'Creating activities', icon: '🎯' },
] as const;

export type LessonStageId = (typeof LESSON_STAGES)[number]['id'];

let lessons: Lesson[] = [...DEMO_LESSONS];

export async function getLessons(): Promise<Lesson[]> {
  await sleep(250);
  return lessons;
}

export async function getLesson(id: string): Promise<Lesson | undefined> {
  await sleep(150);
  return lessons.find((l) => l.id === id);
}

export async function setSavedOffline(id: string, saved: boolean): Promise<Lesson | undefined> {
  await sleep(400);
  lessons = lessons.map((l) => (l.id === id ? { ...l, savedOffline: saved } : l));
  return lessons.find((l) => l.id === id);
}

function templateSections(req: LessonRequest): LessonSection[] {
  const t = req.topic.trim() || 'today’s topic';
  return [
    {
      key: 'introduction',
      title: 'Introduction',
      durationMin: 5,
      script: `आज हम "${t}" के बारे में सीखेंगे। पहले बताओ — तुम इसके बारे में क्या जानते हो?`,
      steps: ['Greet the class in both languages', 'Connect the topic to something from the village or home', 'Ask one open question'],
    },
    {
      key: 'explain',
      title: 'Explain',
      durationMin: 8,
      script: `ध्यान से देखो। "${t}" को हम अपने आस-पास की चीज़ों से समझेंगे।`,
      steps: ['Show 3 real-life examples', 'Name each example in Hindi, then in the home language', `Link back to the outcome: ${req.learningOutcome}`],
    },
    {
      key: 'activity',
      title: 'Activity',
      durationMin: 10,
      script: 'अब छोटे समूह बनाओ। हर समूह मिलकर एक काम करेगा।',
      steps: ['Groups of 4', 'Hands-on task with local materials', 'Each group shares one answer'],
    },
    {
      key: 'practice',
      title: 'Practice',
      durationMin: 7,
      script: 'अपनी स्लेट पर करके दिखाओ।',
      steps: ['Individual slate practice', 'Peer check with a partner'],
    },
    {
      key: 'assessment',
      title: 'Assessment',
      durationMin: 5,
      script: 'मुझे एक-एक करके बताओ, तुमने क्या सीखा?',
      steps: ['Three quick oral questions', 'Thumbs up / thumbs down check', 'Note children who need support'],
    },
  ];
}

/**
 * Generate a full lesson. `onStage` reports progress so the UI can show
 * contextual loading states.
 */
export async function generateLesson(
  req: LessonRequest,
  onStage?: (stage: LessonStageId) => void,
  signal?: AbortSignal,
): Promise<Lesson> {
  for (const stage of LESSON_STAGES) {
    onStage?.(stage.id);
    await sleep(DEMO_LATENCY_MS, signal);
  }

  const isNumbers = /number|संख्या|गिनती|1\s*[–-]\s*10/i.test(req.topic);
  const base = DEMO_LESSONS[0];

  const lesson: Lesson = {
    id: uid('lesson'),
    classLevel: req.classLevel,
    subject: req.subject,
    topic: req.topic || 'Untitled lesson',
    learningOutcome: req.learningOutcome || 'Learning outcome',
    language: req.language,
    durationMin: 35,
    sections: isNumbers ? base.sections : templateSections(req),
    vocabulary: isNumbers ? NUMBER_VOCAB : NUMBER_VOCAB.slice(0, 4),
    savedOffline: false,
    status: 'not-started',
    progress: 0,
  };
  lessons = [lesson, ...lessons];
  return lesson;
}

const ALTERNATE_SCRIPTS: Record<LessonSectionKey, string[]> = {
  introduction: [
    'सुबह की शुरुआत एक गीत से करते हैं! गिनती वाला गीत गाओ मेरे साथ।',
    'आज मेरे थैले में कुछ छुपा है। अंदाज़ा लगाओ — कितनी चीज़ें होंगी?',
  ],
  explain: [
    'देखो, मैं बीज एक-एक करके रखती हूँ। हर बार नया नाम बोलेंगे।',
    'इस चार्ट को देखो। हर खाने में उतनी ही तस्वीरें हैं जितनी संख्या।',
  ],
  activity: [
    'कक्षा से बाहर चलो! पाँच पत्ते और तीन पत्थर ढूँढ कर लाओ।',
    'गोल घेरा बनाओ। गेंद जिसके पास जाएगी, वह अगली संख्या बोलेगा।',
  ],
  practice: ['मिट्टी पर उँगली से संख्या बनाओ।', 'अपने साथी को संख्या बोलो, वह उतनी बार कूदेगा।'],
  assessment: ['मैं कार्ड उठाऊँगी — तुम उसका नाम दोनों भाषाओं में बोलो।', 'कौन सी संख्या गायब है? 7, 8, _, 10'],
};

/** Regenerate a single section without touching the rest of the lesson. */
export async function regenerateSection(section: LessonSection, signal?: AbortSignal): Promise<LessonSection> {
  await sleep(DEMO_LATENCY_MS * 1.4, signal);
  const options = ALTERNATE_SCRIPTS[section.key].filter((s) => s !== section.script);
  const script = options[Math.floor(Math.random() * options.length)] ?? section.script;
  return { ...section, script };
}
