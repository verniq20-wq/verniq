import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ANIMAL_FLASHCARDS } from '../../data/demo';
import { languageName } from '../../data/languages';
import { useAudio } from '../../hooks/useAudio';
import { generateFlashcards } from '../../services/materialsService';
import { useApp } from '../../store/AppContext';
import type { Flashcard as FlashcardType } from '../../types';
import { cn } from '../../utils';
import { Button, IconButton } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select, TextField } from '../ui/Select';
import { Skeleton } from '../ui/States';
import { Flashcard } from './Flashcard';

export function FlashcardStudio() {
  const { pair, toast, notify } = useApp();
  const [topic, setTopic] = useState('Animals');
  const [count, setCount] = useState(10);
  const [cards, setCards] = useState<FlashcardType[]>(ANIMAL_FLASHCARDS.slice(0, 6));
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const audio = useAudio();

  const target = languageName(pair.target);
  const card = cards[index];

  const go = useCallback(
    (delta: number) => {
      const next = index + delta;
      if (next < 0 || next >= cards.length) return;
      audio.stop();
      setDir(delta);
      setFlipped(false);
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

  const generate = async (e?: FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setSaved(false);
    audio.stop();
    const result = await generateFlashcards(topic, count);
    setCards(result);
    setIndex(0);
    setFlipped(false);
    setLoading(false);
    notify({ kind: 'success', title: 'Flashcards ready', detail: `${result.length} cards · ${topic}` });
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 80 || info.velocity.x > 400) go(-1);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit lg:sticky lg:top-24">
        <form onSubmit={generate} className="space-y-5">
          <TextField label="Topic" value={topic} onChange={setTopic} required placeholder="e.g. Animals, Numbers" />
          <div>
            <p className="field-label">Language</p>
            <p className="field flex items-center font-semibold">Hindi + {target}</p>
          </div>
          <Select
            label="Number of cards"
            value={String(count)}
            onChange={(v) => setCount(Number(v))}
            options={[5, 8, 10, 12].map((n) => ({ value: String(n), label: `${n} cards` }))}
          />
          <Button type="submit" size="lg" fullWidth loading={loading} icon={!loading && <Sparkles className="h-5 w-5" />}>
            {loading ? 'Creating cards…' : 'Generate'}
          </Button>
        </form>
      </Card>

      <div className="min-w-0">
        {loading ? (
          <div className="mx-auto max-w-md space-y-4" role="status" aria-label="Creating flashcards">
            <Skeleton className="h-[400px] rounded-[28px]" />
            <p className="text-center text-sm font-semibold text-ocean-700">🖼 Drawing pictures · 🌐 Writing {target} words…</p>
          </div>
        ) : card ? (
          <div className="mx-auto max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-500" aria-live="polite">
                Card {index + 1} of {cards.length}
              </p>
              <span className="rounded-full bg-sun-50 px-2.5 py-1 text-[11px] font-semibold text-sun-700 ring-1 ring-inset ring-sun-100">
                {card.review === 'verified' ? 'Community verified' : `${target} words: review pending`}
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
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={onDragEnd}
                  className="touch-pan-y"
                >
                  <Flashcard
                    card={card}
                    flipped={flipped}
                    onFlip={() => setFlipped((f) => !f)}
                    targetLang={pair.target}
                    playing={audio.playingKey === `${card.id}-t` ? 'target' : audio.playingKey === `${card.id}-h` ? 'hindi' : null}
                    onPlay={(w) => void audio.play(`${card.id}-${w === 'target' ? 't' : 'h'}`, w === 'target' ? card.target : card.hindi, w === 'target' ? pair.target : 'hi')}
                    onStop={audio.stop}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <IconButton label="Previous card" onClick={() => go(-1)} disabled={index === 0} className="h-12 w-12 border border-ink-200 bg-white">
                <ChevronLeft className="h-6 w-6" />
              </IconButton>
              <div className="flex flex-wrap justify-center gap-1.5" aria-hidden>
                {cards.map((c, i) => (
                  <span key={c.id} className={cn('h-2 rounded-full transition-all duration-300', i === index ? 'w-6 bg-ocean-600' : 'w-2 bg-ink-200')} />
                ))}
              </div>
              <IconButton label="Next card" onClick={() => go(1)} disabled={index === cards.length - 1} className="h-12 w-12 border border-ink-200 bg-white">
                <ChevronRight className="h-6 w-6" />
              </IconButton>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant={saved ? 'secondary' : 'outline'}
                icon={saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                onClick={() => {
                  setSaved(true);
                  toast({ tone: 'success', title: 'Flashcard set saved', detail: `${cards.length} cards available offline` });
                }}
              >
                {saved ? 'Saved' : 'Save set'}
              </Button>
              <Button variant="ghost" icon={<RotateCcw className="h-4 w-4" />} onClick={() => void generate()}>
                Regenerate
              </Button>
            </div>
            <p className="mt-4 text-center text-xs text-ink-400">Swipe or use ← → keys · tap a card to flip</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
