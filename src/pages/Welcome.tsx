import { motion } from 'framer-motion';
import { ArrowRight, CloudOff, Languages, NotebookPen, Sparkles, WifiOff } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Logo } from '../components/layout/Logo';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { ApiError, NetworkError } from '../data/api';
import { useData } from '../store/DataContext';

type Mode = 'signup' | 'login' | 'local';

const FEATURES = [
  { icon: NotebookPen, text: 'Curriculum-aligned lessons for Classes 1–5, made in seconds' },
  { icon: Languages, text: 'Hindi ↔ home-language words, phrases and voice' },
  { icon: WifiOff, text: 'Works without internet; syncs when you are back online' },
  { icon: Sparkles, text: 'Worksheets, flashcards, attendance and progress in one place' },
];

export default function Welcome() {
  const { signup, login, startLocal } = useData();
  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signup') await signup({ name, email, password, school: school || undefined });
      else if (mode === 'login') await login(email, password);
      else await startLocal({ name, school: school || undefined });
    } catch (err) {
      setError(
        err instanceof NetworkError
          ? 'No internet connection. You can use Verniq without an account now and back it up later.'
          : err instanceof ApiError
            ? err.message
            : 'Something went wrong. Please try again.',
      );
      if (err instanceof NetworkError && mode !== 'local') setMode('local');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_440px] lg:gap-16">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="order-2 lg:order-1">
          <Logo showTagline className="hidden lg:inline-flex" />
          <h1 className="mt-0 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:mt-10 lg:text-5xl">
            Learning in the language <span className="text-ocean-600">they understand.</span>
          </h1>
          <p className="mt-3 max-w-lg text-base text-ink-500 sm:text-lg">Verniq helps primary teachers plan, teach and talk with children in their mother tongue.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 rounded-2xl border border-ink-200/80 bg-surface p-3.5 shadow-soft">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ocean-50 text-ocean-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-sm font-medium text-ink-700">{text}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="order-1 rounded-3xl border border-ink-200/80 bg-surface p-5 shadow-lift sm:p-8 lg:order-2"
          aria-labelledby="auth-title"
        >
          <Logo className="mb-5 lg:hidden" />
          <h2 id="auth-title" className="text-xl font-bold sm:text-2xl">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Use on this device'}
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            {mode === 'local' ? 'Everything stays on this device. Create an account any time to back it up.' : 'Your lessons and class records are backed up and available on all your devices.'}
          </p>

          <Tabs
            label="Account"
            stretch
            className="mt-5"
            value={mode}
            onChange={(m) => {
              setMode(m);
              setError(null);
            }}
            tabs={[
              { value: 'signup', label: 'Sign up' },
              { value: 'login', label: 'Sign in' },
              { value: 'local', label: 'No account' },
            ]}
          />

          <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
            {mode !== 'login' && <TextField label="Your name" value={name} onChange={setName} autoComplete="name" required minLength={2} placeholder="e.g. Sunita Kumari" />}
            {mode !== 'local' && (
              <TextField label="Email" type="email" inputMode="email" value={email} onChange={setEmail} autoComplete="email" required placeholder="you@example.com" />
            )}
            {mode !== 'local' && (
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={8}
                hint={mode === 'signup' ? 'At least 8 characters' : undefined}
              />
            )}
            {mode !== 'login' && <TextField label="School (optional)" value={school} onChange={setSchool} placeholder="e.g. Govt. Primary School, Chaibasa" />}

            {error && (
              <p role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                <CloudOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={busy}
              disabled={(mode !== 'login' && name.trim().length < 2) || (mode !== 'local' && (!email.includes('@') || password.length < (mode === 'signup' ? 8 : 1)))}
              iconRight={!busy && <ArrowRight className="h-5 w-5" />}
            >
              {mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Start using Verniq'}
            </Button>
          </form>
        </motion.section>
      </div>
    </div>
  );
}
