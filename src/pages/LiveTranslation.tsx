import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Info, Settings2, Sparkles, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MicButton } from '../components/live/MicButton';
import { AudioButton } from '../components/ui/AudioButton';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { LanguagePairDisplay } from '../components/ui/LanguageSelector';
import { EmptyState } from '../components/ui/States';
import { Tabs } from '../components/ui/Tabs';
import { Waveform } from '../components/ui/Waveform';
import { languageName } from '../data/languages';
import { useAudio } from '../hooks/useAudio';
import { useShell } from '../hooks/useShell';
import { DEMO_MODE } from '../services/config';
import { startVoiceSession, type VoiceSession } from '../services/translationService';
import { useApp } from '../store/AppContext';
import type { TranslationDirection, TranslationTurn, VoicePhase } from '../types';
import { cn } from '../utils';

const PHASE_TEXT: Record<VoicePhase, string> = {
  idle: 'Tap the microphone and speak',
  listening: 'Listening…',
  understanding: 'Understanding…',
  translating: 'Translating…',
  speaking: 'Playing translation',
};

const PIPELINE: VoicePhase[] = ['understanding', 'translating', 'speaking'];

export default function LiveTranslation() {
  const { pair } = useApp();
  const { openLanguagePicker } = useShell();
  const [direction, setDirection] = useState<TranslationDirection>('teacher-to-student');
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [transcript, setTranscript] = useState('');
  const [level, setLevel] = useState(0);
  const [turns, setTurns] = useState<TranslationTurn[]>([]);
  const session = useRef<VoiceSession | null>(null);
  const audio = useAudio();

  const teacherLang = languageName(pair.source);
  const studentLang = languageName(pair.target);
  const fromTeacher = direction === 'teacher-to-student';
  const latest = turns[0];

  const start = useCallback(() => {
    audio.stop();
    setTranscript('');
    session.current = startVoiceSession(direction, { teacher: pair.source, student: pair.target }, {
      onPhase: setPhase,
      onPartialTranscript: setTranscript,
      onTurn: (t) => setTurns((ts) => [t, ...ts]),
      onLevel: setLevel,
    });
  }, [audio, direction, pair]);

  const stop = useCallback(() => session.current?.stop(), []);

  useEffect(() => () => session.current?.cancel(), []);

  // Space bar toggles the microphone
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || (e.target as HTMLElement).closest('button, input, textarea, select, a')) return;
      e.preventDefault();
      if (phase === 'idle') start();
      else if (phase === 'listening') stop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, start, stop]);

  const active = phase !== 'idle';

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-[0.16em] text-aqua-600">
            Verniq Live
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] tracking-wide',
                active ? 'bg-rose-50 text-rose-600' : 'bg-ink-100 text-ink-500',
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'animate-pulse bg-rose-500' : 'bg-ink-400')} aria-hidden />
              {active ? 'Live' : 'Ready'}
            </span>
          </p>
          <h1 className="mt-2">
            <LanguagePairDisplay size="lg" />
          </h1>
        </div>
        <Button variant="outline" onClick={openLanguagePicker} icon={<Settings2 className="h-4 w-4" />}>
          Change language
        </Button>
      </header>

      <Tabs
        label="Who is speaking"
        size="lg"
        value={direction}
        onChange={(d) => {
          if (phase === 'idle') setDirection(d);
        }}
        tabs={[
          { value: 'teacher-to-student', label: `Teacher speaks · ${teacherLang} → ${studentLang}`, icon: <span aria-hidden>👩‍🏫</span> },
          { value: 'student-to-teacher', label: `Student speaks · ${studentLang} → ${teacherLang}`, icon: <span aria-hidden>👧</span> },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Stage */}
        <section
          aria-label="Live translation"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-ocean-800 via-ocean-700 to-ocean-600 px-5 py-8 text-white shadow-lift sm:px-10 sm:py-10"
        >
          <div aria-hidden className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-aqua-400/15 blur-3xl" />
          <div aria-hidden className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-ocean-300/10 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            {/* Speaker */}
            <Speaker emoji={fromTeacher ? '👩‍🏫' : '👧'} role={fromTeacher ? 'Teacher' : 'Student'} lang={fromTeacher ? teacherLang : studentLang} active={phase === 'listening'} />

            <div className="mt-6 min-h-[88px] w-full max-w-xl">
              <p className="text-sm font-semibold text-aqua-200" aria-live="polite">
                {PHASE_TEXT[phase]}
              </p>
              <AnimatePresence mode="wait">
                {transcript && (
                  <motion.p
                    key={transcript.length > 0 ? 'on' : 'off'}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 font-display text-2xl font-bold leading-snug sm:text-3xl"
                    lang={fromTeacher ? pair.source : undefined}
                  >
                    “{transcript}”
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Waveform active={phase === 'listening'} tone="white" className="my-4 w-full max-w-sm" />

            <MicButton phase={phase} onStart={start} onStop={stop} level={level} />
            <p className="mt-4 text-sm text-ocean-100">
              {phase === 'listening' ? 'Tap again when you finish speaking' : phase === 'idle' ? 'Tap or press Space to talk' : ' '}
            </p>

            {/* Pipeline */}
            <ol className="mt-6 flex items-center gap-2 text-xs font-semibold sm:text-sm" aria-label="Translation steps">
              {PIPELINE.map((p, i) => {
                const idx = PIPELINE.indexOf(phase);
                const state = phase === p ? 'active' : idx > i ? 'done' : 'pending';
                return (
                  <li key={p} className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1.5 transition-colors duration-300',
                        state === 'active' && 'bg-white text-ocean-700',
                        state === 'done' && 'bg-aqua-500/80 text-white',
                        state === 'pending' && 'bg-white/10 text-ocean-100',
                      )}
                    >
                      {p === 'understanding' ? 'Understand' : p === 'translating' ? 'Translate' : 'Speak'}
                    </span>
                    {i < PIPELINE.length - 1 && <span className="text-ocean-200" aria-hidden>→</span>}
                  </li>
                );
              })}
            </ol>

            {/* Output */}
            <div className="mt-6 w-full max-w-xl">
              <ArrowDown className={cn('mx-auto h-5 w-5 text-aqua-200 transition-opacity', latest ? 'opacity-100' : 'opacity-30')} aria-hidden />
              <AnimatePresence mode="wait">
                {latest && phase !== 'listening' ? (
                  <motion.div
                    key={latest.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 rounded-2xl bg-white/10 p-5 text-left ring-1 ring-inset ring-white/15 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl" aria-hidden>
                        {latest.direction === 'teacher-to-student' ? '👧' : '👩‍🏫'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-aqua-200">
                          For the {latest.direction === 'teacher-to-student' ? 'student' : 'teacher'} · {languageName(latest.targetLang)}
                        </p>
                        <p className="mt-1 font-display text-xl font-bold sm:text-2xl">{latest.translatedText}</p>
                      </div>
                    </div>
                    {phase === 'speaking' && <Waveform active tone="white" bars={32} className="mt-3 h-8" />}
                  </motion.div>
                ) : (
                  <p className="mt-3 text-sm text-ocean-100">The translation appears here and is spoken aloud.</p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* History */}
        <Card className="flex flex-col">
          <CardHeader
            title="Conversation"
            subtitle={turns.length ? `${turns.length} ${turns.length === 1 ? 'exchange' : 'exchanges'}` : 'This session'}
            action={
              turns.length > 0 && (
                <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={() => setTurns([])}>
                  Clear
                </Button>
              )
            }
          />
          {turns.length === 0 ? (
            <EmptyState
              className="border-none py-8"
              emoji="💬"
              title="No conversation yet"
              description="Speak to your students — every exchange is kept here so you can replay it."
            />
          ) : (
            <ol className="-mx-1 max-h-[560px] space-y-3 overflow-y-auto px-1">
              <AnimatePresence initial={false}>
                {turns.map((t) => {
                  const teacher = t.direction === 'teacher-to-student';
                  return (
                    <motion.li
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('rounded-2xl p-4', teacher ? 'bg-ocean-50' : 'bg-sun-50')}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                        <span aria-hidden>{teacher ? '👩‍🏫' : '👧'}</span> {teacher ? 'Teacher' : 'Student'} · {languageName(t.sourceLang)}
                      </p>
                      <p className="mt-1 text-[15px] text-ink-700">{t.sourceText}</p>
                      <p className="mt-2 font-semibold text-ink-900">{t.translatedText}</p>
                      <AudioButton
                        variant="compact"
                        className="mt-3"
                        label={`Replay in ${languageName(t.targetLang)}`}
                        playing={audio.playingKey === t.id}
                        onPlay={() => void audio.play(t.id, t.translatedText, t.targetLang)}
                        onStop={audio.stop}
                      />
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ol>
          )}
          {DEMO_MODE && (
            <p className="mt-auto flex gap-2 border-t border-ink-100 pt-4 text-xs text-ink-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                Demo session: the microphone is not recorded. Sample classroom phrases are replayed, and {studentLang} lines are
                illustrative samples awaiting native-speaker review.
              </span>
            </p>
          )}
        </Card>
      </div>

      <p className="flex items-center gap-2 text-sm text-ink-500">
        <Sparkles className="h-4 w-4 text-aqua-500" aria-hidden /> Works offline once the {studentLang} language pack is on this device.
      </p>
    </div>
  );
}

function Speaker({ emoji, role, lang, active }: { emoji: string; role: string; lang: string; active: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={cn(
          'flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-4xl ring-1 ring-inset ring-white/20 transition-shadow duration-300',
          active && 'shadow-glow',
        )}
        aria-hidden
      >
        {emoji}
      </span>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-white">{role}</p>
      <p className="text-xs text-ocean-100">{lang}</p>
    </div>
  );
}
