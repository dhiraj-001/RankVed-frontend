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
    file: '/openclose.mp3',
    description: 'Standard notification sound',
    category: 'notification'
  },
  {
    id: 'openclose',
    name: 'Open Close Sound',
    file: '/audios/openclose.mp3',
    description: 'Clean open/close notification sound',
    category: 'popup'
  },
  {
    id: 'sound1',
    name: 'Gentle Chime',
    file: '/audios/1.mp3',
    description: 'Soft, pleasant chime sound',
    category: 'notification'
  },
  {
    id: 'sound2',
    name: 'Modern Alert',
    file: '/audios/2.mp3',
    description: 'Contemporary alert tone',
    category: 'notification'
  },
  {
    id: 'sound3',
    name: 'Quick Ping',
    file: '/audios/3.mp3',
    description: 'Short, attention-grabbing ping',
    category: 'popup'
  },
  {
    id: 'sound4',
    name: 'Smooth Bell',
    file: '/audios/4.mp3',
    description: 'Smooth, professional bell sound',
    category: 'notification'
  },
  {
    id: 'sound5',
    name: 'Digital Beep',
    file: '/audios/5.mp3',
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