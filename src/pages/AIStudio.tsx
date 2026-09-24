import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BookOpen, CalendarPlus, Check, Languages, Pencil, Play, RotateCcw, Sparkles, Target } from 'lucide-react';
import { useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { composeLesson, matchOutcomes, regenerateSection } from '../../engine/composer';
import { outcomeByCode, topicSuggestions } from '../../engine/curriculum';
import { SectionScript } from '../components/lesson/SectionView';
import { AIStatus } from '../components/ui/AIStatus';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select, TextField } from '../components/ui/Select';
import { PageHeader } from '../components/ui/States';
import { languageName } from '../data/languages';
import { useAudio } from '../hooks/useAudio';
import { useClassroom } from '../hooks/useClassroom';
import { useApp } from '../store/AppContext';
import { SUBJECTS, type LessonDoc, type LessonSectionKey, type Subject } from '../types';
import { cn, newId, sleep, todayISO } from '../utils';
import { NipunBadge } from '../components/lesson/NipunBadge';

const STAGES = [
  { id: 'curriculum', label: 'Matching the curriculum', icon: <Target className="h-4 w-4" /> },
  { id: 'structure', label: 'Choosing activities', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'language', label: 'Adding home-language words', icon: <Languages className="h-4 w-4" /> },
] satisfies { id: string; label: string; icon: ReactNode }[];

