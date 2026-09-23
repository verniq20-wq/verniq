import { CheckCircle2, CloudDownload, Clock, Play, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { SUBJECT_STYLE } from '../../data/subjects';
import type { Lesson } from '../../types';
import { cn } from '../../utils';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';


export function LessonCard({ lesson }: { lesson: Lesson }) {
  const { toggleOffline } = useApp();
  const s = SUBJECT_STYLE[lesson.subject];

  return (
    <article className="group relative flex flex-col rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-[3px] hover:border-ocean-200 hover:shadow-lift">
      <div className="flex items-start gap-4">
        <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-bold text-ink-700', s.tint)} aria-hidden>
          {s.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">
            {lesson.subject} · Class {lesson.classLevel}
          </p>
          <h3 className="mt-1 text-lg font-bold leading-snug">
            <Link to={`/lessons/${lesson.id}/play`} className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none">
              {lesson.topic}
            </Link>
          </h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-ink-500">{lesson.learningOutcome}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="ink" icon={<Clock className="h-3.5 w-3.5" aria-hidden />}>
          {lesson.durationMin} min
        </Badge>
        {lesson.outcomeCode && <Badge tone="ink">{lesson.outcomeCode}</Badge>}
        {lesson.status === 'completed' && (
          <Badge tone="leaf" icon={<CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}>
            Taught
          </Badge>
        )}
      </div>

      {lesson.status === 'in-progress' && <ProgressBar className="mt-4" value={lesson.progress} label="Progress" size="sm" />}

      <div className="relative z-10 mt-5 flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <button
          type="button"
          onClick={() => void toggleOffline(lesson.id)}
          aria-pressed={lesson.savedOffline}
          className={cn(
            'inline-flex min-h-[40px] items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors',
            lesson.savedOffline ? 'text-ocean-700 hover:bg-ocean-50' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800',
          )}
        >
          {lesson.savedOffline ? <WifiOff className="h-4 w-4" aria-hidden /> : <CloudDownload className="h-4 w-4" aria-hidden />}
          {lesson.savedOffline ? 'Saved offline' : 'Save offline'}
        </button>
        <Link
          to={`/lessons/${lesson.id}/play`}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-ocean-50 px-4 text-sm font-semibold text-ocean-700 transition-colors hover:bg-ocean-600 hover:text-white"
        >
          <Play className="h-4 w-4 fill-current" aria-hidden />
          {lesson.status === 'in-progress' ? 'Continue' : lesson.status === 'completed' ? 'Teach again' : 'Start'}
        </Link>
      </div>
    </article>
  );
}
