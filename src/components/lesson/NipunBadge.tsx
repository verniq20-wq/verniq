import { Flag } from 'lucide-react';
import { nipunLabel, outcomeByCode } from '../../../engine/curriculum';
import { cn } from '../../utils';

/** Shows the NIPUN Bharat Lakshya an outcome works towards (nothing if none applies). */
export function NipunBadge({ code, className, compact }: { code?: string; className?: string; compact?: boolean }) {
  const t = code ? outcomeByCode(code)?.nipun : undefined;
  if (!t) return null;
  return (
    <p className={cn('flex items-start gap-1.5 text-xs text-leaf-700', className)}>
      <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>
        <span className="font-semibold">{nipunLabel(t)}</span>
        {!compact && <>: {t.target}</>}
      </span>
    </p>
  );
}
