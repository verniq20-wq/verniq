/**
 * Demo content for Verniq.
 *
 * Everything in this file is sample data used while the backend is not
 * connected. Tribal-language entries are illustrative and marked
 * `needs-review`: they must be validated by native speakers before
 * classroom use. Replace with API responses via the services layer.
 */
import type { Flashcard, Lesson, NotificationItem, PictureKey, Student, TranslationTurn, VocabularyItem } from '../types';

export const TEACHER = {
  name: 'Sunita Kumari',
  shortName: 'Sunita',
  school: 'Govt. Primary School, Chaibasa',
  district: 'West Singhbhum, Jharkhand',
  classLevel: 1,
  studentCount: 24,
};

export const NUMBER_VOCAB: VocabularyItem[] = [
  { hindi: 'एक', target: 'मियद', english: 'One' },
  { hindi: 'दो', target: 'बरिया', english: 'Two' },
  { hindi: 'तीन', target: 'आपिया', english: 'Three' },
  { hindi: 'चार', target: 'उपुनिया', english: 'Four' },
  { hindi: 'पाँच', target: 'मोंड़ेया', english: 'Five' },
  { hindi: 'छह', target: 'तुरुइया', english: 'Six' },
  { hindi: 'सात', target: 'एया', english: 'Seven' },
  { hindi: 'आठ', target: 'इरिलिया', english: 'Eight' },
  { hindi: 'नौ', target: 'आरेया', english: 'Nine' },
  { hindi: 'दस', target: 'गेलेया', english: 'Ten' },
];

const numbersLesson: Lesson = {
  id: 'math-numbers-1-10',
  classLevel: 1,
  subject: 'Mathematics',
  topic: 'Numbers 1–10',
  learningOutcome: 'Number Recognition',
  outcomeCode: 'M1.01',
  language: 'ho',
  durationMin: 35,
  savedOffline: true,
  status: 'in-progress',
  progress: 0.4,
  scheduledFor: new Date().toISOString(),
  vocabulary: NUMBER_VOCAB,
  sections: [
    {
      key: 'introduction',
      title: 'Introduction',
      durationMin: 5,
      script:
        'आज हम गिनती सीखेंगे — एक से दस तक। अपनी उँगलियाँ दिखाओ! हमारे पास कितनी उँगलियाँ हैं?',
      steps: ['Greet the class in Ho and Hindi', 'Ask children to hold up both hands', 'Count fingers together slowly'],
    },
    {
      key: 'explain',
      title: 'Explain',
      durationMin: 8,
      script:
        'यह है संख्या एक — एक पत्थर। यह है दो — दो पत्ते। हर संख्या के लिए हम चीज़ें गिनेंगे और नाम दोनों भाषाओं में बोलेंगे।',
      steps: ['Show number cards 1 to 10', 'Place real objects (stones, leaves, seeds) next to each card', 'Say each number in Hindi, then in Ho'],
    },
    {
      key: 'activity',
      title: 'Activity',
      durationMin: 10,
      script:
        'चलो खेल खेलते हैं! मैं संख्या बोलूँगी, तुम उतनी बार ताली बजाओ।',
      steps: ['Clap-the-number game', 'Children take turns picking a card', 'Group counts aloud in Ho'],
    },
    {
      key: 'practice',
      title: 'Practice',
      durationMin: 7,
      script: 'अब अपनी स्लेट पर 1 से 10 तक लिखो। जो संख्या छूट गई है, उसे भरो।',
      steps: ['Trace numbers 1–10', 'Fill the missing number in 1, 2, _, 4', 'Match numeral to object group'],
    },
    {
      key: 'assessment',
      title: 'Assessment',
      durationMin: 5,
      script: 'मुझे दिखाओ — पाँच पत्थर कहाँ हैं? पाँच के बाद कौन सी संख्या आती है?',
      steps: ['Point to the group of five', 'Ask "what comes after five?"', 'Note children who need another round'],
    },
  ],
};

