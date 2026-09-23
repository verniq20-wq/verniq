import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftRight, Check, Download } from 'lucide-react';
import { useState } from 'react';
import { LANGUAGES, TRIBAL_LANGUAGES, getLanguage } from '../../data/languages';
import { useApp } from '../../store/AppContext';
import type { LanguageCode } from '../../types';
import { cn } from '../../utils';
import { Button } from './Button';
import { Modal } from './Modal';

/** Animated "Hindi ⇄ Ho" display. */
export function LanguagePairDisplay({ size = 'md', light }: { size?: 'sm' | 'md' | 'lg'; light?: boolean }) {
  const { pair } = useApp();
  const src = getLanguage(pair.source);
  const tgt = getLanguage(pair.target);
  const text = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' }[size];
  return (
    <span className={cn('inline-flex items-center gap-2.5 font-display font-bold', text, light ? 'text-white' : 'text-ink-900')}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={src.code} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}>
          {src.name}
        </motion.span>
      </AnimatePresence>
      <motion.span
        key={`${src.code}-${tgt.code}`}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={cn('inline-flex', light ? 'text-aqua-200' : 'text-aqua-500')}
        aria-label="and"
      >
        <ArrowLeftRight className={size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} />
      </motion.span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={tgt.code} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}>
          {tgt.name}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Modal that changes the classroom language pair.
 * Give it a new `key` each time it opens so the draft selection starts fresh.
 */
export function LanguagePickerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pair, setPair, toast } = useApp();
  const [source, setSource] = useState<LanguageCode>(pair.source);
  const [target, setTarget] = useState<LanguageCode>(pair.target);

  const save = () => {
    setPair({ source, target });
    toast({ tone: 'success', title: 'Classroom language updated', detail: `${getLanguage(source).name} ↔ ${getLanguage(target).name}` });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Classroom language"
      description="Choose the language you teach in and your students’ home language."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Use this pair</Button>
        </>
      }
    >
      <fieldset>
        <legend className="field-label">I teach in</legend>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.filter((l) => l.code === 'hi' || l.code === 'en').map((l) => (
            <Chip key={l.code} selected={source === l.code} onClick={() => setSource(l.code)}>
              {l.name} <span className="text-ink-400">{l.nativeName !== l.name && l.nativeName}</span>
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="field-label">Students speak</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TRIBAL_LANGUAGES.map((l) => {
            const selected = target === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setTarget(l.code)}
                aria-pressed={selected}
                className={cn(
                  'flex min-h-[64px] items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200',
                  selected ? 'border-ocean-500 bg-ocean-50 ring-2 ring-ocean-200' : 'border-ink-200 bg-white hover:border-ocean-200 hover:bg-ocean-50/40',
                )}
              >
                <span>
                  <span className="block font-semibold text-ink-900">
                    {l.name} <span className="font-normal text-ink-400">· {l.nativeName}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
                    {l.downloaded ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-ocean-500" aria-hidden /> Offline ready
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3" aria-hidden /> {l.packSizeMb} MB download
                      </>
                    )}
                  </span>
                </span>
                {selected && <Check className="h-5 w-5 text-ocean-600" aria-hidden />}
              </button>
            );
          })}
        </div>
      </fieldset>
    </Modal>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 font-semibold transition-all duration-200',
        selected ? 'border-ocean-500 bg-ocean-50 text-ocean-700' : 'border-ink-200 bg-white text-ink-700 hover:border-ocean-200',
      )}
    >
      {children}
    </button>
  );
}
