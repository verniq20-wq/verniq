import { motion } from 'framer-motion';
import { ArrowRight, Clock, Target, WifiOff } from 'lucide-react';
import type { LessonDoc } from '../../types';
import { ButtonLink } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

/** Decorative counting-beads illustration. */
function CountingIllustration() {
  const rows = [3, 5, 7];
  const colors = ['#FBBC55', '#6BDFD0', '#ADD4F0'];
  return (
    <svg viewBox="0 0 220 170" className="h-full w-full" aria-hidden>
      <rect x="18" y="18" width="184" height="134" rx="20" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.25" />
      {rows.map((count, r) => {
        const y = 50 + r * 38;
        return (
          <g key={r}>
            <line x1="34" x2="186" y1={y} y2={y} stroke="white" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
            {Array.from({ length: count }).map((_, i) => (
              <motion.circle
                key={i}
                cy={y}
                r="10"
                fill={colors[r]}
                initial={{ cx: 176 - i * 2 }}
                animate={{ cx: 46 + i * 21 }}
                transition={{ delay: 0.3 + r * 0.15 + i * 0.05, type: 'spring', stiffness: 120, damping: 14 }}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function TodayLessonCard({ lesson }: { lesson: LessonDoc }) {
  const sectionsDone = Math.round(lesson.progress * lesson.content.sections.length);
  return (
    <section
      aria-labelledby="today-lesson"
      className="relative overflow-hidden rounded-3xl bg-ocean-gradient p-5 text-white shadow-lift sm:p-8"
    >
      {/* soft light shapes */}
      <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div aria-hidden className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-aqua-300/20 blur-3xl" />

      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-[1fr_220px] md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] sm:px-3 sm:text-xs">Today's lesson</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:text-xs">
              <WifiOff className="h-3.5 w-3.5" aria-hidden /> Works offline
            </span>
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-aqua-100 sm:mt-5 sm:text-sm">
            {lesson.subject} · Class {lesson.grade}
          </p>
          <h2 id="today-lesson" className="mt-1 font-display text-[26px] font-extrabold leading-tight text-white sm:text-4xl">
            {lesson.topic}
          </h2>

          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm sm:mt-5">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-aqua-200" aria-hidden />
              <dt className="sr-only">Learning outcome</dt>
              <dd>
                <span className="text-ocean-100">Outcome:</span> <span className="font-semibold">{lesson.learningOutcome}</span>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-aqua-200" aria-hidden />
              <dt className="sr-only">Duration</dt>
              <dd className="font-semibold">{lesson.durationMin} min</dd>
            </div>
          </dl>

          {lesson.progress > 0 && lesson.progress < 1 && (
            <div className="mt-4 max-w-sm sm:mt-5">
              <div className="mb-1.5 flex justify-between text-xs font-semibold text-ocean-100">
                <span>
                  Step {sectionsDone + 1} of {lesson.content.sections.length}
                </span>
                <span>{Math.round(lesson.progress * 100)}%</span>
              </div>
              <ProgressBar value={lesson.progress} label="Lesson progress" tone="white" size="sm" />
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
            <ButtonLink
              to={`/lessons/${lesson.id}/play`}
              size="lg"
              variant="inverse"
              className="w-full sm:w-auto"
              iconRight={<ArrowRight className="h-5 w-5" />}
            >
              {lesson.progress > 0 ? 'Continue lesson' : 'Start lesson'}
            </ButtonLink>
            <ButtonLink to="/live" size="lg" variant="glass" className="hidden sm:inline-flex">
              Open live translation
            </ButtonLink>
          </div>
        </div>

        <div className="hidden h-44 md:block">
          <CountingIllustration />
        </div>
      </div>
    </section>
  );
}
