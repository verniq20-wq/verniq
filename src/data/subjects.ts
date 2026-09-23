import type { Subject } from '../types';

export const SUBJECT_STYLE: Record<Subject, { emoji: string; tint: string }> = {
  Mathematics: { emoji: '🔢', tint: 'bg-ocean-50' },
  Hindi: { emoji: 'अ', tint: 'bg-sun-50' },
  EVS: { emoji: '🌿', tint: 'bg-leaf-50' },
  English: { emoji: 'Aa', tint: 'bg-aqua-50' },
};
