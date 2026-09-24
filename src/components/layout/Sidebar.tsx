import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils';
import { Logo, LogoMark } from './Logo';
import { NAV_ITEMS } from './navigation';
import { LanguagePairDisplay } from '../ui/LanguageSelector';

/**
 * Tablet (md): compact icon rail with labels.
 * Desktop (lg+): full sidebar.
 */
export function Sidebar({ onChangeLanguage }: { onChangeLanguage: () => void }) {
  return (
    <aside className="sticky top-0 hidden h-screen pt-[env(safe-area-inset-top)] shrink-0 flex-col border-r border-ink-200/70 bg-surface md:flex md:w-[92px] lg:w-64">
      <div className="flex h-[72px] items-center px-5 lg:px-6">
        <NavLink to="/" aria-label="Verniq home" className="rounded-xl">
          <LogoMark className="lg:hidden" />
          <Logo className="hidden lg:inline-flex" showTagline />
        </NavLink>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4 lg:px-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'group relative flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-[11px] font-semibold transition-colors duration-200 lg:min-h-[48px] lg:flex-row lg:gap-3 lg:px-4 lg:text-[15px]',
                    isActive ? 'text-ocean-700' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl bg-ocean-50"
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                    )}
                    <Icon className="relative h-[22px] w-[22px] transition-transform duration-200 group-hover:scale-105" aria-hidden />
                    <span className="relative">{label}</span>
                    {to === '/live' && (
                      <span className="relative ml-auto hidden rounded-full bg-aqua-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-aqua-700 lg:inline">
                        Voice
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="hidden p-4 lg:block">
        <button
          type="button"
          onClick={onChangeLanguage}
          className="w-full rounded-2xl bg-ocean-soft p-4 text-left ring-1 ring-inset ring-ocean-100 transition-shadow hover:shadow-soft"
        >
          <span className="eyebrow">Classroom language</span>
          <span className="mt-1.5 block">
            <LanguagePairDisplay size="sm" />
          </span>
          <span className="mt-2 block text-xs font-semibold text-ocean-600">Change →</span>
        </button>
      </div>
    </aside>
  );
}
