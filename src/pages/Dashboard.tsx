import { ArrowRight, BookOpen, ChevronRight, Moon, Sun, Sunrise, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageStatusCard } from '../components/dashboard/LanguageStatusCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { TodayLessonCard } from '../components/dashboard/TodayLessonCard';
import { SubjectIcon } from '../components/lesson/SubjectIcon';
import { ButtonLink } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState, Skeleton } from '../components/ui/States';
import { STUDENTS, TEACHER } from '../data/demo';
import { useShell } from '../hooks/useShell';
import { useApp } from '../store/AppContext';
import { formatDate, greeting } from '../utils';

function TimeIcon() {
  const h = new Date().getHours();
  const Icon = h < 12 ? Sunrise : h < 17 ? Sun : Moon;
  return <Icon className="h-4 w-4 text-sun-500" aria-hidden />;
}

export default function Dashboard() {
  const { lessons, lessonsLoading } = useApp();
  const { openLanguagePicker } = useShell();
  const today = lessons.find((l) => l.scheduledFor) ?? lessons[0];
  const upNext = lessons.filter((l) => l.status !== 'completed' && l.id !== today?.id).slice(0, 3);
  const needsAttention = STUDENTS.filter((s) => s.attention).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <p className="flex items-center gap-1.5 text-sm font-medium text-ink-500">
          <TimeIcon /> {formatDate()}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {greeting()}, {TEACHER.shortName}
        </h1>
        <p className="mt-1 text-[15px] text-ink-500 sm:text-lg">Ready to make today's lesson easier?</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[1fr_300px]">
        {lessonsLoading ? (
          <Skeleton className="h-[260px] rounded-3xl sm:h-[320px]" />
        ) : today ? (
          <TodayLessonCard lesson={today} />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No lessons created yet."
            description="Create your first curriculum-aligned lesson with Verniq AI."
            action={<ButtonLink to="/studio">Create lesson</ButtonLink>}
          />
        )}
        <LanguageStatusCard onChange={openLanguagePicker} />
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader
            title="Up next"
            subtitle="Ready for this week"
            action={
              <Link to="/lessons" className="inline-flex min-h-[40px] items-center gap-1 rounded-lg px-2 text-sm font-semibold text-ocean-600 hover:bg-ocean-50">
                All <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            }
          />
          {lessonsLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : (
            <ul className="-mx-2 divide-y divide-ink-100">
              {upNext.map((l) => (
                <li key={l.id}>
                  <Link to={`/lessons/${l.id}/play`} className="group flex min-h-[60px] items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-ink-50">
                    <SubjectIcon subject={l.subject} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink-900">{l.topic}</span>
                      <span className="block truncate text-sm text-ink-500">
                        {l.subject} · {l.durationMin} min
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ocean-500" aria-hidden />
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
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-ink-50 p-3.5 sm:p-4">
              <TrendingUp className="h-5 w-5 text-leaf-600" aria-hidden />
              <p className="mt-2 font-display text-xl font-bold tabular-nums sm:text-2xl">18/22</p>
              <p className="text-sm text-ink-500">Lessons done</p>
            </div>
            <Link to="/progress" className="rounded-2xl bg-sun-50 p-3.5 transition-colors hover:bg-sun-100 sm:p-4">
              <Users className="h-5 w-5 text-sun-600" aria-hidden />
              <p className="mt-2 font-display text-xl font-bold tabular-nums sm:text-2xl">{needsAttention}</p>
              <p className="text-sm text-ink-600">Need attention</p>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
