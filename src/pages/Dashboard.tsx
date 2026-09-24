import { ArrowRight, BookOpen, ChevronRight, ClipboardCheck, Moon, Sun, Sunrise, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageStatusCard } from '../components/dashboard/LanguageStatusCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { TodayLessonCard } from '../components/dashboard/TodayLessonCard';
import { SubjectIcon } from '../components/lesson/SubjectIcon';
import { ButtonLink } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/States';
import { useClassroom } from '../hooks/useClassroom';
import { useShell } from '../hooks/useShell';
import { formatDate, greeting } from '../utils';

function TimeIcon() {
  const h = new Date().getHours();
  const Icon = h < 12 ? Sunrise : h < 17 ? Sun : Moon;
  return <Icon className="h-4 w-4 text-sun-500" aria-hidden />;
}

export default function Dashboard() {
  const { teacher, activeClass, lessons, todaysLesson, activeStudents, todayAttendance, insights } = useClassroom();
  const { openLanguagePicker } = useShell();
  const upNext = lessons.filter((l) => l.status !== 'completed' && l.id !== todaysLesson?.id).slice(0, 3);
  const presentToday = todayAttendance ? activeStudents.filter((s) => todayAttendance.present[s.id]).length : null;
  const completed = lessons.filter((l) => l.status === 'completed').length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <p className="flex items-center gap-1.5 text-sm font-medium text-ink-500">
          <TimeIcon /> {formatDate()}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {greeting()}, {teacher?.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-[15px] text-ink-500 sm:text-lg">{activeClass ? `${activeClass.name} · ${activeStudents.length} students` : 'Ready to make today’s lesson easier?'}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[1fr_300px]">
        {todaysLesson ? (
          <TodayLessonCard lesson={todaysLesson} />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No lesson planned yet"
            description="Create a curriculum-aligned lesson with the AI Studio. It takes a few seconds and works offline."
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
            subtitle={upNext.length ? 'Lessons ready to teach' : 'Nothing else planned'}
            action={
              <Link to="/lessons" className="inline-flex min-h-[40px] items-center gap-1 rounded-lg px-2 text-sm font-semibold text-ocean-600 hover:bg-ocean-50">
                All <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            }
          />
          {upNext.length ? (
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
          ) : (
            <p className="text-sm text-ink-500">
              <Link to="/studio" className="font-semibold text-ocean-600 hover:underline">
                Plan the next lesson
              </Link>{' '}
              to keep your week ready.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Class snapshot"
            subtitle={activeClass ? `${activeClass.name} · ${activeStudents.length} students` : undefined}
            action={
              <Link to="/progress" className="inline-flex min-h-[40px] items-center gap-1 rounded-lg px-2 text-sm font-semibold text-ocean-600 hover:bg-ocean-50">
                Details <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            }
          />
          {insights.classMastery !== null ? (
            <ProgressBar value={insights.classMastery} label="Learning progress" showValue size="lg" />
          ) : (
            <p className="text-sm text-ink-500">Record results after a lesson to see learning progress here.</p>
          )}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            <Link to="/class?tab=attendance" className="rounded-2xl bg-ocean-50 p-3 transition-colors hover:bg-ocean-100">
              <ClipboardCheck className="h-5 w-5 text-ocean-600" aria-hidden />
              <p className="mt-2 font-display text-lg font-bold tabular-nums sm:text-xl">{presentToday === null ? '—' : `${presentToday}/${activeStudents.length}`}</p>
              <p className="text-xs text-ink-600">{presentToday === null ? 'Take attendance' : 'Present today'}</p>
            </Link>
            <div className="rounded-2xl bg-ink-50 p-3">
              <TrendingUp className="h-5 w-5 text-leaf-600" aria-hidden />
              <p className="mt-2 font-display text-lg font-bold tabular-nums sm:text-xl">
                {completed}/{lessons.length}
              </p>
              <p className="text-xs text-ink-500">Lessons taught</p>
            </div>
            <Link to="/progress" className="rounded-2xl bg-sun-50 p-3 transition-colors hover:bg-sun-100">
              <Users className="h-5 w-5 text-sun-600" aria-hidden />
              <p className="mt-2 font-display text-lg font-bold tabular-nums sm:text-xl">{insights.needsAttention.length}</p>
              <p className="text-xs text-ink-600">Need attention</p>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
