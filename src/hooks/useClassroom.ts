import { useMemo } from 'react';
import { computeInsights } from '../../engine/insights';
import { useData } from '../store/DataContext';
import type { LanguagePair } from '../types';
import { todayISO } from '../utils';

/** Everything about the active class, derived from stored records. */
export function useClassroom() {
  const data = useData();
  const { records, activeClass, glossaryFor, phrasesFor } = data;
  const classId = activeClass?.id;

  return useMemo(() => {
    const pair: LanguagePair = { source: activeClass?.sourceLanguage ?? 'hi', target: activeClass?.language ?? 'ho' };
    const students = records.students.filter((s) => s.classId === classId).sort((a, b) => (a.rollNo ? 0 : 1) - (b.rollNo ? 0 : 1) || (a.rollNo ?? '').localeCompare(b.rollNo ?? '', undefined, { numeric: true }) || a.name.localeCompare(b.name));
    const activeStudents = students.filter((s) => !s.archived);
    const lessons = records.lessons
      .filter((l) => !l.classId || l.classId === classId)
      .sort((a, b) => b.createdAt - a.createdAt);
    const attendance = records.attendance.filter((a) => a.classId === classId);
    const assessments = records.assessments.filter((a) => a.classId === classId);
    const today = todayISO();
    const todayAttendance = attendance.find((a) => a.date === today);
    const insights = computeInsights(
      activeStudents,
      attendance.flatMap((a) => Object.entries(a.present).map(([studentId, present]) => ({ studentId, present, date: a.date }))),
      assessments,
      today,
    );
    const todaysLesson =
      lessons.find((l) => l.scheduledFor === today && l.status !== 'completed') ??
      lessons.find((l) => l.status === 'in-progress') ??
      lessons.find((l) => l.status === 'not-started') ??
      null;
    const glossary = glossaryFor(pair.target);
    const phrases = phrasesFor(pair.target);
    const materials = records.materials.sort((a, b) => b.createdAt - a.createdAt);
    return { ...data, pair, students, activeStudents, lessons, attendance, assessments, todayAttendance, insights, todaysLesson, glossary, phrases, materials, today };
  }, [data, records, activeClass, classId, glossaryFor, phrasesFor]);
}
