import { AnimatePresence, motion } from 'framer-motion';
import { Check, Download, FileText, Pencil, Printer, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { generateWorksheet } from '../../../engine/materials';
import { useClassroom } from '../../hooks/useClassroom';
import { exportElementToPdf } from '../../platform/pdf';
import { useApp } from '../../store/AppContext';
import type { Difficulty, MaterialDoc, WorksheetContent } from '../../types';
import { cn, newId, sleep } from '../../utils';
import { AIStatus } from '../ui/AIStatus';
import { Button, ButtonLink } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/States';
import { WorksheetPreview } from './WorksheetPreview';

const FLOW = ['Lesson', 'Difficulty', 'Generate', 'Edit & save'];
const STAGES = ['Reading the lesson', 'Choosing activities', 'Adding home-language words'];

const DIFFICULTIES: { value: Difficulty; label: string; hint: string }[] = [
  { value: 'easy', label: 'Easy', hint: 'Fewer, simpler items' },
  { value: 'medium', label: 'Medium', hint: 'A little more' },
  { value: 'challenging', label: 'Challenging', hint: 'Stretch items' },
];

interface Draft {
  id?: string;
  title: string;
  lessonId?: string;
  worksheet: WorksheetContent;
}

export function WorksheetGenerator({ lessonParam, openParam }: { lessonParam?: string | null; openParam?: string | null }) {
  const { lessons, records, put, glossaryFor, phrasesFor, teacher } = useClassroom();
  const { toast, notify } = useApp();
  const [lessonId, setLessonId] = useState(lessonParam ?? lessons[0]?.id ?? '');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [stage, setStage] = useState(-1);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saved, setSaved] = useState<MaterialDoc | null>(null);
  const [editing, setEditing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const paper = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const lesson = lessons.find((l) => l.id === lessonId) ?? lessons[0];
  const generating = stage >= 0 && stage < STAGES.length;
  const flowStep = draft ? 3 : generating ? 2 : 1;
  const dirty = !!draft && (!saved || saved.title !== draft.title || JSON.stringify(saved.worksheet) !== JSON.stringify(draft.worksheet));

  // Open a saved worksheet from the Saved tab
  const loaded = useRef<string | null>(null);
  useEffect(() => {
    if (!openParam || loaded.current === openParam) return;
    const m = records.materials.find((x) => x.id === openParam && x.kind === 'worksheet');
    if (m?.worksheet) {
      loaded.current = openParam;
      setDraft({ id: m.id, title: m.title, lessonId: m.lessonId, worksheet: m.worksheet });
      setSaved(m);
      if (m.lessonId) setLessonId(m.lessonId);
    }
  }, [openParam, records.materials]);

  const generate = async () => {
    if (!lesson) return;
    setEditing(false);
    setDraft(null);
    setSaved(null);
    if (window.innerWidth < 1024) setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    for (let i = 0; i < STAGES.length; i++) {
      setStage(i);
      await sleep(220);
    }
    const ctx = { glossary: glossaryFor(lesson.language), phrases: phrasesFor(lesson.language) };
    const ws = generateWorksheet(
      { grade: lesson.grade, subject: lesson.subject, topic: lesson.topic, outcomeCode: lesson.outcomeCode, vocabulary: lesson.content.vocabulary, difficulty },
      ctx,
    );
    setStage(STAGES.length);
    setDraft({ title: `${lesson.topic} — worksheet`, lessonId: lesson.id, worksheet: ws });
    notify({ kind: 'success', title: 'Worksheet ready', detail: `${lesson.topic} · ${difficulty}` });
  };

  const save = async () => {
    if (!draft) return;
    const src = lessons.find((l) => l.id === draft.lessonId) ?? lesson;
    const doc = await put('materials', {
      id: draft.id ?? newId(),
      kind: 'worksheet',
      lessonId: draft.lessonId,
      title: draft.title.trim() || 'Worksheet',
      grade: src?.grade ?? 1,
      subject: src?.subject ?? 'Mathematics',
      language: src?.language ?? 'ho',
      worksheet: draft.worksheet,
      createdAt: saved?.createdAt ?? Date.now(),
    });
    setDraft({ ...draft, id: doc.id });
    setSaved(doc);
    setEditing(false);
    toast({ tone: 'success', title: 'Worksheet saved', detail: 'Find it any time under Saved.' });
  };

  const exportPdf = async () => {
    if (!paper.current || !draft) return;
    setEditing(false);
    setExporting(true);
    try {
      await sleep(50);
      await exportElementToPdf(paper.current, draft.title, { title: draft.title });
    } catch {
      toast({ tone: 'error', title: 'Could not make the PDF', detail: 'Try Print and choose “Save as PDF”.' });
    } finally {
      setExporting(false);
    }
  };

  if (lessons.length === 0 && !draft) {
    return (
      <EmptyState
        icon={FileText}
        title="Create a lesson first"
        description="Worksheets are made from a lesson so they match what you taught."
        action={<ButtonLink to="/studio">Create lesson</ButtonLink>}
      />
    );
  }

  const meta = (() => {
    const src = lessons.find((l) => l.id === draft?.lessonId) ?? lesson;
    return { title: draft?.title ?? '', school: teacher?.school, grade: saved?.grade ?? src?.grade ?? 1, subject: saved?.subject ?? src?.subject ?? '', language: saved?.language ?? src?.language ?? 'ho', outcomeCode: src?.outcomeCode };
  })();

  return (
    <div className="space-y-4 sm:space-y-6">
      <ol className="flex items-center gap-1 overflow-x-auto pb-1 text-sm scrollbar-none" aria-label="Worksheet steps">
        {FLOW.map((f, i) => (
          <li key={f} className="flex shrink-0 items-center gap-1">
            <span
              aria-current={i === flowStep ? 'step' : undefined}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition-colors duration-300',
                i < flowStep && 'bg-aqua-50 text-aqua-700',
                i === flowStep && 'bg-ocean-600 text-white',
                i > flowStep && 'bg-ink-100 text-ink-400',
              )}
            >
              {i < flowStep ? <Check className="h-3.5 w-3.5" aria-hidden /> : <span className="tabular-nums">{i + 1}</span>}
              <span className={cn(i !== flowStep && 'hidden sm:inline')}>{f}</span>
            </span>
            {i < FLOW.length - 1 && <span className="h-px w-2 bg-ink-200 sm:w-4" aria-hidden />}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="h-fit space-y-5 lg:sticky lg:top-24">
          <Select
            label="1 · Lesson"
            value={lesson?.id ?? ''}
            onChange={setLessonId}
            options={lessons.map((l) => ({ value: l.id, label: `${l.topic} · Class ${l.grade}` }))}
          />
          <fieldset>
            <legend className="field-label">2 · Difficulty</legend>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  aria-pressed={difficulty === d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={cn(
                    'flex min-h-[64px] flex-col items-center justify-center rounded-xl border px-2 text-center transition-all duration-200',
                    difficulty === d.value ? 'border-ocean-500 bg-ocean-50 text-ocean-700 ring-2 ring-ocean-100' : 'border-ink-200 text-ink-700 hover:border-ocean-200',
                  )}
                >
                  <span className="text-sm font-bold">{d.label}</span>
                  <span className="text-[11px] leading-tight text-ink-500">{d.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <Button size="lg" fullWidth onClick={() => void generate()} loading={generating} icon={!generating && <Sparkles className="h-5 w-5" />} disabled={!lesson}>
            {generating ? 'Generating…' : draft ? 'Generate new' : 'Generate worksheet'}
          </Button>
          <p className="text-xs text-ink-500">Every question is built from the lesson’s words and checked so the answers are correct.</p>
        </Card>

        <div ref={resultRef} className="min-w-0 scroll-mt-20">
          <AnimatePresence mode="wait">
            {generating ? (
              <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AIStatus stages={STAGES.map((s, i) => ({ id: String(i), label: s }))} current={stage} />
              </motion.div>
            ) : draft ? (
              <motion.div key="ws" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant={editing ? 'secondary' : 'outline'} icon={<Pencil className="h-4 w-4" />} onClick={() => setEditing((e) => !e)} aria-pressed={editing}>
                    {editing ? 'Done' : 'Edit'}
                  </Button>
                  <Button onClick={() => void save()} disabled={!dirty} icon={<Save className="h-4 w-4" />}>
                    {saved && !dirty ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="outline" loading={exporting} icon={<Download className="h-4 w-4" />} onClick={() => void exportPdf()}>
                    PDF
                  </Button>
                  <Button variant="ghost" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
                    Print
                  </Button>
                  {!saved && (
                    <Button variant="ghost" icon={<RotateCcw className="h-4 w-4" />} onClick={() => void generate()}>
                      Regenerate
                    </Button>
                  )}
                </div>
                {editing && <p className="text-sm text-sun-700">Change any instruction or remove a question, then save.</p>}
                <div className="overflow-x-auto">
                  <WorksheetPreview
                    ref={paper}
                    worksheet={draft.worksheet}
                    meta={meta}
                    editable={editing}
                    onChange={(worksheet, title) => setDraft({ ...draft, worksheet, title: title ?? draft.title })}
                  />
                </div>
              </motion.div>
            ) : (
              <EmptyState
                key="empty"
                icon={FileText}
                title="Your worksheet will appear here"
                description="Choose a lesson and difficulty. Verniq makes a printable Hindi + home-language worksheet you can edit, save and export as PDF."
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
