import { AlertTriangle, ArrowRight, BookCheck, ListChecks, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';
import { ButtonLink } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { PageHeader } from '../components/ui/States';
import { Tabs } from '../components/ui/Tabs';
import { STUDENTS, TEACHER, TOPIC_MASTERY } from '../data/demo';
import { cn, percent } from '../utils';

function StatTile({ icon, label, value, sub, tint }: { icon: React.ReactNode; label: string; value: string; sub?: string; tint: string }) {
  return (
    <Card className="flex flex-col">
      <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', tint)}>{icon}</span>
      <p className="mt-3 font-display text-2xl font-extrabold tabular-nums text-ink-900 sm:mt-4 sm:text-3xl">{value}</p>
      <p className="text-sm font-semibold leading-snug text-ink-700">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-500">{sub}</p>}
    </Card>
  );
}

/** Single-series horizontal bar chart — one hue, direct labels, hover detail. */
function MasteryChart() {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <ul className="space-y-4" aria-label="Outcome mastery by topic">
      {TOPIC_MASTERY.map((t) => (
        <li
          key={t.topic}
          onMouseEnter={() => setHover(t.topic)}
          onMouseLeave={() => setHover(null)}
          className="group relative grid grid-cols-[110px_1fr_48px] items-center gap-3 sm:grid-cols-[140px_1fr_48px]"
        >
          <span className="truncate text-sm font-medium text-ink-700">{t.topic}</span>
          <span className="relative h-7 rounded-md bg-ink-50">
            <span
              className={cn('absolute inset-y-0 left-0 rounded-r-[4px] transition-colors duration-150', hover === t.topic ? 'bg-ocean-600' : 'bg-ocean-500')}
              style={{ width: percent(t.value) }}
            />
            {/* 80% class target */}
            <span className="absolute inset-y-[-4px] w-0.5 rounded bg-ink-400/70" style={{ left: '80%' }} aria-hidden />
            {hover === t.topic && (
              <span className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs text-white shadow-lift">
                {t.topic}: {percent(t.value)} of students mastered · target 80%
              </span>
            )}
          </span>
          <span className="text-right text-sm font-semibold tabular-nums text-ink-900">{percent(t.value)}</span>
        </li>
      ))}
      <li className="flex items-center gap-2 pt-1 text-xs text-ink-500">
        <span className="inline-block h-3 w-0.5 bg-ink-400" aria-hidden /> Class target: 80%
      </li>
    </ul>
  );
}

export default function Progress() {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const attention = STUDENTS.filter((s) => s.attention);

  return (
    <>
      <PageHeader
        title="Class progress"
        description={`Class ${TEACHER.classLevel} · ${TEACHER.school}`}
        action={
          <ButtonLink to="/studio" variant="outline" icon={<Sparkles className="h-4 w-4" />}>
            Plan a revision lesson
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile icon={<Users className="h-5 w-5" aria-hidden />} tint="bg-ocean-50 text-ocean-600" label="Students" value={String(TEACHER.studentCount)} sub="Class 1" />
        <StatTile icon={<BookCheck className="h-5 w-5" aria-hidden />} tint="bg-aqua-50 text-aqua-600" label="Lessons completed" value="18 / 22" sub="4 left this term" />
        <StatTile icon={<ListChecks className="h-5 w-5" aria-hidden />} tint="bg-leaf-50 text-leaf-600" label="Activities completed" value="91%" sub="Up 5% from last month" />
        <StatTile icon={<AlertTriangle className="h-5 w-5" aria-hidden />} tint="bg-amber-50 text-amber-600" label="Need attention" value={String(attention.length)} sub="See list below" />
      </div>

      <Card className="mt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <div className="sm:w-56">
            <p className="eyebrow">Learning progress</p>
            <p className="mt-1 font-display text-4xl font-extrabold tabular-nums text-ink-900 sm:text-5xl">82%</p>
            <p className="text-sm text-ink-500">of Class 1 outcomes on track</p>
          </div>
          <ProgressBar className="flex-1" value={0.82} label="Class learning progress" size="lg" />
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader
            title="Outcome mastery by topic"
            subtitle="Share of students who mastered each topic"
            action={
              <Tabs
                label="View as"
                value={view}
                onChange={setView}
                tabs={[
                  { value: 'chart', label: 'Chart' },
                  { value: 'table', label: 'Table' },
                ]}
              />
            }
          />
          {view === 'chart' ? (
            <MasteryChart />
          ) : (
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="border-b border-ink-100 text-xs uppercase tracking-wider text-ink-500">
                  <th className="py-2 font-semibold">Topic</th>
                  <th className="py-2 text-right font-semibold">Mastered</th>
                  <th className="py-2 text-right font-semibold">vs target</th>
                </tr>
              </thead>
              <tbody>
                {TOPIC_MASTERY.map((t) => (
                  <tr key={t.topic} className="border-b border-ink-50 last:border-0">
                    <td className="py-2.5">{t.topic}</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">{percent(t.value)}</td>
                    <td className={cn('py-2.5 text-right tabular-nums', t.value >= 0.8 ? 'text-leaf-600' : 'text-amber-700')}>
                      {t.value >= 0.8 ? '+' : ''}
                      {Math.round((t.value - 0.8) * 100)} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <CardHeader title="Needs attention" subtitle={`${attention.length} students · suggested next steps`} />
          <ul className="space-y-3">
            {attention.map((s) => (
              <li key={s.id} className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-amber-700 shadow-soft">
                    {s.name.split(' ').map((p) => p[0]).join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-900">{s.name}</p>
                    <p className="flex items-center gap-1.5 text-sm text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden /> {s.attention}
                    </p>
                    <ProgressBar className="mt-2" value={s.progress} label={`${s.name} progress`} size="sm" tone="ocean" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <ButtonLink to="/materials?tab=worksheets" variant="soft" fullWidth className="mt-4" iconRight={<ArrowRight className="h-4 w-4" />}>
            Create practice worksheet
          </ButtonLink>
        </Card>
      </div>

      <Card className="mt-5" padded={false}>
        <div className="p-5 sm:p-6">
          <CardHeader title="All students" subtitle="Progress and attendance this term" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[15px]">
            <thead>
              <tr className="border-y border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wider text-ink-500">
                <th className="px-6 py-3 font-semibold">Student</th>
                <th className="px-6 py-3 font-semibold">Progress</th>
                <th className="px-6 py-3 text-right font-semibold">Attendance</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map((s) => (
                <tr key={s.id} className="border-b border-ink-50 last:border-0">
                  <td className="px-6 py-3 font-medium text-ink-900">{s.name}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <ProgressBar className="w-28" value={s.progress} label={`${s.name} progress`} size="sm" tone="ocean" />
                      <span className="tabular-nums text-ink-700">{percent(s.progress)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums text-ink-700">{percent(s.attendance)}</td>
                  <td className="px-6 py-3">
                    {s.attention ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                        <AlertTriangle className="h-4 w-4" aria-hidden /> Needs support
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-600">
                        <span className="h-2 w-2 rounded-full bg-leaf-500" aria-hidden /> On track
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
