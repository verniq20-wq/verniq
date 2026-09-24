import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, School, Users } from 'lucide-react';
import { useState } from 'react';
import { composeLesson } from '../../engine/composer';
import { outcomesFor } from '../../engine/curriculum';
import { Logo } from '../components/layout/Logo';
import { Button } from '../components/ui/Button';
import { Select, TextField } from '../components/ui/Select';
import { LANGUAGES, TRIBAL_LANGUAGES } from '../data/languages';
import { useData } from '../store/DataContext';
import type { ClassDoc, LanguageCode, LessonDoc, StudentDoc } from '../types';
import { cn, newId, todayISO, parseStudentLines } from '../utils';

const STEPS = ['Your school', 'Your class', 'Students'];

export default function Onboarding() {
  const { teacher, updateProfile, put, putMany, glossaryFor, phrasesFor } = useData();
  const [step, setStep] = useState(0);
  const [school, setSchool] = useState(teacher?.school ?? '');
  const [district, setDistrict] = useState(teacher?.district ?? '');
  const [grade, setGrade] = useState(1);
  const [className, setClassName] = useState('Class 1');
  const [source, setSource] = useState<'hi' | 'en'>('hi');
  const [language, setLanguage] = useState<LanguageCode>('ho');
  const [names, setNames] = useState('');
  const [busy, setBusy] = useState(false);

  const studentNames = parseStudentLines(names).slice(0, 80);

  const finish = async () => {
    setBusy(true);
    const now = Date.now();
    const cls: Omit<ClassDoc, 'updatedAt'> = { id: newId(), name: className.trim() || `Class ${grade}`, grade, sourceLanguage: source, language, createdAt: now };
    await put('classes', cls);
    if (studentNames.length) {
      await putMany(
        'students',
        studentNames.map<Omit<StudentDoc, 'updatedAt'>>((st, i) => ({ id: newId(), classId: cls.id, name: st.name, rollNo: st.rollNo ?? String(i + 1), createdAt: now + i })),
      );
    }
    // Two starter lessons so the home screen is ready for today
    const ctx = { glossary: glossaryFor(language), phrases: phrasesFor(language) };
    const starters = [outcomesFor('Mathematics', grade)[0], outcomesFor('EVS', grade)[0] ?? outcomesFor('Hindi', grade)[0]].filter(Boolean);
    const lessons = starters.map<Omit<LessonDoc, 'updatedAt'>>((o, i) => {
      const composed = composeLesson({ grade, subject: o.subject, topic: o.topics[0], outcomeCode: o.code }, ctx);
      return {
        id: newId(),
        classId: cls.id,
        grade,
        subject: o.subject,
        topic: o.topics[0],
        learningOutcome: composed.learningOutcome,
        outcomeCode: composed.outcome.code,
        language,
        durationMin: composed.durationMin,
        content: composed.content,
        status: 'not-started',
        progress: 0,
        savedOffline: true,
        scheduledFor: i === 0 ? todayISO() : undefined,
        createdAt: now + i,
      };
    });
    await putMany('lessons', lessons);
    await updateProfile({ school: school.trim() || undefined, district: district.trim() || undefined, activeClassId: cls.id, onboarded: true });
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-canvas px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:px-6">
      <div className="mx-auto max-w-xl">
        <Logo />
        <h1 className="mt-6 text-2xl font-extrabold sm:text-3xl">Welcome, {teacher?.name.split(' ')[0]}</h1>
        <p className="mt-1 text-ink-500">Three quick steps to set up your classroom.</p>

        <ol className="mt-6 flex gap-2" aria-label="Setup steps">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <span className={cn('block h-1.5 rounded-full transition-colors', i <= step ? 'bg-ocean-600' : 'bg-ink-200')} />
              <span className={cn('mt-1.5 block text-xs font-semibold', i === step ? 'text-ocean-700' : 'text-ink-400')}>{s}</span>
            </li>
          ))}
        </ol>

        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="mt-6 rounded-3xl border border-ink-200/80 bg-white p-5 shadow-soft sm:p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <School className="h-5 w-5 text-ocean-600" aria-hidden /> Where do you teach?
              </h2>
              <TextField label="School" value={school} onChange={setSchool} placeholder="e.g. Govt. Primary School, Chaibasa" />
              <TextField label="District (optional)" value={district} onChange={setDistrict} placeholder="e.g. West Singhbhum" />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Your class</h2>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Class"
                  value={String(grade)}
                  onChange={(v) => {
                    setGrade(Number(v));
                    if (/^Class \d$/.test(className)) setClassName(`Class ${v}`);
                  }}
                  options={[1, 2, 3, 4, 5].map((g) => ({ value: String(g), label: `Class ${g}` }))}
                />
                <TextField label="Name" value={className} onChange={setClassName} placeholder="e.g. Class 1 A" />
              </div>
              <Select
                label="I teach in"
                value={source}
                onChange={(v) => setSource(v as 'hi' | 'en')}
                options={LANGUAGES.filter((l) => l.code === 'hi' || l.code === 'en').map((l) => ({ value: l.code, label: l.name }))}
              />
              <Select
                label="Children's home language"
                value={language}
                onChange={(v) => setLanguage(v as LanguageCode)}
                options={TRIBAL_LANGUAGES.map((l) => ({ value: l.code, label: `${l.name} · ${l.nativeName}` }))}
                hint={language === 'ho' ? 'Verniq has starter Ho words. You can add and correct words any time.' : 'Verniq has no words for this language yet — you will build the word list as you teach.'}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Users className="h-5 w-5 text-ocean-600" aria-hidden /> Students <span className="text-sm font-normal text-ink-400">(optional)</span>
              </h2>
              <label htmlFor="names" className="field-label">
                One name per line
              </label>
              <textarea
                id="names"
                value={names}
                onChange={(e) => setNames(e.target.value)}
                rows={7}
                placeholder={'Birsa Hembrom\nSalge Purty\nMangal Sinku'}
                className="field min-h-[160px] py-3"
              />
              <p className="text-sm text-ink-500">{studentNames.length ? `${studentNames.length} students will be added.` : 'You can add students later from the Class screen.'}</p>
            </div>
          )}
        </motion.div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || busy} icon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="lg" onClick={() => setStep((s) => s + 1)} iconRight={<ArrowRight className="h-5 w-5" />} disabled={step === 1 && !className.trim()}>
              Next
            </Button>
          ) : (
            <Button size="lg" onClick={() => void finish()} loading={busy} icon={!busy && <Check className="h-5 w-5" />}>
              Finish setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
