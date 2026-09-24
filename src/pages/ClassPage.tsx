import { Archive, ArchiveRestore, Check, ChevronLeft, ChevronRight, ClipboardCheck, GraduationCap, Pencil, Plus, Settings2, UserPlus, Users, X } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { outcomesFor } from '../../engine/curriculum';
import { RubricRecorder } from '../components/class/RubricRecorder';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Select, TextField } from '../components/ui/Select';
import { EmptyState, PageHeader } from '../components/ui/States';
import { Tabs } from '../components/ui/Tabs';
import { LANGUAGES, TRIBAL_LANGUAGES } from '../data/languages';
import { useClassroom } from '../hooks/useClassroom';
import { useApp } from '../store/AppContext';
import { SUBJECTS, type ClassDoc, type LanguageCode, type StudentDoc } from '../types';
import { cn, formatShortDate, newId, parseStudentLines, todayISO } from '../utils';

type Tab = 'students' | 'attendance' | 'assess' | 'class';

function shiftDate(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return todayISO(d);
}

export default function ClassPage() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab: Tab = raw === 'attendance' || raw === 'assess' || raw === 'class' ? raw : 'students';
  const { activeClass } = useClassroom();

  if (!activeClass) {
    return <EmptyState icon={Users} title="No class yet" description="Add a class to start." />;
  }

  return (
    <>
      <PageHeader title={activeClass.name} description={`Class ${activeClass.grade} · students, attendance and results`} />
      <Tabs
        label="Class sections"
        size="lg"
        stretch
        className="mb-5 sm:mb-6 sm:inline-grid sm:w-auto"
        value={tab}
        onChange={(t) => setParams({ tab: t }, { replace: true })}
        tabs={[
          { value: 'students', label: 'Students', icon: <Users className="h-4 w-4" aria-hidden /> },
          { value: 'attendance', label: <span><span className="sm:hidden">Attend.</span><span className="hidden sm:inline">Attendance</span></span>, icon: <ClipboardCheck className="h-4 w-4" aria-hidden /> },
          { value: 'assess', label: 'Results', icon: <GraduationCap className="h-4 w-4" aria-hidden /> },
          { value: 'class', label: <span className="sr-only sm:not-sr-only">Class</span>, icon: <Settings2 className="h-4 w-4" aria-hidden /> },
        ]}
      />
      <div role="tabpanel">
        {tab === 'students' && <StudentsTab />}
        {tab === 'attendance' && <AttendanceTab />}
        {tab === 'assess' && <AssessTab />}
        {tab === 'class' && <ClassTab />}
      </div>
    </>
  );
}

