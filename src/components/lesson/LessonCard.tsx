import { CalendarCheck, CalendarPlus, CheckCircle2, Clock, Pencil, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import type { LessonDoc } from '../../types';
import { cn, todayISO } from '../../utils';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { SubjectIcon } from './SubjectIcon';

export function LessonCard({ lesson }: { lesson: LessonDoc }) {
  const { put } = useData();
  const today = todayISO();
  const isToday = lesson.scheduledFor === today;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-ink-200/80 bg-white p-4 shadow-soft transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-[3px] hover:border-ocean-200 hover:shadow-lift sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <SubjectIcon subject={lesson.subject} />
        <div className="min-w-0 flex-1">
          <p className="eyebrow">
            {lesson.subject} · Class {lesson.grade}
          </p>
          <h3 className="mt-0.5 text-base font-bold leading-snug sm:mt-1 sm:text-lg">
            <Link to={`/lessons/${lesson.id}/play`} className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none">
              {lesson.topic}
            </Link>
          </h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-ink-500">{lesson.learningOutcome}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
        <Badge tone="ink" icon={<Clock className="h-3.5 w-3.5" aria-hidden />}>
          {lesson.durationMin} min
        </Badge>
        {lesson.outcomeCode && <Badge tone="ink">{lesson.outcomeCode}</Badge>}
        {lesson.status === 'completed' && (
          <Badge tone="leaf" icon={<CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}>
            Taught
          </Badge>
        )}
        {isToday && lesson.status !== 'completed' && <Badge tone="sun">Today</Badge>}
      </div>

      {lesson.status === 'in-progress' && <ProgressBar className="mt-4" value={lesson.progress} label="Progress" size="sm" />}

      <div className="relative z-10 mt-4 flex items-center justify-between gap-1 border-t border-ink-100 pt-3 sm:mt-5 sm:pt-4">
        <div className="-ml-2 flex">
          <button
            type="button"
            onClick={() => void put('lessons', { ...lesson, scheduledFor: isToday ? undefined : today })}
            aria-pressed={isToday}
            title={isToday ? 'Remove from today' : 'Teach today'}
            className={cn(
              'inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 text-sm font-semibold transition-colors',
              isToday ? 'text-sun-700 hover:bg-sun-50' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800',
            )}
          >
            {isToday ? <CalendarCheck className="h-4 w-4" aria-hidden /> : <CalendarPlus className="h-4 w-4" aria-hidden />}
            {isToday ? 'Today' : 'Teach today'}
          </button>
          <Link
            to={`/lessons/${lesson.id}/edit`}
            aria-label={`Edit ${lesson.topic}`}
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <Link
          to={`/lessons/${lesson.id}/play`}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-ocean-50 px-4 text-sm font-semibold text-ocean-700 transition-colors hover:bg-ocean-600 hover:text-white"
        >
          <Play className="h-4 w-4 fill-current" aria-hidden />
          {lesson.status === 'in-progress' ? 'Continue' : lesson.status === 'completed' ? 'Teach again' : 'Start'}
        </Link>
      </div>
    </article>
  );
}
