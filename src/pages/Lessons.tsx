import { Search, Sparkles, WifiOff, X } from 'lucide-react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LessonCard } from '../components/lesson/LessonCard';
import { Button, ButtonLink } from '../components/ui/Button';
import { EmptyState, PageHeader, Skeleton } from '../components/ui/States';
import { useApp } from '../store/AppContext';
import type { Subject } from '../types';
import { cn } from '../utils';

const SUBJECTS: ('All' | Subject)[] = ['All', 'Mathematics', 'Hindi', 'EVS', 'English'];

export default function Lessons() {
  const { lessons, lessonsLoading } = useApp();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const subject = (params.get('subject') ?? 'All') as 'All' | Subject;
  const offlineOnly = params.get('offline') === '1';

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return lessons.filter(
      (l) =>
        (subject === 'All' || l.subject === subject) &&
        (!offlineOnly || l.savedOffline) &&
        (!needle || [l.topic, l.learningOutcome, l.subject, l.outcomeCode].some((f) => f?.toLowerCase().includes(needle))),
    );
  }, [lessons, q, subject, offlineOnly]);

  const hasFilters = q || subject !== 'All' || offlineOnly;

  return (
    <>
      <PageHeader
        title="Lessons"
        description="Curriculum-aligned lessons, ready in your classroom language."
        action={
          <ButtonLink to="/studio" icon={<Sparkles className="h-4 w-4" />}>
            New lesson
          </ButtonLink>
        }
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden />
          <label htmlFor="lesson-search" className="sr-only">
            Search lessons
          </label>
          <input
            id="lesson-search"
            type="search"
            value={q}
            onChange={(e) => update('q', e.target.value || null)}
            placeholder="Search topic or outcome"
            className="field pl-11"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="Filter by subject">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={subject === s}
              onClick={() => update('subject', s === 'All' ? null : s)}
              className={cn(
                'min-h-[44px] shrink-0 rounded-xl border px-4 text-sm font-semibold transition-colors',
                subject === s ? 'border-ocean-600 bg-ocean-600 text-white' : 'border-ink-200 bg-white text-ink-600 hover:border-ocean-200 hover:text-ink-900',
              )}
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={offlineOnly}
            onClick={() => update('offline', offlineOnly ? null : '1')}
            className={cn(
              'inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors',
              offlineOnly ? 'border-aqua-600 bg-aqua-50 text-aqua-700' : 'border-ink-200 bg-white text-ink-600 hover:border-aqua-200',
            )}
          >
            <WifiOff className="h-4 w-4" aria-hidden /> Saved offline
          </button>
        </div>
      </div>

      {lessonsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[230px] rounded-2xl" />
          ))}
        </div>
      ) : filtered.length ? (
        <>
          <p className="mb-3 text-sm text-ink-500" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'lesson' : 'lessons'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((l) => (
              <LessonCard key={l.id} lesson={l} />
            ))}
          </div>
        </>
      ) : hasFilters ? (
        <EmptyState
          emoji="🔍"
          title="No lessons match"
          description="Try a different word, or create a new lesson on this topic with Verniq AI."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" icon={<X className="h-4 w-4" />} onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </Button>
              <ButtonLink to="/studio" icon={<Sparkles className="h-4 w-4" />}>
                Create lesson
              </ButtonLink>
            </div>
          }
        />
      ) : (
        <EmptyState
          emoji="📚"
          title="No lessons created yet."
          description="Create your first curriculum-aligned lesson with Verniq AI."
          action={<ButtonLink to="/studio">Create lesson</ButtonLink>}
        />
      )}
    </>
  );
}
