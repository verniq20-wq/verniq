import type { Subject } from '../types';

/** Colour per subject. Language subjects show a letter; others show an icon (see SubjectIcon). */
export const SUBJECT_STYLE: Record<Subject, { tint: string; color: string; glyph?: string }> = {
  Mathematics: { tint: 'bg-ocean-50', color: 'text-ocean-600' },
  Hindi: { tint: 'bg-sun-50', color: 'text-sun-700', glyph: 'अ' },
  EVS: { tint: 'bg-leaf-50', color: 'text-leaf-600' },
  English: { tint: 'bg-aqua-50', color: 'text-aqua-700', glyph: 'Aa' },
};
