import { ArrowRight, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageStatusCard } from '../components/dashboard/LanguageStatusCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { TodayLessonCard } from '../components/dashboard/TodayLessonCard';
import { SUBJECT_STYLE } from '../data/subjects';
import { Card, CardHeader } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState, Skeleton } from '../components/ui/States';
import { ButtonLink } from '../components/ui/Button';
import { STUDENTS, TEACHER } from '../data/demo';
import { useShell } from '../hooks/useShell';
import { useApp } from '../store/AppContext';
import { cn, formatDate, greeting } from '../utils';

export default function Dashboard() {
  const { lessons, lessonsLoading } = useApp();
  const { openLanguagePicker } = useShell();
  const today = lessons.find((l) => l.scheduledFor) ?? lessons[0];
  const upNext = lessons.filter((l) => l.status !== 'completed' && l.id !== today?.id).slice(0, 3);
  const needsAttention = STUDENTS.filter((s) => s.attention).length;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-ink-500">{formatDate()}</p>
        <h1 className="mt-1 text-[28px] font-extrabold leading-tight tracking-tight sm:text-4xl">
          {greeting()}, {TEACHER.shortName} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1.5 text-lg text-ink-500">Ready to make today's lesson easier?</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {lessonsLoading ? (
          <Skeleton className="h-[320px] rounded-3xl" />
        ) : today ? (
          <TodayLessonCard lesson={today} />
        ) : (
          <EmptyState
            emoji="📚"
            title="No lessons created yet."
            description="Create your first curriculum-aligned lesson with Verniq AI."
            action={<ButtonLink to="/studio">Create lesson</ButtonLink>}
          />
        )}
        <LanguageStatusCard onChange={openLanguagePicker} />
      </div>

      <QuickActions />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader
            title="Up next"
            subtitle="Lessons ready for this week"
            action={
              <Link to="/lessons" className="inline-flex min-h-[40px] items-center gap-1 rounded-lg px-2 text-sm font-semibold text-ocean-600 hover:bg-ocean-50">
                All lessons <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            }
          />
          {lessonsLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <ul className="-mx-2 divide-y divide-ink-100">
              {upNext.map((l) => (
                <li key={l.id}>
                  <Link
                    to={`/lessons/${l.id}/play`}
                    className="group flex min-h-[64px] items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-ink-50"
                  >
                    <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold', SUBJECT_STYLE[l.subject].tint)} aria-hidden>
                      {SUBJECT_STYLE[l.subject].emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink-900">{l.topic}</span>
                      <span className="block truncate text-sm text-ink-500">
                        {l.subject} · {l.durationMin} min
                      </span>
                    </span>
                    <ArrowRight className="h-5 w-5 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ocean-500" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Class snapshot"
            subtitle={`Class ${TEACHER.classLevel} · ${TEACHER.studentCount} students`}
            action={
              <Link to="/progress" className="inline-flex min-h-[40px] items-center gap-1 rounded-lg px-2 text-sm font-semibold text-ocean-600 hover:bg-ocean-50">
                Details <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            }
          />
          <ProgressBar value={0.82} label="Learning progress" showValue size="lg" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-ink-50 p-4">
              <TrendingUp className="h-5 w-5 text-leaf-600" aria-hidden />
              <p className="mt-2 font-display text-2xl font-bold tabular-nums">18/22</p>
              <p className="text-sm text-ink-500">Lessons done</p>
            </div>
            <Link to="/progress" className="rounded-2xl bg-sun-50 p-4 transition-colors hover:bg-sun-100">
              <Users className="h-5 w-5 text-sun-600" aria-hidden />
              <p className="mt-2 font-display text-2xl font-bold tabular-nums">{needsAttention}</p>
              <p className="text-sm text-ink-600">Need attention</p>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
