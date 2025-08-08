import { AUDIO_DATA_URIS } from '../../public/audios/audio-data-uris.js';

export interface SoundOption {
  id: string;
  name: string;
  file: string;
  description: string;
  category: 'notification' | 'popup' | 'general';
}

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'default',
    name: 'Default Notification',
    file: AUDIO_DATA_URIS["openclose"],
    description: 'Standard notification sound',
    category: 'notification'
  },
  {
    id: 'sound1',
    name: 'Gentle Chime',
    file: AUDIO_DATA_URIS["1"],
    description: 'Soft, pleasant chime sound',
    category: 'notification'
  },
  {
    id: 'sound2',
    name: 'Modern Alert',
    file: AUDIO_DATA_URIS["2"],
    description: 'Contemporary alert tone',
    category: 'notification'
  },
  {
    id: 'sound3',
    name: 'Quick Ping',
    file: AUDIO_DATA_URIS["3"],
    description: 'Short, attention-grabbing ping',
    category: 'popup'
  },
  {
    id: 'sound4',
    name: 'Smooth Bell',
    file: AUDIO_DATA_URIS["4"],
    description: 'Smooth, professional bell sound',
    category: 'notification'
  },
  {
    id: 'sound5',
    name: 'Digital Beep',
    file: AUDIO_DATA_URIS["5"],
    description: 'Digital notification beep',
    category: 'popup'
  }
];

export const getSoundByFile = (file: string): SoundOption | undefined => {
  return SOUND_OPTIONS.find(sound => sound.file === file);
};

export const getSoundById = (id: string): SoundOption | undefined => {
  return SOUND_OPTIONS.find(sound => sound.id === id);
}; 