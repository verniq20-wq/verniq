import { Languages } from 'lucide-react';
import { useData } from '../../store/DataContext';
import { cn } from '../../utils';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LanguagePairDisplay } from '../ui/LanguageSelector';
import { STATUS_META } from '../ui/statusMeta';

/** Compact row on phones and tablets; a full card beside today's lesson on desktop. */
export function LanguageStatusCard({ onChange }: { onChange: () => void }) {
  const { sync } = useData();
  const connectivity = { status: sync.localOnly ? ('offline' as const) : sync.status };
  const meta = STATUS_META[connectivity.status];
  return (
    <Card className="flex h-full items-center gap-3 lg:flex-col lg:items-stretch lg:gap-0">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-aqua-50 text-aqua-600 lg:hidden">
        <Languages className="h-5 w-5" aria-hidden />
      </span>
      <div className="hidden items-center gap-3 lg:flex">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-aqua-50 text-aqua-600">
          <Languages className="h-5 w-5" aria-hidden />
        </span>
        <p className="eyebrow">Classroom language</p>
      </div>

      <div className="min-w-0 flex-1 lg:mt-5 lg:flex-none">
        <p className="eyebrow lg:hidden">Language</p>
        <span className="mt-0.5 block lg:hidden">
          <LanguagePairDisplay size="sm" />
        </span>
        <span className="hidden lg:block">
          <LanguagePairDisplay size="lg" />
        </span>
        <p className={cn('mt-3 hidden w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset lg:inline-flex', meta.pill)}>
          <span className={cn('h-2 w-2 rounded-full', meta.dot)} aria-hidden />
          {connectivity.status === 'online' ? 'Online · offline ready' : meta.label}
        </p>
      </div>

      <Button variant="outline" size="sm" onClick={onChange} className="shrink-0 lg:hidden">
        Change
      </Button>
      <div className="mt-auto hidden pt-6 lg:block">
        <Button variant="outline" fullWidth onClick={onChange}>
          Change language
        </Button>
      </div>
    </Card>
  );
}
