import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { BookmarkCheck, ChevronLeft, ChevronRight, Download, Images, Pencil, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { generateFlashcards } from '../../../engine/materials';
import { languageName } from '../../data/languages';
import { useAudio } from '../../hooks/useAudio';
import { useClassroom } from '../../hooks/useClassroom';
import { exportElementToPdf } from '../../platform/pdf';
import { useApp } from '../../store/AppContext';
import type { MaterialDoc } from '../../types';
import { cn, newId, sleep } from '../../utils';
import { Button, IconButton } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select, TextField } from '../ui/Select';
import { EmptyState } from '../ui/States';
import { Flashcard, type FlashcardType } from './Flashcard';
import { FlashcardSheet } from './FlashcardSheet';

const TOPICS = ['Animals', 'Numbers', 'Fruits and food', 'Body parts', 'Family', 'Nature', 'Shapes', 'Classroom'];

export function FlashcardStudio({ openParam }: { openParam?: string | null }) {
  const { pair, glossary, put, records, activeClass } = useClassroom();
  const { toast, notify } = useApp();
  const [topic, setTopic] = useState('Animals');
  const [count, setCount] = useState(8);
  const [cards, setCards] = useState<FlashcardType[]>([]);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState<MaterialDoc | null>(null);
  const [editing, setEditing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const audio = useAudio();

  const language = saved?.language ?? pair.target;
  const target = languageName(language);
  const card = cards[index];
  const dirty = cards.length > 0 && (!saved || JSON.stringify(saved.flashcards?.cards) !== JSON.stringify(cards));

  const loaded = useRef<string | null>(null);
  useEffect(() => {
    if (!openParam || loaded.current === openParam) return;
    const m = records.materials.find((x) => x.id === openParam && x.kind === 'flashcards');
    if (m?.flashcards) {
      loaded.current = openParam;
      setSaved(m);
      setCards(m.flashcards.cards);
      setTopic(m.title);
      setIndex(0);
    }
  }, [openParam, records.materials]);

  const go = useCallback(
    (delta: number) => {
      const next = index + delta;
      if (next < 0 || next >= cards.length) return;
      audio.stop();
      setDir(delta);
      setFlipped(false);
      setEditing(false);
      setIndex(next);
    },
    [audio, cards.length, index],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, select, textarea')) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const generate = (e?: FormEvent) => {
    e?.preventDefault();
    audio.stop();
    const result = generateFlashcards(topic, count, glossary);
    setCards(result.cards);
    setSaved(null);
    setIndex(0);
    setFlipped(false);
    setEditing(false);
    if (window.innerWidth < 1024) setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    if (result.cards.length) notify({ kind: 'success', title: 'Flashcards ready', detail: `${result.cards.length} cards · ${topic}` });
  };

  const save = async () => {
    const doc = await put('materials', {
      id: saved?.id ?? newId(),
      kind: 'flashcards',
      title: saved?.title ?? topic.trim(),
      grade: activeClass?.grade ?? 1,
      subject: 'EVS',
      language,
      flashcards: { cards },
      createdAt: saved?.createdAt ?? Date.now(),
    });
    setSaved(doc);
    toast({ tone: 'success', title: 'Flashcard set saved', detail: `${cards.length} cards · available offline` });
  };

  const exportPdf = async () => {
    if (!sheet.current) return;
    setExporting(true);
    try {
      await sleep(50);
      await exportElementToPdf(sheet.current, `${topic} flashcards`, { title: `${topic} flashcards` });
    } catch {
      toast({ tone: 'error', title: 'Could not make the PDF' });
    } finally {
      setExporting(false);
    }
  };

  const editCard = (patch: Partial<FlashcardType>) => setCards((cs) => cs.map((c, i) => (i === index ? { ...c, ...patch, review: patch.target !== undefined ? 'teacher' : c.review } : c)));

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 80 || info.velocity.x > 400) go(-1);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit lg:sticky lg:top-24">
        <form onSubmit={generate} className="space-y-5">
          <TextField label="Topic" value={topic} onChange={setTopic} required placeholder="e.g. Animals, Numbers" list="flash-topics" />
          <datalist id="flash-topics">
            {TOPICS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.slice(0, 6).map((t) => (
              <button key={t} type="button" onClick={() => setTopic(t)} className={cn('min-h-[32px] rounded-lg px-2.5 text-xs font-semibold', topic === t ? 'bg-ocean-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200')}>
                {t}
              </button>
            ))}
          </div>
          <Select
            label="Number of cards"
            value={String(count)}
            onChange={(v) => setCount(Number(v))}
            options={[5, 8, 10, 12].map((n) => ({ value: String(n), label: `${n} cards` }))}
          />
          <Button type="submit" size="lg" fullWidth icon={<Sparkles className="h-5 w-5" />}>
            {cards.length ? 'Make new set' : 'Make flashcards'}
          </Button>
          <p className="text-xs text-ink-500">Cards use words from your word list. Words not yet collected show as blank — never guessed.</p>
        </form>
      </Card>

      <div ref={resultRef} className="min-w-0 scroll-mt-20">
        {card ? (
          <div className="mx-auto max-w-md">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink-500" aria-live="polite">
                Card {index + 1} of {cards.length}
              </p>
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
                  card.review === 'unverified' ? 'bg-sun-50 text-sun-700 ring-sun-100' : 'bg-leaf-50 text-leaf-700 ring-leaf-100',
                )}
              >
                {card.review === 'verified' ? 'Community verified' : card.review === 'teacher' ? 'Checked by you' : `${target} word not yet checked`}
              </span>
            </div>

            <div className="relative overflow-hidden px-1 py-2">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.div
                  key={card.id}
                  custom={dir}
                  initial={{ x: dir * 280, opacity: 0, rotate: dir * 4 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  exit={{ x: dir * -280, opacity: 0, rotate: dir * -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  drag={editing ? false : 'x'}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={onDragEnd}
                  className="touch-pan-y"
                >
                  <Flashcard
                    card={card}
                    flipped={flipped}
                    onFlip={() => setFlipped((f) => !f)}
                    targetLang={language}
                    playing={audio.playingKey === `${card.id}-t` ? 'target' : audio.playingKey === `${card.id}-h` ? 'hindi' : null}
                    onPlay={(w) => void audio.play(`${card.id}-${w === 'target' ? 't' : 'h'}`, w === 'target' ? card.target : card.hindi, w === 'target' ? language : 'hi', w === 'target' ? glossary.find((g) => g.hindi === card.hindi)?.audio : undefined)}
                    onStop={audio.stop}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {editing && (
              <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-sun-200 bg-sun-50/50 p-4 sm:grid-cols-3">
                <TextField label="English" value={card.english} onChange={(english) => editCard({ english })} />
                <TextField label="Hindi" lang="hi" value={card.hindi} onChange={(hindi) => editCard({ hindi })} />
                <TextField label={target} value={card.target} onChange={(t) => editCard({ target: t })} />
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-3">
              <IconButton label="Previous card" onClick={() => go(-1)} disabled={index === 0} className="h-12 w-12 border border-ink-200 bg-surface">
                <ChevronLeft className="h-6 w-6" />
              </IconButton>
              <div className="flex flex-wrap justify-center gap-1.5" aria-hidden>
                {cards.map((c, i) => (
                  <span key={c.id} className={cn('h-2 rounded-full transition-all duration-300', i === index ? 'w-6 bg-ocean-600' : 'w-2 bg-ink-200')} />
                ))}
              </div>
              <IconButton label="Next card" onClick={() => go(1)} disabled={index === cards.length - 1} className="h-12 w-12 border border-ink-200 bg-surface">
                <ChevronRight className="h-6 w-6" />
              </IconButton>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button onClick={() => void save()} disabled={!dirty} icon={saved && !dirty ? <BookmarkCheck className="h-4 w-4" /> : <Save className="h-4 w-4" />}>
                {saved && !dirty ? 'Saved' : 'Save set'}
              </Button>
              <Button variant={editing ? 'secondary' : 'outline'} icon={<Pencil className="h-4 w-4" />} onClick={() => setEditing((e) => !e)} aria-pressed={editing}>
                {editing ? 'Done' : 'Edit card'}
              </Button>
              <Button variant="outline" loading={exporting} icon={<Download className="h-4 w-4" />} onClick={() => void exportPdf()}>
                PDF
              </Button>
              {!saved && (
                <Button variant="ghost" icon={<RotateCcw className="h-4 w-4" />} onClick={() => generate()}>
                  Shuffle
                </Button>
              )}
            </div>
            <p className="mt-4 text-center text-xs text-ink-400">Swipe or use ← → keys · tap a card to flip</p>

            {/* Off-screen printable sheet used for the PDF */}
            <div aria-hidden className="pointer-events-none fixed -left-[10000px] top-0">
              <FlashcardSheet ref={sheet} title={saved?.title ?? topic} cards={cards} language={language} />
            </div>
          </div>
        ) : (
          <EmptyState icon={Images} title="Make a flashcard set" description="Pick a topic. Verniq builds picture cards with English, Hindi and your students’ words from your word list." />
        )}
      </div>
    </div>
  );
}
