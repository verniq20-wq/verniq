import { FileText, Images } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { FlashcardStudio } from '../components/flashcards/FlashcardStudio';
import { PageHeader, Skeleton } from '../components/ui/States';
import { Tabs } from '../components/ui/Tabs';
import { WorksheetGenerator } from '../components/worksheet/WorksheetGenerator';
import { useApp } from '../store/AppContext';

type Tab = 'worksheets' | 'flashcards';

export default function Materials() {
  const [params, setParams] = useSearchParams();
  const { lessonsLoading } = useApp();
  const tab: Tab = params.get('tab') === 'flashcards' ? 'flashcards' : 'worksheets';

  return (
    <>
      <PageHeader title="Materials" description="Bilingual worksheets and picture flashcards, ready to print or show in class." />
      <Tabs
        label="Material type"
        size="lg"
        className="mb-6"
        value={tab}
        onChange={(t) => setParams({ tab: t }, { replace: true })}
        tabs={[
          { value: 'worksheets', label: 'Worksheets', icon: <FileText className="h-4 w-4" aria-hidden /> },
          { value: 'flashcards', label: 'Flashcards', icon: <Images className="h-4 w-4" aria-hidden /> },
        ]}
      />
      <div role="tabpanel">
        {tab === 'worksheets' ? lessonsLoading ? <Skeleton className="h-96 rounded-2xl" /> : <WorksheetGenerator /> : <FlashcardStudio />}
      </div>
    </>
  );
}
