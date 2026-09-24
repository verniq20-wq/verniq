import { ArrowLeft, Compass, Languages, Play, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { regenerateSection, retranslateLesson } from '../../engine/composer';
import { outcomesFor } from '../../engine/curriculum';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Select, TextField } from '../components/ui/Select';
import { EmptyState, PageHeader } from '../components/ui/States';
import { useClassroom } from '../hooks/useClassroom';
import { useApp } from '../store/AppContext';
import type { LessonDoc, LessonSection } from '../types';
import { NipunBadge } from '../components/lesson/NipunBadge';

function TextArea({ label, value, onChange, rows = 4, lang, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; lang?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea lang={lang} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="field min-h-[96px] resize-y py-3 leading-relaxed" />
      {hint && <span className="mt-1.5 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}

/** Edit every part of a saved lesson. Changes stay on this device until saved, then sync. */
export default function LessonEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { records, put, remove, glossary, phrases } = useClassroom();
  const { toast } = useApp();
  const stored = records.lessons.find((l) => l.id === id);
  const [draft, setDraft] = useState<LessonDoc | null>(stored ?? null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ctx = { glossary, phrases };

  useEffect(() => {
    if (!draft && stored) setDraft(stored);
  }, [draft, stored]);

  const outcomes = useMemo(() => (draft ? outcomesFor(draft.subject, draft.grade) : []), [draft]);
  const dirty = !!draft && !!stored && JSON.stringify(draft) !== JSON.stringify(stored);

  if (!draft) {
    return (
      <EmptyState
        icon={Compass}
        title="We couldn't find that lesson"
        description="It may have been deleted on another device."
        action={<ButtonLink to="/lessons">Back to lessons</ButtonLink>}
      />
    );
  }

  const setSection = (key: LessonSection['key'], patch: Partial<LessonSection>) =>
    setDraft({ ...draft, content: { ...draft.content, sections: draft.content.sections.map((s) => (s.key === key ? { ...s, ...patch } : s)) } });

  const save = async (next = draft) => {
    // Keep the home-language words in step with the edited scripts.
    const content = retranslateLesson(next.content, ctx);
    const durationMin = content.sections.reduce((t, s) => t + (Number(s.durationMin) || 0), 0);
    const saved = await put('lessons', { ...next, content, durationMin });
    setDraft(saved);
    toast({ tone: 'success', title: 'Lesson saved' });
  };

  const regen = (key: LessonSection['key']) => {
    const updated = regenerateSection({ grade: draft.grade, subject: draft.subject, topic: draft.topic, outcomeCode: draft.outcomeCode }, draft.content, key, ctx);
    setSection(key, updated);
  };

  const del = async () => {
    await remove('lessons', draft.id);
    toast({ tone: 'info', title: 'Lesson deleted' });
    navigate('/lessons', { replace: true });
  };

  return (
    <>
      <Link to="/lessons" className="mb-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-lg text-sm font-semibold text-ink-500 hover:text-ink-800">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Lessons
      </Link>
      <PageHeader
        title="Edit lesson"
        description={`${draft.subject} · Class ${draft.grade} · ${draft.durationMin} min`}
        action={
          <>
            <ButtonLink to={`/lessons/${draft.id}/play`} variant="outline" icon={<Play className="h-4 w-4" />}>
              Teach
            </ButtonLink>
            <Button onClick={() => void save()} disabled={!dirty} icon={<Save className="h-4 w-4" />}>
              Save
            </Button>
          </>
        }
      />

      <div className="space-y-4 sm:space-y-5">
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Topic" value={draft.topic} onChange={(topic) => setDraft({ ...draft, topic })} />
            <Select
              label="Curriculum outcome"
              value={draft.outcomeCode}
              options={[
                ...outcomes.map((o) => ({ value: o.code, label: `${o.code} · ${o.statement.length > 60 ? o.statement.slice(0, 57) + "…" : o.statement}` })),
                ...(outcomes.some((o) => o.code === draft.outcomeCode) ? [] : [{ value: draft.outcomeCode, label: draft.outcomeCode }]),
              ]}
              onChange={(code) => {
                const o = outcomes.find((x) => x.code === code);
                setDraft({ ...draft, outcomeCode: code, learningOutcome: o?.statement ?? draft.learningOutcome });
              }}
            />
            <div className="sm:col-span-2">
              <TextArea label="Learning outcome" rows={2} value={draft.learningOutcome} onChange={(learningOutcome) => setDraft({ ...draft, learningOutcome })} />
              <NipunBadge code={draft.outcomeCode} className="mt-2" />
            </div>
          </div>
        </Card>

        {draft.content.sections.map((s, i) => (
          <Card key={s.key}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-aqua-600">
                {String(i + 1).padStart(2, '0')} · {s.title}
              </p>
              <Button size="sm" variant="ghost" onClick={() => regen(s.key)} icon={<RotateCcw className="h-4 w-4" />}>
                Try another idea
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <TextField label="Section title" value={s.title} onChange={(title) => setSection(s.key, { title })} />
              <TextField
                label="Minutes"
                type="number"
                inputMode="numeric"
                min={1}
                max={60}
                value={String(s.durationMin)}
                onChange={(v) => setSection(s.key, { durationMin: Math.max(1, Math.min(60, Number(v) || 1)) })}
              />
              <div className="sm:col-span-2">
                <TextArea label="What you say" lang="hi" value={s.script} onChange={(script) => setSection(s.key, { script })} />
              </div>
              <div className="sm:col-span-2">
                <TextArea
                  label="Steps in class"
                  hint="One step per line."
                  rows={Math.max(3, s.steps.length + 1)}
                  value={s.steps.join('\n')}
                  onChange={(v) => setSection(s.key, { steps: v.split('\n').map((x) => x.trimStart()).filter((x, idx, arr) => x || idx < arr.length - 1) })}
                />
              </div>
              <div className="sm:col-span-2">
                <TextField
                  label="Things you need"
                  hint="Separate with commas."
                  value={(s.materials ?? []).join(', ')}
                  onChange={(v) => setSection(s.key, { materials: v.split(',').map((x) => x.trim()).filter(Boolean) })}
                />
              </div>
            </div>
          </Card>
        ))}

        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm text-ink-500">
              <Languages className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Home-language key words are refreshed from your word list each time you save.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setConfirmDelete(true)} icon={<Trash2 className="h-4 w-4" />} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                Delete
              </Button>
              <Button onClick={() => void save()} disabled={!dirty} icon={<Save className="h-4 w-4" />}>
                Save changes
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this lesson?"
        description="It will be removed from this device and your other devices. Results already recorded for students are kept."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void del()}>
              Delete lesson
            </Button>
          </>
        }
      >
        <p className="font-semibold text-ink-900">{draft.topic}</p>
      </Modal>
    </>
  );
}
