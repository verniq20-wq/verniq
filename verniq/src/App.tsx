import { MotionConfig } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Toaster } from './components/ui/Toaster';
import { Skeleton } from './components/ui/States';
import Dashboard from './pages/Dashboard';
import { AppProvider } from './store/AppContext';

// Secondary screens are split out so the home screen loads fast on low-end tablets.
const Lessons = lazy(() => import('./pages/Lessons'));
const LessonPlayer = lazy(() => import('./pages/LessonPlayer'));
const LiveTranslation = lazy(() => import('./pages/LiveTranslation'));
const AIStudio = lazy(() => import('./pages/AIStudio'));
const Materials = lazy(() => import('./pages/Materials'));
const Progress = lazy(() => import('./pages/Progress'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageFallback() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64 rounded-3xl" />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/lessons/:id/play" element={<LessonPlayer />} />
              <Route element={<AppShell />}>
                <Route index element={<Dashboard />} />
                <Route path="lessons" element={<Lessons />} />
                <Route path="live" element={<LiveTranslation />} />
                <Route path="studio" element={<AIStudio />} />
                <Route path="materials" element={<Materials />} />
                <Route path="progress" element={<Progress />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </AppProvider>
    </MotionConfig>
  );
}
