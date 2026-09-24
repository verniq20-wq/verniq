import { motion } from 'framer-motion';
import { ArrowUpRight, ClipboardCheck, FileText, Mic, Sparkles, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils';

interface Action {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tint: string;
}

const ACTIONS: Action[] = [
  { to: '/live', title: 'Live Translation', description: 'Talk with students', icon: Mic, tint: 'bg-aqua-50 text-aqua-600 group-hover:bg-aqua-500 group-hover:text-white' },
  { to: '/studio', title: 'Create Lesson', description: 'Plan with the AI Studio', icon: Sparkles, tint: 'bg-ocean-50 text-ocean-600 group-hover:bg-ocean-600 group-hover:text-white' },
  { to: '/class?tab=attendance', title: 'Attendance', description: 'Mark today in one tap each', icon: ClipboardCheck, tint: 'bg-leaf-50 text-leaf-600 group-hover:bg-leaf-500 group-hover:text-white' },
  { to: '/materials?tab=worksheets', title: 'Worksheet', description: 'Printable, in both languages', icon: FileText, tint: 'bg-sun-50 text-sun-600 group-hover:bg-sun-500 group-hover:text-white' },
];

export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions">
      <h2 id="quick-actions" className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
        Quick actions
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {ACTIONS.map((a, i) => (
          <motion.li key={a.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i, duration: 0.25 }}>
            <Link
              to={a.to}
              className="group flex h-full min-h-[112px] flex-col rounded-2xl border border-ink-200/80 bg-white p-3.5 shadow-soft transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-[3px] hover:border-ocean-200 hover:shadow-lift sm:min-h-[148px] sm:p-5"
            >
              <div className="flex items-start justify-between">
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105 sm:h-12 sm:w-12 sm:rounded-2xl', a.tint)}>
                  <a.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-ink-300 transition-all sm:h-5 sm:w-5 duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ocean-500"
                  aria-hidden
                />
              </div>
              <span className="mt-auto pt-3 sm:pt-4">
                <span className="block font-display text-[15px] font-bold leading-snug text-ink-900 sm:text-lg">{a.title}</span>
                <span className="mt-0.5 block truncate text-xs text-ink-500 sm:text-sm">{a.description}</span>
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
