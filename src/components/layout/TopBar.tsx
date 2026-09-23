import { Search, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TEACHER } from '../../data/demo';
import { DEMO_MODE } from '../../services/config';
import { IconButton } from '../ui/Button';
import { OfflineIndicator } from '../ui/OfflineIndicator';
import { LogoMark } from './Logo';
import { NotificationPanel } from './NotificationPanel';

export function TopBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/lessons${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
    setMobileSearch(false);
  };

  const initials = TEACHER.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/60 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-[64px] max-w-7xl items-center gap-3 px-4 sm:px-6 md:h-[72px] lg:px-8">
        <Link to="/" aria-label="Verniq home" className="md:hidden">
          <LogoMark className="h-8 w-8" />
        </Link>

        <form role="search" onSubmit={submit} className="relative hidden max-w-md flex-1 sm:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden />
          <label htmlFor="global-search" className="sr-only">
            Search lessons
          </label>
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, topics, outcomes…"
            className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-4 text-[15px] shadow-soft placeholder:text-ink-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          />
        </form>

        <div className="flex-1 sm:hidden" />

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {DEMO_MODE && (
            <span
              className="hidden rounded-full bg-sun-50 px-2.5 py-1 text-xs font-semibold text-sun-700 ring-1 ring-inset ring-sun-100 lg:inline"
              title="No backend connected — sample data and simulated AI responses"
            >
              Demo data
            </span>
          )}
          <IconButton label="Search" className="sm:hidden" onClick={() => setMobileSearch(true)}>
            <Search className="h-[22px] w-[22px]" />
          </IconButton>
          <OfflineIndicator />
          <NotificationPanel />
          <Link
            to="/settings"
            className="ml-1 flex items-center gap-2.5 rounded-xl p-1 pr-1 transition-colors hover:bg-ink-100 lg:pr-3"
            aria-label={`Profile: ${TEACHER.name}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sun-100 text-sm font-bold text-sun-700">{initials}</span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-sm font-semibold text-ink-900">{TEACHER.name}</span>
              <span className="block text-xs text-ink-500">Class {TEACHER.classLevel} Teacher</span>
            </span>
          </Link>
        </div>
      </div>

      {mobileSearch && (
        <form role="search" onSubmit={submit} className="flex items-center gap-2 border-t border-ink-200/60 px-4 py-3 sm:hidden">
          <label htmlFor="mobile-search" className="sr-only">
            Search lessons
          </label>
          <input
            id="mobile-search"
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons…"
            className="field"
          />
          <IconButton label="Close search" onClick={() => setMobileSearch(false)}>
            <X className="h-5 w-5" />
          </IconButton>
        </form>
      )}
    </header>
  );
}
