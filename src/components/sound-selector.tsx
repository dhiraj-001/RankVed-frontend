import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Volume2, Play, Pause, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { SOUND_OPTIONS, SoundOption, getSoundByFile } from '@/lib/sound-options';

interface SoundSelectorProps {
  selectedSound?: string;
  onSoundSelect: (soundFile: string) => void;
  title?: string;
  description?: string;
  volume?: number;
}

export function SoundSelector({ 
  selectedSound, 
  onSoundSelect, 
  title = "Select Sound",
  description = "Choose a notification sound for your chatbot",
  volume = 50
}: SoundSelectorProps) {
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const handlePlaySound = async (sound: SoundOption) => {
    try {
      // Stop any currently playing sound
      if (playingSound && audioRefs.current[playingSound]) {
        audioRefs.current[playingSound].pause();
        audioRefs.current[playingSound].currentTime = 0;
      }

      // Create or get audio element
      if (!audioRefs.current[sound.file]) {
        audioRefs.current[sound.file] = new Audio(sound.file);
      }

      const audio = audioRefs.current[sound.file];
      // Set volume based on the volume prop
      audio.volume = volume / 100;
      
      // Play the sound
      setPlayingSound(sound.file);
      await audio.play();
      
      // Reset playing state when sound ends
      audio.onended = () => {
        setPlayingSound(null);
      };
    } catch (error) {
      console.error('Error playing sound:', error);
      setPlayingSound(null);
    }
  };

  const handleStopSound = () => {
    if (playingSound && audioRefs.current[playingSound]) {
      audioRefs.current[playingSound].pause();
      audioRefs.current[playingSound].currentTime = 0;
    }
    setPlayingSound(null);
  };

  const isSelected = (sound: SoundOption) => selectedSound === sound.file;
  const isPlaying = (sound: SoundOption) => playingSound === sound.file;
  const selectedSoundOption = getSoundByFile(selectedSound || '');

  return (
    <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Volume2 className="h-4 w-4 text-blue-600" />
          {title}
        </CardTitle>
        <p className="text-sm text-slate-600">{description}</p>
      </CardHeader>
      <CardContent>
        {/* Selected Sound Display */}
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Current Selection</Label>
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-slate-50">
            <div className="flex items-center justify-center w-5 h-5">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedSoundOption ? selectedSoundOption.name : 'No Sound'}
                </span>
                {selectedSoundOption && (
                  <Badge variant="secondary" className="text-xs hidden sm:block">
                    {selectedSoundOption.category}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 ">
                {selectedSoundOption ? selectedSoundOption.description : 'Disable sound notifications'}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (selectedSoundOption) {
                  if (isPlaying(selectedSoundOption)) {
                    handleStopSound();
                  } else {
                    handlePlaySound(selectedSoundOption);
                  }
                }
              }}
              className="hover:bg-blue-50 hover:border-blue-200 border-blue-200"
              disabled={!selectedSoundOption}
            >
              {selectedSoundOption && isPlaying(selectedSoundOption) ? (
                <Pause className="h-3 w-3 text-blue-600" />
              ) : (
                <Play className="h-3 w-3 text-blue-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Expandable Sound List */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-between hover:bg-blue-50 hover:border-blue-200"
          >
            <span className="text-sm font-medium">Choose Different Sound</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-blue-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-blue-600" />
            )}
          </Button>

          {isExpanded && (
            <div className="space-y-2 animate-in fade-in duration-300 ease-in-out">
              {SOUND_OPTIONS.map((sound) => (
                <div
                  key={sound.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected(sound)
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => onSoundSelect(sound.file)}
                >
                  {/* Selection Indicator */}
                  <div className="flex items-center justify-center w-5 h-5">
                    {isSelected(sound) ? (
                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 border-2 border-slate-300 rounded-full"></div>
                    )}
                  </div>

                  {/* Sound Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{sound.name}</span>
                      <Badge variant="secondary" className="text-xs hidden sm:block">
                        {sound.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 hidden sm:block">{sound.description}</p>
                  </div>

                  {/* Play Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPlaying(sound)) {
                        handleStopSound();
                      } else {
                        handlePlaySound(sound);
                      }
                    }}
                    className="hover:bg-blue-50 hover:border-blue-200 border-blue-200"
                  >
                    {isPlaying(sound) ? (
                      <Pause className="h-3 w-3 text-blue-600" />
                    ) : (
                      <Play className="h-3 w-3 text-blue-600" />
                    )}
                  </Button>
                </div>
              ))}

              {/* No Sound Option */}
              <div
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedSound === '' || selectedSound === undefined
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => onSoundSelect('')}
              >
                <div className="flex items-center justify-center w-5 h-5">
                  {(selectedSound === '' || selectedSound === undefined) ? (
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-slate-300 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">No Sound</span>
                  <p className="text-xs text-slate-500 mt-1">Disable sound notifications</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 