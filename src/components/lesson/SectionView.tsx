import { Info, Mic } from 'lucide-react';
import { useMemo, useState } from 'react';
import { normalize } from '../../../engine/text';
import { languageName } from '../../data/languages';
import { useData } from '../../store/DataContext';
import type { LanguageCode, LessonSection } from '../../types';
import { cn } from '../../utils';
import { AudioButton } from '../ui/AudioButton';
import { PhraseEditor } from '../words/PhraseEditor';

interface Props {
  section: LessonSection;
  source: LanguageCode;
  target: LanguageCode;
  audio: { playingKey: string | null; play: (key: string, text: string, lang: LanguageCode, audio?: string) => unknown; stop: () => void };
  size?: 'md' | 'lg';
}

/**
 * Teacher script with home-language key words and read-aloud. There is no
 * speech engine for tribal languages, so the home-language version plays the
 * teacher's own recording of this line (saved in the phrasebook).
 */
export function SectionScript({ section, source, target, audio, size = 'md' }: Props) {
  const { glossaryFor, phrasesFor } = useData();
  const [recording, setRecording] = useState(false);
  const keywords = section.keywords ?? [];
  const targetName = languageName(target);
  const glossary = useMemo(() => glossaryFor(target), [glossaryFor, target]);
  const phrase = useMemo(() => {
    const key = normalize(section.script);
    return phrasesFor(target).find((p) => normalize(p.hindi) === key);
  }, [phrasesFor, section.script, target]);
  const wordAudio = (hindi: string) => glossary.find((g) => g.hindi === hindi)?.audio;
  const isTribal = target !== 'hi' && target !== 'en';

  return (
    <div>
      <p lang="hi" className={cn('font-semibold leading-relaxed text-ink-900', size === 'lg' ? 'text-xl sm:text-[28px]' : 'text-lg sm:text-xl')}>
        “{section.script}”
      </p>
      {phrase?.target && (
        <p className={cn('mt-2 font-semibold leading-relaxed text-ocean-700', size === 'lg' ? 'text-lg sm:text-2xl' : 'text-base sm:text-lg')}>
          <span className="sr-only">{targetName}: </span>“{phrase.target}”
        </p>
      )}

      {keywords.length > 0 && (
        <div className="mt-4">
          <p className="eyebrow mb-2">Key words in {targetName}</p>
          <ul className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <li key={k.hindi}>
                <button
                  type="button"
                  onClick={() => void audio.play(`kw-${section.key}-${k.hindi}`, k.target, target, wordAudio(k.hindi))}
                  className={cn(
                    'inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3 text-sm transition-colors',
                    audio.playingKey === `kw-${section.key}-${k.hindi}` ? 'border-aqua-400 bg-aqua-50' : 'border-ink-200 bg-surface hover:border-aqua-300',
                  )}
                >
                  <span className="font-bold text-ocean-700">{k.target}</span>
                  <span className="text-ink-400">{k.hindi}</span>
                  {wordAudio(k.hindi) && <Mic className="h-3 w-3 text-aqua-600" aria-label="recorded" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
        <AudioButton
          variant={size === 'lg' ? 'solid' : 'soft'}
          label={`Read aloud · ${languageName(source)}`}
          playing={audio.playingKey === `${section.key}-s`}
          onPlay={() => void audio.play(`${section.key}-s`, section.script, source)}
          onStop={audio.stop}
        />
        {isTribal &&
          (phrase?.audio ? (
            <AudioButton
              variant="soft"
              label={`Play · ${targetName}`}
              playing={audio.playingKey === `${section.key}-t`}
              onPlay={() => void audio.play(`${section.key}-t`, phrase.target, target, phrase.audio)}
              onStop={audio.stop}
            />
          ) : (
            <button
              type="button"
              onClick={() => setRecording(true)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-dashed border-aqua-300 px-4 text-sm font-semibold text-aqua-700 hover:bg-aqua-50"
            >
              <Mic className="h-4 w-4" aria-hidden /> {phrase ? `Record ${targetName} voice` : `Add ${targetName} version`}
            </button>
          ))}
      </div>

      {keywords.length === 0 && isTribal && !phrase && (
        <p className="mt-3 flex gap-2 text-xs text-ink-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          No {targetName} words for this part yet. Add words in the Words screen, or add a {targetName} version of this line with a recording.
        </p>
      )}

      {recording && (
        <PhraseEditor
          open
          onClose={() => setRecording(false)}
          language={target}
          title={`${targetName} version of this line`}
          initial={phrase ? { ...phrase } : { hindi: section.script, target: '', speaker: 'teacher' }}
        />
      )}
    </div>
  );
}
