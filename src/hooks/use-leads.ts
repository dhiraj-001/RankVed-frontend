import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Lead, InsertLead } from '@/types';

export function useLeads(chatbotId?: string) {
  return useQuery<Lead[]>({
    queryKey: chatbotId ? ['/api/leads', { chatbotId }] : ['/api/leads'],
    queryFn: async () => {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = chatbotId ? `${baseUrl}/api/leads?chatbotId=${chatbotId}` : `${baseUrl}/api/leads`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch leads');
      return response.json();
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertLead) => {
      const response = await apiRequest('POST', '/api/leads', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
    },
  });
}

export function useDashboardStats() {
  return useQuery<{
    totalConversations: number;
    totalLeads: number;
    activeChatbots: number;
  }>({
    queryKey: ['/api/dashboard/stats'],
  });
}