// ─── Students ────────────────────────────────────────────────
function StudentsTab() {
  const { activeClass, students, put, putMany } = useClassroom();
  const { toast } = useApp();
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [bulk, setBulk] = useState<string | null>(null);
  const [editing, setEditing] = useState<StudentDoc | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const active = students.filter((s) => !s.archived);
  const archived = students.filter((s) => s.archived);

  if (!activeClass) return null;

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await put('students', { id: newId(), classId: activeClass.id, name: name.trim(), ...(roll.trim() ? { rollNo: roll.trim() } : {}), createdAt: Date.now() });
    setName('');
    setRoll('');
  };

  const addBulk = async () => {
    const rows = parseStudentLines(bulk ?? '');
    if (!rows.length) return;
    const now = Date.now();
    await putMany('students', rows.map((r, i) => ({ id: newId(), classId: activeClass.id, name: r.name, ...(r.rollNo ? { rollNo: r.rollNo } : {}), createdAt: now + i })));
    toast({ tone: 'success', title: `Added ${rows.length} students` });
    setBulk(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[1fr_340px]">
      <Card>
        <CardHeader title={`${active.length} students`} subtitle="Tap a name to edit" />
        {active.length === 0 ? (
          <p className="text-sm text-ink-500">No students yet. Add them one at a time or paste a list.</p>
        ) : (
          <ul className="-mx-2 divide-y divide-ink-100">
            {active.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => setEditing(s)} className="flex min-h-[52px] w-full items-center gap-3 rounded-xl px-2 text-left hover:bg-ink-50">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ocean-50 text-sm font-bold tabular-nums text-ocean-700">{s.rollNo ?? s.name.charAt(0)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink-900">{s.name}</span>
                    {s.notes && <span className="block truncate text-xs text-ink-500">{s.notes}</span>}
                  </span>
                  <Pencil className="h-4 w-4 shrink-0 text-ink-300" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        {archived.length > 0 && (
          <div className="mt-4 border-t border-ink-100 pt-3">
            <button type="button" onClick={() => setShowArchived((v) => !v)} className="text-sm font-semibold text-ink-500 hover:text-ink-800">
              {showArchived ? 'Hide' : 'Show'} {archived.length} archived
            </button>
            {showArchived && (
              <ul className="mt-2 space-y-1">
                {archived.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 text-sm text-ink-500">
                    {s.name}
                    <Button size="sm" variant="ghost" icon={<ArchiveRestore className="h-4 w-4" />} onClick={() => void put('students', { ...s, archived: false })}>
                      Restore
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader title="Add a student" />
          <form onSubmit={add} className="space-y-3">
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <TextField label="Roll no." inputMode="numeric" value={roll} onChange={setRoll} maxLength={6} />
              <TextField label="Name" value={name} onChange={setName} maxLength={80} required />
            </div>
            <Button type="submit" fullWidth icon={<UserPlus className="h-4 w-4" />} disabled={!name.trim()}>
              Add
            </Button>
          </form>
          <button type="button" onClick={() => setBulk('')} className="mt-3 text-sm font-semibold text-ocean-600 hover:underline">
            Paste a list of names
          </button>
        </Card>
      </div>

      <Modal
        open={bulk !== null}
        onClose={() => setBulk(null)}
        title="Add many students"
        description="One student per line. Start a line with a number to set the roll number, e.g. “12 Birsa Hembrom”."
        footer={
          <>
            <Button variant="ghost" onClick={() => setBulk(null)}>
              Cancel
            </Button>
            <Button onClick={() => void addBulk()} disabled={!parseStudentLines(bulk ?? '').length}>
              Add {parseStudentLines(bulk ?? '').length || ''} students
            </Button>
          </>
        }
      >
        <textarea aria-label="Student names" value={bulk ?? ''} onChange={(e) => setBulk(e.target.value)} rows={8} className="field min-h-[200px] py-3" />
      </Modal>

      {editing && <StudentEditor key={editing.id} student={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function StudentEditor({ student, onClose }: { student: StudentDoc; onClose: () => void }) {
  const { put } = useClassroom();
  const [name, setName] = useState(student.name);
  const [roll, setRoll] = useState(student.rollNo ?? '');
  const [notes, setNotes] = useState(student.notes ?? '');

  const save = async () => {
    const { rollNo: _r, notes: _n, ...rest } = student;
    void _r;
    void _n;
    await put('students', { ...rest, name: name.trim(), ...(roll.trim() ? { rollNo: roll.trim() } : {}), ...(notes.trim() ? { notes: notes.trim() } : {}) });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit student"
      footer={
        <>
          <Button
            variant="ghost"
            className="mr-auto"
            icon={<Archive className="h-4 w-4" />}
            onClick={() => {
              void put('students', { ...student, archived: true });
              onClose();
            }}
          >
            Archive
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={!name.trim()}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-[90px_1fr] gap-3">
          <TextField label="Roll no." value={roll} onChange={setRoll} maxLength={6} />
          <TextField label="Name" value={name} onChange={setName} maxLength={80} />
        </div>
        <TextField label="Note (optional)" value={notes} onChange={setNotes} maxLength={200} hint="e.g. needs glasses, speaks Santali at home" />
        <p className="text-xs text-ink-500">Archived students are hidden from attendance and results but their history is kept.</p>
      </div>
    </Modal>
  );
}

// ─── Attendance ──────────────────────────────────────────────
function AttendanceTab() {
  const { activeClass, activeStudents, attendance, put, today } = useClassroom();
  const [date, setDate] = useState(today);
  const doc = attendance.find((a) => a.date === date);
  const marked = doc ? activeStudents.filter((s) => s.id in doc.present).length : 0;
  const present = doc ? activeStudents.filter((s) => doc.present[s.id]).length : 0;
  const recent = useMemo(() => [...attendance].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7), [attendance]);

  if (!activeClass) return null;
  if (activeStudents.length === 0) {
    return <EmptyState icon={Users} title="Add students first" description="Attendance needs a class list." action={<ButtonLink to="/class?tab=students">Add students</ButtonLink>} />;
  }

  const save = (presentMap: Record<string, boolean>) =>
    put('attendance', { id: doc?.id ?? newId(), classId: activeClass.id, date, present: presentMap });

  const toggle = (id: string, value: boolean) => void save({ ...(doc?.present ?? {}), [id]: value });
  const allPresent = () => void save(Object.fromEntries(activeStudents.map((s) => [s.id, true])));

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[1fr_300px]">
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Previous day" onClick={() => setDate((d) => shiftDate(d, -1))} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-ink-100">
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <label className="sr-only" htmlFor="att-date">
              Date
            </label>
            <input id="att-date" type="date" max={today} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="field h-10 min-h-0 w-[160px] py-0" />
            <button
              type="button"
              aria-label="Next day"
              disabled={date >= today}
              onClick={() => setDate((d) => shiftDate(d, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-ink-100 disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <Button variant="soft" onClick={allPresent} icon={<Check className="h-4 w-4" />}>
            Everyone present
          </Button>
        </div>
        <p className="mb-3 text-sm text-ink-500" aria-live="polite">
          {date === today ? 'Today' : formatShortDate(date)} · {present} present · {marked - present} absent · {activeStudents.length - marked} not marked
        </p>
        <ul className="divide-y divide-ink-100 rounded-2xl border border-ink-200">
          {activeStudents.map((s) => {
            const v = doc?.present[s.id];
            return (
              <li key={s.id} className="flex items-center gap-3 px-3 py-2">
                <span className="w-8 shrink-0 text-right text-sm tabular-nums text-ink-400">{s.rollNo}</span>
                <span className="min-w-0 flex-1 truncate font-semibold text-ink-900">{s.name}</span>
                <div role="radiogroup" aria-label={`Attendance for ${s.name}`} className="flex gap-1.5">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={v === true}
                    onClick={() => toggle(s.id, true)}
                    className={cn('inline-flex h-11 min-w-[48px] items-center justify-center gap-1 rounded-xl border px-2.5 text-sm font-bold', v === true ? 'border-leaf-500 bg-leaf-500 text-white' : 'border-ink-200 text-ink-500 hover:border-leaf-300')}
                  >
                    <Check className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Present</span>
                    <span className="sm:hidden">P</span>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={v === false}
                    onClick={() => toggle(s.id, false)}
                    className={cn('inline-flex h-11 min-w-[48px] items-center justify-center gap-1 rounded-xl border px-2.5 text-sm font-bold', v === false ? 'border-rose-500 bg-rose-500 text-white' : 'border-ink-200 text-ink-500 hover:border-rose-300')}
                  >
                    <X className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Absent</span>
                    <span className="sm:hidden">A</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-ink-500">Saved as you tap — works offline.</p>
      </Card>

      <Card>
        <CardHeader title="Recent days" />
        {recent.length === 0 ? (
          <p className="text-sm text-ink-500">No attendance taken yet.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((a) => {
              const p = activeStudents.filter((s) => a.present[s.id]).length;
              return (
                <li key={a.id}>
                  <button type="button" onClick={() => setDate(a.date)} className={cn('flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-ink-50', a.date === date && 'bg-ocean-50')}>
                    <span className="font-semibold text-ink-800">{a.date === today ? 'Today' : formatShortDate(a.date)}</span>
                    <span className="tabular-nums text-ink-500">
                      {p}/{activeStudents.length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ─── Results ─────────────────────────────────────────────────
function AssessTab() {
  const { activeClass, activeStudents, assessments, lessons, today } = useClassroom();
  const grade = activeClass?.grade ?? 1;
  const options = useMemo(() => SUBJECTS.flatMap((s) => outcomesFor(s, grade)), [grade]);
  const lastTaught = lessons.find((l) => l.status !== 'not-started');
  const [code, setCode] = useState(lastTaught?.outcomeCode ?? options[0]?.code ?? '');
  const [date, setDate] = useState(today);
  const outcome = options.find((o) => o.code === code);
  const history = useMemo(() => {
    const byKey = new Map<string, { code: string; date: string; count: number }>();
    for (const a of assessments) {
      const k = `${a.outcomeCode}|${a.date}`;
      const cur = byKey.get(k) ?? { code: a.outcomeCode, date: a.date, count: 0 };
      cur.count++;
      byKey.set(k, cur);
    }
    return [...byKey.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  }, [assessments]);

  if (!activeClass) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[1fr_300px]">
      <Card>
        <div className="grid gap-3 sm:grid-cols-[1fr_170px]">
          <Select
            label="Learning outcome"
            value={code}
            onChange={setCode}
            options={options.map((o) => ({ value: o.code, label: `${o.code} · ${o.subject} · ${o.statement.length > 50 ? `${o.statement.slice(0, 48)}…` : o.statement}` }))}
          />
          <TextField label="Date" type="date" max={today} value={date} onChange={(v) => v && setDate(v)} />
        </div>
        {outcome && <p className="mb-4 mt-2 text-sm text-ink-500">{outcome.statement}</p>}
        <RubricRecorder key={`${code}|${date}`} classId={activeClass.id} students={activeStudents} outcomeCode={code} date={date} assessments={assessments} />
      </Card>
      <Card>
        <CardHeader title="Recorded" subtitle="Tap to open" />
        {history.length === 0 ? (
          <p className="text-sm text-ink-500">Nothing recorded yet.</p>
        ) : (
          <ul className="space-y-1">
            {history.map((h) => (
              <li key={`${h.code}${h.date}`}>
                <button
                  type="button"
                  onClick={() => {
                    setCode(h.code);
                    setDate(h.date);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-ink-50"
                >
                  <span className="font-semibold text-ink-800">{h.code}</span>
                  <span className="text-ink-500">
                    {formatShortDate(h.date)} · {h.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <Link to="/progress" className="mt-3 inline-block text-sm font-semibold text-ocean-600 hover:underline">
          See class progress
        </Link>
      </Card>
    </div>
  );
}

// ─── Class settings ─────────────────────────────────────────
function ClassForm({ initial, onSave, submitLabel }: { initial: Omit<ClassDoc, 'id' | 'updatedAt' | 'createdAt'>; onSave: (c: Omit<ClassDoc, 'id' | 'updatedAt' | 'createdAt'>) => void; submitLabel: string }) {
  const [c, setC] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (c.name.trim()) onSave({ ...c, name: c.name.trim() });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Select label="Class" value={String(c.grade)} onChange={(v) => setC({ ...c, grade: Number(v) })} options={[1, 2, 3, 4, 5].map((g) => ({ value: String(g), label: `Class ${g}` }))} />
        <TextField label="Name" value={c.name} onChange={(name) => setC({ ...c, name })} maxLength={80} required />
      </div>
      <Select
        label="I teach in"
        value={c.sourceLanguage}
        onChange={(v) => setC({ ...c, sourceLanguage: v as 'hi' | 'en' })}
        options={LANGUAGES.filter((l) => l.code === 'hi' || l.code === 'en').map((l) => ({ value: l.code, label: l.name }))}
      />
      <Select
        label="Children's home language"
        value={c.language}
        onChange={(v) => setC({ ...c, language: v as LanguageCode })}
        options={TRIBAL_LANGUAGES.map((l) => ({ value: l.code, label: `${l.name} · ${l.nativeName}` }))}
      />
      <Button type="submit" disabled={!c.name.trim()}>
        {submitLabel}
      </Button>
    </form>
  );
}

function ClassTab() {
  const { activeClass, records, put, setActiveClass } = useClassroom();
  const { toast } = useApp();
  const [adding, setAdding] = useState(false);
  if (!activeClass) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title="This class" />
        <ClassForm
          key={activeClass.id + activeClass.updatedAt}
          initial={{ name: activeClass.name, grade: activeClass.grade, sourceLanguage: activeClass.sourceLanguage, language: activeClass.language }}
          submitLabel="Save class"
          onSave={(c) => {
            void put('classes', { ...activeClass, ...c });
            toast({ tone: 'success', title: 'Class saved' });
          }}
        />
      </Card>
      <Card>
        <CardHeader
          title="Your classes"
          action={
            <Button size="sm" variant="soft" icon={<Plus className="h-4 w-4" />} onClick={() => setAdding(true)}>
              New class
            </Button>
          }
        />
        <ul className="space-y-2">
          {records.classes.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => void setActiveClass(c.id)}
                aria-current={c.id === activeClass.id}
                className={cn('flex min-h-[52px] w-full items-center justify-between rounded-xl border px-3 text-left', c.id === activeClass.id ? 'border-ocean-300 bg-ocean-50' : 'border-ink-200 hover:border-ocean-200')}
              >
                <span>
                  <span className="block font-semibold text-ink-900">{c.name}</span>
                  <span className="block text-xs text-ink-500">
                    Class {c.grade} · {records.students.filter((s) => s.classId === c.id && !s.archived).length} students
                  </span>
                </span>
                {c.id === activeClass.id && <Check className="h-5 w-5 text-ocean-600" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <Modal open={adding} onClose={() => setAdding(false)} title="New class">
        <ClassForm
          initial={{ name: '', grade: activeClass.grade, sourceLanguage: activeClass.sourceLanguage, language: activeClass.language }}
          submitLabel="Create class"
          onSave={async (c) => {
            const doc = await put('classes', { id: newId(), ...c, createdAt: Date.now() });
            await setActiveClass(doc.id);
            setAdding(false);
            toast({ tone: 'success', title: `${doc.name} created`, detail: 'Now add students.' });
          }}
        />
      </Modal>
    </div>
  );
}
