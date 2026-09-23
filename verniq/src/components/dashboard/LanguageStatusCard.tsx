import { Languages } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LanguagePairDisplay } from '../ui/LanguageSelector';
import { STATUS_META } from '../ui/statusMeta';
import { cn } from '../../utils';

export function LanguageStatusCard({ onChange }: { onChange: () => void }) {
  const { connectivity } = useApp();
  const meta = STATUS_META[connectivity.status];
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-aqua-50 text-aqua-600">
          <Languages className="h-5 w-5" aria-hidden />
        </span>
        <p className="eyebrow">Classroom language</p>
      </div>
      <div className="mt-5">
        <LanguagePairDisplay size="lg" />
      </div>
      <p className={cn('mt-3 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset', meta.pill)}>
        <span className={cn('h-2 w-2 rounded-full', meta.dot)} aria-hidden />
        {connectivity.status === 'online' ? 'Online · offline ready' : meta.label}
      </p>
      <div className="mt-auto pt-6">
        <Button variant="outline" fullWidth onClick={onChange}>
          Change language
        </Button>
      </div>
    </Card>
  );
}
