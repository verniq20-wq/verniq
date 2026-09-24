import { BadgeCheck, BookA, Download, MessageSquareQuote, Play, Plus, Search, Upload, UserCheck } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Picture } from '../components/ui/Picture';
import { Select, TextField } from '../components/ui/Select';
import { EmptyState, PageHeader } from '../components/ui/States';
import { Tabs } from '../components/ui/Tabs';
import { PhraseEditor, type PhraseDraft } from '../components/words/PhraseEditor';
import { RecordButton } from '../components/words/RecordButton';
import { languageName } from '../data/languages';
import { useAudio } from '../hooks/useAudio';
import { useClassroom } from '../hooks/useClassroom';
import { useApp } from '../store/AppContext';
import type { GlossaryCategory, GlossaryEntry, ReviewStatus } from '../types';
import { corpusCsv, readCorpus } from '../data/corpus';
import { cn, download, newId } from '../utils';

type Tab = 'words' | 'phrases';

const CATEGORIES: { value: GlossaryCategory | 'all' | 'missing'; label: string }[] = [
  { value: 'all', label: 'All words' },
  { value: 'missing', label: 'Missing a word' },
  { value: 'number', label: 'Numbers' },
  { value: 'animal', label: 'Animals' },
  { value: 'nature', label: 'Nature' },
  { value: 'food', label: 'Food' },
  { value: 'body', label: 'Body' },
  { value: 'family', label: 'Family' },
  { value: 'classroom', label: 'Classroom' },
  { value: 'colour', label: 'Colours' },
  { value: 'shape', label: 'Shapes' },
  { value: 'place', label: 'Places' },
  { value: 'time', label: 'Time' },
  { value: 'greeting', label: 'Greetings' },
  { value: 'question', label: 'Questions' },
  { value: 'describing', label: 'Describing' },
  { value: 'action', label: 'Actions' },
];

function StatusBadge({ status }: { status: ReviewStatus }) {
  if (status === 'verified')
    return (
      <Badge tone="leaf" icon={<BadgeCheck className="h-3.5 w-3.5" aria-hidden />}>
        Verified
      </Badge>
    );
  if (status === 'teacher')
    return (
      <Badge tone="aqua" icon={<UserCheck className="h-3.5 w-3.5" aria-hidden />}>
        Yours
      </Badge>
    );
  return <Badge tone="sun">Not checked</Badge>;
}

export default function Words() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'phrases' ? 'phrases' : 'words';
  const { pair } = useClassroom();
  const lang = languageName(pair.target);

  return (
    <>
      <PageHeader
        title={`${lang} words`}
        description={`Verniq only uses ${lang} words from this list and your phrasebook. Add and correct them — every lesson, card and translation updates.`}
        action={<CorpusActions />}
      />
      <Tabs
        label="Word list sections"
        size="lg"
        stretch
        className="mb-5 sm:mb-6 sm:inline-grid sm:w-auto"
        value={tab}
        onChange={(t) => setParams({ tab: t }, { replace: true })}
        tabs={[
          { value: 'words', label: 'Word list', icon: <BookA className="h-4 w-4" aria-hidden /> },
          { value: 'phrases', label: 'Phrasebook', icon: <MessageSquareQuote className="h-4 w-4" aria-hidden /> },
        ]}
      />
      {tab === 'words' ? <WordList /> : <Phrasebook />}
    </>
  );
}

// ─── Share: export / import ─────────────────────────────────
function CorpusActions() {
  const { glossary, phrases, records, pair, putMany } = useClassroom();
  const { toast } = useApp();
  const input = useRef<HTMLInputElement>(null);
  const lang = languageName(pair.target);

  const exportCsv = () => {
    download(new Blob([corpusCsv(glossary, phrases)], { type: 'text/csv;charset=utf-8' }), `verniq-${lang.toLowerCase()}-words.csv`);
  };

  const importFile = async (file: File) => {
    const rows = readCorpus(await file.text());
    if (!rows.length) {
      toast({ tone: 'warning', title: 'No words found', detail: 'Use columns: hindi, english, target — or a file exported from Verniq.' });
      return;
    }
    const own = new Map(records.glossary.filter((g) => g.language === pair.target).map((g) => [g.hindi, g]));
    const seed = new Map(glossary.map((g) => [g.hindi, g]));
    const words = rows
      .filter((r) => r.kind === 'word')
      .map((r) => {
        const prev = own.get(r.hindi);
        const base = seed.get(r.hindi);
        return {
          id: prev?.id ?? newId(),
          language: pair.target,
          hindi: r.hindi,
          english: r.english || base?.english || '',
          target: r.target,
          category: base?.category ?? r.category,
          ...(base?.picture ? { picture: base.picture } : {}),
          ...(base?.value !== undefined ? { value: base.value } : {}),
          ...(prev?.audio ? { audio: prev.audio } : {}),
          status: 'teacher' as const,
        };
      });
    const known = new Set(phrases.map((p) => p.hindi.trim()));
    const newPhrases = rows
      .filter((r) => r.kind === 'phrase' && !known.has(r.hindi))
      .map((r) => ({ id: newId(), language: pair.target, hindi: r.hindi, target: r.target, ...(r.english ? { english: r.english } : {}), speaker: r.speaker, uses: 0 }));
    if (words.length) await putMany('glossary', words);
    if (newPhrases.length) await putMany('phrases', newPhrases);
    toast({ tone: 'success', title: `Imported ${words.length} words and ${newPhrases.length} phrases`, detail: `Added to your ${lang} list as your own words.` });
  };

  return (
    <>
      <Button variant="outline" icon={<Upload className="h-4 w-4" />} onClick={() => input.current?.click()}>
        Import
      </Button>
      <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={exportCsv}>
        Export CSV
      </Button>
      <input
        ref={input}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) void importFile(f);
        }}
      />
    </>
  );
}

