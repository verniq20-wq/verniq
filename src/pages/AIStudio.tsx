import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BookOpen, Check, CloudDownload, Languages, Play, RefreshCw, RotateCcw, Sparkles, Target, WifiOff } from 'lucide-react';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AIStatus } from '../components/ui/AIStatus';
import { AudioButton } from '../components/ui/AudioButton';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select, TextField } from '../components/ui/Select';
import { ErrorState, PageHeader } from '../components/ui/States';
import { TRIBAL_LANGUAGES, languageName } from '../data/languages';
import { useAudio } from '../hooks/useAudio';
import { LESSON_STAGES, generateLesson, regenerateSection, type LessonStageId } from '../services/lessonService';
import { useApp } from '../store/AppContext';
import type { LanguageCode, Lesson, LessonRequest, Subject } from '../types';
import { cn, sleep } from '../utils';

const STAGE_ICONS: Record<LessonStageId, ReactNode> = {
  curriculum: <Sparkles className="h-4 w-4" />,
  structure: <BookOpen className="h-4 w-4" />,
  language: <Languages className="h-4 w-4" />,
  activities: <Target className="h-4 w-4" />,
};

const TOPIC_SUGGESTIONS: Record<Subject, string[]> = {
  Mathematics: ['Numbers 1–10', 'Shapes Around Us', 'Bigger and Smaller'],
  Hindi: ['स्वर — Vowels', 'Rhymes and Sounds', 'My Name'],
  EVS: ['Animals Around Us', 'My Family', 'Plants and Trees'],
  English: ['Greetings', 'Colours', 'Body Parts'],
};

