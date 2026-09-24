import { FileText, FolderOpen, Images, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { FlashcardStudio } from '../components/flashcards/FlashcardStudio';
import { Card } from '../components/ui/Card';
import { EmptyState, PageHeader } from '../components/ui/States';
import { Tabs } from '../components/ui/Tabs';
import { WorksheetGenerator } from '../components/worksheet/WorksheetGenerator';
import { languageName } from '../data/languages';
import { useClassroom } from '../hooks/useClassroom';
import { useApp } from '../store/AppContext';
import { timeAgo } from '../utils';

type Tab = 'worksheets' | 'flashcards' | 'saved';

export default function Materials() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab: Tab = raw === 'flashcards' || raw === 'saved' ? raw : 'worksheets';
  const open = params.get('open');

  return (
    <>
      <PageHeader title="Materials" description="Bilingual worksheets and picture flashcards — edit, save, and export as PDF." />
      <Tabs
        label="Material type"
        size="lg"
        stretch
        className="mb-5 sm:mb-6 sm:inline-grid sm:w-auto"
        value={tab}
        onChange={(t) => setParams({ tab: t }, { replace: true })}
        tabs={[
          { value: 'worksheets', label: 'Worksheets', icon: <FileText className="h-4 w-4" aria-hidden /> },
          { value: 'flashcards', label: 'Flashcards', icon: <Images className="h-4 w-4" aria-hidden /> },
          { value: 'saved', label: 'Saved', icon: <FolderOpen className="h-4 w-4" aria-hidden /> },
        ]}
      />
      <div role="tabpanel">
        {tab === 'worksheets' ? (
          <WorksheetGenerator key={open ?? 'new'} lessonParam={params.get('lesson')} openParam={open} />
        ) : tab === 'flashcards' ? (
          <FlashcardStudio key={open ?? 'new'} openParam={open} />
        ) : (
          <SavedList onOpen={(kind, id) => setParams({ tab: kind === 'worksheet' ? 'worksheets' : 'flashcards', open: id })} />
        )}
      </div>
    </>
  );
}

function SavedList({ onOpen }: { onOpen: (kind: 'worksheet' | 'flashcards', id: string) => void }) {
  const { materials, remove } = useClassroom();
  const { toast } = useApp();
  if (materials.length === 0) {
    return <EmptyState icon={FolderOpen} title="Nothing saved yet" description="Worksheets and flashcard sets you save appear here, on every device you sign in to." />;
  }
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {materials.map((m) => {
        const Icon = m.kind === 'worksheet' ? FileText : Images;
        const size = m.kind === 'worksheet' ? `${m.worksheet?.items.length ?? 0} questions` : `${m.flashcards?.cards.length ?? 0} cards`;
        return (
          <li key={m.id}>
            <Card className="flex items-center gap-3 p-3 sm:p-4" padded={false}>
              <button type="button" onClick={() => onOpen(m.kind, m.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink-900">{m.title}</span>
                  <span className="block truncate text-sm text-ink-500">
                    {size} · Hindi + {languageName(m.language)} · {timeAgo(m.updatedAt)}
                  </span>
                </span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${m.title}`}
                onClick={() => {
                  void remove('materials', m.id);
                  toast({ tone: 'info', title: 'Deleted', detail: m.title });
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
