/**
 * Synced record types and their validation schemas — shared by the server
 * (validation) and the app (types). Every record has an `id` generated on the
 * device so it can be created offline, and an `updatedAt` used for
 * last-write-wins merging.
 */
import { z } from 'zod';
import type {
  FlashcardContent,
  GlossaryEntry,
  LanguageCode,
  LessonContent,
  Phrase,
  Rubric,
  Subject,
  WorksheetContent,
} from '../engine/types';

export const COLLECTIONS = ['classes', 'students', 'attendance', 'assessments', 'lessons', 'materials', 'glossary', 'phrases'] as const;
export type Collection = (typeof COLLECTIONS)[number];

interface Base {
  id: string;
  updatedAt: number;
}

export interface ClassDoc extends Base {
  name: string;
  grade: number;
  /** Language the teacher teaches in */
  sourceLanguage: 'hi' | 'en';
  /** Students' home language */
  language: LanguageCode;
  createdAt: number;
}

export interface StudentDoc extends Base {
  classId: string;
  name: string;
  rollNo?: string;
  notes?: string;
  archived?: boolean;
  createdAt: number;
}

/** One document per class per day. */
export interface AttendanceDoc extends Base {
  classId: string;
  date: string; // YYYY-MM-DD
  present: Record<string, boolean>;
}

export interface AssessmentDoc extends Base {
  classId: string;
  studentId: string;
  lessonId?: string;
  outcomeCode: string;
  rubric: Rubric;
  note?: string;
  date: string;
}

export type LessonStatus = 'not-started' | 'in-progress' | 'completed';

export interface LessonDoc extends Base {
  classId?: string;
  grade: number;
  subject: Subject;
  topic: string;
  learningOutcome: string;
  outcomeCode: string;
  language: LanguageCode;
  durationMin: number;
  content: LessonContent;
  status: LessonStatus;
  progress: number;
  savedOffline: boolean;
  scheduledFor?: string; // YYYY-MM-DD
  createdAt: number;
}

export interface MaterialDoc extends Base {
  kind: 'worksheet' | 'flashcards';
  lessonId?: string;
  title: string;
  grade: number;
  subject: Subject;
  language: LanguageCode;
  worksheet?: WorksheetContent;
  flashcards?: FlashcardContent;
  createdAt: number;
}

export type GlossaryDoc = GlossaryEntry & Base;
export type PhraseDoc = Phrase & Base;

export interface RecordMap {
  classes: ClassDoc;
  students: StudentDoc;
  attendance: AttendanceDoc;
  assessments: AssessmentDoc;
  lessons: LessonDoc;
  materials: MaterialDoc;
  glossary: GlossaryDoc;
  phrases: PhraseDoc;
}

export interface TeacherProfile {
  id: string;
  email: string;
  name: string;
  school?: string;
  district?: string;
  /** Class shown by default */
  activeClassId?: string;
  onboarded?: boolean;
}

// ─── Validation ───────────────────────────────────────────────
const id = z.string().min(1).max(80).regex(/^[A-Za-z0-9_\-:.]+$/);
const ts = z.number().int().nonnegative();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const lang = z.enum(['hi', 'ho', 'sat', 'mun', 'kru', 'gon', 'bhb', 'en']);
const subject = z.enum(['Mathematics', 'Hindi', 'EVS', 'English']);
const text = (max: number) => z.string().max(max);
/** A short recording stored as a data URL (up to ~20 s of compressed audio). */
const audioDataUrl = z
  .string()
  .max(700_000)
  .regex(/^data:audio\/[a-z0-9.+-]+(;codecs=[a-z0-9.,]+)?;base64,/i);

export const SCHEMAS: Record<Collection, z.ZodType> = {
  classes: z.object({
    id,
    updatedAt: ts,
    createdAt: ts,
    name: text(80).min(1),
    grade: z.number().int().min(1).max(8),
    sourceLanguage: z.enum(['hi', 'en']),
    language: lang,
  }),
  students: z.object({
    id,
    updatedAt: ts,
    createdAt: ts,
    classId: id,
    name: text(80).min(1),
    rollNo: text(20).optional(),
    notes: text(1000).optional(),
    archived: z.boolean().optional(),
  }),
  attendance: z.object({
    id,
    updatedAt: ts,
    classId: id,
    date,
    present: z.record(z.string(), z.boolean()),
  }),
  assessments: z.object({
    id,
    updatedAt: ts,
    classId: id,
    studentId: id,
    lessonId: id.optional(),
    outcomeCode: text(20).min(1),
    rubric: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
    note: text(500).optional(),
    date,
  }),
  lessons: z.object({
    id,
    updatedAt: ts,
    createdAt: ts,
    classId: id.optional(),
    grade: z.number().int().min(1).max(8),
    subject,
    topic: text(160).min(1),
    learningOutcome: text(400),
    outcomeCode: text(20),
    language: lang,
    durationMin: z.number().int().min(1).max(240),
    content: z.object({ sections: z.array(z.any()).max(12), vocabulary: z.array(z.any()).max(60), seed: z.number() }).passthrough(),
    status: z.enum(['not-started', 'in-progress', 'completed']),
    progress: z.number().min(0).max(1),
    savedOffline: z.boolean(),
    scheduledFor: date.optional(),
  }),
  materials: z.object({
    id,
    updatedAt: ts,
    createdAt: ts,
    kind: z.enum(['worksheet', 'flashcards']),
    lessonId: id.optional(),
    title: text(160).min(1),
    grade: z.number().int().min(1).max(8),
    subject,
    language: lang,
    worksheet: z.any().optional(),
    flashcards: z.any().optional(),
  }),
  glossary: z.object({
    id,
    updatedAt: ts,
    language: lang,
    hindi: text(120).min(1),
    english: text(120),
    target: text(120),
    category: text(30),
    picture: text(30).optional(),
    value: z.number().optional(),
    status: z.enum(['unverified', 'teacher', 'verified']),
    audio: audioDataUrl.optional(),
  }),
  phrases: z.object({
    id,
    updatedAt: ts,
    language: lang,
    hindi: text(600).min(1),
    target: text(600),
    english: text(600).optional(),
    speaker: z.enum(['teacher', 'student']),
    audio: audioDataUrl.optional(),
    uses: z.number().int().min(0),
  }),
};

/** References that must point at the same teacher's records. */
export const REFERENCES: Partial<Record<Collection, { field: string; collection: Collection }[]>> = {
  students: [{ field: 'classId', collection: 'classes' }],
  attendance: [{ field: 'classId', collection: 'classes' }],
  assessments: [
    { field: 'classId', collection: 'classes' },
    { field: 'studentId', collection: 'students' },
  ],
};

export type SyncOp =
  | { op: 'put'; collection: Collection; id: string; data: unknown }
  | { op: 'delete'; collection: Collection; id: string; updatedAt: number };

export interface SyncResult {
  id: string;
  collection: Collection;
  ok: boolean;
  error?: string;
}

export interface Bootstrap {
  teacher: TeacherProfile;
  records: { [K in Collection]: RecordMap[K][] };
  serverTime: number;
}
