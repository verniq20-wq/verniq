import { BarChart3, BookA, BookOpen, FileText, Home, Mic, Settings, Sparkles, Users, type LucideIcon } from 'lucide-react';

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
  { to: '/class', label: 'Class', icon: Users, primary: true },
  { to: '/studio', label: 'AI Studio', icon: Sparkles },
  { to: '/materials', label: 'Materials', icon: FileText },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/words', label: 'Words', icon: BookA },
  { to: '/settings', label: 'Settings', icon: Settings },
];
