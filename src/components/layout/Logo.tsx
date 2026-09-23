import { useId } from 'react';
import { cn } from '../../utils';

export function LogoMark({ className }: { className?: string }) {
  // unique id: several marks can be on the page, some hidden
  const gid = `verniq-g-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 64 64" className={cn('h-9 w-9', className)} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#145F9E" />
          <stop offset="1" stopColor="#16AC9E" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${gid})`} />
      <path d="M17 20l15 26 15-26" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="47" cy="20" r="4" fill="#FBBC55" />
    </svg>
  );
}

export function Logo({ className, showTagline }: { className?: string; showTagline?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="leading-none">
        <span className="block font-display text-xl font-extrabold tracking-tight text-ink-900">
          VERN<span className="text-aqua-600">IQ</span>
        </span>
        {showTagline && <span className="mt-1 block text-[11px] font-medium text-ink-500">Learning in their language</span>}
      </span>
    </span>
  );
}
