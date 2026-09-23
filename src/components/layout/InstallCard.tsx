import { CheckCircle2, Download, Share, Smartphone } from 'lucide-react';
import { isNative } from '../../platform';
import { isIosSafari, promptInstall, usePwa } from '../../platform/pwa';
import { useApp } from '../../store/AppContext';
import { Button, IconButton } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';

/** Settings card: install Verniq on this device. */
export function InstallCard() {
  const { canInstall, installed } = usePwa();
  const { toast } = useApp();

  const install = async () => {
    const ok = await promptInstall();
    if (ok) toast({ tone: 'success', title: 'Verniq installed', detail: 'Open it from your home screen.' });
  };

  return (
    <Card>
      <CardHeader title="Verniq app" subtitle="Home-screen icon, full-screen, works offline." />
      {isNative || installed ? (
        <p className="flex items-center gap-2 font-semibold text-leaf-700">
          <CheckCircle2 className="h-5 w-5" aria-hidden /> Installed on this device
        </p>
      ) : canInstall ? (
        <Button onClick={() => void install()} icon={<Download className="h-4 w-4" />}>
          Install Verniq
        </Button>
      ) : isIosSafari ? (
        <p className="flex items-start gap-2 text-sm text-ink-600">
          <Share className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Tap Share, then “Add to Home Screen”.
        </p>
      ) : (
        <p className="flex items-start gap-2 text-sm text-ink-600">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Open your browser menu and choose “Install app” or “Add to Home screen”.
        </p>
      )}
    </Card>
  );
}

/** Compact install button for the top bar — only shown when the browser offers it. */
export function InstallButton() {
  const { canInstall, installed } = usePwa();
  const { toast } = useApp();
  if (isNative || installed || !canInstall) return null;
  return (
    <IconButton
      label="Install Verniq app"
      onClick={async () => {
        if (await promptInstall()) toast({ tone: 'success', title: 'Verniq installed', detail: 'Open it from your home screen.' });
      }}
      className="text-ocean-600"
    >
      <Download className="h-[22px] w-[22px]" />
    </IconButton>
  );
}
