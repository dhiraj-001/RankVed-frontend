import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface CustomSound {
  id: string;
  name: string;
  soundUrl: string;
  createdAt: Date;
}

export function useCustomSounds() {
  return useQuery({
    queryKey: ['custom-sounds'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/sounds/custom');
      
      if (!response.ok) {
        throw new Error('Failed to fetch custom sounds');
      }
      
      const data = await response.json();
      return data.map((sound: any) => ({
        ...sound,
        createdAt: new Date(sound.createdAt),
      }));
    },
  });
} 