// ─── Word list ───────────────────────────────────────────────
function WordList() {
  const { glossary, records, pair } = useClassroom();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]['value']>('all');
  const [editing, setEditing] = useState<GlossaryEntry | null>(null);
  const lang = languageName(pair.target);
  const ownIds = useMemo(() => new Set(records.glossary.map((g) => g.id)), [records.glossary]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return glossary.filter((g) => {
      if (cat === 'missing' ? g.target : cat !== 'all' && g.category !== cat) return false;
      if (!needle) return true;
      return g.hindi.includes(needle) || g.english.toLowerCase().includes(needle) || g.target.toLowerCase().includes(needle);
    });
  }, [glossary, q, cat]);
  const known = glossary.filter((g) => g.target).length;

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <label htmlFor="word-search" className="sr-only">
            Search words
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden />
          <input id="word-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Hindi, English or the home language" className="field pl-11" />
        </div>
        <Select label="Show" className="sm:w-52 [&_.field-label]:sr-only" value={cat} onChange={(v) => setCat(v as typeof cat)} options={CATEGORIES} />
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setEditing({ id: '', language: pair.target, hindi: '', english: '', target: '', category: 'classroom', status: 'teacher' })}
        >
          Add word
        </Button>
      </div>
      <p className="mb-3 text-sm text-ink-500">
        {known} of {glossary.length} words have a {lang} word · showing {filtered.length}
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={BookA} title="No words match" description="Try another search, or add the word yourself." />
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g) => (
            <li key={g.id}>
              <button type="button" onClick={() => setEditing(g)} className="flex min-h-[64px] w-full items-center gap-3 rounded-2xl border border-ink-200 bg-surface p-3 text-left transition-colors hover:border-ocean-300">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-50">
                  {g.picture ? <Picture picture={g.picture} size={28} /> : g.value !== undefined ? <span className="font-display text-lg font-extrabold text-ocean-600">{g.value}</span> : <BookA className="h-5 w-5 text-ink-300" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink-900">
                    {g.target || <span className="font-normal italic text-ink-400">no {lang} word yet</span>}
                  </span>
                  <span className="block truncate text-sm text-ink-500">
                    {g.hindi} · {g.english}
                  </span>
                </span>
                {g.target && <StatusBadge status={g.status} />}
              </button>
            </li>
          ))}
        </ul>
      )}

      {editing && <WordEditor key={editing.id || 'new'} entry={editing} own={ownIds.has(editing.id)} onClose={() => setEditing(null)} />}
    </>
  );
}

