import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { TEACHER } from '../../data/demo';
import { languageName } from '../../data/languages';
import type { Worksheet, WorksheetItem } from '../../types';
import { cn } from '../../utils';
import { Picture } from '../ui/Picture';

function Prompt({ n, item, lang }: { n: number; item: WorksheetItem; lang: string }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-sm font-bold text-white">{n}</span>
      <div>
        <p lang="hi" className="font-semibold text-ink-900">
          {item.prompt}
        </p>
        <p className="text-sm text-ocean-700">
          <span className="sr-only">{lang}: </span>
          {item.promptTarget}
        </p>
      </div>
    </div>
  );
}

function Item({ item, n, lang }: { item: WorksheetItem; n: number; lang: string }) {
  switch (item.kind) {
    case 'count':
      return (
        <div>
          <Prompt n={n} item={item} lang={lang} />
          <div className="flex items-center gap-4 pl-0 sm:pl-10">
            <div className="flex max-w-[240px] flex-wrap gap-1.5" role="img" aria-label={`${item.count} ${item.picture} pictures`}>
              {Array.from({ length: item.count }).map((_, i) => (
                <Picture key={i} picture={item.picture} size={34} />
              ))}
            </div>
            <span className="ml-auto h-14 w-14 shrink-0 rounded-xl border-2 border-dashed border-ink-300" aria-label="Answer box" />
          </div>
        </div>
      );
    case 'match':
      return <MatchItem item={item} n={n} lang={lang} />;
    case 'fill':
      return (
        <div>
          <Prompt n={n} item={item} lang={lang} />
          <div className="flex flex-wrap gap-2 pl-0 sm:pl-10">
            {item.sequence.map((v, i) => (
              <span
                key={i}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl font-display text-xl font-bold sm:h-12 sm:w-12',
                  v === null ? 'border-2 border-dashed border-sun-400 bg-sun-50' : 'bg-ink-50 text-ink-800',
                )}
              >
                {v ?? <span className="sr-only">blank</span>}
              </span>
            ))}
          </div>
        </div>
      );
    case 'circle':
      return (
        <div>
          <Prompt n={n} item={item} lang={lang} />
          <div className="flex gap-3 pl-0 sm:gap-4 sm:pl-10">
            {item.options.map((o) => (
              <span key={o} className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink-200 font-display text-2xl font-bold text-ink-800">
                {o}
              </span>
            ))}
          </div>
        </div>
      );
  }
}

function MatchItem({ item, n, lang }: { item: Extract<WorksheetItem, { kind: 'match' }>; n: number; lang: string }) {
  const right = useMemo(() => [...item.pairs].map((p) => p.right).sort(), [item.pairs]);
  return (
    <div>
      <Prompt n={n} item={item} lang={lang} />
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 pl-0 sm:max-w-md sm:gap-x-12 sm:pl-10">
        {item.pairs.map((p, i) => (
          <div key={p.left} className="contents">
            <span className="flex items-center justify-between rounded-xl bg-ocean-50 px-4 py-2 font-display text-xl font-bold text-ocean-700">
              {p.left} <span className="h-2 w-2 rounded-full bg-ocean-400" aria-hidden />
            </span>
            <span className="flex items-center gap-3 rounded-xl bg-aqua-50 px-4 py-2 font-semibold text-aqua-800">
              <span className="h-2 w-2 rounded-full bg-aqua-400" aria-hidden /> {right[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorksheetPreview({ worksheet, editable }: { worksheet: Worksheet; editable: boolean }) {
  const lang = languageName(worksheet.language);
  return (
    <motion.article
      id="printable"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      contentEditable={editable}
      suppressContentEditableWarning
      aria-label="Worksheet preview"
      className={cn(
        'mx-auto w-full max-w-[720px] rounded-2xl border border-ink-200 bg-white p-4 shadow-lift outline-none sm:p-10',
        editable && 'ring-2 ring-sun-300 ring-offset-4 ring-offset-canvas',
      )}
    >
      <header className="border-b-2 border-ocean-600 pb-4">
        <div className="flex items-start justify-between gap-4 text-xs text-ink-500">
          <span>{TEACHER.school}</span>
          <span>
            Class {worksheet.classLevel} · {worksheet.subject}
          </span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">{worksheet.title}</h2>
        <p className="font-display text-lg font-bold text-ocean-600">{worksheet.titleTarget}</p>
        <div className="mt-4 grid grid-cols-2 gap-6 text-sm text-ink-600">
          <span className="border-b border-ink-300 pb-1">नाम / Name:</span>
          <span className="border-b border-ink-300 pb-1">तारीख / Date:</span>
        </div>
      </header>

      <div className="mt-5 space-y-6 sm:mt-6 sm:space-y-8">
        {worksheet.items.map((item, i) => (
          <Item key={i} item={item} n={i + 1} lang={lang} />
        ))}
      </div>

      <footer className="mt-10 flex items-center justify-between border-t border-ink-100 pt-3 text-[11px] text-ink-400">
        <span>Hindi + {lang} · {worksheet.difficulty}</span>
        <span>Made with Verniq</span>
      </footer>
    </motion.article>
  );
}
