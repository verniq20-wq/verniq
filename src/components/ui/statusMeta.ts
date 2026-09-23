import { AlertCircle, CloudOff, RefreshCw, Wifi } from 'lucide-react';
import type { ConnectivityStatus } from '../../types';

export const STATUS_META: Record<ConnectivityStatus, { label: string; dot: string; pill: string; icon: typeof Wifi }> = {
  online: { label: 'Online', dot: 'bg-leaf-500', pill: 'bg-leaf-50 text-leaf-700 ring-leaf-100', icon: Wifi },
  syncing: { label: 'Syncing', dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700 ring-amber-100', icon: RefreshCw },
  offline: { label: 'Offline ready', dot: 'bg-ocean-500', pill: 'bg-ocean-50 text-ocean-700 ring-ocean-100', icon: CloudOff },
  'sync-required': { label: 'Sync required', dot: 'bg-rose-500', pill: 'bg-rose-50 text-rose-700 ring-rose-100', icon: AlertCircle },
};