function WordEditor({ entry, own, onClose }: { entry: GlossaryEntry; own: boolean; onClose: () => void }) {
  const { put, remove } = useClassroom();
  const { toast } = useApp();
  const audio = useAudio();
  const [e, setE] = useState(entry);
  const lang = languageName(entry.language);
  const isNew = !entry.id;

  const save = async () => {
    // Starter words are never edited in place: the teacher's version is saved as their own entry and replaces it.
    const id = own ? entry.id : newId();
    const status: ReviewStatus = e.status === 'verified' ? 'verified' : 'teacher';
    await put('glossary', { ...e, id, hindi: e.hindi.trim(), english: e.english.trim(), target: e.target.trim(), status });
    toast({ tone: 'success', title: 'Word saved', detail: `${e.hindi} → ${e.target || '—'}` });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'Add a word' : 'Edit word'}
      description={isNew ? undefined : own ? 'Your word. It is used everywhere in Verniq.' : 'Starter word from Verniq — not yet checked by a speaker. Saving makes it yours.'}
      footer={
        <>
          {own && (
            <Button
              variant="ghost"
              className="mr-auto text-rose-600 hover:bg-rose-50"
              onClick={() => {
                void remove('glossary', entry.id);
                onClose();
              }}
            >
              Remove
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={!e.hindi.trim()}>
            Save word
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Hindi" lang="hi" value={e.hindi} onChange={(hindi) => setE({ ...e, hindi })} readOnly={!isNew && !own} hint={!isNew && !own ? 'Starter word' : undefined} />
          <TextField label="English" value={e.english} onChange={(english) => setE({ ...e, english })} />
        </div>
        <div className="flex items-end gap-2">
          <TextField className="flex-1" label={lang} value={e.target} onChange={(target) => setE({ ...e, target })} placeholder="How children say it at home" />
          {e.target && (
            <Button variant="soft" aria-label="Listen" className="min-h-[48px]" onClick={() => void audio.play('w', e.target, e.language, e.audio)}>
              <Play className="h-4 w-4 fill-current" aria-hidden />
            </Button>
          )}
        </div>
        <Select
          label="Group"
          value={e.category}
          onChange={(v) => setE({ ...e, category: v as GlossaryCategory })}
          options={CATEGORIES.filter((c) => c.value !== 'all' && c.value !== 'missing')}
        />
        <div>
          <p className="field-label">Pronunciation</p>
          <RecordButton value={e.audio} onChange={(a) => setE({ ...e, audio: a })} label={`Record ${lang} word`} />
          <p className="mt-1.5 text-xs text-ink-500">Played on flashcards, lesson key words and in Live instead of the approximate Hindi voice.</p>
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 p-3">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-leaf-600" checked={e.status === 'verified'} onChange={(ev) => setE({ ...e, status: ev.target.checked ? 'verified' : 'teacher' })} />
          <span>
            <span className="block font-semibold text-ink-900">Checked by a {lang} speaker</span>
            <span className="block text-sm text-ink-500">Tick when a parent, elder or colleague has confirmed this word.</span>
          </span>
        </label>
      </div>
    </Modal>
  );
}

// ─── Phrasebook ─────────────────────────────────────────────
function Phrasebook() {
  const { phrases, pair } = useClassroom();
  const audio = useAudio();
  const [editor, setEditor] = useState<{ key: number; draft: PhraseDraft } | null>(null);
  const [who, setWho] = useState<'all' | 'teacher' | 'student'>('all');
  const lang = languageName(pair.target);
  const list = phrases.filter((p) => who === 'all' || p.speaker === who).sort((a, b) => b.uses - a.uses || b.updatedAt - a.updatedAt);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          label="Who says it"
          value={who}
          onChange={setWho}
          tabs={[
            { value: 'all', label: 'All' },
            { value: 'teacher', label: 'Teacher' },
            { value: 'student', label: 'Students' },
          ]}
        />
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditor({ key: Date.now(), draft: { hindi: '', target: '', speaker: who === 'student' ? 'student' : 'teacher' } })}>
          Add phrase
        </Button>
      </div>
      {list.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          title="Your phrasebook is empty"
          description={`Add sentences you use every day — “बैठ जाओ”, “पानी पी लो” — with the ${lang} way of saying them and a recording. Live translation uses them word-for-word.`}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {list.map((p) => (
            <li key={p.id}>
              <Card className="flex items-start gap-3 p-4" padded={false}>
                <button type="button" onClick={() => setEditor({ key: Date.now(), draft: { ...p } })} className="min-w-0 flex-1 text-left">
                  <span className="eyebrow">{p.speaker === 'teacher' ? 'Teacher says' : 'Student says'}</span>
                  <span lang="hi" className="mt-1 block font-semibold text-ink-900">
                    {p.hindi}
                  </span>
                  <span className="block font-semibold text-ocean-700">{p.target}</span>
                  {p.english && <span className="block text-sm text-ink-500">{p.english}</span>}
                  <span className="mt-1 block text-xs text-ink-400">
                    {p.audio ? 'Recorded' : 'No recording'} · used {p.uses} {p.uses === 1 ? 'time' : 'times'}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Play ${p.target}`}
                  onClick={() => void audio.play(p.id, p.target, p.language, p.audio)}
                  className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', audio.playingKey === p.id ? 'bg-aqua-500 text-white' : 'bg-aqua-50 text-aqua-700 hover:bg-aqua-100')}
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden />
                </button>
              </Card>
            </li>
          ))}
        </ul>
      )}
      {editor && <PhraseEditor key={editor.key} open onClose={() => setEditor(null)} language={pair.target} initial={editor.draft} />}
    </>
  );
}
