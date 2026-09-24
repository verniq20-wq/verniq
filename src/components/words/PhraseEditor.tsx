import { useState } from 'react';
import { languageName } from '../../data/languages';
import { useApp } from '../../store/AppContext';
import { useData } from '../../store/DataContext';
import type { LanguageCode, Phrase } from '../../types';
import { newId } from '../../utils';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TextField } from '../ui/Select';
import { Tabs } from '../ui/Tabs';
import { RecordButton } from './RecordButton';

export interface PhraseDraft {
  id?: string;
  hindi: string;
  target: string;
  english?: string;
  speaker: Phrase['speaker'];
  audio?: string;
  uses?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  language: LanguageCode;
  initial: PhraseDraft;
  title?: string;
  onSaved?: (p: Phrase) => void;
}

/** Add or correct a sentence in the phrasebook — the translation memory Live and lessons reuse. */
export function PhraseEditor({ open, onClose, language, initial, title, onSaved }: Props) {
  const { put, remove } = useData();
  const { toast } = useApp();
  const [d, setD] = useState<PhraseDraft>(initial);
  const lang = languageName(language);
  const valid = d.hindi.trim() && d.target.trim();

  const save = async () => {
    const doc = await put('phrases', {
      id: d.id ?? newId(),
      language,
      hindi: d.hindi.trim(),
      target: d.target.trim(),
      ...(d.english?.trim() ? { english: d.english.trim() } : {}),
      speaker: d.speaker,
      ...(d.audio ? { audio: d.audio } : {}),
      uses: d.uses ?? 0,
    });
    toast({ tone: 'success', title: 'Saved to phrasebook', detail: 'Verniq will use this exact sentence from now on.' });
    onSaved?.(doc);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? (d.id ? 'Edit phrase' : 'Add phrase')}
      description={`Write the sentence the way it is really said in ${lang}. Saved phrases are used word-for-word in Live and lessons.`}
      footer={
        <>
          {d.id && (
            <Button
              variant="ghost"
              className="mr-auto text-rose-600 hover:bg-rose-50"
              onClick={() => {
                void remove('phrases', d.id!);
                onClose();
              }}
            >
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={!valid}>
            Save phrase
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Tabs
          label="Who says it"
          stretch
          value={d.speaker}
          onChange={(speaker) => setD({ ...d, speaker })}
          tabs={[
            { value: 'teacher', label: 'Teacher says' },
            { value: 'student', label: 'Student says' },
          ]}
        />
        <TextField label="Hindi" lang="hi" value={d.hindi} onChange={(hindi) => setD({ ...d, hindi })} />
        <TextField label={lang} value={d.target} onChange={(target) => setD({ ...d, target })} hint="Devanagari or Roman script — whatever your community uses." />
        <TextField label="English (optional)" value={d.english ?? ''} onChange={(english) => setD({ ...d, english })} />
        <div>
          <p className="field-label">Pronunciation in {lang}</p>
          <RecordButton value={d.audio} onChange={(audio) => setD({ ...d, audio })} />
          <p className="mt-1.5 text-xs text-ink-500">A real recording is played instead of the approximate Hindi voice.</p>
        </div>
      </div>
    </Modal>
  );
}
