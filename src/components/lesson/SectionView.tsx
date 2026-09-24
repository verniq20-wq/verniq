import { Info } from 'lucide-react';
import { languageName } from '../../data/languages';
import type { LanguageCode, LessonSection } from '../../types';
import { cn } from '../../utils';
import { AudioButton } from '../ui/AudioButton';

interface Props {
  section: LessonSection;
  source: LanguageCode;
  target: LanguageCode;
  audio: { playingKey: string | null; play: (key: string, text: string, lang: LanguageCode) => void; stop: () => void };
  size?: 'md' | 'lg';
}

/** Teacher script with home-language key words and read-aloud. */
export function SectionScript({ section, source, target, audio, size = 'md' }: Props) {
  const keywords = section.keywords ?? [];
  const targetName = languageName(target);
  return (
    <div>
      <p lang="hi" className={cn('font-semibold leading-relaxed text-ink-900', size === 'lg' ? 'text-xl sm:text-[28px]' : 'text-lg sm:text-xl')}>
        “{section.script}”
      </p>

      {keywords.length > 0 && (
        <div className="mt-4">
          <p className="eyebrow mb-2">Key words in {targetName}</p>
          <ul className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <li key={k.hindi}>
                <button
                  type="button"
                  onClick={() => audio.play(`kw-${section.key}-${k.hindi}`, k.target, target)}
                  className={cn(
                    'inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3 text-sm transition-colors',
                    audio.playingKey === `kw-${section.key}-${k.hindi}` ? 'border-aqua-400 bg-aqua-50' : 'border-ink-200 bg-white hover:border-aqua-300',
                  )}
                >
                  <span className="font-bold text-ocean-700">{k.target}</span>
                  <span className="text-ink-400">{k.hindi}</span>
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
          onPlay={() => audio.play(`${section.key}-s`, section.script, source)}
          onStop={audio.stop}
        />
      </div>

      {keywords.length === 0 && target !== 'hi' && (
        <p className="mt-3 flex gap-2 text-xs text-ink-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          No {targetName} words for this part yet. Add words in the Words screen and they will appear here.
        </p>
      )}
    </div>
  );
}
