import { Check, Download, Info } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { LanguagePairDisplay } from '../components/ui/LanguageSelector';
import { OfflinePanel } from '../components/ui/OfflineIndicator';
import { PageHeader } from '../components/ui/States';
import { TEACHER } from '../data/demo';
import { LANGUAGES } from '../data/languages';
import { useShell } from '../hooks/useShell';
import { DEMO_MODE } from '../services/config';
import { useApp, type ConnectivityMode } from '../store/AppContext';
import { cn } from '../utils';

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span>
        <span className="block font-semibold text-ink-900">{label}</span>
        <span className="block text-sm text-ink-500">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200', checked ? 'bg-aqua-500' : 'bg-ink-200')}
      >
        <span className={cn('absolute top-1 h-6 w-6 rounded-full bg-white shadow-soft transition-transform duration-200', checked ? 'translate-x-7' : 'translate-x-1')} />
        <span className="sr-only">{label}</span>
      </button>
    </label>
  );
}

export default function Settings() {
  const { largeText, setLargeText, connectivity, setConnectivityMode, toast } = useApp();
  const { openLanguagePicker } = useShell();
  const [packs, setPacks] = useState(LANGUAGES);
  const [downloading, setDownloading] = useState<string | null>(null);

  const download = (code: string) => {
    setDownloading(code);
    setTimeout(() => {
      setPacks((ps) => ps.map((p) => (p.code === code ? { ...p, downloaded: true } : p)));
      setDownloading(null);
      toast({ tone: 'success', title: 'Language pack ready offline', detail: packs.find((p) => p.code === code)?.name });
    }, 1400);
  };

  const modes: { value: ConnectivityMode; label: string }[] = [
    { value: 'auto', label: 'Follow device' },
    { value: 'offline', label: 'Offline' },
    { value: 'sync-required', label: 'Sync required' },
  ];

  return (
    <>
      <PageHeader title="Settings" description="Your profile, classroom language and offline content." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile" />
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sun-100 font-display text-lg font-bold text-sun-700">
              {TEACHER.name.split(' ').map((p) => p[0]).join('')}
            </span>
            <div>
              <p className="font-semibold text-ink-900">{TEACHER.name}</p>
              <p className="text-sm text-ink-500">
                Class {TEACHER.classLevel} · {TEACHER.school}
              </p>
              <p className="text-sm text-ink-500">{TEACHER.district}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Classroom language" />
          <LanguagePairDisplay size="lg" />
          <Button variant="outline" className="mt-5" onClick={openLanguagePicker}>
            Change language
          </Button>
        </Card>

        <Card>
          <CardHeader title="Offline & sync" subtitle="Verniq keeps working without internet." />
          <OfflinePanel />
        </Card>

        <Card>
          <CardHeader title="Accessibility" />
          <div className="divide-y divide-ink-100">
            <Toggle checked={largeText} onChange={setLargeText} label="Larger text" description="Easier to read from a distance in class." />
          </div>
          <p className="mt-3 text-sm text-ink-500">Animations follow your device's “reduce motion” setting.</p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Language packs" subtitle="Download packs to translate, speak and generate offline." />
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {packs.map((l) => (
              <li key={l.code} className="flex items-center justify-between gap-3 rounded-2xl border border-ink-200 p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">
                    {l.name} <span className="font-normal text-ink-400">{l.nativeName !== l.name && l.nativeName}</span>
                  </p>
                  <p className="text-xs text-ink-500">
                    {l.script} · {l.packSizeMb} MB
                  </p>
                </div>
                {l.downloaded ? (
                  <Badge tone="aqua" icon={<Check className="h-3.5 w-3.5" aria-hidden />}>
                    Offline
                  </Badge>
                ) : (
                  <Button size="sm" variant="soft" loading={downloading === l.code} onClick={() => download(l.code)} icon={<Download className="h-4 w-4" />} aria-label={`Download ${l.name} pack`}>
                    Get
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>

        {DEMO_MODE && (
          <Card className="border-sun-200 bg-sun-50/50 lg:col-span-2">
            <CardHeader
              title="Demo controls"
              subtitle="No backend is connected. Lessons, translations and materials use sample data and simulated AI responses."
            />
            <p className="field-label">Simulate connection</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Simulate connection">
              {modes.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  aria-pressed={connectivity.mode === m.value}
                  onClick={() => setConnectivityMode(m.value)}
                  className={cn(
                    'min-h-[44px] rounded-xl border px-4 text-sm font-semibold transition-colors',
                    connectivity.mode === m.value ? 'border-ocean-600 bg-ocean-600 text-white' : 'border-ink-200 bg-white text-ink-700 hover:border-ocean-200',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="mt-4 flex gap-2 text-sm text-ink-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Set <code className="rounded bg-white px-1.5 py-0.5 text-xs">VITE_VERNIQ_API_URL</code> and implement the functions in
              <code className="rounded bg-white px-1.5 py-0.5 text-xs">src/services</code> to connect real services.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
