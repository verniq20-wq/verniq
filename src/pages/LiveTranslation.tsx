import { AnimatePresence, motion } from 'framer-motion';
import { ChalkboardTeacher, Student } from '@phosphor-icons/react';
import { ArrowDown, BookmarkPlus, Info, Keyboard, MessagesSquare, PenLine, Send, Settings2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { normalize } from '../../engine/text';
import { describeResult, translate } from '../../engine/translator';
import { MicButton } from '../components/live/MicButton';
import { AudioButton } from '../components/ui/AudioButton';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { LanguagePairDisplay } from '../components/ui/LanguageSelector';
import { EmptyState } from '../components/ui/States';
import { Tabs } from '../components/ui/Tabs';
import { Waveform } from '../components/ui/Waveform';
import { PhraseEditor, type PhraseDraft } from '../components/words/PhraseEditor';
import { languageName } from '../data/languages';
import { useAudio } from '../hooks/useAudio';
import { useClassroom } from '../hooks/useClassroom';
import { useShell } from '../hooks/useShell';
import { canRecognize, listen, type Listening } from '../platform/voice';
import type { LanguageCode, Phrase, TranslationDirection, TranslationTurn, VoicePhase } from '../types';
import { cn, newId } from '../utils';

const PHASE_TEXT: Record<VoicePhase, string> = {
  idle: 'Tap the microphone and speak',
  listening: 'Listening…',
  understanding: 'Understanding…',
  translating: 'Translating…',
  speaking: 'Playing translation',
};

const PIPELINE: VoicePhase[] = ['understanding', 'translating', 'speaking'];

const VIA_NOTE: Record<string, string> = {
  'hindi-voice': 'Read with a Hindi voice, so pronunciation is approximate. Record this phrase to play a real voice.',
  none: 'No voice is installed for this language on this device — show the text instead.',
};

export default function LiveTranslation() {
  const { pair, glossary, phrases, put } = useClassroom();
  const { openLanguagePicker } = useShell();
  const [direction, setDirection] = useState<TranslationDirection>('teacher-to-student');
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [transcript, setTranscript] = useState('');
  const [turns, setTurns] = useState<TranslationTurn[]>([]);
  const [typed, setTyped] = useState('');
  const [typing, setTyping] = useState(false);
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ key: number; draft: PhraseDraft } | null>(null);
  const [viaNote, setViaNote] = useState<string | null>(null);
  const session = useRef<Listening | null>(null);
  const audio = useAudio();

  const teacherLang = languageName(pair.source);
  const studentLang = languageName(pair.target);
  const fromTeacher = direction === 'teacher-to-student';
  const speakerLang: LanguageCode = fromTeacher ? pair.source : pair.target;
  const listenerLang: LanguageCode = fromTeacher ? pair.target : 'hi';
  const latest = turns[0];
  const quickPhrases = phrases
    .filter((p) => p.speaker === (fromTeacher ? 'teacher' : 'student'))
    .sort((a, b) => b.uses - a.uses || b.updatedAt - a.updatedAt)
    .slice(0, 8);

  useEffect(() => {
    let alive = true;
    setMicOk(null);
    void canRecognize(speakerLang).then((ok) => {
      if (!alive) return;
      setMicOk(ok);
      setTyping(!ok);
    });
    return () => {
      alive = false;
    };
  }, [speakerLang]);

  const deliver = useCallback(
    async (text: string, known?: Phrase) => {
      const t0 = performance.now();
      const src = text.trim();
      if (!src) {
        setPhase('idle');
        return;
      }
      setPhase('translating');
      const result = known
        ? { text: fromTeacher ? known.target : known.hindi, segments: [], coverage: 1, method: 'memory' as const, matchedPhraseId: known.id }
        : translate(src, {
            glossary,
            phrases,
            direction: fromTeacher ? 'to-target' : 'to-hindi',
            sourceIsEnglish: fromTeacher && pair.source === 'en',
          });
      const turn: TranslationTurn = {
        id: newId(),
        direction,
        sourceText: src,
        translatedText: result.text,
        sourceLang: speakerLang,
        targetLang: listenerLang,
        method: result.method,
        coverage: result.coverage,
        phraseId: result.matchedPhraseId,
        segments: result.segments,
        at: Date.now(),
      };
      setTurns((ts) => [turn, ...ts].slice(0, 50));
      setTranscript('');
      const phrase = result.matchedPhraseId ? phrases.find((p) => p.id === result.matchedPhraseId) : undefined;
      if (phrase && result.method === 'memory') void put('phrases', { ...phrase, uses: phrase.uses + 1 });
      if (!result.text) {
        setPhase('idle');
        return;
      }
      // A teacher's recording is only right for the student-language side of an exact phrase,
      // or for a single known word that has its own recording.
      const words = result.segments.filter((sg) => sg.via !== 'stopword');
      const clip =
        fromTeacher && result.method === 'memory'
          ? phrase?.audio
          : fromTeacher && words.length === 1 && words[0].known
            ? glossary.find((g) => normalize(g.hindi) === words[0].source)?.audio
            : undefined;
      const latencyMs = Math.round(performance.now() - t0);
      setTurns((ts) => ts.map((x) => (x.id === turn.id ? { ...x, latencyMs } : x)));
      setPhase('speaking');
      const res = await audio.play(turn.id, result.text, listenerLang, clip);
      setViaNote(VIA_NOTE[res.via] ?? null);
      setPhase('idle');
    },
    [audio, direction, fromTeacher, glossary, listenerLang, pair.source, phrases, put, speakerLang],
  );

  const start = useCallback(async () => {
    audio.stop();
    setError(null);
    setTranscript('');
    setPhase('listening');
    try {
      session.current = await listen(speakerLang, {
        onPartial: setTranscript,
        onFinal: (text) => {
          session.current = null;
          setPhase('understanding');
          void deliver(text);
        },
        onError: (msg) => {
          session.current = null;
          setError(msg);
          setPhase('idle');
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start listening.');
      setPhase('idle');
      setTyping(true);
    }
  }, [audio, deliver, speakerLang]);

  const stop = useCallback(() => session.current?.stop(), []);

  useEffect(() => () => session.current?.cancel(), []);

  // Space bar toggles the microphone
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!micOk || e.code !== 'Space' || (e.target as HTMLElement).closest('button, input, textarea, select, a')) return;
      e.preventDefault();
      if (phase === 'idle') void start();
      else if (phase === 'listening') stop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [micOk, phase, start, stop]);

  const submitTyped = (e: FormEvent) => {
    e.preventDefault();
    const text = typed;
    setTyped('');
    void deliver(text);
  };

  const openEditor = (t: TranslationTurn) => {
    const teacherSide = t.direction === 'teacher-to-student';
    const existing = t.phraseId && t.method === 'memory' ? phrases.find((p) => p.id === t.phraseId) : undefined;
    setEditor({
      key: Date.now(),
      draft: existing
        ? { ...existing }
        : {
            hindi: teacherSide ? t.sourceText : t.translatedText,
            target: teacherSide ? (t.method === 'gloss' && t.coverage < 1 ? '' : t.translatedText) : t.sourceText,
            speaker: teacherSide ? 'teacher' : 'student',
          },
    });
  };

  const active = phase !== 'idle';

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="flex items-end justify-between gap-3">
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
          <h1 className="mt-1.5 sm:mt-2">
            <span className="sm:hidden">
              <LanguagePairDisplay size="md" />
            </span>
            <span className="hidden sm:inline">
              <LanguagePairDisplay size="lg" />
            </span>
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={openLanguagePicker} icon={<Settings2 className="h-4 w-4" />} className="sm:min-h-[44px] sm:px-4 sm:text-[15px]">
          <span className="sm:hidden">Change</span>
          <span className="hidden sm:inline">Change language</span>
        </Button>
      </header>

      <Tabs
        label="Who is speaking"
        size="lg"
        stretch
        className="sm:inline-grid sm:w-auto"
        value={direction}
        onChange={(d) => {
          if (phase === 'idle') {
            setDirection(d);
            setError(null);
          }
        }}
        tabs={[
          {
            value: 'teacher-to-student',
            label: (
              <span>
                Teacher<span className="hidden sm:inline"> speaks · {teacherLang} → {studentLang}</span>
              </span>
            ),
            icon: <ChalkboardTeacher size={20} weight="duotone" aria-hidden />,
          },
          {
            value: 'student-to-teacher',
            label: (
              <span>
                Student<span className="hidden sm:inline"> speaks · {studentLang} → Hindi</span>
              </span>
            ),
            icon: <Student size={20} weight="duotone" aria-hidden />,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[1fr_380px]">
        {/* Stage */}
        <section
          aria-label="Live translation"
          className="light-scope relative overflow-hidden rounded-3xl bg-gradient-to-b from-ocean-800 via-ocean-700 to-ocean-600 px-4 py-6 text-white shadow-lift sm:px-10 sm:py-10"
        >
          <div aria-hidden className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-aqua-400/15 blur-3xl" />
          <div aria-hidden className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-ocean-300/10 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <Speaker teacher={fromTeacher} role={fromTeacher ? 'Teacher' : 'Student'} lang={fromTeacher ? teacherLang : studentLang} active={phase === 'listening'} />

            <div className="mt-4 min-h-[56px] w-full max-w-xl sm:mt-6 sm:min-h-[72px]">
              <p className="text-sm font-semibold text-aqua-200" aria-live="polite">
                {micOk === false && phase === 'idle' ? (fromTeacher ? 'Type what you want to say' : quickPhrases.length ? 'Tap what the student said, or type it' : 'Type what the student said') : PHASE_TEXT[phase]}
              </p>
              {transcript && (
                <p className="mt-1.5 font-display text-xl font-bold leading-snug sm:mt-2 sm:text-3xl" lang={speakerLang}>
                  “{transcript}”
                </p>
              )}
            </div>

            {micOk && (
              <>
                <Waveform active={phase === 'listening'} tone="white" className="my-4 w-full max-w-sm" />
                <MicButton phase={phase} onStart={() => void start()} onStop={stop} level={phase === 'listening' ? 0.5 : 0} />
                <p className="mt-4 text-sm text-ocean-100">{phase === 'listening' ? 'Tap again when you finish speaking' : phase === 'idle' ? 'Tap or press Space to talk' : '\u00a0'}</p>
              </>
            )}

            {error && (
              <p role="alert" className="mt-3 max-w-md rounded-xl bg-rose-500/20 px-3 py-2 text-sm text-white ring-1 ring-inset ring-rose-300/40">
                {error}
              </p>
            )}

            {/* Type instead */}
            <div className="mt-5 w-full max-w-xl">
              {typing ? (
                <form onSubmit={submitTyped} className="flex gap-2">
                  <label htmlFor="live-type" className="sr-only">
                    {fromTeacher ? `Type in ${teacherLang}` : `Type what the student said in ${studentLang}`}
                  </label>
                  <input
                    id="live-type"
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    lang={speakerLang}
                    placeholder={fromTeacher ? `Type in ${teacherLang}…` : `Type in ${studentLang}…`}
                    className="min-h-[48px] min-w-0 flex-1 rounded-xl border-0 bg-surface px-4 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-aqua-300"
                    autoComplete="off"
                  />
                  <Button type="submit" variant="inverse" disabled={!typed.trim() || active} aria-label="Translate" className="min-h-[48px] px-4">
                    <Send className="h-5 w-5" aria-hidden />
                  </Button>
                </form>
              ) : (
                <button type="button" onClick={() => setTyping(true)} className="inline-flex min-h-[40px] items-center gap-2 rounded-xl px-3 text-sm font-semibold text-ocean-100 hover:bg-white/10">
                  <Keyboard className="h-4 w-4" aria-hidden /> Type instead
                </button>
              )}
            </div>

            {/* Phrasebook quick picks */}
            {quickPhrases.length > 0 && (
              <div className="mt-5 w-full max-w-xl text-left">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-aqua-200">{fromTeacher ? 'Your phrases' : 'What students often say'}</p>
                <ul className="flex flex-wrap gap-2">
                  {quickPhrases.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        disabled={active}
                        onClick={() => void deliver(fromTeacher ? p.hindi : p.target, p)}
                        className="min-h-[40px] rounded-xl bg-white/10 px-3 py-1.5 text-left text-sm ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/20 disabled:opacity-50"
                      >
                        <span className="block font-semibold">{fromTeacher ? p.hindi : p.target}</span>
                        <span className="block text-xs text-ocean-100">{fromTeacher ? p.target : p.hindi}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pipeline */}
            {micOk && (
              <ol className="mt-6 flex items-center gap-2 text-xs font-semibold sm:text-sm" aria-label="Translation steps">
                {PIPELINE.map((p, i) => {
                  const idx = PIPELINE.indexOf(phase);
                  const state = phase === p ? 'active' : idx > i ? 'done' : 'pending';
                  return (
                    <li key={p} className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1.5 transition-colors duration-300',
                          state === 'active' && 'bg-surface text-ocean-700',
                          state === 'done' && 'bg-aqua-500/80 text-white',
                          state === 'pending' && 'bg-white/10 text-ocean-100',
                        )}
                      >
                        {p === 'understanding' ? 'Hear' : p === 'translating' ? 'Translate' : 'Speak'}
                      </span>
                      {i < PIPELINE.length - 1 && <span className="text-ocean-200" aria-hidden>→</span>}
                    </li>
                  );
                })}
              </ol>
            )}

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
                    className="mt-3 rounded-2xl bg-white/10 p-4 text-left ring-1 ring-inset ring-white/15 backdrop-blur-sm sm:p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-aqua-200">
                      For the {latest.direction === 'teacher-to-student' ? 'student' : 'teacher'} · {languageName(latest.targetLang)}
                    </p>
                    <p className="mt-1 font-display text-xl font-bold sm:text-2xl" lang={latest.targetLang}>
                      {latest.translatedText ? <Rendered turn={latest} /> : <span className="text-ocean-100">No known words yet</span>}
                    </p>
                    <p className="mt-2 text-xs text-ocean-100">
                      {latest.method === 'memory' ? 'Saved translation' : describeResult({ text: latest.translatedText, segments: latest.segments ?? [], coverage: latest.coverage, method: latest.method === 'typed' ? 'gloss' : latest.method })}
                      {latest.method === 'gloss' && latest.coverage < 1 && ' · underlined words were kept as spoken'}
                      {latest.latencyMs !== undefined && ` · ready in ${(latest.latencyMs / 1000).toFixed(latest.latencyMs < 1000 ? 2 : 1)} s`}
                    </p>
                    {phase === 'speaking' && <Waveform active tone="white" bars={32} className="mt-3 h-8" />}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {latest.translatedText && (
                        <AudioButton
                          variant="compact"
                          label="Play again"
                          playing={audio.playingKey === latest.id}
                          onPlay={() => {
                            const p = latest.phraseId && latest.method === 'memory' && latest.direction === 'teacher-to-student' ? phrases.find((x) => x.id === latest.phraseId) : undefined;
                            void audio.play(latest.id, latest.translatedText, latest.targetLang, p?.audio);
                          }}
                          onStop={audio.stop}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => openEditor(latest)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-white/15 px-3 text-sm font-semibold hover:bg-white/25"
                      >
                        {latest.method === 'memory' ? <PenLine className="h-4 w-4" aria-hidden /> : <BookmarkPlus className="h-4 w-4" aria-hidden />}
                        {latest.method === 'memory' ? 'Edit phrase' : 'Correct & save'}
                      </button>
                    </div>
                    {viaNote && latest.translatedText && <p className="mt-2 text-xs text-ocean-100">{viaNote}</p>}
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
              icon={MessagesSquare}
              title="No conversation yet"
              description="Each exchange stays here during the lesson so you can replay it or save it as a phrase."
            />
          ) : (
            <ol className="-mx-1 max-h-[560px] space-y-3 overflow-y-auto px-1">
              {turns.map((t) => {
                const teacher = t.direction === 'teacher-to-student';
                return (
                  <li key={t.id} className={cn('rounded-2xl p-4', teacher ? 'bg-ocean-50' : 'bg-sun-50')}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                      <Avatar teacher={teacher} size="sm" className="-mt-0.5 mr-1 inline" /> {teacher ? 'Teacher' : 'Student'} · {languageName(t.sourceLang)}
                    </p>
                    <p className="mt-1 text-[15px] text-ink-700">{t.sourceText}</p>
                    <p className="mt-2 font-semibold text-ink-900">{t.translatedText || '—'}</p>
                    <p className="mt-1 text-xs text-ink-500">{t.method === 'memory' ? 'Saved translation' : t.method === 'close' ? 'Similar saved sentence' : `Keyword guide · ${Math.round(t.coverage * 100)}% known`}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {t.translatedText && (
                        <AudioButton
                          variant="compact"
                          label="Replay"
                          playing={audio.playingKey === t.id}
                          onPlay={() => void audio.play(t.id, t.translatedText, t.targetLang)}
                          onStop={audio.stop}
                        />
                      )}
                      {t.method !== 'memory' && (
                        <button type="button" onClick={() => openEditor(t)} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-ocean-700 hover:bg-surface">
                          <BookmarkPlus className="h-4 w-4" aria-hidden /> Save
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          <p className="mt-auto flex gap-2 border-t border-ink-100 pt-4 text-xs text-ink-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              Verniq translates with your phrasebook first, then word by word from your{' '}
              <Link to="/words" className="font-semibold text-ocean-700 underline-offset-2 hover:underline">
                word list
              </Link>
              . It never invents {studentLang} words — save corrected sentences so they are used exactly next time.
            </span>
          </p>
        </Card>
      </div>

      {editor && (
        <PhraseEditor
          key={editor.key}
          open
          onClose={() => setEditor(null)}
          language={pair.target}
          initial={editor.draft}
          title={editor.draft.id ? 'Edit phrase' : 'Save to phrasebook'}
        />
      )}
    </div>
  );
}

/** Output with words Verniq did not know underlined. */
function Rendered({ turn }: { turn: TranslationTurn }) {
  if (turn.method !== 'gloss' || !turn.segments?.length) return <>{turn.translatedText}</>;
  const parts = turn.segments.filter((s) => s.output);
  return (
    <>
      {parts.map((s, i) => (
        <span key={i}>
          {i > 0 && ' '}
          {s.known ? s.output : <span className="underline decoration-sun-300 decoration-dashed decoration-2 underline-offset-4">{s.output}</span>}
        </span>
      ))}
    </>
  );
}

function Avatar({ teacher, size = 'md', className }: { teacher: boolean; size?: 'sm' | 'md'; className?: string }) {
  const Icon = teacher ? ChalkboardTeacher : Student;
  return <Icon size={size === 'sm' ? 16 : 40} weight="duotone" className={className} aria-hidden />;
}

function Speaker({ teacher, role, lang, active }: { teacher: boolean; role: string; lang: string; active: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-inset ring-white/20 transition-shadow duration-300 sm:h-20 sm:w-20',
          active && 'shadow-glow',
        )}
        aria-hidden
      >
        <Avatar teacher={teacher} />
      </span>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-white">{role}</p>
      <p className="text-xs text-ocean-100">{lang}</p>
    </div>
  );
}
