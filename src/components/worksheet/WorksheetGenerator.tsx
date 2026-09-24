import { AnimatePresence, motion } from 'framer-motion';
import { Check, Download, FileText, Pencil, Printer, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { TRIBAL_LANGUAGES } from '../../data/languages';
import { WORKSHEET_STAGES, generateWorksheet } from '../../services/materialsService';
import { useApp } from '../../store/AppContext';
import type { Difficulty, LanguageCode, Worksheet } from '../../types';
import { cn } from '../../utils';
import { AIStatus } from '../ui/AIStatus';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/States';
import { WorksheetPreview } from './WorksheetPreview';

const FLOW = ['Choose lesson', 'Language', 'Difficulty', 'Generate', 'Preview'];

const DIFFICULTIES: { value: Difficulty; label: string; hint: string }[] = [
  { value: 'easy', label: 'Easy', hint: 'Numbers 1–5' },
  { value: 'medium', label: 'Medium', hint: 'Numbers 1–8' },
  { value: 'challenging', label: 'Challenging', hint: 'Numbers 1–10' },
];

export function WorksheetGenerator() {
  const { lessons, pair, toast, notify } = useApp();
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? '');
  const [language, setLanguage] = useState<LanguageCode>(pair.target);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [stage, setStage] = useState(-1);
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [editing, setEditing] = useState(false);

  const lesson = lessons.find((l) => l.id === lessonId) ?? lessons[0];
  const generating = stage >= 0 && stage < WORKSHEET_STAGES.length;
  const flowStep = worksheet ? 4 : generating ? 3 : 2;

  const generate = async () => {
    if (!lesson) return;
    setEditing(false);
    setWorksheet(null);
    setStage(0);
    const ws = await generateWorksheet(lesson, language, difficulty, setStage);
    setStage(WORKSHEET_STAGES.length);
    setWorksheet(ws);
    notify({ kind: 'success', title: 'Worksheet generated', detail: `${ws.title} · ${difficulty}` });
  };

  const share = async () => {
    const text = `Worksheet: ${worksheet?.title} (Class ${worksheet?.classLevel})`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Verniq worksheet', text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast({ tone: 'success', title: 'Copied to share', detail: 'Paste it into WhatsApp or SMS.' });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Flow indicator */}
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
            options={lessons.map((l) => ({ value: l.id, label: `${l.topic} · Class ${l.classLevel}` }))}
          />
          <Select
            label="2 · Students' language"
            value={language}
            onChange={(v) => setLanguage(v as LanguageCode)}
            options={TRIBAL_LANGUAGES.map((l) => ({ value: l.code, label: `Hindi + ${l.name}` }))}
          />
          <fieldset>
            <legend className="field-label">3 · Difficulty</legend>
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
                  <span className="text-[11px] text-ink-500">{d.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <Button size="lg" fullWidth onClick={() => void generate()} loading={generating} icon={!generating && <Sparkles className="h-5 w-5" />} disabled={!lesson}>
            {generating ? 'Generating…' : worksheet ? 'Generate new' : 'Generate worksheet'}
          </Button>
        </Card>

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {generating ? (
              <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <AIStatus stages={WORKSHEET_STAGES.map((s, i) => ({ id: String(i), label: s }))} current={stage} />
                {/* paper appearing */}
                <div className="mx-auto max-w-[720px] space-y-3 rounded-2xl border border-ink-200 bg-white p-8" aria-hidden>
                  {Array.from({ length: stage + 2 }).map((_, i) => (
                    <motion.div key={i} initial={{ opacity: 0, width: '30%' }} animate={{ opacity: 1, width: `${60 + ((i * 17) % 35)}%` }} className="h-4 rounded bg-ink-100" />
                  ))}
                </div>
              </motion.div>
            ) : worksheet ? (
              <motion.div key="ws" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant={editing ? 'secondary' : 'outline'} icon={<Pencil className="h-4 w-4" />} onClick={() => setEditing((e) => !e)} aria-pressed={editing}>
                    {editing ? 'Done editing' : 'Edit'}
                  </Button>
                  <Button variant="outline" icon={<RotateCcw className="h-4 w-4" />} onClick={() => void generate()}>
                    Regenerate
                  </Button>
                  <Button icon={<Download className="h-4 w-4" />} onClick={() => window.print()} title="Opens the print dialog — choose “Save as PDF”">
                    Download PDF
                  </Button>
                  <Button variant="outline" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
                    Print
                  </Button>
                  <Button variant="ghost" icon={<Share2 className="h-4 w-4" />} onClick={() => void share()}>
                    Share
                  </Button>
                </div>
                {editing && <p className="text-sm text-sun-700">Click any text on the worksheet to change it.</p>}
                <WorksheetPreview worksheet={worksheet} editable={editing} />
              </motion.div>
            ) : (
              <EmptyState
                key="empty"
                icon={FileText}
                title="Your worksheet will appear here"
                description="Choose a lesson, language and difficulty. Verniq creates a printable bilingual worksheet with counting, matching and fill-in activities."
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