export default function AIStudio() {
  const { pair, upsertLesson, toggleOffline, toast, notify } = useApp();
  const [req, setReq] = useState<LessonRequest>({
    classLevel: 1,
    subject: 'Mathematics',
    topic: 'Numbers 1–10',
    learningOutcome: 'Number Recognition',
    language: pair.target,
  });
  const [stage, setStage] = useState(-1);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [active, setActive] = useState(0);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const audio = useAudio();

  const generating = stage >= 0 && !lesson && !error;

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(false);
    setLesson(null);
    setStage(0);
    try {
      const result = await generateLesson(req, (id) => setStage(LESSON_STAGES.findIndex((s) => s.id === id)));
      setStage(LESSON_STAGES.length);
      await sleep(600); // let the "Lesson ready" state register
      setLesson(result);
      setActive(0);
      upsertLesson(result);
      notify({ kind: 'lesson', title: 'Lesson generated', detail: `${result.topic} · Class ${result.classLevel}` });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    } catch {
      setStage(-1);
      setError(true);
    }
  };

  const regen = async (index: number) => {
    if (!lesson) return;
    const section = lesson.sections[index];
    setRegenerating(section.key);
    try {
      const updated = await regenerateSection(section);
      const next = { ...lesson, sections: lesson.sections.map((s, i) => (i === index ? updated : s)) };
      setLesson(next);
      upsertLesson(next);
      toast({ tone: 'success', title: `${section.title} regenerated`, detail: 'The rest of the lesson is unchanged.' });
    } finally {
      setRegenerating(null);
    }
  };

  const saveOffline = async () => {
    if (!lesson || lesson.savedOffline) return;
    await toggleOffline(lesson.id);
    setLesson({ ...lesson, savedOffline: true });
  };

  const section = lesson?.sections[active];

  return (
    <>
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1.5 text-aqua-600">
            <Sparkles className="h-4 w-4" aria-hidden /> AI Lesson Studio
          </span>
        }
        title="Create a complete lesson in seconds."
        description="Pick the class and learning outcome. Verniq writes the lesson, the teacher script and activities in both languages."
      />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <Card className="h-fit lg:sticky lg:top-24">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-[112px_1fr] gap-3 sm:grid-cols-2 sm:gap-4">
              <Select
                label="Class"
                value={String(req.classLevel)}
                onChange={(v) => setReq({ ...req, classLevel: Number(v) })}
                options={[1, 2, 3, 4, 5].map((c) => ({ value: String(c), label: `Class ${c}` }))}
              />
              <Select
                label="Subject"
                value={req.subject}
                onChange={(v) => setReq({ ...req, subject: v as Subject, topic: TOPIC_SUGGESTIONS[v as Subject][0] })}
                options={(['Mathematics', 'Hindi', 'EVS', 'English'] as Subject[]).map((s) => ({ value: s, label: s }))}
              />
            </div>
            <div>
              <TextField label="Topic" value={req.topic} onChange={(v) => setReq({ ...req, topic: v })} required placeholder="e.g. Numbers 1–10" />
              <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Suggested topics">
                {TOPIC_SUGGESTIONS[req.subject].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setReq({ ...req, topic: t })}
                    className={cn(
                      'min-h-[32px] rounded-lg px-2.5 text-xs font-semibold transition-colors',
                      req.topic === t ? 'bg-ocean-100 text-ocean-700' : 'bg-ink-100 text-ink-600 hover:bg-ink-200',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <TextField
              label="Learning outcome"
              value={req.learningOutcome}
              onChange={(v) => setReq({ ...req, learningOutcome: v })}
              required
              placeholder="e.g. Number Recognition"
            />
            <Select
              label="Students' language"
              value={req.language}
              onChange={(v) => setReq({ ...req, language: v as LanguageCode })}
              options={TRIBAL_LANGUAGES.map((l) => ({ value: l.code, label: `${l.name} · ${l.nativeName}` }))}
            />
            <Button type="submit" size="lg" fullWidth loading={generating} icon={!generating && <Sparkles className="h-5 w-5" />}>
              {generating ? 'Generating…' : lesson ? 'Generate again' : 'Generate lesson'}
            </Button>
          </form>
        </Card>

        {/* Output */}
        <div ref={resultRef} className="min-w-0 scroll-mt-24">
          <AnimatePresence mode="wait">
            {error ? (
              <ErrorState key="error" onRetry={() => void submit()} onContinueOffline={() => setError(false)} />
            ) : generating ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AIStatus stages={LESSON_STAGES.map((s) => ({ ...s, icon: STAGE_ICONS[s.id] }))} current={stage} doneLabel="Lesson ready" />
              </motion.div>
            ) : lesson && section ? (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-leaf-100 bg-leaf-50 px-5 py-4">
                  <p className="flex items-center gap-2 font-semibold text-leaf-700">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-leaf-500 text-white">
                      <Check className="h-4 w-4" aria-hidden />
                    </span>
                    Lesson generated · {lesson.topic}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void saveOffline()}
                      icon={lesson.savedOffline ? <WifiOff className="h-4 w-4" /> : <CloudDownload className="h-4 w-4" />}
                      disabled={lesson.savedOffline}
                    >
                      {lesson.savedOffline ? 'Saved offline' : 'Save offline'}
                    </Button>
                    <ButtonLink to={`/lessons/${lesson.id}/play`} size="sm" icon={<Play className="h-4 w-4 fill-current" />}>
                      Start lesson
                    </ButtonLink>
                  </div>
                </div>

                {/* Stepper */}
                <nav aria-label="Lesson sections" className="overflow-x-auto scrollbar-none">
                  <ol className="flex min-w-max gap-2">
                    {lesson.sections.map((s, i) => (
                      <li key={s.key}>
                        <button
                          type="button"
                          onClick={() => setActive(i)}
                          aria-current={active === i ? 'step' : undefined}
                          className={cn(
                            'flex min-h-[48px] items-center gap-2.5 rounded-xl border px-4 text-sm font-semibold transition-all duration-200',
                            active === i ? 'border-ocean-600 bg-ocean-600 text-white shadow-soft' : 'border-ink-200 bg-white text-ink-600 hover:border-ocean-200',
                          )}
                        >
                          <span className={cn('font-display tabular-nums', active === i ? 'text-aqua-200' : 'text-ink-400')}>{String(i + 1).padStart(2, '0')}</span>
                          {s.title}
                        </button>
                      </li>
                    ))}
                  </ol>
                </nav>

                <AnimatePresence mode="wait">
                  <motion.div key={`${section.key}-${section.script}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Card className="relative">
                      {regenerating === section.key && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-[1px]" role="status">
                          <p className="flex items-center gap-2 font-semibold text-ocean-700">
                            <RefreshCw className="h-5 w-5 animate-spin" aria-hidden /> Rewriting {section.title.toLowerCase()}…
                          </p>
                        </div>
                      )}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="eyebrow">
                            Step {active + 1} · {section.durationMin} min
                          </p>
                          <h2 className="mt-1 text-xl font-bold sm:text-2xl">{section.title}</h2>
                        </div>
                        <Button variant="soft" size="sm" onClick={() => void regen(active)} icon={<RotateCcw className="h-4 w-4" />} disabled={!!regenerating}>
                          Regenerate section
                        </Button>
                      </div>

                      <div className="mt-4 rounded-2xl bg-ink-50 p-4 sm:mt-5 sm:p-5">
                        <p className="eyebrow mb-2">Teacher script</p>
                        <p lang="hi" className="text-lg font-medium leading-relaxed text-ink-900 sm:text-xl">
                          “{section.script}”
                        </p>
                        <AudioButton
                          variant="compact"
                          className="mt-4"
                          label={`Listen in ${languageName(lesson.language)}`}
                          playing={audio.playingKey === section.key}
                          onPlay={() => void audio.play(section.key, section.script, lesson.language)}
                          onStop={audio.stop}
                        />
                      </div>

                      {section.steps && (
                        <ul className="mt-5 space-y-2">
                          {section.steps.map((s) => (
                            <li key={s} className="flex gap-3 text-[15px] text-ink-700">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua-500" aria-hidden />
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-6 flex justify-between border-t border-ink-100 pt-4">
                        <Button variant="ghost" onClick={() => setActive((a) => Math.max(0, a - 1))} disabled={active === 0}>
                          Previous
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setActive((a) => Math.min(lesson.sections.length - 1, a + 1))}
                          disabled={active === lesson.sections.length - 1}
                          iconRight={<ArrowRight className="h-4 w-4" />}
                        >
                          Next section
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                </AnimatePresence>

                <Card>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold">Vocabulary</h2>
                    <span className="text-xs text-ink-400">Sample words · community review pending</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[360px] text-left text-[15px]">
                      <thead>
                        <tr className="border-b border-ink-100 text-xs uppercase tracking-wider text-ink-500">
                          <th className="py-2 pr-4 font-semibold">English</th>
                          <th className="py-2 pr-4 font-semibold">Hindi</th>
                          <th className="py-2 font-semibold">{languageName(lesson.language)}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lesson.vocabulary.map((v) => (
                          <tr key={v.english} className="border-b border-ink-50 last:border-0">
                            <td className="py-2.5 pr-4 text-ink-600">{v.english}</td>
                            <td className="py-2.5 pr-4 text-ink-900">{v.hindi}</td>
                            <td className="py-2.5 font-semibold text-ocean-700">{v.target}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="rounded-3xl border border-dashed border-ink-200 bg-white p-4 sm:p-10">
                  <span className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-ocean-soft text-ocean-600 ring-1 ring-inset ring-ocean-100 sm:flex" aria-hidden>
                    <Sparkles className="h-7 w-7" strokeWidth={1.75} />
                  </span>
                  <h2 className="text-base font-bold sm:mt-5 sm:text-xl">What you'll get</h2>
                  <ul className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3">
                    {[
                      ['01', 'Introduction', 'A warm opening linked to home life'],
                      ['02', 'Explain', 'Teacher script in both languages'],
                      ['03', 'Activity', 'Hands-on, low-resource classroom task'],
                      ['04', 'Practice', 'Slate and partner practice'],
                      ['05', 'Assessment', 'Quick oral check for understanding'],
                      ['06', 'Vocabulary', 'Key words in Hindi and the home language'],
                    ].map(([n, t, d]) => (
                      <li key={t} className="flex gap-3 rounded-2xl bg-ink-50 p-3 sm:p-4">
                        <span className="font-display text-sm font-bold text-aqua-600">{n}</span>
                        <span>
                          <span className="block font-semibold text-ink-900">{t}</span>
                          <span className="block text-sm text-ink-500">{d}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-sm text-ink-500">You can regenerate any single section without losing the rest.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
