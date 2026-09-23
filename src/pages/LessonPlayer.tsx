import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clock, Mic, PartyPopper, Target, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AudioButton } from '../components/ui/AudioButton';
import { Button, ButtonLink } from '../components/ui/Button';
import { LanguagePairDisplay } from '../components/ui/LanguageSelector';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState, Skeleton } from '../components/ui/States';
import { languageName } from '../data/languages';
import { useAudio } from '../hooks/useAudio';
import { useApp } from '../store/AppContext';
import { cn } from '../utils';

/** Distraction-free classroom mode. */
export default function LessonPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lessons, lessonsLoading, upsertLesson, pair, toast } = useApp();
  const lesson = lessons.find((l) => l.id === id);
  const total = lesson?.sections.length ?? 0;

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
        upsertLesson({ ...lesson, status: 'completed', progress: 1 });
        return;
      }
      if (next < 0) return;
      setDirection(delta);
      setStep(next);
      upsertLesson({ ...lesson, status: 'in-progress', progress: Math.max(lesson.progress, next / total) });
    },
    [audio, lesson, step, total, upsertLesson],
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

  if (lessonsLoading) {
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
          emoji="🧭"
          title="We couldn't find that lesson"
          description="It may have been removed from this device. Your other saved lessons are still here."
          action={<ButtonLink to="/lessons">Back to lessons</ButtonLink>}
        />
      </div>
    );
  }

  const section = lesson.sections[step];

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

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {finished ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl bg-white p-8 text-center shadow-soft sm:p-12">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-leaf-50 text-leaf-600">
              <PartyPopper className="h-10 w-10" aria-hidden />
            </span>
            <h1 className="mt-6 text-3xl font-extrabold">Lesson complete!</h1>
            <p className="mx-auto mt-2 max-w-md text-lg text-ink-500">
              Great teaching. {lesson.topic} is marked as taught and saved to class progress.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink to="/materials?tab=worksheets" size="lg">
                Create a worksheet
              </ButtonLink>
              <ButtonLink to="/" size="lg" variant="outline">
                Back to home
              </ButtonLink>
            </div>
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
                <section className="rounded-3xl border border-ocean-100 bg-ocean-soft p-6">
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-ocean-700">
                    <Target className="h-4 w-4" aria-hidden /> Learning objective
                  </h2>
                  <p className="mt-2 font-display text-xl font-bold text-ink-900 sm:text-2xl">
                    Students will {lesson.learningOutcome.charAt(0).toLowerCase() + lesson.learningOutcome.slice(1)}
                    {lesson.topic ? ` — ${lesson.topic}` : ''}.
                  </p>
                </section>
              )}

              <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
                <h2 className="eyebrow">Teacher script</h2>
                <p lang="hi" className="mt-3 text-2xl font-semibold leading-relaxed text-ink-900 sm:text-[28px]">
                  “{section.script}”
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <AudioButton
                    variant="solid"
                    label={`Play in ${languageName(pair.target)}`}
                    playing={audio.playingKey === `${section.key}-t`}
                    onPlay={() => void audio.play(`${section.key}-t`, section.scriptTarget ?? section.script, pair.target)}
                    onStop={audio.stop}
                  />
                  <AudioButton
                    label={`Play in ${languageName(pair.source)}`}
                    playing={audio.playingKey === `${section.key}-s`}
                    onPlay={() => void audio.play(`${section.key}-s`, section.script, pair.source)}
                    onStop={audio.stop}
                  />
                </div>
                {audio.simulated && (
                  <p className="mt-3 text-xs text-ink-400">{languageName(pair.target)} voice pack not connected yet — playback is simulated in this demo.</p>
                )}
              </section>

              {section.steps && (
                <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
                  <h2 className="eyebrow mb-3">In class</h2>
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
                            <span className={cn('text-lg', done ? 'text-ink-400 line-through' : 'text-ink-800')}>{s}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {section.key === 'explain' && lesson.vocabulary.length > 0 && (
                <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="eyebrow">Vocabulary</h2>
                    <span className="text-xs text-ink-400">Sample words · community review pending</span>
                  </div>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {lesson.vocabulary.map((v, i) => (
                      <li key={v.english}>
                        <button
                          type="button"
                          onClick={() => void audio.play(`v-${i}`, v.target, pair.target)}
                          className={cn(
                            'w-full rounded-2xl border p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-soft',
                            audio.playingKey === `v-${i}` ? 'border-aqua-400 bg-aqua-50' : 'border-ink-200 bg-white',
                          )}
                          aria-label={`${i + 1}: ${v.hindi}, ${languageName(pair.target)} ${v.target}. Play`}
                        >
                          <span className="block font-display text-3xl font-extrabold text-ocean-600">{i + 1}</span>
                          <span className="mt-1 block text-sm text-ink-500">{v.hindi}</span>
                          <span className="block font-semibold text-ink-900">{v.target}</span>
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
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
            <Button variant="outline" size="lg" onClick={() => go(-1)} disabled={step === 0} icon={<ArrowLeft className="h-5 w-5" />}>
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Link
              to="/live"
              onClick={() => toast({ tone: 'info', title: 'Lesson paused', detail: 'Come back any time — your place is saved.' })}
              className="mx-auto inline-flex min-h-[52px] items-center gap-2 rounded-xl px-4 font-semibold text-aqua-700 hover:bg-aqua-50"
            >
              <Mic className="h-5 w-5" aria-hidden /> Live translate
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
