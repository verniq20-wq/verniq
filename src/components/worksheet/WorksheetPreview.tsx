import { forwardRef, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { languageName } from '../../data/languages';
import type { LanguageCode, WorksheetContent, WorksheetItem } from '../../types';
import { cn } from '../../utils';
import { Picture } from '../ui/Picture';

interface Meta {
  title: string;
  school?: string;
  grade: number;
  subject: string;
  language: LanguageCode;
}

interface Props {
  worksheet: WorksheetContent;
  meta: Meta;
  editable?: boolean;
  onChange?: (ws: WorksheetContent, title?: string) => void;
}

const inputCls = 'w-full rounded-lg border border-sun-300 bg-sun-50/60 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sun-300';

function Prompt({ n, item, lang, editable, onEdit, onRemove }: { n: number; item: WorksheetItem; lang: string; editable?: boolean; onEdit: (p: Partial<WorksheetItem>) => void; onRemove: () => void }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean-600 text-sm font-bold text-white">{n}</span>
      {editable ? (
        <div className="min-w-0 flex-1 space-y-1.5">
          <input aria-label="Instruction in Hindi" lang="hi" className={cn(inputCls, 'font-semibold')} value={item.prompt} onChange={(e) => onEdit({ prompt: e.target.value })} />
          <input aria-label={`Instruction in ${lang}`} className={cn(inputCls, 'text-sm')} placeholder={`${lang} (optional)`} value={item.promptTarget} onChange={(e) => onEdit({ promptTarget: e.target.value })} />
        </div>
      ) : (
        <div className="min-w-0">
          <p lang="hi" className="font-semibold text-ink-900">
            {item.prompt}
          </p>
          {item.promptTarget && (
            <p className="text-sm text-ocean-700">
              <span className="sr-only">{lang}: </span>
              {item.promptTarget}
            </p>
          )}
        </div>
      )}
      {editable && (
        <button type="button" onClick={onRemove} aria-label={`Remove question ${n}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600">
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

function Body({ item }: { item: WorksheetItem }) {
  switch (item.kind) {
    case 'count':
      return (
        <div className="flex items-center gap-4 sm:pl-10">
          <div className="flex max-w-[260px] flex-wrap gap-1.5" role="img" aria-label={`${item.count} pictures`}>
            {Array.from({ length: item.count }).map((_, i) => (
              <Picture key={i} picture={item.picture} size={32} />
            ))}
          </div>
          <span className="ml-auto h-14 w-14 shrink-0 rounded-xl border-2 border-dashed border-ink-300" aria-label="Answer box" />
        </div>
      );
    case 'match':
      return <MatchBody item={item} />;
    case 'fill':
      return (
        <div className="flex flex-wrap gap-2 sm:pl-10">
          {item.sequence.map((v, i) => (
            <span
              key={i}
              className={cn(
                'flex h-11 min-w-[44px] items-center justify-center rounded-xl px-1 font-display text-xl font-bold sm:h-12 sm:min-w-[48px]',
                v === null ? 'border-2 border-dashed border-sun-400 bg-sun-50' : 'bg-ink-50 text-ink-800',
              )}
            >
              {v ?? <span className="sr-only">blank</span>}
            </span>
          ))}
        </div>
      );
    case 'circle':
      return (
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 sm:pl-10">
          {item.picture && <Picture picture={item.picture} size={48} tile className="h-16 w-16" />}
          {item.options.map((o) => (
            <span key={o} className="flex min-h-[56px] min-w-[56px] items-center justify-center rounded-full border-2 border-ink-200 px-3 font-display text-xl font-bold text-ink-800">
              {o}
            </span>
          ))}
        </div>
      );
    case 'write':
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:pl-10">
          {item.words.map((w, i) => (
            <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-ink-200 p-3">
              {w.picture ? <Picture picture={w.picture} size={40} /> : <span className="font-display text-2xl font-bold text-ocean-600">{w.hint}</span>}
              {w.picture && <span className="text-xs text-ink-500">{w.hint}</span>}
              <span className="h-8 w-full border-b-2 border-dotted border-ink-300" aria-label="Write here" />
            </div>
          ))}
        </div>
      );
    case 'sort':
      return (
        <div className="sm:pl-10">
          <div className="mb-3 flex flex-wrap gap-2">
            {item.words.map((w) => (
              <span key={w} className="rounded-lg bg-ink-50 px-3 py-1.5 font-semibold text-ink-800">
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {item.groups.map((g) => (
              <div key={g} className="min-h-[96px] rounded-xl border-2 border-dashed border-ink-300 p-2">
                <p className="text-center text-sm font-bold text-ocean-700">{g}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 'tick':
      return (
        <ul className="space-y-2 sm:pl-10">
          {item.statements.map((s, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="h-7 w-7 shrink-0 rounded-md border-2 border-ink-300" aria-hidden />
              <span lang="hi" className="text-ink-800">
                {s.text}
              </span>
            </li>
          ))}
        </ul>
      );
  }
}

function MatchBody({ item }: { item: Extract<WorksheetItem, { kind: 'match' }> }) {
  // The right column is rotated so no answer sits beside its question.
  const right = useMemo(() => {
    const r = item.pairs.map((p) => p.right);
    return r.length > 1 ? [...r.slice(1), r[0]] : r;
  }, [item.pairs]);
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:max-w-md sm:gap-x-12 sm:pl-10">
      {item.pairs.map((p, i) => (
        <div key={`${p.left}-${i}`} className="contents">
          <span className="flex min-h-[48px] items-center justify-between gap-2 rounded-xl bg-ocean-50 px-3 py-2 font-display text-lg font-bold text-ocean-700">
            <span className="flex items-center gap-2">
              {p.picture && <Picture picture={p.picture} size={28} />}
              {p.left}
            </span>
            <span className="h-2 w-2 shrink-0 rounded-full bg-ocean-400" aria-hidden />
          </span>
          <span className="flex min-h-[48px] items-center gap-3 rounded-xl bg-aqua-50 px-3 py-2 font-semibold text-aqua-800">
            <span className="h-2 w-2 shrink-0 rounded-full bg-aqua-400" aria-hidden /> {right[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Printable bilingual worksheet. In edit mode the title and instructions become fields. */
export const WorksheetPreview = forwardRef<HTMLElement, Props>(function WorksheetPreview({ worksheet, meta, editable, onChange }, ref) {
  const lang = languageName(meta.language);
  const edit = (i: number, patch: Partial<WorksheetItem>) =>
    onChange?.({ ...worksheet, items: worksheet.items.map((it, idx) => (idx === i ? ({ ...it, ...patch } as WorksheetItem) : it)) });
  const removeItem = (i: number) => onChange?.({ ...worksheet, items: worksheet.items.filter((_, idx) => idx !== i) });

  return (
    <article
      ref={ref}
      id="printable"
      aria-label="Worksheet preview"
      className={cn(
        'mx-auto w-full max-w-[720px] rounded-2xl border border-ink-200 bg-white p-4 shadow-lift sm:p-10',
        editable && 'ring-2 ring-sun-300 ring-offset-4 ring-offset-canvas',
      )}
    >
      <header className="border-b-2 border-ocean-600 pb-4">
        <div className="flex items-start justify-between gap-4 text-xs text-ink-500">
          <span>{meta.school ?? ''}</span>
          <span>
            Class {meta.grade} · {meta.subject}
          </span>
        </div>
        {editable ? (
          <div className="mt-3 space-y-1.5">
            <input aria-label="Title" className={cn(inputCls, 'font-display text-xl font-extrabold')} value={meta.title} onChange={(e) => onChange?.(worksheet, e.target.value)} />
            <input
              aria-label={`Title in ${lang}`}
              className={cn(inputCls, 'font-semibold')}
              placeholder={`${lang} title (optional)`}
              value={worksheet.titleTarget}
              onChange={(e) => onChange?.({ ...worksheet, titleTarget: e.target.value })}
            />
          </div>
        ) : (
          <>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">{meta.title}</h2>
            {worksheet.titleTarget && <p className="font-display text-lg font-bold text-ocean-600">{worksheet.titleTarget}</p>}
          </>
        )}
        <div className="mt-4 grid grid-cols-2 gap-6 text-sm text-ink-600">
          <span className="border-b border-ink-300 pb-1">नाम / Name:</span>
          <span className="border-b border-ink-300 pb-1">तारीख / Date:</span>
        </div>
      </header>

      <div className="mt-5 space-y-6 sm:mt-6 sm:space-y-8">
        {worksheet.items.map((item, i) => (
          <section key={i} className="break-inside-avoid">
            <Prompt n={i + 1} item={item} lang={lang} editable={editable} onEdit={(p) => edit(i, p)} onRemove={() => removeItem(i)} />
            <Body item={item} />
          </section>
        ))}
      </div>

      <footer className="mt-10 flex items-center justify-between border-t border-ink-100 pt-3 text-[11px] text-ink-400">
        <span>
          Hindi + {lang} · {worksheet.difficulty}
        </span>
        <span>Made with Verniq</span>
      </footer>
    </article>
  );
});
