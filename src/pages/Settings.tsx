import { CloudUpload, Download, LogOut, Monitor, Moon, Save, ShieldCheck, Sun } from 'lucide-react';
import { Tabs } from '../components/ui/Tabs';
import { useState, type FormEvent } from 'react';
import { InstallCard } from '../components/layout/InstallCard';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { LanguagePairDisplay } from '../components/ui/LanguageSelector';
import { Modal } from '../components/ui/Modal';
import { OfflinePanel } from '../components/ui/OfflineIndicator';
import { TextField } from '../components/ui/Select';
import { PageHeader } from '../components/ui/States';
import { ApiError, NetworkError } from '../data/api';
import { useShell } from '../hooks/useShell';
import { useApp } from '../store/AppContext';
import { useData } from '../store/DataContext';
import { cn, download, todayISO } from '../utils';

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span>
        <span className="block font-semibold text-ink-900">{label}</span>
        <span className="block text-sm text-ink-500">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn('relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200', checked ? 'bg-aqua-500' : 'bg-ink-200')}
      >
        <span className={cn('absolute top-1 h-6 w-6 rounded-full bg-surface shadow-soft transition-transform duration-200', checked ? 'translate-x-7' : 'translate-x-1')} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { largeText, setLargeText, theme, setTheme, toast } = useApp();
  const { teacher, session, updateProfile, logout, exportBackup, signup, sync } = useData();
  const { openLanguagePicker } = useShell();
  const [name, setName] = useState(teacher?.name ?? '');
  const [school, setSchool] = useState(teacher?.school ?? '');
  const [district, setDistrict] = useState(teacher?.district ?? '');
  const [confirmOut, setConfirmOut] = useState(false);
  const [account, setAccount] = useState({ email: '', password: '' });
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const local = session?.mode === 'local';
  const profileDirty = name !== (teacher?.name ?? '') || school !== (teacher?.school ?? '') || district !== (teacher?.district ?? '');

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await updateProfile({ name: name.trim(), school: school.trim() || undefined, district: district.trim() || undefined });
    toast({ tone: 'success', title: 'Profile saved' });
  };

  const backup = async () => {
    download(await exportBackup(), `verniq-backup-${todayISO()}.json`);
    toast({ tone: 'success', title: 'Backup downloaded', detail: 'Keep it somewhere safe.' });
  };

  const createAccount = async (e: FormEvent) => {
    e.preventDefault();
    setAccountError(null);
    setAccountBusy(true);
    try {
      await signup({ name: teacher?.name ?? name, email: account.email.trim(), password: account.password, school: teacher?.school, district: teacher?.district });
      toast({ tone: 'success', title: 'Account created', detail: 'Your work is uploading now.' });
    } catch (err) {
      setAccountError(
        err instanceof NetworkError
          ? 'No internet connection. Try again when you are online — your work stays safe on this device.'
          : err instanceof ApiError
            ? err.message
            : 'Something went wrong. Please try again.',
      );
    } finally {
      setAccountBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" description="Your profile, account, classroom language and this device." />

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile" subtitle={local ? 'Stored on this device' : teacher?.email} />
          <form onSubmit={saveProfile} className="space-y-4">
            <TextField label="Your name" value={name} onChange={setName} required autoComplete="name" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="School" value={school} onChange={setSchool} />
              <TextField label="District" value={district} onChange={setDistrict} />
            </div>
            <Button type="submit" disabled={!profileDirty || !name.trim()} icon={<Save className="h-4 w-4" />}>
              Save profile
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Account & backup" subtitle={local ? 'Using Verniq without an account' : 'Signed in — your work is backed up'} />
          {local ? (
            <form onSubmit={createAccount} className="space-y-4">
              <p className="text-sm text-ink-600">Create a free account to back up your classes and use them on another phone or tablet. Everything on this device is uploaded.</p>
              <TextField label="Email" type="email" autoComplete="email" value={account.email} onChange={(email) => setAccount((a) => ({ ...a, email }))} required />
              <TextField
                label="Password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                hint="At least 8 characters."
                value={account.password}
                onChange={(password) => setAccount((a) => ({ ...a, password }))}
                required
              />
              {accountError && (
                <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {accountError}
                </p>
              )}
              <Button type="submit" loading={accountBusy} icon={<CloudUpload className="h-4 w-4" />}>
                Create account & upload
              </Button>
            </form>
          ) : (
            <p className="flex items-start gap-2 text-sm text-ink-600">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" aria-hidden />
              Changes are saved on this device first and sent to your account when there is internet.
              {sync.pending > 0 && ` ${sync.pending} change${sync.pending === 1 ? '' : 's'} waiting.`}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => void backup()}>
              Download backup
            </Button>
            <Button variant="ghost" icon={<LogOut className="h-4 w-4" />} onClick={() => setConfirmOut(true)} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
              {local ? 'Reset this device' : 'Sign out'}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Classroom language" subtitle="For the class you are viewing" />
          <LanguagePairDisplay size="lg" />
          <Button variant="outline" className="mt-4 sm:mt-5" onClick={openLanguagePicker}>
            Change language
          </Button>
        </Card>

        <Card>
          <CardHeader title="Offline & sync" subtitle="Verniq keeps working without internet." />
          <OfflinePanel />
          <p className="mt-4 border-t border-ink-100 pt-3 text-sm text-ink-500">
            Lessons, translation, worksheets and flashcards are made on this device and need no internet. For offline voice on Android, download Hindi under
            Android Settings → Languages → Speech (on-device recognition).
          </p>
        </Card>

        <InstallCard />

        <Card>
          <CardHeader title="Appearance" />
          <p className="field-label">Theme</p>
          <Tabs
            label="Theme"
            stretch
            value={theme}
            onChange={setTheme}
            tabs={[
              { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" aria-hidden /> },
              { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" aria-hidden /> },
              { value: 'system', label: 'Device', icon: <Monitor className="h-4 w-4" aria-hidden /> },
            ]}
          />
          <p className="mt-2 text-sm text-ink-500">Dark is easier on the eyes in the evening and saves battery on many phones. Worksheets and PDFs always print on white.</p>
          <div className="mt-3 divide-y divide-ink-100 border-t border-ink-100">
            <Toggle checked={largeText} onChange={setLargeText} label="Larger text" description="Easier to read from a distance in class." />
          </div>
          <p className="mt-3 text-sm text-ink-500">Animations follow your device's “reduce motion” setting.</p>
        </Card>
      </div>

      <p className="mt-6 text-center text-xs text-ink-400">
        Verniq builds lessons, worksheets and translations on this device from its curriculum library and your own word list — no data is sent to outside AI services.
      </p>

      <Modal
        open={confirmOut}
        onClose={() => setConfirmOut(false)}
        size="sm"
        title={local ? 'Reset this device?' : 'Sign out?'}
        description={
          local
            ? 'Everything you made without an account will be deleted from this device. Download a backup first if you want to keep it.'
            : sync.pending > 0
              ? `${sync.pending} change${sync.pending === 1 ? ' has' : 's have'} not been uploaded yet and will be lost. Connect to the internet and sync first.`
              : 'Your work is safe in your account. Sign in again any time.'
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOut(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void logout()}>
              {local ? 'Delete & reset' : 'Sign out'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">{teacher?.name}</p>
      </Modal>
    </>
  );
}