export const DEMO_LESSONS: Lesson[] = [
  numbersLesson,
  {
    ...numbersLesson,
    id: 'math-shapes',
    topic: 'Shapes Around Us',
    learningOutcome: 'Identify circle, square and triangle',
    outcomeCode: 'M1.04',
    durationMin: 30,
    status: 'not-started',
    progress: 0,
    savedOffline: true,
    scheduledFor: undefined,
  },
  {
    ...numbersLesson,
    id: 'evs-animals',
    subject: 'EVS',
    topic: 'Animals Around Us',
    learningOutcome: 'Name common domestic and wild animals',
    outcomeCode: 'E1.02',
    durationMin: 30,
    status: 'completed',
    progress: 1,
    savedOffline: true,
    scheduledFor: undefined,
  },
  {
    ...numbersLesson,
    id: 'hindi-swar',
    subject: 'Hindi',
    topic: 'स्वर — Vowels अ to औ',
    learningOutcome: 'Recognise and sound out Hindi vowels',
    outcomeCode: 'H1.01',
    durationMin: 35,
    status: 'completed',
    progress: 1,
    savedOffline: false,
    scheduledFor: undefined,
  },
  {
    ...numbersLesson,
    id: 'evs-family',
    subject: 'EVS',
    topic: 'My Family',
    learningOutcome: 'Talk about family members and their roles',
    outcomeCode: 'E1.01',
    durationMin: 25,
    status: 'not-started',
    progress: 0,
    savedOffline: false,
    scheduledFor: undefined,
  },
  {
    ...numbersLesson,
    id: 'math-bigger-smaller',
    topic: 'Bigger and Smaller',
    learningOutcome: 'Compare two groups of objects',
    outcomeCode: 'M1.03',
    durationMin: 30,
    status: 'not-started',
    progress: 0,
    savedOffline: true,
    scheduledFor: undefined,
  },
];

const pic = (picture: PictureKey) => ({ type: 'picture' as const, picture });

/** Target-language words left empty have not been collected yet — the UI says so instead of guessing. */
export const ANIMAL_FLASHCARDS: Flashcard[] = [
  { id: 'a1', visual: pic('dog'), english: 'Dog', hindi: 'कुत्ता', target: 'सेता', review: 'needs-review' },
  { id: 'a2', visual: pic('cat'), english: 'Cat', hindi: 'बिल्ली', target: 'पुसि', review: 'needs-review' },
  { id: 'a3', visual: pic('cow'), english: 'Cow', hindi: 'गाय', target: 'गाय', review: 'needs-review' },
  { id: 'a4', visual: pic('horse'), english: 'Horse', hindi: 'घोड़ा', target: 'सादोम', review: 'needs-review' },
  { id: 'a5', visual: pic('bird'), english: 'Bird', hindi: 'चिड़िया', target: 'चेंड़े', review: 'needs-review' },
  { id: 'a6', visual: pic('fish'), english: 'Fish', hindi: 'मछली', target: 'हाकु', review: 'needs-review' },
  { id: 'a7', visual: pic('rabbit'), english: 'Rabbit', hindi: 'खरगोश', target: 'कुलै', review: 'needs-review' },
  { id: 'a8', visual: pic('butterfly'), english: 'Butterfly', hindi: 'तितली', target: '', review: 'needs-review' },
  { id: 'a9', visual: pic('beetle'), english: 'Beetle', hindi: 'भृंग', target: '', review: 'needs-review' },
];

export const NATURE_FLASHCARDS: Flashcard[] = [
  { id: 'n1', visual: pic('sun'), english: 'Sun', hindi: 'सूरज', target: 'सिङगि', review: 'needs-review' },
  { id: 'n2', visual: pic('moon'), english: 'Moon', hindi: 'चाँद', target: 'चांडु', review: 'needs-review' },
  { id: 'n3', visual: pic('tree'), english: 'Tree', hindi: 'पेड़', target: 'दारु', review: 'needs-review' },
  { id: 'n4', visual: pic('flower'), english: 'Flower', hindi: 'फूल', target: 'बा', review: 'needs-review' },
  { id: 'n5', visual: pic('leaf'), english: 'Leaf', hindi: 'पत्ता', target: 'सकम', review: 'needs-review' },
  { id: 'n6', visual: pic('star'), english: 'Star', hindi: 'तारा', target: '', review: 'needs-review' },
];

