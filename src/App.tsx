import { MotionConfig } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLifecycle } from './components/layout/AppLifecycle';
import { AppShell } from './components/layout/AppShell';
import { Logo } from './components/layout/Logo';
import { Toaster } from './components/ui/Toaster';
import { Skeleton } from './components/ui/States';
import Dashboard from './pages/Dashboard';
import { AppProvider } from './store/AppContext';
import { DataProvider, useData } from './store/DataContext';

// Secondary screens are split out so the home screen loads fast on low-end tablets.
const Welcome = lazy(() => import('./pages/Welcome'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Lessons = lazy(() => import('./pages/Lessons'));
const LessonPlayer = lazy(() => import('./pages/LessonPlayer'));
const LessonEditor = lazy(() => import('./pages/LessonEditor'));
const LiveTranslation = lazy(() => import('./pages/LiveTranslation'));
const AIStudio = lazy(() => import('./pages/AIStudio'));
const Materials = lazy(() => import('./pages/Materials'));
const ClassPage = lazy(() => import('./pages/ClassPage'));
const Words = lazy(() => import('./pages/Words'));
const Progress = lazy(() => import('./pages/Progress'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageFallback() {
  return (
    <div className="space-y-4 p-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64 rounded-3xl" />
    </div>
  );
}

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas" aria-busy="true" aria-label="Opening Verniq">
      <div className="animate-pulse">
        <Logo />
      </div>
    </div>
  );
}

/** Welcome → onboarding → app. Everything below works offline once set up. */
function Gate() {
  const { ready, session, teacher, records } = useData();
  if (!ready) return <Splash />;
  if (!session) return <Welcome />;
  if (!teacher?.onboarded || records.classes.length === 0) return <Onboarding />;
  return (
    <Routes>
      <Route path="/lessons/:id/play" element={<LessonPlayer />} />
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="lessons" element={<Lessons />} />
        <Route path="lessons/:id/edit" element={<LessonEditor />} />
        <Route path="live" element={<LiveTranslation />} />
        <Route path="studio" element={<AIStudio />} />
        <Route path="materials" element={<Materials />} />
        <Route path="class" element={<ClassPage />} />
        <Route path="words" element={<Words />} />
        <Route path="progress" element={<Progress />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <DataProvider>
          <BrowserRouter>
            <AppLifecycle />
            <Suspense fallback={<PageFallback />}>
              <Gate />
            </Suspense>
          </BrowserRouter>
          <Toaster />
        </DataProvider>
      </AppProvider>
    </MotionConfig>
  );
}