export default function AIStudio() {
  const { activeClass, glossary, phrases, pair, put, records } = useClassroom();
  const { toast, notify } = useApp();
  const [params] = useSearchParams();
  const preset = outcomeByCode(params.get('outcome') ?? '');
  const [grade, setGrade] = useState(preset?.grade ?? activeClass?.grade ?? 1);
  const [subject, setSubject] = useState<Subject>(preset?.subject ?? ((params.get('subject') as Subject) || 'Mathematics'));
  const [topic, setTopic] = useState(params.get('topic') ?? (preset ? `Revision: ${preset.topics[0] ?? preset.statement}` : ''));
  const [outcomeText, setOutcomeText] = useState('');
  const [outcomeCode, setOutcomeCode] = useState<string | undefined>(params.get('outcome') ?? undefined);
  const [stage, setStage] = useState(-1);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);
  const audio = useAudio();

  const lesson = records.lessons.find((l) => l.id === lessonId) ?? null;
  const generating = stage >= 0 && stage < STAGES.length;
  const suggestions = topicSuggestions(subject, grade);
  const ctx = { glossary, phrases };

  const matches = useMemo(
    () => (topic.trim().length >= 3 ? matchOutcomes({ grade, subject, topic, learningOutcome: outcomeText }, 3) : []),
    [grade, subject, topic, outcomeText],
  );
  const chosen = matches.find((m) => m.outcome.code === outcomeCode)?.outcome ?? (outcomeCode ? outcomeByCode(outcomeCode) : undefined) ?? matches[0]?.outcome;

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!topic.trim()) return;
    setLessonId(null);
    for (let i = 0; i < STAGES.length; i++) {
      setStage(i);
      await sleep(260);
    }
    const composed = composeLesson({ grade, subject, topic, learningOutcome: outcomeText, outcomeCode: chosen?.code }, ctx, Date.now() % 100000);
    setStage(STAGES.length);
    const doc: Omit<LessonDoc, 'updatedAt'> = {
      id: newId(),
      classId: activeClass?.id,
      grade,
      subject,
      topic: topic.trim(),
      learningOutcome: composed.learningOutcome,
      outcomeCode: composed.outcome.code,
      language: pair.target,
      durationMin: composed.durationMin,
      content: composed.content,
      status: 'not-started',
      progress: 0,
      savedOffline: true,
      createdAt: Date.now(),
    };
    await put('lessons', doc);
    setLessonId(doc.id);
    setActive(0);
    notify({ kind: 'lesson', title: 'Lesson created', detail: `${doc.topic} · Class ${grade}` });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
  };

  const regen = async (key: LessonSectionKey) => {
    if (!lesson) return;
    const updated = regenerateSection({ grade: lesson.grade, subject: lesson.subject, topic: lesson.topic, outcomeCode: lesson.outcomeCode }, lesson.content, key, ctx);
    await put('lessons', { ...lesson, content: { ...lesson.content, sections: lesson.content.sections.map((s) => (s.key === key ? updated : s)) } });
    toast({ tone: 'success', title: `${updated.title} rewritten`, detail: 'The rest of the lesson is unchanged.' });
  };

  const section = lesson?.content.sections[active];

  return (
    <>
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1.5 text-aqua-600">
            <Sparkles className="h-4 w-4" aria-hidden /> AI Lesson Studio
          </span>
        }
        title="Create a complete lesson in seconds."
        description="Verniq matches your topic to the Class 1–5 curriculum and writes the lesson, script and activities. It runs on this device, even offline."
      />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit lg:sticky lg:top-24">
          <form onSubmit={submit} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-[112px_1fr] gap-3 sm:grid-cols-2 sm:gap-4">
              <Select label="Class" value={String(grade)} onChange={(v) => setGrade(Number(v))} options={[1, 2, 3, 4, 5].map((c) => ({ value: String(c), label: `Class ${c}` }))} />
              <Select
                label="Subject"
                value={subject}
                onChange={(v) => {
                  setSubject(v as Subject);
                  setTopic('');
                  setOutcomeCode(undefined);
                }}
                options={SUBJECTS.map((s) => ({ value: s, label: s }))}
              />
            </div>
            <div>
              <TextField
                label="Topic"
                value={topic}
                onChange={(v) => {
                  setTopic(v);
                  setOutcomeCode(undefined);
                }}
                required
                placeholder="e.g. Numbers 1–10"
              />
              <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Suggested topics">
                {suggestions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTopic(t);
                      setOutcomeCode(undefined);
                    }}
                    className={cn(
                      'min-h-[32px] rounded-lg px-2.5 text-xs font-semibold transition-colors',
                      topic === t ? 'bg-ocean-100 text-ocean-700' : 'bg-ink-100 text-ink-600 hover:bg-ink-200',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <TextField label="Learning outcome (optional)" value={outcomeText} onChange={setOutcomeText} placeholder="Leave empty to use the curriculum outcome" />

            {matches.length > 0 && (
              <fieldset>
                <legend className="field-label">Curriculum outcome</legend>
                <div className="space-y-2">
                  {matches.map((m) => {
                    const selected = m.outcome.code === chosen?.code;
                    return (
                      <button
                        key={m.outcome.code}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setOutcomeCode(m.outcome.code)}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                          selected ? 'border-ocean-500 bg-ocean-50' : 'border-ink-200 bg-surface hover:border-ocean-200',
                        )}
                      >
                        <span className={cn('mt-0.5 rounded-md px-1.5 py-0.5 font-display text-xs font-bold', selected ? 'bg-ocean-600 text-white' : 'bg-ink-100 text-ink-600')}>{m.outcome.code}</span>
                        <span className="min-w-0">
                          <span className="block text-sm leading-snug text-ink-700">{m.outcome.statement}</span>
                          <NipunBadge code={m.outcome.code} compact className="mt-1" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <p className="text-sm text-ink-500">
              Students’ language: <span className="font-semibold text-ink-800">{languageName(pair.target)}</span> ({activeClass?.name ?? 'no class'})
            </p>
            <Button type="submit" size="lg" fullWidth loading={generating} disabled={!topic.trim()} icon={!generating && <Sparkles className="h-5 w-5" />}>
              {generating ? 'Creating…' : lesson ? 'Create another' : 'Create lesson'}
            </Button>
          </form>
        </Card>

        <div ref={resultRef} className="min-w-0 scroll-mt-24">
          <AnimatePresence mode="wait">
            {generating ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AIStatus stages={STAGES} current={stage} doneLabel="Lesson ready" />
              </motion.div>
            ) : lesson && section ? (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
                <div className="rounded-2xl border border-leaf-100 bg-leaf-50 p-4">
                  <p className="flex items-center gap-2 font-semibold text-leaf-700">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf-500 text-white">
                      <Check className="h-4 w-4" aria-hidden />
                    </span>
                    Saved · {lesson.topic}
                  </p>
                  <p className="mt-1 text-sm text-ink-600">
                    <span className="font-semibold">{lesson.outcomeCode}</span> · {lesson.learningOutcome}
                  </p>
                  <NipunBadge code={lesson.outcomeCode} className="mt-1" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ButtonLink to={`/lessons/${lesson.id}/play`} size="sm" icon={<Play className="h-4 w-4 fill-current" />}>
                      Start lesson
                    </ButtonLink>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<CalendarPlus className="h-4 w-4" />}
                      disabled={lesson.scheduledFor === todayISO()}
                      onClick={() => void put('lessons', { ...lesson, scheduledFor: todayISO() })}
                    >
                      {lesson.scheduledFor === todayISO() ? 'Planned for today' : 'Teach today'}
                    </Button>
                    <ButtonLink to={`/lessons/${lesson.id}/edit`} variant="ghost" size="sm" icon={<Pencil className="h-4 w-4" />}>
                      Edit
                    </ButtonLink>
                  </div>
                </div>

                <nav aria-label="Lesson sections" className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
                  <ol className="flex min-w-max gap-2">
                    {lesson.content.sections.map((s, i) => (
                      <li key={s.key}>
                        <button
                          type="button"
                          onClick={() => setActive(i)}
                          aria-current={active === i ? 'step' : undefined}
                          className={cn(
                            'flex min-h-[44px] items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-all duration-200 sm:px-4',
                            active === i ? 'border-ocean-600 bg-ocean-600 text-white shadow-soft' : 'border-ink-200 bg-surface text-ink-600 hover:border-ocean-200',
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
                  <motion.div key={`${section.key}-${section.variant}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Card>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="eyebrow">
                            Step {active + 1} · {section.durationMin} min
                          </p>
                          <h2 className="mt-1 text-xl font-bold sm:text-2xl">{section.title}</h2>
                        </div>
                        <Button variant="soft" size="sm" onClick={() => void regen(section.key)} icon={<RotateCcw className="h-4 w-4" />}>
                          Try another idea
                        </Button>
                      </div>
                      <div className="mt-4 rounded-2xl bg-ink-50 p-4 sm:p-5">
                        <p className="eyebrow mb-2">Teacher script</p>
                        <SectionScript section={section} source={pair.source} target={pair.target} audio={audio} />
                      </div>
                      <ul className="mt-4 space-y-2">
                        {section.steps.map((s) => (
                          <li key={s} className="flex gap-3 text-[15px] text-ink-700">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua-500" aria-hidden />
                            {s}
                          </li>
                        ))}
                      </ul>
                      {section.materials?.length ? <p className="mt-3 text-sm text-ink-500">Materials: {section.materials.join(', ')}</p> : null}
                      <div className="mt-5 flex justify-between border-t border-ink-100 pt-3">
                        <Button variant="ghost" onClick={() => setActive((a) => Math.max(0, a - 1))} disabled={active === 0}>
                          Previous
                        </Button>
                        <Button variant="ghost" onClick={() => setActive((a) => Math.min(lesson.content.sections.length - 1, a + 1))} disabled={active === lesson.content.sections.length - 1} iconRight={<ArrowRight className="h-4 w-4" />}>
                          Next
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                </AnimatePresence>

                <Card>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-base font-bold sm:text-lg">Vocabulary</h2>
                    <Link to="/words" className="text-sm font-semibold text-ocean-600 hover:underline">
                      Add or correct words
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[320px] text-left text-[15px]">
                      <thead>
                        <tr className="border-b border-ink-100 text-xs uppercase tracking-wider text-ink-500">
                          <th className="py-2 pr-4 font-semibold">Hindi</th>
                          <th className="py-2 pr-4 font-semibold">{languageName(pair.target)}</th>
                          <th className="py-2 font-semibold">English</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lesson.content.vocabulary.map((v) => (
                          <tr key={v.hindi} className="border-b border-ink-50 last:border-0">
                            <td className="py-2.5 pr-4 text-ink-900">{v.hindi}</td>
                            <td className="py-2.5 pr-4 font-semibold text-ocean-700">{v.target || <span className="text-xs font-normal text-ink-400">not added yet</span>}</td>
                            <td className="py-2.5 text-ink-500">{v.english}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="rounded-3xl border border-dashed border-ink-200 bg-surface p-4 sm:p-10">
                  <h2 className="text-base font-bold sm:text-xl">What you'll get</h2>
                  <ul className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3">
                    {[
                      ['01', 'Introduction', 'A warm opening linked to home life'],
                      ['02', 'Explain', 'Clear teacher script in Hindi'],
                      ['03', 'Activity', 'Hands-on, low-cost classroom task'],
                      ['04', 'Practice', 'Slate and partner practice'],
                      ['05', 'Assessment', 'Quick check you can record per student'],
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
                  <p className="mt-4 text-sm text-ink-500">Each part can be rewritten on its own, and you can edit everything afterwards.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
