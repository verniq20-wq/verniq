import { motion } from 'framer-motion';
import { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LanguagePickerModal } from '../ui/LanguageSelector';
import { Skeleton } from '../ui/States';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell() {
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const [langKey, setLangKey] = useState(0);
  const openLanguagePicker = () => {
    setLangKey((k) => k + 1);
    setLangOpen(true);
  };

  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only z-[70] rounded-xl bg-ocean-600 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Sidebar onChangeLanguage={openLanguagePicker} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12 lg:px-8 lg:pt-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Suspense
              fallback={
                <div className="space-y-4" aria-busy="true" aria-label="Loading">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-64 rounded-3xl" />
                </div>
              }
            >
              <Outlet context={{ openLanguagePicker }} />
            </Suspense>
          </motion.div>
        </main>
      </div>
      <BottomNav />
      <LanguagePickerModal key={langKey} open={langOpen} onClose={() => setLangOpen(false)} />
    </div>
  );
}