/** Sample conversation turns used by the demo voice session. */
export const DEMO_PHRASES: Omit<TranslationTurn, 'id' | 'at' | 'sourceLang' | 'targetLang'>[] = [
  {
    direction: 'teacher-to-student',
    sourceText: 'पाँच के बाद कौन सी संख्या आती है?',
    translatedText: 'मोंड़ेया ताएओम चि संख्या हिजुःआ?',
  },
  {
    direction: 'student-to-teacher',
    sourceText: 'तुरुइया!',
    translatedText: 'छह!',
  },
  {
    direction: 'teacher-to-student',
    sourceText: 'बहुत अच्छा! अब मुझे तीन पत्थर दिखाओ।',
    translatedText: 'आलाङ बुगिन! नेंदो आपिया दिरि उदुब् इञ।',
  },
  {
    direction: 'student-to-teacher',
    sourceText: 'इञ आपिया दिरि मेनाः।',
    translatedText: 'मेरे पास तीन पत्थर हैं।',
  },
];

export const STUDENTS: Student[] = [
  { id: 's1', name: 'Birsa Hembrom', progress: 0.92, attendance: 0.96 },
  { id: 's2', name: 'Salge Purty', progress: 0.88, attendance: 0.94 },
  { id: 's3', name: 'Mangal Sinku', progress: 0.54, attendance: 0.71, attention: 'Missed 4 lessons this month' },
  { id: 's4', name: 'Jonga Bodra', progress: 0.85, attendance: 0.9 },
  { id: 's5', name: 'Sumi Laguri', progress: 0.49, attendance: 0.88, attention: 'Struggling with numbers 6–10' },
  { id: 's6', name: 'Dasmati Gope', progress: 0.9, attendance: 0.98 },
  { id: 's7', name: 'Ramesh Tiu', progress: 0.58, attendance: 0.82, attention: 'Needs more practice with vowels' },
  { id: 's8', name: 'Phulmani Deogam', progress: 0.81, attendance: 0.92 },
  { id: 's9', name: 'Lakhan Banra', progress: 0.52, attendance: 0.79, attention: 'Low activity completion' },
];

export const TOPIC_MASTERY = [
  { topic: 'Numbers 1–10', value: 0.78 },
  { topic: 'Shapes', value: 0.64 },
  { topic: 'Animals', value: 0.91 },
  { topic: 'Hindi vowels', value: 0.84 },
  { topic: 'My Family', value: 0.72 },
];

export const WEEKLY_ACTIVITY = [
  { week: 'Wk 1', value: 0.74 },
  { week: 'Wk 2', value: 0.8 },
  { week: 'Wk 3', value: 0.77 },
  { week: 'Wk 4', value: 0.86 },
  { week: 'Wk 5', value: 0.91 },
];

const now = Date.now();
export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', kind: 'lesson', title: "Today's lesson is ready", detail: 'Numbers 1–10 · Class 1', at: now - 1000 * 60 * 12, read: false },
  { id: 'n2', kind: 'sync', title: '3 new lessons available offline', detail: 'Shapes, Bigger & Smaller, Animals', at: now - 1000 * 60 * 60 * 3, read: false },
  { id: 'n3', kind: 'voice', title: 'Language pack updated', detail: 'Ho voice pack v1.4', at: now - 1000 * 60 * 60 * 20, read: true },
  { id: 'n4', kind: 'success', title: 'Worksheet generated', detail: 'Counting 1–10 · Easy', at: now - 1000 * 60 * 60 * 26, read: true },
];
