import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clock, Compass, Mic, PartyPopper, Target, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RubricRecorder } from '../components/class/RubricRecorder';
import { SectionScript } from '../components/lesson/SectionView';
import { Picture } from '../components/ui/Picture';
import { Button, ButtonLink } from '../components/ui/Button';
import { LanguagePairDisplay } from '../components/ui/LanguageSelector';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState, Skeleton } from '../components/ui/States';
import { languageName } from '../data/languages';
import { useAudio } from '../hooks/useAudio';
import { useClassroom } from '../hooks/useClassroom';
import { useApp } from '../store/AppContext';
import { cn } from '../utils';

/** Distraction-free classroom mode. */
export default function LessonPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ready, records, put, activeStudents, assessments, activeClass } = useClassroom();
  const { toast } = useApp();
  const lesson = records.lessons.find((l) => l.id === id);
  const total = lesson?.content.sections.length ?? 0;
  const pair = { source: activeClass?.sourceLanguage ?? 'hi', target: lesson?.language ?? activeClass?.language ?? 'ho' } as const;
  const [recorded, setRecorded] = useState(false);

  const [step, setStep] = useState(() => (lesson ? Math.min(Math.round(lesson.progress * total), total - 1) : 0));
  const [direction, setDirection] = useState(1);
  const [finished, setFinished] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const audio = useAudio();

  const go = useCallback(
    (delta: number) => {
      if (!lesson) return;
      audio.stop();
      const next = step + delta;
      if (next >= total) {
        setFinished(true);
        void put('lessons', { ...lesson, status: 'completed', progress: 1, scheduledFor: undefined });
        return;
      }
      if (next < 0) return;
      setDirection(delta);
      setStep(next);
      void put('lessons', { ...lesson, status: lesson.status === 'completed' ? 'completed' : 'in-progress', progress: Math.max(lesson.progress, next / total) });
    },
    [audio, lesson, step, total, put],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'Escape') navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, navigate]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-12" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="mx-auto max-w-xl p-6 pt-20">
        <EmptyState
          icon={Compass}
          title="We couldn't find that lesson"
          description="It may have been removed from this device. Your other saved lessons are still here."
          action={<ButtonLink to="/lessons">Back to lessons</ButtonLink>}
        />
      </div>
    );
  }

  const section = lesson.content.sections[step];
  const vocabulary = lesson.content.vocabulary;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b pt-[env(safe-area-inset-top)] border-ink-200/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/lessons"
            aria-label="Exit lesson"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100"
          >
            <X className="h-6 w-6" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="eyebrow truncate">{lesson.subject}</p>
            <p className="truncate font-display text-lg font-bold text-ink-900">{lesson.topic}</p>
          </div>
          <div className="hidden sm:block">
            <LanguagePairDisplay size="sm" />
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-3 sm:px-6">
          <div className="mb-1.5 flex justify-between text-xs font-semibold text-ink-500">
            <span>
              Step {finished ? total : step + 1} of {total}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {section.durationMin} min
            </span>
          </div>
          <ProgressBar value={finished ? 1 : (step + 1) / total} label="Lesson progress" size="sm" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5 sm:px-6 sm:py-10">
        {finished ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
            <div className="rounded-3xl bg-white p-6 text-center shadow-soft sm:p-10">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-leaf-50 text-leaf-600 sm:h-20 sm:w-20">
                <PartyPopper className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden />
              </span>
              <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">Lesson complete</h1>
              <p className="mx-auto mt-2 max-w-md text-ink-500 sm:text-lg">{lesson.topic} is marked as taught. Record how each child did so progress stays accurate.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <ButtonLink to={`/materials?tab=worksheets&lesson=${lesson.id}`} variant="outline">
                  Make a worksheet
                </ButtonLink>
                <ButtonLink to="/" variant={recorded ? 'primary' : 'ghost'}>
                  Back to home
                </ButtonLink>
              </div>
            </div>
            {activeClass && (
              <section className="rounded-3xl bg-white p-4 shadow-soft sm:p-6">
                <h2 className="font-display text-lg font-bold">Record results</h2>
                <p className="mb-4 text-sm text-ink-500">
                  {lesson.outcomeCode} · {lesson.learningOutcome}
                </p>
                <RubricRecorder
                  classId={activeClass.id}
                  students={activeStudents}
                  outcomeCode={lesson.outcomeCode}
                  lessonId={lesson.id}
                  assessments={assessments}
                  onSaved={() => setRecorded(true)}
                />
              </section>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.article
              key={section.key}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-5"
            >
              <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-aqua-600">
                {String(step + 1).padStart(2, '0')} · {section.title}
              </p>

              {step === 0 && (
                <section className="rounded-3xl border border-ocean-100 bg-ocean-soft p-4 sm:p-6">
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-ocean-700">
                    <Target className="h-4 w-4" aria-hidden /> Learning objective
                  </h2>
                  <p className="mt-2 font-display text-lg font-bold text-ink-900 sm:text-2xl">
                    {lesson.learningOutcome}
                    <span className="block text-sm font-semibold text-ocean-700 sm:text-base">{lesson.topic}</span>
                  </p>
                </section>
              )}

              <section className="rounded-3xl bg-white p-4 shadow-soft sm:p-8">
                <h2 className="eyebrow mb-2 sm:mb-3">Teacher script</h2>
                <SectionScript section={section} source={pair.source} target={pair.target} audio={audio} size="lg" />
              </section>

              {section.steps && (
                <section className="rounded-3xl bg-white p-4 shadow-soft sm:p-8">
                  <h2 className="eyebrow mb-3">In class</h2>
                  {section.materials && section.materials.length > 0 && (
                    <p className="mb-3 rounded-xl bg-sun-50 px-3 py-2 text-sm text-sun-900">
                      <span className="font-semibold">You need:</span> {section.materials.join(', ')}
                    </p>
                  )}
                  <ul className="space-y-2">
                    {section.steps.map((s, i) => {
                      const k = `${section.key}-${i}`;
                      const done = !!checked[k];
                      return (
                        <li key={k}>
                          <button
                            type="button"
                            onClick={() => setChecked((c) => ({ ...c, [k]: !c[k] }))}
                            aria-pressed={done}
                            className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-ink-50"
                          >
                            <span
                              className={cn(
                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors',
                                done ? 'border-aqua-500 bg-aqua-500 text-white' : 'border-ink-300',
                              )}
                            >
                              {done && <Check className="h-4 w-4" aria-hidden />}
                            </span>
                            <span className={cn('text-base sm:text-lg', done ? 'text-ink-400 line-through' : 'text-ink-800')}>{s}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {section.key === 'explain' && vocabulary.length > 0 && (
                <section className="rounded-3xl bg-white p-4 shadow-soft sm:p-8">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="eyebrow">Words for this lesson</h2>
                    <span className="text-xs text-ink-400">Tap to hear · {languageName(pair.target)}</span>
                  </div>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                    {vocabulary.map((v, i) => (
                      <li key={`${v.hindi}-${i}`}>
                        <button
                          type="button"
                          onClick={() => void audio.play(`v-${i}`, v.target, pair.target)}
                          className={cn(
                            'flex w-full flex-col items-center rounded-2xl border p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-soft',
                            audio.playingKey === `v-${i}` ? 'border-aqua-400 bg-aqua-50' : 'border-ink-200 bg-white',
                          )}
                          aria-label={`${v.hindi}, ${languageName(pair.target)} ${v.target}. Play`}
                        >
                          {v.picture ? (
                            <Picture picture={v.picture} size={36} />
                          ) : v.value !== undefined ? (
                            <span className="font-display text-3xl font-extrabold text-ocean-600">{v.value}</span>
                          ) : null}
                          <span className="mt-1 block font-semibold text-ink-900">{v.target}</span>
                          <span className="block text-sm text-ink-500">{v.hindi}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </motion.article>
          </AnimatePresence>
        )}
      </main>

      {!finished && (
        <footer className="sticky bottom-0 border-t border-ink-200/60 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
            <Button variant="outline" size="lg" onClick={() => go(-1)} disabled={step === 0} icon={<ArrowLeft className="h-5 w-5" />} aria-label="Previous step" className="px-3.5 sm:px-6">
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Link
              to="/live"
              aria-label="Live translate"
              onClick={() => toast({ tone: 'info', title: 'Lesson paused', detail: 'Come back any time — your place is saved.' })}
              className="mx-auto inline-flex min-h-[52px] items-center gap-2 whitespace-nowrap rounded-xl px-3 font-semibold text-aqua-700 hover:bg-aqua-50 sm:px-4"
            >
              <Mic className="h-5 w-5" aria-hidden /> <span className="hidden min-[360px]:inline sm:hidden">Translate</span>
              <span className="hidden sm:inline">Live translate</span>
            </Link>
            <Button size="lg" onClick={() => go(1)} iconRight={<ArrowRight className="h-5 w-5" />}>
              {step === total - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
