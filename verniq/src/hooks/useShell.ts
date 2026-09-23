import { useOutletContext } from 'react-router-dom';

export interface ShellContext {
  openLanguagePicker: () => void;
}

/** Access actions provided by the app shell (e.g. the language picker). */
export function useShell(): ShellContext {
  return useOutletContext<ShellContext>();
}
