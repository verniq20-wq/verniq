import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RUBRIC_LABELS, type AssessmentDoc, type Rubric, type StudentDoc } from '../../types';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import { cn, newId, todayISO } from '../../utils';
import { Button } from '../ui/Button';

const RUBRICS: Rubric[] = [0, 1, 2, 3];
const TONE: Record<Rubric, string> = {
  0: 'border-rose-300 bg-rose-50 text-rose-700',
  1: 'border-sun-300 bg-sun-50 text-sun-800',
  2: 'border-aqua-300 bg-aqua-50 text-aqua-800',
  3: 'border-leaf-300 bg-leaf-50 text-leaf-800',
};

interface Props {
  classId: string;
  students: StudentDoc[];
  outcomeCode: string;
  lessonId?: string;
  date?: string;
  /** Existing results, so re-opening shows and updates them */
  assessments: AssessmentDoc[];
  onSaved?: (count: number) => void;
}

/** Tap one of four levels per student. Saves one assessment per student for the outcome and date. */
export function RubricRecorder({ classId, students, outcomeCode, lessonId, date = todayISO(), assessments, onSaved }: Props) {
  const { putMany } = useData();
  const { toast } = useApp();
  const existing = useMemo(() => {
    const map = new Map<string, AssessmentDoc>();
    for (const a of assessments) if (a.outcomeCode === outcomeCode && a.date === date) map.set(a.studentId, a);
    return map;
  }, [assessments, outcomeCode, date]);
  const [marks, setMarks] = useState<Record<string, Rubric | undefined>>(() =>
    Object.fromEntries(students.map((s) => [s.id, existing.get(s.id)?.rubric])),
  );
  const [saving, setSaving] = useState(false);
  const marked = students.filter((s) => marks[s.id] !== undefined);

  const setAll = (r: Rubric) => setMarks(Object.fromEntries(students.map((s) => [s.id, r])));

  const save = async () => {
    setSaving(true);
    try {
      const docs = marked.map((s) => {
        const prev = existing.get(s.id);
        return {
          id: prev?.id ?? newId(),
          classId,
          studentId: s.id,
          lessonId: lessonId ?? prev?.lessonId,
          outcomeCode,
          rubric: marks[s.id] as Rubric,
          date,
          ...(prev?.note ? { note: prev.note } : {}),
        };
      });
      await putMany('assessments', docs);
      toast({ tone: 'success', title: `Saved results for ${docs.length} student${docs.length === 1 ? '' : 's'}` });
      onSaved?.(docs.length);
    } finally {
      setSaving(false);
    }
  };

  if (students.length === 0) {
    return <p className="text-sm text-ink-500">Add students in the Class screen to record results.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-500">Mark everyone:</span>
        {RUBRICS.map((r) => (
          <button key={r} type="button" onClick={() => setAll(r)} className="min-h-[36px] rounded-lg border border-ink-200 bg-white px-2.5 font-semibold text-ink-700 hover:border-ocean-300">
            {RUBRIC_LABELS[r]}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-ink-100 rounded-2xl border border-ink-200 bg-white">
        {students.map((s) => (
          <li key={s.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-4">
            <p className="min-w-0 flex-1 truncate font-semibold text-ink-900">
              {s.rollNo && <span className="mr-2 tabular-nums text-ink-400">{s.rollNo}</span>}
              {s.name}
            </p>
            <div role="radiogroup" aria-label={`Result for ${s.name}`} className="grid grid-cols-4 gap-1.5 sm:w-[420px]">
              {RUBRICS.map((r) => {
                const on = marks[s.id] === r;
                return (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setMarks((m) => ({ ...m, [s.id]: on ? undefined : r }))}
                    className={cn(
                      'inline-flex min-h-[40px] items-center justify-center gap-1 rounded-lg border px-1 text-xs font-semibold transition-colors sm:text-[13px]',
                      on ? TONE[r] : 'border-ink-200 bg-white text-ink-500 hover:border-ink-300',
                    )}
                  >
                    {on && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                    {RUBRIC_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          {marked.length} of {students.length} marked
        </p>
        <Button onClick={() => void save()} loading={saving} disabled={marked.length === 0}>
          Save results
        </Button>
      </div>
    </div>
  );
}
