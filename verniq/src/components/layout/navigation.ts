import { BarChart3, BookOpen, FileText, Home, Mic, Settings, Sparkles, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** shown in the phone bottom bar */
  primary?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, primary: true },
  { to: '/lessons', label: 'Lessons', icon: BookOpen, primary: true },
  { to: '/live', label: 'Live', icon: Mic, primary: true },
  { to: '/studio', label: 'AI Studio', icon: Sparkles },
  { to: '/materials', label: 'Materials', icon: FileText, primary: true },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];
