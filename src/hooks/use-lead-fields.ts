import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface LeadFieldsConfig {
  leadCollectionEnabled: boolean;
  leadCollectionFields: string[];
  chatbotId: string;
}

export function useLeadFields(chatbotId: string) {
  return useQuery({
    queryKey: ['/api/chatbots', chatbotId, 'lead-fields'],
    queryFn: async (): Promise<LeadFieldsConfig> => {
      const response = await apiRequest('GET', `/api/chatbots/${chatbotId}/lead-fields`);
      if (!response.ok) throw new Error('Failed to fetch lead fields');
      return response.json();
    },
    enabled: !!chatbotId,
  });
}

export function useUpdateLeadFields() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ chatbotId, fields, enabled }: { chatbotId: string; fields: string[]; enabled?: boolean }) => {
      const response = await apiRequest('PUT', `/api/chatbots/${chatbotId}`, {
        leadCollectionFields: fields,
        leadCollectionEnabled: enabled,
      });
      if (!response.ok) throw new Error('Failed to update lead fields');
      return response.json();
    },
    onSuccess: (_, { chatbotId }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots', chatbotId, 'lead-fields'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chatbots', chatbotId] });
    },
  });
}

// Common field options for lead collection
export const LEAD_FIELD_OPTIONS = [
  { value: 'name', label: 'Full Name', required: true },
  { value: 'email', label: 'Email Address', required: false },
  { value: 'phone', label: 'Phone Number', required: false },

] as const;

export type LeadFieldType = typeof LEAD_FIELD_OPTIONS[number]['value']; 