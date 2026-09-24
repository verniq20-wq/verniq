import { AlertTriangle, BarChart3, BookCheck, ClipboardCheck, Download, ListChecks, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NipunBadge } from '../components/lesson/NipunBadge';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { EmptyState, PageHeader } from '../components/ui/States';
import { Tabs } from '../components/ui/Tabs';
import { useClassroom } from '../hooks/useClassroom';
import { cn, download, percent } from '../utils';

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

const fmt = (v: number | null) => (v === null ? '—' : percent(v));

export default function Progress() {
  const { activeClass, activeStudents, lessons, insights, attendance } = useClassroom();
  const [view, setView] = useState<'outcomes' | 'students'>('outcomes');
  const [hover, setHover] = useState<string | null>(null);
  const taught = lessons.filter((l) => l.status === 'completed').length;
  const hasData = insights.outcomes.length > 0 || attendance.length > 0;

  const exportCsv = () => {
    const rows = [['Student', 'Attendance (30 days)', 'Learning level', 'Outcomes assessed', 'Notes']];
    for (const s of insights.students) rows.push([s.name, fmt(s.attendance), fmt(s.mastery), String(s.assessed), s.flags.join('; ')]);
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    download(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), `${activeClass?.name ?? 'class'}-progress.csv`);
  };

  return (
    <>
      <PageHeader
        title="Class progress"
        description={activeClass ? `${activeClass.name} · ${activeStudents.length} students · from your attendance and recorded results` : undefined}
        action={
          insights.students.length > 0 && (
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={exportCsv}>
              Export CSV
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile icon={<BookCheck className="h-5 w-5 text-ocean-600" />} tint="bg-ocean-50" label="Lessons taught" value={String(taught)} sub={`${lessons.length} planned in total`} />
        <StatTile icon={<Sparkles className="h-5 w-5 text-aqua-600" />} tint="bg-aqua-50" label="Learning level" value={fmt(insights.classMastery)} sub="Average of latest results" />
        <StatTile icon={<ClipboardCheck className="h-5 w-5 text-leaf-600" />} tint="bg-leaf-50" label="Attendance" value={fmt(insights.classAttendance)} sub="Last 30 days" />
        <StatTile icon={<Users className="h-5 w-5 text-sun-600" />} tint="bg-sun-50" label="Need attention" value={String(insights.needsAttention.length)} sub="Reasons listed below" />
      </div>

      {!hasData ? (
        <EmptyState
          className="mt-6"
          icon={BarChart3}
          title="No results yet"
          description="Take attendance and record results after a lesson. Progress is calculated only from what you record — nothing is estimated."
          action={<ButtonLink to="/class?tab=attendance">Take attendance</ButtonLink>}
        />
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-5 xl:grid-cols-[1fr_380px]">
          <Card>
            <CardHeader
              title={view === 'outcomes' ? 'Outcomes' : 'Students'}
              subtitle={view === 'outcomes' ? 'Share of assessed students at Developing or Proficient' : 'Latest level and attendance per child'}
              action={
                <Tabs
                  label="View"
                  value={view}
                  onChange={setView}
                  tabs={[
                    { value: 'outcomes', label: 'Outcomes' },
                    { value: 'students', label: 'Students' },
                  ]}
                />
              }
            />
            {view === 'outcomes' ? (
              insights.outcomes.length ? (
                <ul className="space-y-4" aria-label="Outcome mastery">
                  {insights.outcomes.map((o) => (
                    <li
                      key={o.code}
                      onMouseEnter={() => setHover(o.code)}
                      onMouseLeave={() => setHover(null)}
                      className="grid grid-cols-[1fr_48px] items-center gap-x-3 gap-y-1 sm:grid-cols-[220px_1fr_48px]"
                    >
                      <span className="col-span-2 min-w-0 text-sm sm:col-span-1">
                        <span className="font-semibold text-ink-900">{o.code}</span>{' '}
                        <span className="text-ink-500 sm:block sm:truncate" title={o.statement}>
                          {o.statement}
                        </span>
                        <NipunBadge code={o.code} compact className="mt-0.5" />
                      </span>
                      <span className="relative h-7 rounded-md bg-ink-50">
                        <span className={cn('absolute inset-y-0 left-0 rounded-r-[4px] transition-colors', hover === o.code ? 'bg-ocean-600' : 'bg-ocean-500')} style={{ width: percent(o.mastered) }} />
                        <span className="absolute inset-y-[-4px] w-0.5 rounded bg-ink-400/70" style={{ left: '80%' }} aria-hidden />
                      </span>
                      <span className="text-right text-sm font-semibold tabular-nums text-ink-900">
                        {percent(o.mastered)}
                        <span className="block text-[11px] font-normal text-ink-400">{o.assessed} ch.</span>
                      </span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2 pt-1 text-xs text-ink-500">
                    <span className="inline-block h-3 w-0.5 bg-ink-400" aria-hidden /> Class target: 80%
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-ink-500">
                  No results recorded yet.{' '}
                  <Link to="/class?tab=assess" className="font-semibold text-ocean-600 hover:underline">
                    Record results
                  </Link>
                </p>
              )
            ) : (
              <div className="-mx-4 overflow-x-auto sm:mx-0">
                <table className="w-full min-w-[440px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-200 text-xs uppercase tracking-wider text-ink-500">
                      <th className="px-4 py-2 font-semibold sm:px-2">Student</th>
                      <th className="px-2 py-2 text-right font-semibold">Attendance</th>
                      <th className="px-2 py-2 text-right font-semibold">Level</th>
                      <th className="px-4 py-2 text-right font-semibold sm:px-2">Assessed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.students.map((s) => (
                      <tr key={s.id} className="border-b border-ink-100 last:border-0">
                        <td className="px-4 py-2.5 font-semibold text-ink-900 sm:px-2">
                          {s.name}
                          {s.flags.length > 0 && <AlertTriangle className="ml-1.5 inline h-3.5 w-3.5 text-sun-600" aria-label="Needs attention" />}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{fmt(s.attendance)}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{fmt(s.mastery)}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums sm:px-2">{s.assessed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="space-y-4 sm:space-y-5">
            <Card>
              <CardHeader title="Suggested next steps" subtitle="From simple rules on your records" />
              {insights.recommendations.length ? (
                <ul className="space-y-3">
                  {insights.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-3 rounded-xl bg-ocean-50/60 p-3 text-sm">
                      <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-ocean-600" aria-hidden />
                      <span className="text-ink-800">
                        {r.text}
                        {r.kind === 'revise' && r.outcomeCode && (
                          <Link to={`/studio?outcome=${r.outcomeCode}`} className="ml-1 font-semibold text-ocean-700 hover:underline">
                            Plan it
                          </Link>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-500">Nothing urgent. Keep recording results to see suggestions.</p>
              )}
            </Card>
            <Card>
              <CardHeader title="Needs attention" subtitle={insights.needsAttention.length ? 'Each child is listed with the reason' : undefined} />
              {insights.needsAttention.length ? (
                <ul className="divide-y divide-ink-100">
                  {insights.needsAttention.map((s) => (
                    <li key={s.id} className="py-2.5">
                      <p className="font-semibold text-ink-900">{s.name}</p>
                      {s.flags.map((f) => (
                        <p key={f} className="text-sm text-ink-500">
                          {f}
                        </p>
                      ))}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-500">No one is flagged right now.</p>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
