import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLeadFields, useUpdateLeadFields, LEAD_FIELD_OPTIONS } from '@/hooks/use-lead-fields';
import { useToast } from '@/hooks/use-toast';
import { Save, Users } from 'lucide-react';

interface LeadFieldsManagerProps {
  chatbotId: string;
}

export function LeadFieldsManager({ chatbotId }: LeadFieldsManagerProps) {
  const { data: leadFields, isLoading } = useLeadFields(chatbotId);
  const updateLeadFields = useUpdateLeadFields();
  const { toast } = useToast();

  // State management
  const [enabled, setEnabled] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(['name', 'phone']);
  const [originalState, setOriginalState] = useState<{
    enabled: boolean;
    fields: string[];
  } | null>(null);

  // Initialize state from API data
  useEffect(() => {
    console.log('[LeadFields] useEffect triggered:', {
      hasLeadFields: !!leadFields,
      leadFieldsData: leadFields,
      originalState: originalState,
      isLoading: isLoading
    });

    if (leadFields) {
      const newState = {
        enabled: leadFields.leadCollectionEnabled,
        fields: leadFields.leadCollectionFields || ['name', 'phone']
      };
      
      console.log('[LeadFields] Initializing state from API:', {
        newState: newState,
        leadCollectionFieldsType: typeof leadFields.leadCollectionFields,
        leadCollectionFieldsIsArray: Array.isArray(leadFields.leadCollectionFields),
        leadCollectionFieldsValue: leadFields.leadCollectionFields
      });
      
      // Always update state when API data changes
      setEnabled(newState.enabled);
      setSelectedFields([...newState.fields]);
      setOriginalState({
        enabled: newState.enabled,
        fields: [...newState.fields]
      });
    } else if (!originalState && !isLoading) {
      // Fallback initialization if no API data and not loading
      console.log('[LeadFields] Using fallback initialization');
      const fallbackState = {
        enabled: false,
        fields: ['name', 'phone']
      };
      setOriginalState(fallbackState);
    }
  }, [leadFields, isLoading]); // Removed originalState from dependencies to prevent infinite loop

  // Check if there are any changes
  const hasChanges = useMemo(() => {
    console.log('[LeadFields] Change detection triggered:', {
      hasOriginalState: !!originalState,
      currentEnabled: enabled,
      currentSelectedFields: selectedFields,
      currentSelectedFieldsType: typeof selectedFields,
      currentSelectedFieldsIsArray: Array.isArray(selectedFields)
    });

    if (!originalState) {
      console.log('[LeadFields] No original state, no changes');
      return false;
    }
    
    // Simple comparison - check if arrays have same length and same items
    const fieldsChanged = selectedFields.length !== originalState.fields.length ||
      !selectedFields.every(field => originalState.fields.includes(field)) ||
      !originalState.fields.every(field => selectedFields.includes(field));
    
    const enabledChanged = enabled !== originalState.enabled;
    
    const hasChangesResult = fieldsChanged || enabledChanged;
    
    console.log('[LeadFields] Change detection result:', {
      current: { 
        enabled, 
        fields: selectedFields,
        fieldsType: typeof selectedFields,
        fieldsIsArray: Array.isArray(selectedFields)
      },
      original: {
        ...originalState,
        fieldsType: typeof originalState.fields,
        fieldsIsArray: Array.isArray(originalState.fields)
      },
      fieldsChanged,
      enabledChanged,
      hasChanges: hasChangesResult
    });
    
    return hasChangesResult;
  }, [enabled, selectedFields, originalState]);

  const handleToggleField = (fieldValue: string) => {
    console.log('[LeadFields] Toggle field called:', {
      fieldValue: fieldValue,
      currentSelectedFields: selectedFields,
      willRemove: selectedFields.includes(fieldValue)
    });

    setSelectedFields(prev => {
      const newFields = prev.includes(fieldValue) 
        ? prev.filter(f => f !== fieldValue)
        : [...prev, fieldValue];
      
      console.log('[LeadFields] Field toggle result:', {
        fieldValue: fieldValue,
        previousFields: prev,
        newFields: newFields,
        newFieldsType: typeof newFields,
        newFieldsIsArray: Array.isArray(newFields)
      });
      
      return newFields;
    });
  };

  const handleReset = () => {
    console.log('[LeadFields] Reset called:', {
      hasOriginalState: !!originalState,
      originalState: originalState
    });

    if (originalState) {
      console.log('[LeadFields] Resetting to original state:', {
        enabled: originalState.enabled,
        fields: originalState.fields,
        fieldsType: typeof originalState.fields,
        fieldsIsArray: Array.isArray(originalState.fields)
      });
      
      setEnabled(originalState.enabled);
      setSelectedFields([...originalState.fields]); // Create a copy to ensure state immutability
    }
  };

  const handleSave = async () => {
    console.log('[LeadFields] Save called:', {
      chatbotId: chatbotId,
      selectedFields: selectedFields,
      selectedFieldsType: typeof selectedFields,
      selectedFieldsIsArray: Array.isArray(selectedFields),
      enabled: enabled
    });

    try {
      // Update both lead collection enabled state and fields
      const saveData = {
        chatbotId,
        fields: selectedFields,
        enabled: enabled,
      };
      
      console.log('[LeadFields] Sending save data to API:', saveData);
      
      await updateLeadFields.mutateAsync(saveData);

      // Update original state to reflect the saved state
      const newOriginalState = {
        enabled,
        fields: [...selectedFields] // Create a copy to ensure state immutability
      };
      
      console.log('[LeadFields] Updating original state after save:', {
        newOriginalState: newOriginalState,
        fieldsType: typeof newOriginalState.fields,
        fieldsIsArray: Array.isArray(newOriginalState.fields)
      });
      
      setOriginalState(newOriginalState);

      toast({
        title: 'Lead Fields Updated',
        description: 'Lead collection settings have been saved successfully.',
        duration: 3000, // Auto-dismiss after 3 seconds
      });
    } catch (error) {
      console.error('[LeadFields] Save error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead fields. Please try again.',
        variant: 'destructive',
        duration: 5000, // Auto-dismiss after 5 seconds for errors
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md">
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 bg-gradient-to-br from-white to-blue-50/30 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-blue-600" />
          Lead Collection Fields
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Lead Collection */}
        <div className="flex items-center justify-between">
          <Label htmlFor="leadCollectionEnabled" className="text-sm font-medium">
            Enable Lead Collection
          </Label>
          <Switch
            id="leadCollectionEnabled"
            checked={enabled}
            onCheckedChange={setEnabled}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>

        {enabled && (
          <>
            {/* Field Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Required Fields</Label>
              <div className="space-y-2">
                {LEAD_FIELD_OPTIONS.map((field) => (
                  <div
                    key={field.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFields.includes(field.value)
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => handleToggleField(field.value)}
                  >
                    <div className="flex items-center justify-center w-5 h-5">
                      {selectedFields.includes(field.value) ? (
                        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      ) : (
                        <div className="w-4 h-4 border-2 border-slate-300 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{field.label}</div>
                      {field.required && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Recommended
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Fields Summary */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Fields ({selectedFields.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedFields.map((field) => {
                  const fieldInfo = LEAD_FIELD_OPTIONS.find(f => f.value === field);
                  return (
                    <Badge
                      key={field}
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      {fieldInfo?.label || field}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons - Always Visible */}
        <div className="space-y-2">
          {hasChanges && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200">
              ⚠️ You have unsaved changes
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={updateLeadFields.isPending || !hasChanges}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              size="sm"
            >
              {updateLeadFields.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {updateLeadFields.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            
            {hasChanges && (
              <Button
                onClick={handleReset}
                disabled={updateLeadFields.isPending}
                variant="outline"
                size="sm"
                className="hover:bg-slate-50 hover:border-slate-300"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 