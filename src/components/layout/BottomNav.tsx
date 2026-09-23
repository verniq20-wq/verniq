import { AnimatePresence, motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../utils';
import { NAV_ITEMS } from './navigation';

/** Phone navigation. Live is the emphasised centre action. */
export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();
  const primary = NAV_ITEMS.filter((n) => n.primary);
  const secondary = NAV_ITEMS.filter((n) => !n.primary);
  const moreActive = secondary.some((n) => pathname.startsWith(n.to));

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-ink-900/30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.nav
              aria-label="More"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-3 bottom-[88px] z-40 rounded-3xl border border-ink-200 bg-white p-2 shadow-lift md:hidden"
            >
              {secondary.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    cn('flex min-h-[52px] items-center gap-3 rounded-2xl px-4 font-semibold', isActive ? 'bg-ocean-50 text-ocean-700' : 'text-ink-700 hover:bg-ink-50')
                  }
                >
                  <Icon className="h-5 w-5" aria-hidden /> {label}
                </NavLink>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {primary.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) =>
                  cn('relative flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] font-semibold', isActive ? 'text-ocean-700' : 'text-ink-500')
                }
              >
                {({ isActive }) =>
                  to === '/live' ? (
                    <>
                      <span
                        className={cn(
                          '-mt-5 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lift transition-transform',
                          isActive ? 'scale-105 bg-aqua-600' : 'bg-ocean-gradient',
                        )}
                      >
                        <Icon className="h-6 w-6" aria-hidden />
                      </span>
                      {label}
                    </>
                  ) : (
                    <>
                      {isActive && <motion.span layoutId="bottom-active" className="absolute top-0 h-[3px] w-8 rounded-full bg-ocean-600" />}
                      <Icon className="h-[22px] w-[22px]" aria-hidden />
                      {label}
                    </>
                  )
                }
              </NavLink>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              className={cn(
                'relative flex min-h-[64px] w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold',
                moreActive || moreOpen ? 'text-ocean-700' : 'text-ink-500',
              )}
            >
              <MoreHorizontal className="h-[22px] w-[22px]" aria-hidden />
              More
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
