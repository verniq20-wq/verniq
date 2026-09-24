/**
 * Class insights computed from the teacher's own records: attendance and
 * outcome assessments. Plain, explainable rules — every flag says why.
 */
import { outcomeByCode } from './curriculum';
import type { Rubric } from './types';

export interface StudentLite {
  id: string;
  name: string;
  archived?: boolean;
}
export interface AttendanceLite {
  studentId: string;
  date: string; // YYYY-MM-DD
  present: boolean;
}
export interface AssessmentLite {
  studentId: string;
  outcomeCode: string;
  rubric: Rubric;
  date: string;
}

export interface StudentInsight {
  id: string;
  name: string;
  attendance: number | null; // 0..1, null when no records
  mastery: number | null; // average rubric / 3
  assessed: number;
  flags: string[];
}

export interface OutcomeInsight {
  code: string;
  statement: string;
  assessed: number;
  /** Share of assessed students at Developing or above */
  mastered: number;
}

export interface ClassInsights {
  students: StudentInsight[];
  outcomes: OutcomeInsight[];
  classMastery: number | null;
  classAttendance: number | null;
  needsAttention: StudentInsight[];
  recommendations: { kind: 'revise' | 'attendance' | 'assess'; text: string; outcomeCode?: string }[];
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function computeInsights(
  students: StudentLite[],
  attendance: AttendanceLite[],
  assessments: AssessmentLite[],
  today = new Date().toISOString().slice(0, 10),
): ClassInsights {
  const active = students.filter((s) => !s.archived);
  const cutoff = new Date(new Date(today).getTime() - 30 * 86400000).toISOString().slice(0, 10);

  const studentInsights = active.map<StudentInsight>((s) => {
    const att = attendance.filter((a) => a.studentId === s.id && a.date >= cutoff);
    const as = assessments.filter((a) => a.studentId === s.id);
    // Latest rubric per outcome counts
    const latest = new Map<string, AssessmentLite>();
    for (const a of [...as].sort((x, y) => x.date.localeCompare(y.date))) latest.set(a.outcomeCode, a);
    const scores = [...latest.values()].map((a) => a.rubric / 3);
    const attendanceRate = att.length ? att.filter((a) => a.present).length / att.length : null;
    const mastery = avg(scores);
    const flags: string[] = [];
    if (attendanceRate !== null && att.length >= 5 && attendanceRate < 0.75) flags.push(`Attendance ${Math.round(attendanceRate * 100)}% in the last 30 days`);
    const weak = [...latest.values()].filter((a) => a.rubric <= 1);
    if (weak.length) {
      const names = weak.slice(0, 2).map((w) => outcomeByCode(w.outcomeCode)?.code ?? w.outcomeCode);
      flags.push(`Not yet secure on ${names.join(', ')}${weak.length > 2 ? ` and ${weak.length - 2} more` : ''}`);
    }
    const recentAbsences = att
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3)
      .filter((a) => !a.present).length;
    if (recentAbsences === 3) flags.push('Absent for the last 3 recorded days');
    return { id: s.id, name: s.name, attendance: attendanceRate, mastery, assessed: latest.size, flags };
  });

  const codes = [...new Set(assessments.map((a) => a.outcomeCode))];
  const outcomes = codes.map<OutcomeInsight>((code) => {
    const latest = new Map<string, AssessmentLite>();
    for (const a of assessments.filter((x) => x.outcomeCode === code).sort((x, y) => x.date.localeCompare(y.date))) latest.set(a.studentId, a);
    const rs = [...latest.values()];
    return {
      code,
      statement: outcomeByCode(code)?.statement ?? code,
      assessed: rs.length,
      mastered: rs.length ? rs.filter((r) => r.rubric >= 2).length / rs.length : 0,
    };
  });

  const recommendations: ClassInsights['recommendations'] = [];
  for (const o of outcomes.filter((x) => x.assessed >= 3 && x.mastered < 0.6).sort((a, b) => a.mastered - b.mastered).slice(0, 2)) {
    recommendations.push({ kind: 'revise', outcomeCode: o.code, text: `Only ${Math.round(o.mastered * 100)}% are secure on ${o.code} — plan a revision lesson.` });
  }
  const lowAtt = studentInsights.filter((s) => s.flags.some((f) => f.startsWith('Attendance') || f.startsWith('Absent')));
  if (lowAtt.length) recommendations.push({ kind: 'attendance', text: `${lowAtt.length} ${lowAtt.length === 1 ? 'student needs' : 'students need'} a home visit or call about attendance.` });
  const unassessed = studentInsights.filter((s) => s.assessed === 0).length;
  if (active.length && unassessed / active.length > 0.5) recommendations.push({ kind: 'assess', text: `${unassessed} students have no assessments yet — record results after your next lesson.` });

  return {
    students: studentInsights,
    outcomes: outcomes.sort((a, b) => a.code.localeCompare(b.code)),
    classMastery: avg(studentInsights.map((s) => s.mastery).filter((x): x is number => x !== null)),
    classAttendance: avg(studentInsights.map((s) => s.attendance).filter((x): x is number => x !== null)),
    needsAttention: studentInsights.filter((s) => s.flags.length),
    recommendations,
  };
}
